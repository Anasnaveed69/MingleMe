const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect, requireVerification, requireOwnership } = require('../middleware/auth');
const Post = require('../models/Post'); // Added Post model import

const router = express.Router();

// Helper function to create notifications
const createNotification = async (recipientId, senderId, type, message, postId = null, commentId = null) => {
  try {
    // Don't create notification if sender is the same as recipient
    if (recipientId.toString() === senderId.toString()) {
      return;
    }

    await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type,
      message,
      post: postId,
      commentId: commentId
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// @route   GET /api/users
// @desc    Get all users (with search and pagination)
// @access  Private
router.get('/', protect, requireVerification, async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true, _id: { $ne: req.user._id } };

    // Add search functionality
    if (search) {
      query.$text = { $search: search };
    }

    const users = await User.find(query)
      .select('username firstName lastName avatar bio followerCount followingCount postCount')
      .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await User.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        users,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching users'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user profile by ID
// @access  Private
router.get('/:id', protect, requireVerification, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('followers', 'username firstName lastName avatar')
      .populate('following', 'username firstName lastName avatar')
      .populate({
        path: 'posts',
        match: { isDeleted: false },
        options: { sort: { createdAt: -1 }, limit: 10 },
        populate: {
          path: 'author',
          select: 'username firstName lastName avatar'
        }
      });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Check if current user is following this user
    const isFollowing = user.followers.some(follower => 
      follower._id.toString() === req.user._id.toString()
    );

    res.json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          bio: user.bio,
          isVerified: user.isVerified,
          followerCount: user.followerCount,
          followingCount: user.followingCount,
          postCount: user.postCount,
          followers: user.followers,
          following: user.following,
          posts: user.posts,
          createdAt: user.createdAt,
          isFollowing
        }
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching user'
    });
  }
});

// @route   GET /api/users/:id/posts
// @desc    Get user posts with pagination
// @access  Private
router.get('/:id/posts', protect, requireVerification, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Get user's posts with pagination
    const posts = await Post.find({ 
      author: req.params.id, 
      isDeleted: false 
    })
      .populate('author', 'username firstName lastName avatar')
      .populate('likes', 'username firstName lastName avatar')
      .populate('comments.user', 'username firstName lastName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Post.countDocuments({ 
      author: req.params.id, 
      isDeleted: false 
    });

    // Add isLiked field to posts
    const postsWithLikeStatus = posts.map(post => ({
      ...post,
      isLiked: post.likes.some(like => like._id.toString() === req.user._id.toString()),
      likeCount: post.likes.length,
      commentCount: post.comments.length,
      comments: post.comments.map(comment => ({
        ...comment,
        isLiked: comment.likes.some(like => like._id.toString() === req.user._id.toString()),
        likeCount: comment.likes.length
      }))
    }));

    res.json({
      status: 'success',
      data: {
        posts: postsWithLikeStatus,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching user posts'
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private (owner only)
router.put('/:id', [
  protect,
  requireVerification,
  requireOwnership('id'),
  body('firstName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  body('lastName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { firstName, lastName, bio } = req.body;
    const updateFields = {};

    if (firstName !== undefined) updateFields.firstName = firstName;
    if (lastName !== undefined) updateFields.lastName = lastName;
    if (bio !== undefined) updateFields.bio = bio;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          bio: user.bio,
          isVerified: user.isVerified
        }
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating profile'
    });
  }
});

// @route   POST /api/users/:id/follow
// @desc    Follow a user
// @access  Private
router.post('/:id/follow', protect, requireVerification, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    if (!userToFollow) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    if (!userToFollow.isActive) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Check if trying to follow self
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        status: 'error',
        message: 'You cannot follow yourself'
      });
    }

    // Check if already following
    const isAlreadyFollowing = userToFollow.followers.includes(req.user._id);
    if (isAlreadyFollowing) {
      return res.status(400).json({
        status: 'error',
        message: 'You are already following this user'
      });
    }

    // Add to following list
    req.user.follow(userToFollow._id);
    userToFollow.followers.push(req.user._id);

    await Promise.all([req.user.save(), userToFollow.save()]);

    // Create notification for follow
    await createNotification(
      userToFollow._id,
      req.user._id,
      'follow',
      `started following you`
    );

    res.json({
      status: 'success',
      message: `You are now following ${userToFollow.username}`,
      data: {
        isFollowing: true,
        followerCount: userToFollow.followers.length
      }
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while following user'
    });
  }
});

// @route   DELETE /api/users/:id/follow
// @desc    Unfollow a user
// @access  Private
router.delete('/:id/follow', protect, requireVerification, async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    if (!userToUnfollow) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Check if already following
    const isFollowing = userToUnfollow.followers.includes(req.user._id);
    if (!isFollowing) {
      return res.status(400).json({
        status: 'error',
        message: 'You are not following this user'
      });
    }

    // Remove from following list
    req.user.unfollow(userToUnfollow._id);
    userToUnfollow.followers = userToUnfollow.followers.filter(
      followerId => followerId.toString() !== req.user._id.toString()
    );

    await Promise.all([req.user.save(), userToUnfollow.save()]);

    res.json({
      status: 'success',
      message: `You have unfollowed ${userToUnfollow.username}`,
      data: {
        isFollowing: false,
        followerCount: userToUnfollow.followers.length
      }
    });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while unfollowing user'
    });
  }
});

// @route   GET /api/users/:id/followers
// @desc    Get user's followers
// @access  Private
router.get('/:id/followers', protect, requireVerification, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.params.id)
      .populate({
        path: 'followers',
        select: 'username firstName lastName avatar bio',
        options: { skip, limit: parseInt(limit) }
      });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const total = user.followers.length;

    res.json({
      status: 'success',
      data: {
        followers: user.followers,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching followers'
    });
  }
});

// @route   GET /api/users/:id/following
// @desc    Get users that this user is following
// @access  Private
router.get('/:id/following', protect, requireVerification, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.params.id)
      .populate({
        path: 'following',
        select: 'username firstName lastName avatar bio',
        options: { skip, limit: parseInt(limit) }
      });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const total = user.following.length;

    res.json({
      status: 'success',
      data: {
        following: user.following,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching following'
    });
  }
});

module.exports = router; 