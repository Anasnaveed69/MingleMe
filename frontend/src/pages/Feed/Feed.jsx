import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, MoreHorizontal, Loader2 } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      // TODO: Replace with actual API call
      const mockPosts = [
        {
          id: 1,
          author: {
            id: 1,
            username: 'john_doe',
            firstName: 'John',
            lastName: 'Doe',
            avatar: null
          },
          content: 'Just finished building my first MERN stack application! 🚀 #coding #webdev',
          images: [],
          likes: [],
          comments: [],
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          likeCount: 5,
          commentCount: 2
        },
        {
          id: 2,
          author: {
            id: 2,
            username: 'jane_smith',
            firstName: 'Jane',
            lastName: 'Smith',
            avatar: null
          },
          content: 'Beautiful sunset today! Nature is amazing 🌅',
          images: [],
          likes: [],
          comments: [],
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          likeCount: 12,
          commentCount: 3
        }
      ];
      setPosts(mockPosts);
    } catch (error) {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    setSubmitting(true);
    try {
      // TODO: Replace with actual API call
      const post = {
        id: Date.now(),
        author: {
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar
        },
        content: newPost,
        images: [],
        likes: [],
        comments: [],
        createdAt: new Date(),
        likeCount: 0,
        commentCount: 0
      };
      
      setPosts([post, ...posts]);
      setNewPost('');
      toast.success('Post created successfully!');
    } catch (error) {
      toast.error('Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d`;
    return `${Math.floor(diffInSeconds / 2592000)}mo`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Create Post */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border p-4"
      >
        <form onSubmit={handleSubmitPost} className="space-y-4">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            rows={3}
          />
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              {/* TODO: Add image upload functionality */}
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting || !newPost.trim()}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                  Posting...
                </>
              ) : (
                'Post'
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border overflow-hidden"
          >
            {/* Post Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {post.author.firstName[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {post.author.firstName} {post.author.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      @{post.author.username} • {formatTimeAgo(post.createdAt)}
                    </p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Post Content */}
            <div className="p-4">
              <p className="text-gray-900 mb-4">{post.content}</p>
              {post.images && post.images.length > 0 && (
                <div className="mb-4">
                  {/* TODO: Add image display */}
                </div>
              )}
            </div>

            {/* Post Actions */}
            <div className="px-4 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <button className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors">
                    <Heart className="w-5 h-5" />
                    <span className="text-sm">{post.likeCount}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm">{post.commentCount}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors">
                    <Share2 className="w-5 h-5" />
                    <span className="text-sm">Share</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {posts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-gray-500 text-lg">No posts yet. Be the first to share something!</p>
        </motion.div>
      )}
    </div>
  );
};

export default Feed; 