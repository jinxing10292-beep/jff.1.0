const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const speakeasy = require('speakeasy');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register',
  body('username').trim().isLength({ min: 3, max: 50 }).isAlphanumeric(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, password } = req.body;
      const passwordHash = await bcrypt.hash(password, 12);

      const client = await db.pool.connect();
      try {
        await client.query('BEGIN');

        const userResult = await client.query(
          'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
          [username, email, passwordHash]
        );

        const userId = userResult.rows[0].id;

        await client.query(
          'INSERT INTO wallets (user_id) VALUES ($1)',
          [userId]
        );

        await client.query(
          'INSERT INTO security_logs (user_id, event_type, ip_address, user_agent) VALUES ($1, $2, $3, $4)',
          [userId, 'REGISTER', req.ip, req.get('user-agent')]
        );

        await client.query('COMMIT');

        res.status(201).json({
          message: 'User registered successfully',
          user: userResult.rows[0],
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

// Login
router.post('/login',
  body('username').trim().notEmpty(),
  body('password').notEmpty(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, password, twoFactorCode } = req.body;

      const result = await db.query(
        'SELECT * FROM users WHERE username = $1',
        [username]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = result.rows[0];

      if (user.locked_until && new Date(user.locked_until) > new Date()) {
        return res.status(423).json({ error: 'Account temporarily locked' });
      }

      const validPassword = await bcrypt.compare(password, user.password_hash);

      if (!validPassword) {
        await db.query(
          'UPDATE users SET failed_login_attempts = failed_login_attempts + 1, locked_until = CASE WHEN failed_login_attempts >= 4 THEN NOW() + INTERVAL \'15 minutes\' ELSE NULL END WHERE id = $1',
          [user.id]
        );
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      if (user.two_factor_enabled) {
        if (!twoFactorCode) {
          return res.status(200).json({ requiresTwoFactor: true });
        }

        const verified = speakeasy.totp.verify({
          secret: user.two_factor_secret,
          encoding: 'base32',
          token: twoFactorCode,
          window: 2,
        });

        if (!verified) {
          return res.status(401).json({ error: 'Invalid 2FA code' });
        }
      }

      await db.query(
        'UPDATE users SET last_login = NOW(), failed_login_attempts = 0, locked_until = NULL WHERE id = $1',
        [user.id]
      );

      await db.query(
        'INSERT INTO security_logs (user_id, event_type, ip_address, user_agent) VALUES ($1, $2, $3, $4)',
        [user.id, 'LOGIN', req.ip, req.get('user-agent')]
      );

      const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Enable 2FA
router.post('/2fa/enable', authenticateToken, async (req, res, next) => {
  try {
    const secret = speakeasy.generateSecret({ length: 32 });

    await db.query(
      'UPDATE users SET two_factor_secret = $1 WHERE id = $2',
      [secret.base32, req.user.id]
    );

    res.json({
      secret: secret.base32,
      qrCode: secret.otpauth_url,
    });
  } catch (error) {
    next(error);
  }
});

// Verify and activate 2FA
router.post('/2fa/verify', authenticateToken,
  body('token').isLength({ min: 6, max: 6 }),
  async (req, res, next) => {
    try {
      const { token } = req.body;

      const result = await db.query(
        'SELECT two_factor_secret FROM users WHERE id = $1',
        [req.user.id]
      );

      const verified = speakeasy.totp.verify({
        secret: result.rows[0].two_factor_secret,
        encoding: 'base32',
        token,
        window: 2,
      });

      if (!verified) {
        return res.status(400).json({ error: 'Invalid code' });
      }

      await db.query(
        'UPDATE users SET two_factor_enabled = TRUE WHERE id = $1',
        [req.user.id]
      );

      res.json({ message: '2FA enabled successfully' });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
