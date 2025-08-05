const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect, requireVerification, requireOwnership, requirePostOwnership } = require('../middleware/auth');

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

// @route   GET /api/posts
// @desc    Get all posts (with pagination and search)
// @access  Private
router.get('/', protect, requireVerification, async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    let result;
    if (search) {
      result = await Post.searchPosts(search, parseInt(page), parseInt(limit));
    } else {
      result = await Post.getPosts(parseInt(page), parseInt(limit), req.user._id);
    }

    // Filter out posts with missing author data and add isLiked field to each post and comment
    const postsWithLikeStatus = result.posts
      .filter(post => post.author && post.author._id) // Filter out posts with missing author
      .map(post => ({
        ...post,
        isLiked: post.likes.some(like => like._id.toString() === req.user._id.toString()),
        likeCount: post.likes.length, // Ensure likeCount is included
        commentCount: post.comments.length, // Ensure commentCount is included
        comments: post.comments
          .filter(comment => comment.user && comment.user._id) // Filter out comments with missing user
          .map(comment => ({
            ...comment,
            isLiked: comment.likes.some(like => like._id.toString() === req.user._id.toString()),
            likeCount: comment.likes.length // Ensure comment likeCount is included
          }))
      }));

    res.json({
      status: 'success',
      data: {
        posts: postsWithLikeStatus,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching posts'
    });
  }
});

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', [
  protect,
  requireVerification,
  body('content')
    .notEmpty()
    .withMessage('Post content is required')
    .isLength({ max: 2000 })
    .withMessage('Post content cannot exceed 2000 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
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

    const { content, images = [], tags = [] } = req.body;

    // Create new post
    const post = new Post({
      author: req.user._id,
      content,
      images,
      tags: tags.map(tag => tag.toLowerCase().trim())
    });

    await post.save();

    // Add post to user's posts array
    await User.findByIdAndUpdate(req.user._id, {
      $push: { posts: post._id }
    });

    // Populate author information
    await post.populate('author', 'username firstName lastName avatar');

    res.status(201).json({
      status: 'success',
      message: 'Post created successfully',
      data: {
        post: {
          id: post._id,
          content: post.content,
          images: post.images,
          tags: post.tags,
          author: post.author,
          likeCount: post.likeCount,
          commentCount: post.commentCount,
          isLiked: false,
          createdAt: post.createdAt,
          timeAgo: post.timeAgo
        }
      }
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while creating post'
    });
  }
});

// @route   GET /api/posts/:id
// @desc    Get a single post by ID
// @access  Private
router.get('/:id', protect, requireVerification, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username firstName lastName avatar')
      .populate('comments.user', 'username firstName lastName avatar')
      .populate('likes', 'username firstName lastName avatar');

    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }

    if (post.isDeleted) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }

    // Check if post has valid author data
    if (!post.author || !post.author._id) {
      return res.status(404).json({
        status: 'error',
        message: 'Post author data is invalid'
      });
    }

    // Check if user can view this post
    if (!post.isPublic && post.author._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    // Add isLiked field for post and comments (with safety checks)
    const isLiked = post.likes.some(like => like._id.toString() === req.user._id.toString());
    const commentsWithLikeStatus = post.comments
      .filter(comment => comment.user && comment.user._id) // Filter out comments with missing user
      .map(comment => ({
        ...comment,
        isLiked: comment.likes.some(like => like._id.toString() === req.user._id.toString()),
        likeCount: comment.likes.length // Ensure comment likeCount is included
      }));

    res.json({
      status: 'success',
      data: {
        post: {
          id: post._id,
          content: post.content,
          images: post.images,
          tags: post.tags,
          author: post.author,
          likes: post.likes,
          comments: commentsWithLikeStatus,
          likeCount: post.likeCount,
          commentCount: post.commentCount,
          isLiked,
          isPublic: post.isPublic,
          isEdited: post.isEdited,
          editedAt: post.editedAt,
          createdAt: post.createdAt,
          timeAgo: post.timeAgo
        }
      }
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching post'
    });
  }
});

// @route   PUT /api/posts/:id
// @desc    Update a post
// @access  Private (owner only)
router.put('/:id', [
  protect,
  requireVerification,
  requirePostOwnership,
  body('content')
    .notEmpty()
    .withMessage('Post content is required')
    .isLength({ max: 2000 })
    .withMessage('Post content cannot exceed 2000 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
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

    const { content, images, tags } = req.body;

    const post = req.post; // Use post from middleware

    // Update post
    post.content = content;
    if (images !== undefined) post.images = images;
    if (tags !== undefined) post.tags = tags.map(tag => tag.toLowerCase().trim());
    post.isEdited = true;
    post.editedAt = new Date();

    await post.save();
    await post.populate('author', 'username firstName lastName avatar');

    res.json({
      status: 'success',
      message: 'Post updated successfully',
      data: {
        post: {
          id: post._id,
          content: post.content,
          images: post.images,
          tags: post.tags,
          author: post.author,
          likeCount: post.likeCount,
          commentCount: post.commentCount,
          isEdited: post.isEdited,
          editedAt: post.editedAt,
          updatedAt: post.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating post'
    });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private (owner only)
router.delete('/:id', [
  protect,
  requireVerification,
  requirePostOwnership
], async (req, res) => {
  try {
    const post = req.post; // Use post from middleware

    // Soft delete the post
    post.isDeleted = true;
    await post.save();

    // Remove post from user's posts array
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { posts: post._id }
    });

    res.json({
      status: 'success',
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while deleting post'
    });
  }
});

// @route   POST /api/posts/:id/like
// @desc    Like/unlike a post
// @access  Private
router.post('/:id/like', protect, requireVerification, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }

    if (post.isDeleted) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }

    const isLiked = post.likes.some(like => like.toString() === req.user._id.toString());

    if (isLiked) {
      // Unlike the post
      post.unlike(req.user._id);
    } else {
      // Like the post
      post.like(req.user._id);
      
      // Create notification for like
      await createNotification(
        post.author,
        req.user._id,
        'like',
        `liked your post`,
        post._id
      );
    }

    await post.save();

    // Populate likes to get user details
    await post.populate('likes', 'username firstName lastName avatar');

    res.json({
      status: 'success',
      message: isLiked ? 'Post unliked' : 'Post liked',
      data: {
        isLiked: !isLiked,
        likeCount: post.likes.length
      }
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while liking/unliking post'
    });
  }
});

