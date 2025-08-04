import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Image as ImageIcon,
  X,
  Send,
  ThumbsUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import usePostsStore from '../../store/postsStore';
import toast from 'react-hot-toast';

const Post = ({ post, onPostUpdate, onPostDelete }) => {
  const { user } = useAuthStore();
  const { 
    likePostAction, 
    unlikePostAction, 
    addCommentAction, 
    deleteCommentAction,
    likeCommentAction,
    unlikeCommentAction
  } = usePostsStore();

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const isOwnPost = user?._id === post.author._id;
  const isLiked = post.isLiked || false;

  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }

    try {
      if (isLiked) {
        await unlikePostAction(post._id);
      } else {
        await likePostAction(post._id);
      }
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!user) {
      toast.error('Please login to comment');
      return;
    }

    setSubmittingComment(true);
    try {
      await addCommentAction(post._id, commentText.trim());
      setCommentText('');
    } catch (error) {
      console.error('Comment error:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteCommentAction(post._id, commentId);
    } catch (error) {
      console.error('Delete comment error:', error);
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!user) {
      toast.error('Please login to like comments');
      return;
    }

    try {
      const comment = post.comments.find(c => c._id === commentId);
      const isCommentLiked = comment?.isLiked || false;
      
      if (isCommentLiked) {
        await unlikeCommentAction(post._id, commentId);
      } else {
        await likeCommentAction(post._id, commentId);
      }
    } catch (error) {
      console.error('Like comment error:', error);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${post.author.firstName} ${post.author.lastName}'s post`,
        text: post.content,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const openImageModal = (image) => {
    setSelectedImage(image);
    setShowImageModal(true);
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d`;
    return `${Math.floor(diffInSeconds / 2592000)}mo`;
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border overflow-hidden"
      >
        {/* Post Header */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to={`/profile/${post.author._id}`}>
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 rounded-full flex items-center justify-center">
                  {post.author.avatar ? (
                    <img 
                      src={post.author.avatar} 
                      alt={post.author.firstName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold">
                      {post.author.firstName[0]}
                    </span>
                  )}
                </div>
              </Link>
              <div>
                <Link to={`/profile/${post.author._id}`}>
                  <h3 className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors">
                    {post.author.firstName} {post.author.lastName}
                  </h3>
                </Link>
                <p className="text-sm text-slate-500">
                  @{post.author.username} • {formatTimeAgo(post.createdAt)}
                  {post.isEdited && <span className="ml-1 text-slate-400">(edited)</span>}
                </p>
              </div>
            </div>
            
            {/* Post Actions Menu */}
            <div className="relative">
              <button className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10 hidden group-hover:block">
                {isOwnPost && (
                  <>
                    <button
                      onClick={() => onPostUpdate(post)}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit Post</span>
                    </button>
                    <button
                      onClick={() => onPostDelete(post._id)}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Post</span>
                    </button>
                  </>
                )}
                <button
                  onClick={handleShare}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Post</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="p-4">
          <p className="text-slate-900 mb-4 whitespace-pre-wrap">{post.content}</p>
          
          {/* Post Images */}
          {post.images && post.images.length > 0 && (
            <div className="mb-4">
              {post.images.length === 1 ? (
                <div className="relative">
                  <img
                    src={post.images[0].url}
                    alt="Post"
                    className="w-full max-h-96 object-cover rounded-lg cursor-pointer"
                    onClick={() => openImageModal(post.images[0])}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {post.images.slice(0, 4).map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image.url}
                        alt={`Post ${index + 1}`}
                        className={`w-full h-32 object-cover rounded-lg cursor-pointer ${
                          index === 3 && post.images.length > 4 ? 'brightness-50' : ''
                        }`}
                        onClick={() => openImageModal(image)}
                      />
                      {index === 3 && post.images.length > 4 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            +{post.images.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Post Actions */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-2 transition-colors ${
                  isLiked 
                    ? 'text-red-500' 
                    : 'text-slate-500 hover:text-red-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                <span className="text-sm">{post.likeCount || 0}</span>
              </button>
              
              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center space-x-2 text-slate-500 hover:text-indigo-500 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">{post.commentCount || 0}</span>
              </button>
              
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 text-slate-500 hover:text-green-500 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span className="text-sm">Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="border-t border-slate-100">
            {/* Comment Input */}
            <div className="p-4 border-b border-slate-100">
              <form onSubmit={handleComment} className="flex space-x-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={submittingComment}
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || submittingComment}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submittingComment ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            </div>

            {/* Comments List */}
            <div className="max-h-64 overflow-y-auto">
              {post.comments && post.comments.length > 0 ? (
                post.comments.map((comment) => (
                  <div key={comment._id} className="p-4 border-b border-slate-50 last:border-b-0">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                        {comment.user.avatar ? (
                          <img 
                            src={comment.user.avatar} 
                            alt={comment.user.firstName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-xs font-bold">
                            {comment.user.firstName[0]}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-slate-900">
                            {comment.user.firstName} {comment.user.lastName}
                          </span>
                          <span className="text-xs text-slate-500">
                            {formatTimeAgo(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 mb-2">{comment.content}</p>
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => handleLikeComment(comment._id)}
                            className={`flex items-center space-x-1 text-xs transition-colors ${
                              comment.isLiked 
                                ? 'text-indigo-600' 
                                : 'text-slate-500 hover:text-indigo-600'
                            }`}
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>{comment.likeCount || 0}</span>
                          </button>
                          
                          {user?._id === comment.user._id && (
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              className="text-xs text-red-500 hover:text-red-700 transition-colors"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-slate-500 text-sm">
                  No comments yet. Be the first to comment!
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Image Modal */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedImage.url}
              alt="Post"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Post; 