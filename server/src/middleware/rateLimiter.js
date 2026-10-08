const rateLimit = require('express-rate-limit');

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Max requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.'
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // 50 login/register attempts
  message: {
    success: false,
    message: 'Too many login attempts. Please wait 15 minutes.'
  }
});

// SOS endpoint has higher limits so emergencies are never throttled unexpectedly
const sosLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: 'Emergency request rate exceeded. Please call hostel control room directly.'
  }
});

module.exports = {
  generalLimiter,
  authLimiter,
  sosLimiter
};