// @route   POST /api/posts/:id/comments
// @desc    Add a comment to a post
// @access  Private
router.post('/:id/comments', [
  protect,
  requireVerification,
  body('content')
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ max: 1000 })
    .withMessage('Comment cannot exceed 1000 characters')
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

    const { content } = req.body;

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }

    if (post.isDeleted) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }

    // Add comment
    post.addComment(req.user._id, content);
    await post.save();

    // Populate the new comment properly
    await post.populate('comments.user', 'username firstName lastName avatar');
    const newComment = post.comments[post.comments.length - 1];

    // Create notification for comment
    await createNotification(
      post.author,
      req.user._id,
      'comment',
      `commented on your post`,
      post._id,
      newComment._id.toString()
    );

    res.status(201).json({
      status: 'success',
      message: 'Comment added successfully',
      data: {
        comment: {
          id: newComment._id,
          content: newComment.content,
          user: newComment.user,
          likeCount: newComment.likeCount,
          isLiked: false, // New comments are not liked by default
          createdAt: newComment.createdAt
        },
        commentCount: post.commentCount
      }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while adding comment'
    });
  }
});

// @route   PUT /api/posts/:id/comments/:commentId
// @desc    Edit a comment
// @access  Private (comment owner only)
router.put('/:id/comments/:commentId', [
  protect,
  requireVerification,
  body('content')
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ max: 1000 })
    .withMessage('Comment cannot exceed 1000 characters')
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

    const { id: postId, commentId } = req.params;
    const { content } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }

    if (post.isDeleted) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        status: 'error',
        message: 'Comment not found'
      });
    }

    // Check if user owns the comment
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only edit your own comments.'
      });
    }

    // Update comment
    comment.content = content;
    comment.isEdited = true;
    comment.editedAt = new Date();
    
    await post.save();

    // Populate the updated comment
    await post.populate('comments.user', 'username firstName lastName avatar');
    const updatedComment = post.comments.id(commentId);

    res.json({
      status: 'success',
      message: 'Comment updated successfully',
      data: {
        comment: {
          id: updatedComment._id,
          content: updatedComment.content,
          user: updatedComment.user,
          likeCount: updatedComment.likeCount,
          isLiked: updatedComment.likes.some(like => like.toString() === req.user._id.toString()),
          isEdited: updatedComment.isEdited,
          editedAt: updatedComment.editedAt,
          createdAt: updatedComment.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Edit comment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while editing comment'
    });
  }
});

// @route   DELETE /api/posts/:id/comments/:commentId
// @desc    Delete a comment
// @access  Private (comment owner or post owner)
router.delete('/:id/comments/:commentId', protect, requireVerification, async (req, res) => {
  try {
    const { id: postId, commentId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }

    if (post.isDeleted) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        status: 'error',
        message: 'Comment not found'
      });
    }

    // Check if user can delete the comment
    const isCommentOwner = comment.user.toString() === req.user._id.toString();
    const isPostOwner = post.author.toString() === req.user._id.toString();

    if (!isCommentOwner && !isPostOwner) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only delete your own comments.'
      });
    }

    // Remove comment
    post.removeComment(commentId);
    await post.save();

    res.json({
      status: 'success',
      message: 'Comment deleted successfully',
      data: {
        commentCount: post.commentCount
      }
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while deleting comment'
    });
  }
});

// @route   GET /api/posts/:id/likes
// @desc    Get who liked a post
// @access  Private
router.get('/:id/likes', protect, requireVerification, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('likes', 'username firstName lastName avatar');

    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }

    if (post.isDeleted) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        likes: post.likes,
        totalLikes: post.likes.length
      }
    });
  } catch (error) {
    console.error('Get post likes error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching post likes'
    });
  }
});

// @route   POST /api/posts/:id/comments/:commentId/like
// @desc    Like/unlike a comment
// @access  Private
router.post('/:id/comments/:commentId/like', protect, requireVerification, async (req, res) => {
  try {
    const { id: postId, commentId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }

    if (post.isDeleted) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        status: 'error',
        message: 'Comment not found'
      });
    }

    const isLiked = comment.likes.some(like => like.toString() === req.user._id.toString());

    if (isLiked) {
      // Unlike the comment
      post.unlikeComment(commentId, req.user._id);
    } else {
      // Like the comment
      post.likeComment(commentId, req.user._id);
    }

    await post.save();

    // Get the updated comment to get the correct like count
    const updatedComment = post.comments.id(commentId);

    res.json({
      status: 'success',
      message: isLiked ? 'Comment unliked' : 'Comment liked',
      data: {
        isLiked: !isLiked,
        likeCount: updatedComment.likes.length,
        commentId: commentId
      }
    });
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while liking/unliking comment'
    });
  }
});

module.exports = router; 