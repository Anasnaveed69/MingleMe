const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for comment like count
commentSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    trim: true,
    maxlength: [2000, 'Post content cannot exceed 2000 characters']
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    }
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [commentSchema],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
postSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Virtual for time ago
postSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffInSeconds = Math.floor((now - this.createdAt) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds}s`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo`;
  return `${Math.floor(diffInSeconds / 31536000)}y`;
});

// Index for search functionality
postSchema.index({ content: 'text', tags: 'text' });

// Index for sorting by date
postSchema.index({ createdAt: -1 });

// Pre-save middleware to update editedAt
postSchema.pre('save', function(next) {
  if (this.isModified('content') && !this.isNew) {
    this.isEdited = true;
    this.editedAt = new Date();
  }
  next();
});

// Method to like a post
postSchema.methods.like = function(userId) {
  if (!this.likes.includes(userId)) {
    this.likes.push(userId);
  }
};

// Method to unlike a post
postSchema.methods.unlike = function(userId) {
  this.likes = this.likes.filter(id => id.toString() !== userId.toString());
};

// Method to add comment
postSchema.methods.addComment = function(userId, content) {
  this.comments.push({
    user: userId,
    content: content
  });
};

// Method to remove comment
postSchema.methods.removeComment = function(commentId) {
  this.comments = this.comments.filter(comment => 
    comment._id.toString() !== commentId.toString()
  );
};

// Method to like a comment
postSchema.methods.likeComment = function(commentId, userId) {
  const comment = this.comments.id(commentId);
  if (comment && !comment.likes.includes(userId)) {
    comment.likes.push(userId);
  }
};

// Method to unlike a comment
postSchema.methods.unlikeComment = function(commentId, userId) {
  const comment = this.comments.id(commentId);
  if (comment) {
    comment.likes = comment.likes.filter(id => id.toString() !== userId.toString());
  }
};

// Static method to get posts with pagination
postSchema.statics.getPosts = async function(page = 1, limit = 10, userId = null) {
  const skip = (page - 1) * limit;
  
  let query = { isDeleted: false, isPublic: true };
  
  // If userId is provided, also include user's own posts
  if (userId) {
    query = {
      $or: [
        { isDeleted: false, isPublic: true },
        { isDeleted: false, author: userId }
      ]
    };
  }
  
  const posts = await this.find(query)
    .populate('author', 'username firstName lastName avatar')
    .populate('comments.user', 'username firstName lastName avatar')
    .populate('likes', 'username firstName lastName avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  
  const total = await this.countDocuments(query);
  
  return {
    posts,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1
  };
};

// Static method to search posts
postSchema.statics.searchPosts = async function(searchTerm, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  const query = {
    isDeleted: false,
    isPublic: true,
    $text: { $search: searchTerm }
  };
  
  const posts = await this.find(query)
    .populate('author', 'username firstName lastName avatar')
    .populate('comments.user', 'username firstName lastName avatar')
    .populate('likes', 'username firstName lastName avatar')
    .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  
  const total = await this.countDocuments(query);
  
  return {
    posts,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1
  };
};

module.exports = mongoose.model('Post', postSchema); 