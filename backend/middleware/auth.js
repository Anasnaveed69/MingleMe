const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - require authentication
const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'User not found'
        });
      }

      if (!req.user.isActive) {
        return res.status(401).json({
          status: 'error',
          message: 'Account is deactivated'
        });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized, token failed'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Not authorized, no token'
    });
  }
};

// Optional authentication - doesn't require token but adds user if available
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Token is invalid, but we don't throw an error
      req.user = null;
    }
  }

  next();
};

// Check if user is verified
const requireVerification = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({
      status: 'error',
      message: 'Account not verified. Please verify your email first.'
    });
  }
  next();
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

// Check if user owns the resource or is admin
const requireOwnership = (resourceUserId) => {
  return (req, res, next) => {
    const resourceId = req.params[resourceUserId] || req.body[resourceUserId];
    
    if (!resourceId) {
      return res.status(400).json({
        status: 'error',
        message: 'Resource ID is required'
      });
    }

    if (req.user.role === 'admin' || req.user._id.toString() === resourceId.toString()) {
      next();
    } else {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only modify your own resources.'
      });
    }
  };
};

// Check if user owns the post or is admin
const requirePostOwnership = async (req, res, next) => {
  try {
    const postId = req.params.id;
    
    if (!postId) {
      return res.status(400).json({
        status: 'error',
        message: 'Post ID is required'
      });
    }

    const Post = require('../models/Post');
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }

    if (req.user.role === 'admin' || post.author.toString() === req.user._id.toString()) {
      req.post = post; // Add post to request for later use
      next();
    } else {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only modify your own posts.'
      });
    }
  } catch (error) {
    console.error('Post ownership check error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error while checking post ownership'
    });
  }
};

module.exports = {
  protect,
  optionalAuth,
  requireVerification,
  requireAdmin,
  requireOwnership,
  requirePostOwnership
}; 