const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
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

      const client = await db.pool.connect();
      try {
        await client.query('BEGIN');

        const moneyColumn = moneyType === 'T' ? 'test_money' : 'real_money';
        
        const walletResult = await client.query(
          `SELECT ${moneyColumn} FROM wallets WHERE user_id = $1 FOR UPDATE`,
          [req.user.id]
        );

        const currentBalance = parseFloat(walletResult.rows[0][moneyColumn]);

        if (currentBalance < parseFloat(betAmount)) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: 'Insufficient balance' });
        }

        // Process game logic
        const gameResult = gameLogic.playGame(gameType, gameData, parseFloat(betAmount));

        const newBalance = currentBalance - parseFloat(betAmount) + gameResult.winAmount;

        await client.query(
          `UPDATE wallets SET ${moneyColumn} = $1 WHERE user_id = $2`,
          [newBalance, req.user.id]
        );

        // Record bet transaction
        await client.query(
          `INSERT INTO transactions (user_id, transaction_type, money_type, amount, balance_before, balance_after, game_type, ip_address, user_agent)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [req.user.id, 'BET', moneyType, betAmount, currentBalance, currentBalance - parseFloat(betAmount), gameType, req.ip, req.get('user-agent')]
        );

        // Record win transaction if applicable
        if (gameResult.winAmount > 0) {
          await client.query(
            `INSERT INTO transactions (user_id, transaction_type, money_type, amount, balance_before, balance_after, game_type, ip_address, user_agent)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [req.user.id, 'WIN', moneyType, gameResult.winAmount, currentBalance - parseFloat(betAmount), newBalance, gameType, req.ip, req.get('user-agent')]
          );
        }

        // Record game session
        const sessionResult = await client.query(
          `INSERT INTO game_sessions (user_id, game_type, money_type, bet_amount, win_amount, game_data, result, ip_address)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
          [req.user.id, gameType, moneyType, betAmount, gameResult.winAmount, JSON.stringify(gameResult.gameData), gameResult.result, req.ip]
        );

        await client.query('COMMIT');

        res.json({
          sessionId: sessionResult.rows[0].id,
          result: gameResult.result,
          winAmount: gameResult.winAmount,
          newBalance,
          gameData: gameResult.gameData,
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
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

    const result = await db.query(
      `SELECT id, game_type, money_type, bet_amount, win_amount, result, created_at 
       FROM game_sessions 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// Get game statistics
router.get('/stats', authenticateToken, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT 
        game_type,
        COUNT(*) as games_played,
        SUM(bet_amount) as total_bet,
        SUM(win_amount) as total_won,
        SUM(win_amount - bet_amount) as net_profit
       FROM game_sessions 
       WHERE user_id = $1 
       GROUP BY game_type`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
