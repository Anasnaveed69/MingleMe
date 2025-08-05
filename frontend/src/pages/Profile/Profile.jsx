import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Edit, Camera, Settings, Loader2, X, Check } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { getCurrentUserProfile, updateUserProfile, uploadAvatar, getUserPosts } from '../../services/userService';
import toast from 'react-hot-toast';
import GradientBackground from '../../components/ui/GradientBackground';

const Profile = () => {
  const { user, updateProfile: updateAuthProfile } = useAuthStore();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || '',
    username: user?.username || ''
  });
  const [userProfile, setUserProfile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchUserProfile();
    fetchUserPosts();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await getCurrentUserProfile();
      const profile = response.data.user;
      setUserProfile(profile);
      setProfileData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        bio: profile.bio || '',
        username: profile.username || ''
      });
    } catch (error) {
      toast.error('Failed to load profile');
    }
  };

  const fetchUserPosts = async () => {
    try {
      if (!user?.id) return;
      
      const response = await getUserPosts(user.id, 1, 20);
      setPosts(response.data.posts || []);
    } catch (error) {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      if (!user?.id) return;
      
      const response = await updateUserProfile(user.id, profileData);
      const updatedUser = response.data.user;
      
      // Update auth store
      updateAuthProfile(updatedUser);
      setUserProfile(updatedUser);
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setUploadingAvatar(true);
      const response = await uploadAvatar(file);
      const avatarUrl = response.data.avatar;
      
      // Update auth store and local state
      updateAuthProfile({ avatar: avatarUrl });
      setUserProfile(prev => ({ ...prev, avatar: avatarUrl }));
      toast.success('Avatar updated successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
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

  if (loading) {
    return (
      <GradientBackground variant="default" className="flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </GradientBackground>
    );
  }

  const currentUser = userProfile || user;

  return (
    <GradientBackground variant="default">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border overflow-hidden"
        >
          {/* Cover Photo */}
          <div className="h-48 bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 relative">
            <button className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-white/30 transition-colors">
              <Camera className="w-5 h-5" />
            </button>
          </div>

          {/* Profile Info */}
          <div className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col sm:flex-row sm:items-end space-y-4 sm:space-y-0 sm:space-x-6">
                {/* Avatar */}
                <div className="relative -mt-16">
                  <div className="w-32 h-32 bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
                    {currentUser?.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt={`${currentUser.firstName} ${currentUser.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-4xl font-bold">
                        {currentUser?.firstName?.[0] || 'U'}
                      </span>
                    )}
                    {uploadingAvatar && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg hover:shadow-xl transition-shadow"
                    disabled={uploadingAvatar}
                  >
                    <Camera className="w-4 h-4 text-slate-600" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>

                {/* Profile Details */}
                <div className="space-y-2">
                  {editing ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                          className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="First Name"
                        />
                        <input
                          type="text"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                          className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="Last Name"
                        />
                      </div>
                      <input
                        type="text"
                        value={profileData.username}
                        onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Username"
                      />
                      <textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                        rows={3}
                        placeholder="Tell us about yourself..."
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSaveProfile}
                          className="bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 text-white px-4 py-2 rounded-lg font-medium hover:from-indigo-700 hover:via-purple-700 hover:to-teal-600 transition-all duration-200 shadow-lg flex items-center space-x-2"
                        >
                          <Check className="w-4 h-4" />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={() => setEditing(false)}
                          className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-300 transition-colors flex items-center space-x-2"
                        >
                          <X className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h1 className="text-2xl font-bold text-slate-900">
                        {currentUser?.firstName} {currentUser?.lastName}
                      </h1>
                      <p className="text-slate-600">@{currentUser?.username}</p>
                      {currentUser?.bio && (
                        <p className="text-slate-700 mt-2 max-w-md">{currentUser.bio}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {!editing && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center space-x-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                  <button className="flex items-center space-x-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-200 transition-colors">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex space-x-8 mt-6 pt-6 border-t border-slate-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">{posts.length}</div>
                <div className="text-sm text-slate-600">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">{currentUser?.followerCount || 0}</div>
                <div className="text-sm text-slate-600">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">{currentUser?.followingCount || 0}</div>
                <div className="text-sm text-slate-600">Following</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Posts Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Posts</h2>
          {posts.length > 0 ? (
            <div className="grid gap-4">
              {posts.map((post, index) => (
                <motion.div
                  key={post._id || post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm border p-4"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 rounded-full flex items-center justify-center overflow-hidden">
                      {post.author?.avatar ? (
                        <img
                          src={post.author.avatar}
                          alt={post.author.firstName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold text-sm">
                          {post.author?.firstName?.[0] || currentUser?.firstName?.[0]}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">
                        {formatTimeAgo(post.createdAt)}
                      </p>
                    </div>
                  </div>
                  <p className="text-slate-900 mb-3">{post.content}</p>
                  {post.images && post.images.length > 0 && (
                    <div className="mb-3">
                      <img
                        src={post.images[0].url}
                        alt="Post"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-slate-500">
                    <span>{post.likeCount || 0} likes</span>
                    <span>{post.commentCount || 0} comments</span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-white rounded-xl shadow-sm border"
            >
              <p className="text-slate-500 text-lg">No posts yet. Start sharing your thoughts!</p>
            </motion.div>
          )}
        </div>
      </div>
    </GradientBackground>
  );
};

export default Profile; 