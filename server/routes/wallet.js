const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get wallet balance
router.get('/balance', authenticateToken, async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT test_money, real_money FROM wallets WHERE user_id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Get transaction history
router.get('/transactions', authenticateToken, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const result = await db.query(
      `SELECT id, transaction_type, money_type, amount, balance_after, game_type, created_at 
       FROM transactions 
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

      const client = await db.pool.connect();
      try {
        await client.query('BEGIN');

        const walletResult = await client.query(
          'SELECT real_money FROM wallets WHERE user_id = $1 FOR UPDATE',
          [req.user.id]
        );

        const currentBalance = parseFloat(walletResult.rows[0].real_money);
        const newBalance = currentBalance + parseFloat(amount);

        await client.query(
          'UPDATE wallets SET real_money = $1 WHERE user_id = $2',
          [newBalance, req.user.id]
        );

        await client.query(
          `INSERT INTO transactions (user_id, transaction_type, money_type, amount, balance_before, balance_after, ip_address, user_agent)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [req.user.id, 'DEPOSIT', moneyType, amount, currentBalance, newBalance, req.ip, req.get('user-agent')]
        );

        await client.query('COMMIT');

        res.json({
          message: 'Deposit successful',
          newBalance,
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

module.exports = router;
