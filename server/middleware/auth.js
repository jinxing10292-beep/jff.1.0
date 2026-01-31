const jwt = require('jsonwebtoken');
const { db } = require('../config/database');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user still exists and is active
    const user = await db.findUserById(decoded.userId);

    if (!user || !user.is_active) {
      return res.status(403).json({ error: 'Invalid or inactive user' });
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email
    };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(403).json({ error: 'Invalid token' });
  }
};

module.exports = { authenticateToken };
