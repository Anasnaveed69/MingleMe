import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search as SearchIcon, Users, FileText } from 'lucide-react';
import usePostsStore from '../../store/postsStore';
import useUsersStore from '../../store/usersStore';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const Search = () => {
  const { posts, searchPostsAction, searchResults: postResults, searchLoading: postSearchLoading } = usePostsStore();
  const { searchUsersAction, searchResults: userResults, searchLoading: userSearchLoading, followUserAction, unfollowUserAction } = useUsersStore();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');

  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'users'

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      return;
    }

    try {
      if (activeTab === 'posts') {
        await searchPostsAction(searchTerm);
      } else {
        await searchUsersAction(searchTerm);
      }
    } catch (error) {
      toast.error(`Failed to search ${activeTab}`);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm.trim()) {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, activeTab]);

  const renderPostResult = (post) => (
    <motion.div
      key={post._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border p-4 mb-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 rounded-full flex items-center justify-center">
          {post.author?.avatar ? (
            <img 
              src={post.author.avatar} 
              alt={post.author.firstName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <span className="text-white font-bold">
              {post.author?.firstName?.[0]}
            </span>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="font-semibold text-slate-900">
              {post.author?.firstName} {post.author?.lastName}
            </span>
            <span className="text-sm text-slate-500">@{post.author?.username}</span>
          </div>
          <p className="text-slate-700 mb-2 line-clamp-3">{post.content}</p>
          {post.images && post.images.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-2">
              {post.images.slice(0, 2).map((image, index) => (
                <img
                  key={index}
                  src={image.url}
                  alt={`Post image ${index + 1}`}
                  className="w-full h-20 object-cover rounded-lg"
                />
              ))}
            </div>
          )}
          <div className="flex items-center space-x-4 text-sm text-slate-500">
            <span>{post.likes?.length || 0} likes</span>
            <span>{post.comments?.length || 0} comments</span>
            <span>{post.timeAgo}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderUserResult = (user) => (
    <motion.div
      key={user.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border p-4 mb-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 rounded-full flex items-center justify-center">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.firstName}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <span className="text-white font-bold text-lg">
                {user.firstName?.[0]}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-900">
                {user.firstName} {user.lastName}
              </span>
              {user.isVerified && (
                <span className="text-blue-500">✓</span>
              )}
            </div>
            <span className="text-sm text-slate-500">@{user.username}</span>
            {user.bio && (
              <p className="text-sm text-slate-600 mt-1 line-clamp-2">{user.bio}</p>
            )}
            <div className="flex items-center space-x-4 text-sm text-slate-500 mt-2">
              <span>{user.followerCount || 0} followers</span>
              <span>{user.followingCount || 0} following</span>
              <span>{user.postCount || 0} posts</span>
            </div>
          </div>
        </div>
        {user.id !== user?.id && (
          <button
            onClick={() => user.isFollowing ? unfollowUserAction(user.id) : followUserAction(user.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              user.isFollowing
                ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {user.isFollowing ? 'Unfollow' : 'Follow'}
          </button>
        )}
      </div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Search</h1>
        <p className="text-slate-600 mt-1">Find posts and people on MingleMe</p>
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for posts, users, or tags..."
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      {/* Search Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'posts'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Posts</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'users'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users</span>
          </button>
        </div>
      </div>

      {/* Search Results */}
      <div>
        {(activeTab === 'posts' ? postSearchLoading : userSearchLoading) ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Searching...</p>
          </div>
        ) : searchTerm.trim() ? (
          (activeTab === 'posts' ? postResults : userResults).length > 0 ? (
            <div>
              <p className="text-sm text-slate-600 mb-4">
                Found {(activeTab === 'posts' ? postResults : userResults).length} result{(activeTab === 'posts' ? postResults : userResults).length !== 1 ? 's' : ''}
              </p>
              {activeTab === 'posts' && postResults.map(renderPostResult)}
              {activeTab === 'users' && userResults.map(renderUserResult)}
            </div>
          ) : (
            <div className="text-center py-8">
              <SearchIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No {activeTab} found for "{searchTerm}"</p>
              <p className="text-sm text-slate-500 mt-2">Try different keywords or check your spelling</p>
            </div>
          )
        ) : (
          <div className="text-center py-8">
            <SearchIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">Start typing to search</p>
            <p className="text-sm text-slate-500 mt-2">Search for posts, users, or tags</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Search; 