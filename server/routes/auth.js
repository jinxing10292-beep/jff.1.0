const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const speakeasy = require('speakeasy');
const { db, supabase } = require('../config/database');
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

      // Create user
      const user = await db.createUser(username, email, passwordHash);

      // Create wallet
      await db.createWallet(user.id);

      // Log security event
      await db.createSecurityLog({
        user_id: user.id,
        event_type: 'REGISTER',
        ip_address: req.ip,
        user_agent: req.get('user-agent')
      });

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
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

      const user = await db.findUserByUsername(username);

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      if (user.locked_until && new Date(user.locked_until) > new Date()) {
        return res.status(423).json({ error: 'Account temporarily locked' });
      }

      const validPassword = await bcrypt.compare(password, user.password_hash);

      if (!validPassword) {
        const newAttempts = (user.failed_login_attempts || 0) + 1;
        const lockedUntil = newAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null;
        
        await db.updateUser(user.id, {
          failed_login_attempts: newAttempts,
          locked_until: lockedUntil
        });
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

      await db.updateUser(user.id, {
        last_login: new Date().toISOString(),
        failed_login_attempts: 0,
        locked_until: null
      });

      await db.createSecurityLog({
        user_id: user.id,
        event_type: 'LOGIN',
        ip_address: req.ip,
        user_agent: req.get('user-agent')
      });

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

    await db.updateUser(req.user.id, {
      two_factor_secret: secret.base32
    });

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

      const user = await db.findUserById(req.user.id);

      const verified = speakeasy.totp.verify({
        secret: user.two_factor_secret,
        encoding: 'base32',
        token,
        window: 2,
      });

      if (!verified) {
        return res.status(400).json({ error: 'Invalid code' });
      }

      await db.updateUser(req.user.id, {
        two_factor_enabled: true
      });

      res.json({ message: '2FA enabled successfully' });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
