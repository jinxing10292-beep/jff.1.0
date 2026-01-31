const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get wallet balance
router.get('/balance', authenticateToken, async (req, res, next) => {
  try {
    const wallet = await db.getWallet(req.user.id);

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    res.json({
      test_money: wallet.test_money,
      real_money: wallet.real_money
    });
  } catch (error) {
    next(error);
  }
});

// Get transaction history
router.get('/transactions', authenticateToken, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const transactions = await db.getTransactions(req.user.id, limit, offset);

    res.json(transactions);
  } catch (error) {
    next(error);
  }
});

// Deposit (for real money - would integrate with payment gateway)
router.post('/deposit',
  authenticateToken,
  body('amount').isFloat({ min: 1, max: 100000 }),
  body('moneyType').isIn(['M']),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { amount, moneyType } = req.body;

      // Get current wallet
      const wallet = await db.getWallet(req.user.id);
      const currentBalance = parseFloat(wallet.real_money);
      const newBalance = currentBalance + parseFloat(amount);

      // Update wallet
      await db.updateWallet(req.user.id, 'M', newBalance);

      // Create transaction record
      await db.createTransaction({
        user_id: req.user.id,
        transaction_type: 'DEPOSIT',
        money_type: moneyType,
        amount: parseFloat(amount),
        balance_before: currentBalance,
        balance_after: newBalance,
        ip_address: req.ip,
        user_agent: req.get('user-agent')
      });

      res.json({
        message: 'Deposit successful',
        newBalance,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
