const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const User = require('../models/User');
const { protect, requireVerification, requireOwnership } = require('../middleware/auth');

const router = express.Router();

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

    // Add isLiked field to each post
    const postsWithLikeStatus = result.posts.map(post => ({
      ...post,
      isLiked: post.likes.some(like => like._id.toString() === req.user._id.toString())
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

    // Check if user can view this post
    if (!post.isPublic && post.author._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    // Add isLiked field
    const isLiked = post.likes.some(like => like._id.toString() === req.user._id.toString());

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
          comments: post.comments,
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
  requireOwnership('id'),
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
  requireOwnership('id')
], async (req, res) => {
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

    const isLiked = post.likes.includes(req.user._id);

    if (isLiked) {
      // Unlike the post
      post.unlike(req.user._id);
      req.user.unlikePost(post._id);
    } else {
      // Like the post
      post.like(req.user._id);
      req.user.likePost(post._id);
    }

    await Promise.all([post.save(), req.user.save()]);

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

    // Populate the new comment
    const newComment = post.comments[post.comments.length - 1];
    await newComment.populate('user', 'username firstName lastName avatar');

    res.status(201).json({
      status: 'success',
      message: 'Comment added successfully',
      data: {
        comment: {
          id: newComment._id,
          content: newComment.content,
          user: newComment.user,
          likeCount: newComment.likeCount,
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

    const isLiked = comment.likes.includes(req.user._id);

    if (isLiked) {
      // Unlike the comment
      post.unlikeComment(commentId, req.user._id);
    } else {
      // Like the comment
      post.likeComment(commentId, req.user._id);
    }

    await post.save();

    res.json({
      status: 'success',
      message: isLiked ? 'Comment unliked' : 'Comment liked',
      data: {
        isLiked: !isLiked,
        likeCount: comment.likes.length
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