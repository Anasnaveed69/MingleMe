import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Loader2, 
  RefreshCw
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import usePostsStore from '../../store/postsStore';
import CreatePost from '../../components/Posts/CreatePost';
import Post from '../../components/Posts/Post';
import EditPostModal from '../../components/Posts/EditPostModal';
import GradientBackground from '../../components/ui/GradientBackground';
import toast from 'react-hot-toast';

const Feed = () => {
  const { user } = useAuthStore();
  const { 
    posts, 
    loading, 
    pagination, 
    fetchPosts, 
    deleteExistingPost
  } = usePostsStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPosts(currentPage, 10, searchTerm);
    }
  }, [user, currentPage, searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPosts(1, 10, searchTerm);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(1);
    await fetchPosts(1, 10, searchTerm);
    setRefreshing(false);
    toast.success('Feed refreshed!');
  };

  const handleLoadMore = () => {
    if (pagination.hasNext) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePostCreated = () => {
    // Refresh the feed to show the new post
    setCurrentPage(1);
    fetchPosts(1, 10, searchTerm);
  };

  const handlePostDelete = async (postId) => {
    try {
      await deleteExistingPost(postId);
      toast.success('Post deleted successfully!');
    } catch (error) {
      console.error('Delete post error:', error);
    }
  };

  const handlePostUpdate = async (post) => {
    setEditingPost(post);
    setShowEditModal(true);
  };

  const handlePostUpdated = () => {
    // Refresh the feed to show the updated post
    setCurrentPage(1);
    fetchPosts(1, 10, searchTerm);
  };

  if (!user) {
    return (
      <GradientBackground variant="default" className="flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground variant="default">
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Feed</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl shadow-sm border p-4"
          >
            <form onSubmit={handleSearch} className="flex space-x-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search posts..."
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Search
              </button>
            </form>
          </motion.div>
        )}

        {/* Create Post */}
        <CreatePost onPostCreated={handlePostCreated} />

        {/* Posts */}
        <div className="space-y-6">
          {loading && currentPage === 1 ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-4" />
              <p className="text-slate-600">Loading posts...</p>
            </div>
          ) : posts.length > 0 ? (
            <>
              {posts
                .filter(post => post && post._id && post.author) // Filter out incomplete posts
                .map((post) => (
                  <Post
                    key={post._id}
                    post={post}
                    onPostUpdate={handlePostUpdate}
                    onPostDelete={handlePostDelete}
                  />
                ))}
              
              {/* Load More Button */}
              {pagination.hasNext && (
                <div className="text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 text-white rounded-lg font-medium hover:from-indigo-700 hover:via-purple-700 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Loading...</span>
                      </div>
                    ) : (
                      'Load More Posts'
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-white rounded-xl shadow-sm border"
            >
              {searchTerm ? (
                <div>
                  <Search className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No posts found</h3>
                  <p className="text-slate-600 mb-4">
                    No posts match your search for "{searchTerm}"
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setCurrentPage(1);
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                <div>
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl">📝</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No posts yet</h3>
                  <p className="text-slate-600 mb-4">
                    Be the first to share something with your friends!
                  </p>
                  <p className="text-sm text-slate-500">
                    Create a post above to get started
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Pagination Info */}
        {posts.length > 0 && (
          <div className="text-center text-sm text-slate-500">
            Showing {posts.length} of {pagination.total} posts
            {pagination.totalPages > 1 && (
              <span> • Page {pagination.page} of {pagination.totalPages}</span>
            )}
          </div>
        )}

        {/* Edit Post Modal */}
        <EditPostModal
          post={editingPost}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingPost(null);
          }}
          onPostUpdated={handlePostUpdated}
        />
      </div>
    </GradientBackground>
  );
};

export default Feed; 