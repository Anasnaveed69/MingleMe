import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Loader2 } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import usePostsStore from '../../store/postsStore';
// ...existing code...
import Post from '../../components/Posts/Post';
import CreatePost from '../../components/Posts/CreatePostButton';
import EditPostModal from '../../components/Posts/EditPostModal';
import GradientBackground from '../../components/ui/GradientBackground';
import toast from 'react-hot-toast';

const Feed = () => {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { posts, fetchPosts, loading } = usePostsStore();
  const { user } = useAuthStore();

  // Fix create post modal positioning to center (not bottom)
  const [createPostModalPosition, setCreatePostModalPosition] = useState('center');

  useEffect(() => {
    const loadPosts = async () => {
      try {
        await fetchPosts();
      } catch (error) {
        console.error('Error fetching posts:', error);
        toast.error('Failed to load posts');
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, [fetchPosts]);

  const handlePostUpdate = (post) => {
    setEditingPost(post);
    setShowEditModal(true);
  };


  const handlePostDelete = async (postId) => {
    try {
      await usePostsStore.getState().deleteExistingPost(postId);
      fetchPosts();
      toast.success('Post deleted successfully!');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const handlePostUpdated = () => {
    fetchPosts();
    setShowEditModal(false);
    setEditingPost(null);
  };

  if (isLoading) {
    return (
      <GradientBackground variant="feed" className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-slate-600 dark:text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading posts...</p>
        </div>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground variant="feed" className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white dark:text-white mb-2">
              Welcome back, {user?.firstName || 'User'}!
            </h1>
            <p className="text-slate-100 dark:text-slate-100">
              Stay connected with your friends and discover new content
            </p>
          </div>
          
          {/* Create Post Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreatePost(true)}
            className="bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 text-white px-6 py-3 rounded-lg font-medium hover:from-indigo-700 hover:via-purple-700 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create Post</span>
          </motion.button>
        </div>

        {/* Posts */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                No posts yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Be the first to share something amazing!
              </p>
              <button
                onClick={() => setShowCreatePost(true)}
                className="bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 text-white px-6 py-3 rounded-lg font-medium hover:from-indigo-700 hover:via-purple-700 hover:to-teal-600 transition-all duration-200"
              >
                Create Your First Post
              </button>
            </motion.div>
          ) : (
            posts.map((post, index) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Post 
                  post={post} 
                  onPostUpdate={handlePostUpdate} 
                  onPostDelete={handlePostDelete} 
                />
              </motion.div>
            ))
          )}
        </div>

        {/* Loading indicator for new posts */}
        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-slate-600 dark:text-slate-400" />
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePost
          onClose={() => setShowCreatePost(false)}
          onPostCreated={() => {
            fetchPosts();
            // Do not close modal immediately to allow manual closing
          }}
          position={createPostModalPosition}  // Pass position prop
        />
      )}

      {/* Edit Post Modal */}
      {showEditModal && editingPost && (
        <EditPostModal
          post={editingPost}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onPostUpdated={handlePostUpdated}
        />
      )}
    </GradientBackground>
  );
};

export default Feed;

