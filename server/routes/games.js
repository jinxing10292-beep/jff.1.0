const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const gameLogic = require('../utils/gameLogic');

const router = express.Router();

// Play game endpoint
router.post('/play',
  authenticateToken,
  body('gameType').isIn(['blackjack', 'roulette', 'baccarat', 'slots', 'poker', 'sicbo', 'dragontiger', 'craps', 'bingo', 'keno']),
  body('moneyType').isIn(['T', 'M']),
  body('betAmount').isFloat({ min: 0.01, max: 100000 }),
  body('gameData').isObject(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { gameType, moneyType, betAmount, gameData } = req.body;

      // Get current wallet
      const wallet = await db.getWallet(req.user.id);
      const moneyColumn = moneyType === 'T' ? 'test_money' : 'real_money';
      const currentBalance = parseFloat(wallet[moneyColumn]);

      if (currentBalance < parseFloat(betAmount)) {
        return res.status(400).json({ error: 'Insufficient balance' });
      }

      // Process game logic
      const gameResult = gameLogic.playGame(gameType, gameData, parseFloat(betAmount));

      const newBalance = currentBalance - parseFloat(betAmount) + gameResult.winAmount;

      // Update wallet
      await db.updateWallet(req.user.id, moneyType, newBalance);

      // Record bet transaction
      await db.createTransaction({
        user_id: req.user.id,
        transaction_type: 'BET',
        money_type: moneyType,
        amount: parseFloat(betAmount),
        balance_before: currentBalance,
        balance_after: currentBalance - parseFloat(betAmount),
        game_type: gameType,
        ip_address: req.ip,
        user_agent: req.get('user-agent')
      });

      // Record win transaction if applicable
      if (gameResult.winAmount > 0) {
        await db.createTransaction({
          user_id: req.user.id,
          transaction_type: 'WIN',
          money_type: moneyType,
          amount: gameResult.winAmount,
          balance_before: currentBalance - parseFloat(betAmount),
          balance_after: newBalance,
          game_type: gameType,
          ip_address: req.ip,
          user_agent: req.get('user-agent')
        });
      }

      // Record game session
      const session = await db.createGameSession({
        user_id: req.user.id,
        game_type: gameType,
        money_type: moneyType,
        bet_amount: parseFloat(betAmount),
        win_amount: gameResult.winAmount,
        game_data: gameResult.gameData,
        result: gameResult.result,
        ip_address: req.ip
      });

      res.json({
        sessionId: session.id,
        result: gameResult.result,
        winAmount: gameResult.winAmount,
        newBalance,
        gameData: gameResult.gameData,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get game history
router.get('/history', authenticateToken, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const history = await db.getGameHistory(req.user.id, limit, offset);

    res.json(history);
  } catch (error) {
    next(error);
  }
});

// Get game statistics
router.get('/stats', authenticateToken, async (req, res, next) => {
  try {
    const stats = await db.getGameStats(req.user.id);

    res.json(stats);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
