import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Edit, Camera, Settings, Loader2, X, Check, Trash2, MoreHorizontal, Heart, MessageCircle, Share2, Send, ThumbsUp, Users } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import usePostsStore from '../../store/postsStore';
import { getCurrentUserProfile, updateUserProfile, uploadAvatar, uploadCoverPhoto, removeAvatar, removeCoverPhoto, getUserPosts } from '../../services/userService';
import toast from 'react-hot-toast';
import GradientBackground from '../../components/ui/GradientBackground';
import EditPostModal from '../../components/Posts/EditPostModal';
import EditCommentModal from '../../components/Posts/EditCommentModal';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const Profile = () => {
  const { user, updateProfile: updateAuthProfile } = useAuthStore();
  const { deleteExistingPost, updateExistingPost, likePostAction, unlikePostAction, addCommentAction, deleteCommentAction, likeCommentAction, unlikeCommentAction, getPostLikesAction, editCommentAction } = usePostsStore();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCoverPhoto, setUploadingCoverPhoto] = useState(false);
  const [removingAvatar, setRemovingAvatar] = useState(false);
  const [removingCoverPhoto, setRemovingCoverPhoto] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [likesData, setLikesData] = useState(null);
  const [loadingLikes, setLoadingLikes] = useState(false);
  const [showEditCommentModal, setShowEditCommentModal] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || '',
    username: user?.username || ''
  });
  const [userProfile, setUserProfile] = useState(null);
  const fileInputRef = useRef(null);
  const coverPhotoInputRef = useRef(null);

  useEffect(() => {
    fetchUserProfile();
    fetchUserPosts();
  }, []);

  // Handle clicking outside menu to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      if (!target.closest('.post-menu')) {
        setPosts(prev => prev.map(p => ({ ...p, showMenu: false })));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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
      const userId = user?.id || user?._id;
      if (!userId) return;
      
      const response = await getUserPosts(userId, 1, 20);
      const postsWithMenu = (response.data.posts || []).map(post => ({
        ...post,
        showMenu: false,
        showComments: false
      }));
      setPosts(postsWithMenu);
    } catch (error) {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const userId = user?.id || user?._id;
      if (!userId) return;
      
      const response = await updateUserProfile(userId, profileData);
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
      const avatarUrl = response.data.url;
      const updatedUser = response.data.user;
      
      // Update auth store and local state with the complete user data
      updateAuthProfile(updatedUser);
      setUserProfile(prev => ({ ...prev, ...updatedUser }));
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

  const handleCoverPhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit for cover photo
      toast.error('Cover photo size should be less than 10MB');
      return;
    }

    try {
      setUploadingCoverPhoto(true);
      const response = await uploadCoverPhoto(file);
      const coverPhotoUrl = response.data.url;
      const updatedUser = response.data.user;

      updateAuthProfile(updatedUser);
      setUserProfile(prev => ({ ...prev, ...updatedUser }));
      toast.success('Cover photo updated successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to upload cover photo');
    } finally {
      setUploadingCoverPhoto(false);
      if (coverPhotoInputRef.current) {
        coverPhotoInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    const currentUser = userProfile || user;
    if (!currentUser?.avatar) {
      toast.error('No avatar to remove');
      return;
    }

    try {
      setRemovingAvatar(true);
      const response = await removeAvatar();
      const updatedUser = response.data.user;
      
      // Update auth store and local state
      updateAuthProfile(updatedUser);
      setUserProfile(prev => ({ ...prev, ...updatedUser }));
      toast.success('Avatar removed successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to remove avatar');
    } finally {
      setRemovingAvatar(false);
    }
  };

  const handleRemoveCoverPhoto = async () => {
    const currentUser = userProfile || user;
    if (!currentUser?.coverPhoto) {
      toast.error('No cover photo to remove');
      return;
    }

    try {
      setRemovingCoverPhoto(true);
      const response = await removeCoverPhoto();
      const updatedUser = response.data.user;
      
      // Update auth store and local state
      updateAuthProfile(updatedUser);
      setUserProfile(prev => ({ ...prev, ...updatedUser }));
      toast.success('Cover photo removed successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to remove cover photo');
    } finally {
      setRemovingCoverPhoto(false);
    }
  };

  const handlePostDelete = async (postId) => {
    try {
      await deleteExistingPost(postId);
      // Update local posts state
      setPosts(prev => prev.filter(post => post._id !== postId));
      toast.success('Post deleted successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to delete post');
    }
  };

  const handlePostUpdate = (post) => {
    setEditingPost(post);
    setShowEditModal(true);
  };

  const handlePostUpdated = () => {
    // Refresh posts to show the updated post
    fetchUserPosts();
    setShowEditModal(false);
    setEditingPost(null);
  };

  const handleLike = async (postId) => {
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }

    try {
      const post = posts.find(p => p._id === postId);
      const isLiked = post?.isLiked || false;
      
      if (isLiked) {
        await unlikePostAction(postId);
      } else {
        await likePostAction(postId);
      }
      
      // Update local posts state
      setPosts(prev => prev.map(p => {
        if (p._id === postId) {
          return {
            ...p,
            isLiked: !isLiked,
            likeCount: isLiked ? (p.likeCount || 1) - 1 : (p.likeCount || 0) + 1
          };
        }
        return p;
      }));
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleComment = async (postId, commentText) => {
    if (!user) {
      toast.error('Please login to comment');
      return;
    }

    try {
      await addCommentAction(postId, commentText.trim());
      // Refresh posts to show the new comment
      fetchUserPosts();
    } catch (error) {
      console.error('Comment error:', error);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      await deleteCommentAction(postId, commentId);
      // Refresh posts to show the updated comments
      fetchUserPosts();
    } catch (error) {
      console.error('Delete comment error:', error);
    }
  };

  const handleEditComment = async (comment, postId) => {
    setSelectedComment({ ...comment, postId });
    setShowEditCommentModal(true);
  };

  const handleCommentUpdated = () => {
    // Refresh posts to show the updated comment
    fetchUserPosts();
    setShowEditCommentModal(false);
    setSelectedComment(null);
  };

  const handleLikeComment = async (postId, commentId) => {
    if (!user) {
      toast.error('Please login to like comments');
      return;
    }

    try {
      const post = posts.find(p => p._id === postId);
      const comment = post?.comments?.find(c => c._id === commentId);
      const isCommentLiked = comment?.isLiked || false;
      
      if (isCommentLiked) {
        await unlikeCommentAction(postId, commentId);
      } else {
        await likeCommentAction(postId, commentId);
      }
      
      // Refresh posts to show the updated comment
      fetchUserPosts();
    } catch (error) {
      console.error('Like comment error:', error);
    }
  };

  const handleShowLikes = async (postId) => {
    const post = posts.find(p => p._id === postId);
    if (!post?.likeCount || post.likeCount === 0) return;
    
    setLoadingLikes(true);
    try {
      const response = await getPostLikesAction(postId);
      setLikesData(response);
      setShowLikesModal(true);
    } catch (error) {
      console.error('Get likes error:', error);
    } finally {
      setLoadingLikes(false);
    }
  };

  const handleShare = (post) => {
    if (navigator.share) {
      navigator.share({
        title: `${post.author?.firstName || 'User'} ${post.author?.lastName || ''}'s post`,
        text: post.content,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const fetchFollowers = async () => {
    setLoadingFollowers(true);
    try {
      const userId = user?.id || user?._id;
      const response = await api.get(`/users/${userId}/followers`);
      if (response.data.status === 'success') {
        setFollowers(response.data.data.followers || []);
        setShowFollowersModal(true);
      } else {
        toast.error('Failed to load followers');
      }
    } catch (error) {
      toast.error('Failed to load followers');
    } finally {
      setLoadingFollowers(false);
    }
  };

  const fetchFollowing = async () => {
    setLoadingFollowing(true);
    try {
      const userId = user?.id || user?._id;
      const response = await api.get(`/users/${userId}/following`);
      if (response.data.status === 'success') {
        setFollowingList(response.data.data.following || []);
        setShowFollowingModal(true);
      } else {
        toast.error('Failed to load following');
      }
    } catch (error) {
      toast.error('Failed to load following');
    } finally {
      setLoadingFollowing(false);
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
      <GradientBackground
        variant="default"
        className="flex items-center justify-center"
      >
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
          className=" bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-white dark:border-slate-900 overflow-hidden"
        >
          {/* Cover Photo */}
          <div className="h-48 bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 relative overflow-hidden">
            {currentUser?.coverPhoto ? (
              <img
                src={currentUser.coverPhoto}
                alt="Cover photo"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500"></div>
            )}
            {uploadingCoverPhoto && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-white" />
              </div>
            )}
            {removingCoverPhoto && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-white" />
              </div>
            )}
            {/* Cover Photo Action Buttons */}
            <div className="absolute top-4 right-4 flex space-x-2">
              {currentUser?.coverPhoto && (
                <button
                  onClick={handleRemoveCoverPhoto}
                  className="bg-red-500 hover:bg-red-600 backdrop-blur-sm text-white p-2.5 rounded-lg hover:shadow-lg transition-all duration-200 group border border-white/20"
                  disabled={removingCoverPhoto || uploadingCoverPhoto}
                  title="Remove cover photo"
                >
                  <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
              )}
              <button
                onClick={() => coverPhotoInputRef.current?.click()}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2.5 rounded-lg hover:shadow-lg transition-all duration-200 group border border-white/20"
                disabled={removingCoverPhoto || uploadingCoverPhoto}
                title="Upload cover photo"
              >
                <Camera className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </div>
            <input
              ref={coverPhotoInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverPhotoUpload}
              className="hidden"
            />
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
                        {currentUser?.firstName?.[0] || "U"}
                      </span>
                    )}
                    {uploadingAvatar && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-white" />
                      </div>
                    )}
                    {removingAvatar && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  {/* Avatar Action Buttons */}
                  <div className="absolute -bottom-2 -right-2 flex space-x-1">
                    {currentUser?.avatar && (
                      <button
                        onClick={handleRemoveAvatar}
                        className="bg-red-500 hover:bg-red-600 p-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group border-2 border-white"
                        disabled={removingAvatar || uploadingAvatar}
                        title="Remove avatar"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-white group-hover:scale-110 transition-transform" />
                      </button>
                    )}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white hover:bg-gray-50 p-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group border-2 border-white"
                      disabled={removingAvatar || uploadingAvatar}
                      title="Upload avatar"
                    >
                      <Camera className="w-4 h-4 text-slate-600 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
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
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              firstName: e.target.value,
                            })
                          }
                          className="bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-100 px-3 py-2 border border-slate-300 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="First Name"
                        />
                        <input
                          type="text"
                          value={profileData.lastName}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              lastName: e.target.value,
                            })
                          }
                          className="bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-100 px-3 py-2 border border-slate-300  dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="Last Name"
                        />
                      </div>
                      <input
                        type="text"
                        value={profileData.username}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            username: e.target.value,
                          })
                        }
                        className="bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-100 w-full px-3 py-2 border border-slate-300  dark:border-slate-800  rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Username"
                      />
                      <textarea
                        value={profileData.bio}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            bio: e.target.value,
                          })
                        }
                        className="bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-100 w-full px-3 py-2 border border-slate-300  dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
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
                          className="bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-100 px-4 py-2 rounded-lg border  dark:border-slate-800 font-medium hover:bg-slate-300  dark:hover:bg-slate-500 transition-colors flex items-center space-x-2"
                        >
                          <X className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {currentUser?.firstName} {currentUser?.lastName}
                      </h1>
                      <p className="text-slate-600">@{currentUser?.username}</p>
                      {currentUser?.bio && (
                        <p className="text-slate-700 mt-2 max-w-md">
                          {currentUser.bio}
                        </p>
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
                    className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-100 px-4 py-2 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex space-x-8 mt-6 pt-6 border-t border-slate-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {posts.length}
                </div>
                <div className="text-sm text-slate-600">Posts</div>
              </div>
              <button
                onClick={fetchFollowers}
                disabled={loadingFollowers}
                className="text-center hover:opacity-80 transition-opacity disabled:opacity-50"
              >
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {currentUser?.followerCount || 0}
                </div>
                <div className="text-sm text-slate-600">Followers</div>
              </button>
              <button
                onClick={fetchFollowing}
                disabled={loadingFollowing}
                className="text-center hover:opacity-80 transition-opacity disabled:opacity-50"
              >
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {currentUser?.followingCount || 0}
                </div>
                <div className="text-sm text-slate-600">Following</div>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Posts Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Posts</h2>
          {posts.length > 0 ? (
            <div className="grid gap-4">
              {posts.map((post, index) => {
                const isOwnPost =
                  user?.id?.toString() === post.author?._id?.toString() ||
                  user?._id?.toString() === post.author?._id?.toString();
                const isLiked = post.isLiked || false;

                return (
                  <motion.div
                    key={post._id || post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-slate-900 rounded-xl shadow-sm  p-4 relative"
                  >
                    {/* Post Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 rounded-full flex items-center justify-center overflow-hidden">
                          {post.author?.avatar ? (
                            <img
                              src={post.author.avatar}
                              alt={post.author.firstName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-slate-900 dark:text-slate-100 font-bold text-sm">
                              {post.author?.firstName?.[0] ||
                                currentUser?.firstName?.[0]}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">
                            {formatTimeAgo(post.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Post Menu */}
                      {isOwnPost && (
                        <div className="relative post-menu">
                          <button
                            onClick={() => {
                              // Toggle menu for this specific post
                              setPosts((prev) =>
                                prev.map((p) =>
                                  p._id === post._id
                                    ? { ...p, showMenu: !p.showMenu }
                                    : { ...p, showMenu: false }
                                )
                              );
                            }}
                            className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </button>

                          {/* Dropdown Menu */}
                          {post.showMenu && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-500 border-t-0 border-r-0 border-l-0 border-b-1 border-solid border-gray-200 z-50">
                              {" "}
                              <button
                                onClick={() => {
                                  handlePostUpdate(post);
                                  setPosts((prev) =>
                                    prev.map((p) => ({ ...p, showMenu: false }))
                                  );
                                }}
                                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors darkt:text-slate-100 dark:hover:bg-slate-100"
                              >
                                <Edit className="w-4 h-4" />
                                <span>Edit Post</span>
                              </button>
                              <button
                                onClick={() => {
                                  handlePostDelete(post._id);
                                  setPosts((prev) =>
                                    prev.map((p) => ({ ...p, showMenu: false }))
                                  );
                                }}
                                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete Post</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Post Content */}
                    <p className="text-slate-900 dark:text-slate-100 mb-3">
                      {post.content}
                    </p>
                    {post.images && post.images.length > 0 && (
                      <div className="mb-3">
                        <img
                          src={post.images[0].url}
                          alt="Post"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}

                    {/* Post Actions */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-6">
                        <button
                          onClick={() => handleLike(post._id)}
                          className={`flex items-center space-x-2 transition-colors ${
                            isLiked
                              ? "text-red-500"
                              : "text-slate-500 hover:text-red-500"
                          }`}
                        >
                          <Heart
                            className={`w-5 h-5 ${
                              isLiked ? "fill-current" : ""
                            }`}
                          />
                          <span className="text-sm">{post.likeCount || 0}</span>
                        </button>

                        <button
                          onClick={() => {
                            setPosts((prev) =>
                              prev.map((p) =>
                                p._id === post._id
                                  ? { ...p, showComments: !p.showComments }
                                  : p
                              )
                            );
                          }}
                          className="flex items-center space-x-2 text-slate-500 hover:text-indigo-500 transition-colors"
                        >
                          <MessageCircle className="w-5 h-5" />
                          <span className="text-sm">
                            {post.commentCount || 0}
                          </span>
                        </button>

                        <button
                          onClick={() => handleShare(post)}
                          className="flex items-center space-x-2 text-slate-500 hover:text-green-500 transition-colors"
                        >
                          <Share2 className="w-5 h-5" />
                          <span className="text-sm">Share</span>
                        </button>
                      </div>

                      {/* Who liked button */}
                      {post.likeCount > 0 && (
                        <button
                          onClick={() => handleShowLikes(post._id)}
                          disabled={loadingLikes}
                          className="flex items-center space-x-1 text-xs text-slate-500 hover:text-indigo-600 transition-colors disabled:opacity-50"
                        >
                          <Users className="w-3 h-3" />
                          <span>Who liked</span>
                        </button>
                      )}
                    </div>

                    {/* Comments Section */}
                    {post.showComments && (
                      <div className="border-t border-slate-100">
                        {/* Comment Input */}
                        <div className="p-4 border-b border-slate-100">
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              const commentText = e.target.commentText.value;
                              if (commentText.trim()) {
                                handleComment(post._id, commentText);
                                e.target.commentText.value = "";
                              }
                            }}
                            className="flex space-x-2"
                          >
                            <input
                              type="text"
                              name="commentText"
                              placeholder="Write a comment..."
                              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                            <button
                              type="submit"
                              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </form>
                        </div>

                        {/* Comments List */}
                        <div className="max-h-64 overflow-y-auto">
                          {post.comments && post.comments.length > 0 ? (
                            post.comments.map((comment) => (
                              <div
                                key={comment._id}
                                className="p-4 border-b border-slate-50 last:border-b-0"
                              >
                                <div className="flex items-start space-x-3">
                                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    {comment.user?.avatar ? (
                                      <img
                                        src={comment.user.avatar}
                                        alt={comment.user?.firstName || "User"}
                                        className="w-8 h-8 rounded-full object-cover"
                                      />
                                    ) : (
                                      <span className="text-white text-xs font-bold">
                                        {comment.user?.firstName?.[0] || "U"}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <span className="text-sm font-medium text-slate-900  dark:text-slate-100">
                                        {comment.user?.firstName || "Unknown"}{" "}
                                        {comment.user?.lastName || "User"}
                                      </span>
                                      <span className="text-xs text-slate-500">
                                        {formatTimeAgo(comment.createdAt)}
                                        {comment.isEdited && (
                                          <span className="ml-1">(edited)</span>
                                        )}
                                      </span>
                                    </div>

                                    <p className="text-sm text-slate-700 mb-2">
                                      {comment.content}
                                    </p>

                                    <div className="flex items-center space-x-4">
                                      <button
                                        onClick={() =>
                                          handleLikeComment(
                                            post._id,
                                            comment._id
                                          )
                                        }
                                        className={`flex items-center space-x-1 text-xs transition-colors ${
                                          comment.isLiked
                                            ? "text-indigo-600"
                                            : "text-slate-500 hover:text-indigo-600"
                                        }`}
                                      >
                                        <ThumbsUp className="w-3 h-3" />
                                        <span>{comment.likeCount || 0}</span>
                                      </button>

                                      {(user?.id?.toString() ===
                                        comment.user?._id?.toString() ||
                                        user?.id?.toString() ===
                                          post.author?._id?.toString()) && (
                                        <div className="flex space-x-2">
                                          {user?.id?.toString() ===
                                            comment.user?._id?.toString() && (
                                            <button
                                              onClick={() =>
                                                handleEditComment(
                                                  comment,
                                                  post._id
                                                )
                                              }
                                              className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors"
                                            >
                                              Edit
                                            </button>
                                          )}
                                          <button
                                            onClick={() =>
                                              handleDeleteComment(
                                                post._id,
                                                comment._id
                                              )
                                            }
                                            className="text-xs text-red-500 hover:text-red-700 transition-colors"
                                          >
                                            Delete
                                          </button>
                                        </div>
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
                );
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-white rounded-xl shadow-sm border"
            >
              <p className="text-slate-500 text-lg">
                No posts yet. Start sharing your thoughts!
              </p>
            </motion.div>
          )}
        </div>
      </div>

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

      {/* Likes Modal */}
      {showLikesModal && likesData && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full max-h-96 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900  dark:text-slate-100">
                Likes
              </h3>
              <button
                onClick={() => setShowLikesModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {likesData.likes.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center space-x-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-700 "
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 rounded-full flex items-center justify-center">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.firstName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold">
                        {user.firstName?.[0] || "U"}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900  dark:text-slate-100">
                      {user.firstName} {user.lastName}
                    </div>
                    <p className="text-sm text-slate-500">@{user.username}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Comment Modal */}
      <EditCommentModal
        comment={selectedComment}
        postId={selectedComment?.postId}
        isOpen={showEditCommentModal}
        onClose={() => {
          setShowEditCommentModal(false);
          setSelectedComment(null);
        }}
        onCommentUpdated={handleCommentUpdated}
      />

      {/* Followers Modal */}
      {showFollowersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full max-h-96 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Followers
              </h3>
              <button
                onClick={() => setShowFollowersModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {followers.length > 0 ? (
                followers.map((follower) => (
                  <div
                    key={follower._id}
                    className="flex items-center space-x-3 p-4 hover:bg-slate-50"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 rounded-full flex items-center justify-center">
                      {follower.avatar ? (
                        <img
                          src={follower.avatar}
                          alt={follower.firstName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold">
                          {follower.firstName?.[0] || "U"}
                        </span>
                      )}
                    </div>
                    <div>
                      <Link
                        to={`/user/${follower._id}`}
                        className="font-medium text-slate-900 dark:text-slate-100 hover:text-indigo-600 transition-colors"
                      >
                        {follower.firstName} {follower.lastName}
                      </Link>
                      <p className="text-sm text-slate-500 dark:text-slate-100">
                        @{follower.username}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-slate-500">
                  No followers yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Following Modal */}
      {showFollowingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full max-h-96 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Following
              </h3>
              <button
                onClick={() => setShowFollowingModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {followingList.length > 0 ? (
                followingList.map((following) => (
                  <div
                    key={following._id}
                    className="flex items-center space-x-3 p-4 hover:bg-slate-50"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 rounded-full flex items-center justify-center">
                      {following.avatar ? (
                        <img
                          src={following.avatar}
                          alt={following.firstName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold">
                          {following.firstName?.[0] || "U"}
                        </span>
                      )}
                    </div>
                    <div>
                      <Link
                        to={`/user/${following._id}`}
                        className="font-medium text-slate-900 hover:text-indigo-600 transition-colors"
                      >
                        {following.firstName} {following.lastName}
                      </Link>
                      <p className="text-sm text-slate-500 dark:text-slate-100">
                        @{following.username}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-slate-500">
                  Not following anyone yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </GradientBackground>
  );
};

export default Profile; 