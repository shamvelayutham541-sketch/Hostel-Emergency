const { verifyAccessToken } = require('../utils/jwt');
const store = require('../models/dataStore');

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. Missing token.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Invalid or expired access token.' });
    }

    const user = await store.users.findById(decoded.userId);
    if (!user || user.isActive === false) {
      return res.status(401).json({ success: false, message: 'User account not found or suspended.' });
    }

    // Attach user information
    req.user = {
      _id: user._id,
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name || 'User'
    };

    next();
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Auth middleware internal error', error: err.message });
  }
};

module.exports = { requireAuth };
