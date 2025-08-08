import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Edit, 
  Camera, 
  Settings, 
  Loader2, 
  X, 
  Check, 
  Trash2, 
  MoreHorizontal, 
  Heart, 
  MessageCircle, 
  Share2, 
  Send, 
  ThumbsUp, 
  Users,
  UserPlus,
  UserCheck,
  User
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import usePostsStore from '../../store/postsStore';
import { getUserProfile, followUser, unfollowUser, getUserPosts } from '../../services/userService';
import toast from 'react-hot-toast';
import GradientBackground from '../../components/ui/GradientBackground';
import EditPostModal from '../../components/Posts/EditPostModal';
import EditCommentModal from '../../components/Posts/EditCommentModal';
import api from '../../utils/api';

const UserProfile = () => {
  const { id } = useParams();
  const { user } = useAuthStore();
  const { deleteExistingPost, updateExistingPost, likePostAction, unlikePostAction, addCommentAction, deleteCommentAction, likeCommentAction, unlikeCommentAction, getPostLikesAction, editCommentAction } = usePostsStore();
  
  const [userProfile, setUserProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchUserProfile();
      fetchUserPosts();
      
      // Set a timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        setLoading(false);
      }, 10000); // 10 seconds timeout
      
      return () => clearTimeout(timeout);
    }
  }, [id]);

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
      const response = await getUserProfile(id);
      const profile = response.data.user;
      setUserProfile(profile);
      
      // Check if current user is following this user
      if (user && profile.followers) {
        const isFollowing = profile.followers.some(follower => 
          follower._id === user.id || follower._id === user._id
        );
        setFollowing(isFollowing);
      }
    } catch (error) {
      toast.error('Failed to load profile');
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await getUserPosts(id, 1, 20);
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

  const handleFollow = async () => {
    if (!user) {
      toast.error('Please login to follow users');
      return;
    }

    if (user.id === id || user._id === id) {
      toast.error('You cannot follow yourself');
      return;
    }

    setFollowLoading(true);
    try {
      if (following) {
        await unfollowUser(id);
        setFollowing(false);
        toast.success('Unfollowed successfully!');
      } else {
        await followUser(id);
        setFollowing(true);
        toast.success('Followed successfully!');
      }
      
      // Refresh user profile to get updated follower count
      fetchUserProfile();
    } catch (error) {
      toast.error(error.message || 'Failed to follow/unfollow user');
    } finally {
      setFollowLoading(false);
    }
  };

  const fetchFollowers = async () => {
    setLoadingFollowers(true);
    try {
      const response = await api.get(`/users/${id}/followers`);
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
      const response = await api.get(`/users/${id}/following`);
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
      fetchUserPosts();
    } catch (error) {
      console.error('Comment error:', error);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      await deleteCommentAction(postId, commentId);
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

  if (!userProfile) {
    return (
      <GradientBackground variant="default" className="flex items-center justify-center">
        <div className="text-center">
          <User className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">User not found</p>
        </div>
      </GradientBackground>
    );
  }

  const isOwnProfile = user?.id === id || user?._id === id;

  return (
    <GradientBackground variant="default">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900   border-white dark:border-slate-800 rounded-xl shadow-sm border overflow-hidden"
        >
          {/* Cover Photo */}
          <div className="h-48 bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 relative overflow-hidden">
            {userProfile?.coverPhoto ? (
              <img
                src={userProfile.coverPhoto}
                alt="Cover photo"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500"></div>
            )}
          </div>

          {/* Profile Info */}
          <div className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col sm:flex-row sm:items-end space-y-4 sm:space-y-0 sm:space-x-6">
                {/* Avatar */}
                <div className="relative -mt-16">
                  <div className="w-32 h-32 bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
                    {userProfile?.avatar ? (
                      <img
                        src={userProfile.avatar}
                        alt={`${userProfile.firstName} ${userProfile.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-4xl font-bold">
                        {userProfile?.firstName?.[0] || "U"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Profile Details */}
                <div className="space-y-2">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {userProfile?.firstName} {userProfile?.lastName}
                    </h1>
                    <p className="text-slate-600 dark:text-white">
                      @{userProfile?.username}
                    </p>
                    {userProfile?.bio && (
                      <p className="text-slate-700 dark:text-white mt-2 max-w-md">
                        {userProfile.bio}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Follow Button */}
              {!isOwnProfile && (
                <div className="flex space-x-2">
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg ${
                      following
                        ? "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-500"
                        : "bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 text-white hover:from-indigo-700 hover:via-purple-700 hover:to-teal-600"
                    }`}
                  >
                    {followLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : following ? (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Follow</span>
                      </>
                    )}
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
                className="text-center hover:opacity-80 transition-opacity"
              >
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {userProfile?.followerCount || 0}
                </div>
                <div className="text-sm text-slate-600">Followers</div>
              </button>
              <button
                onClick={fetchFollowing}
                disabled={loadingFollowing}
                className="text-center hover:opacity-80 transition-opacity"
              >
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {userProfile?.followingCount || 0}
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
                    className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-white dark:border-slate-800 p-4 relative"
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
                            <span className="text-slate-900 dark:text-white font-bold text-sm">
                              {post.author?.firstName?.[0] ||
                                userProfile?.firstName?.[0]}
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
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                              <button
                                onClick={() => {
                                  setEditingPost(post);
                                  setShowEditModal(true);
                                  setPosts((prev) =>
                                    prev.map((p) => ({ ...p, showMenu: false }))
                                  );
                                }}
                                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                                <span>Edit Post</span>
                              </button>
                              <button
                                onClick={() => {
                                  // Handle delete post
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
                                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
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
              <p className="text-slate-500 text-lg">No posts yet.</p>
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
        onPostUpdated={() => {
          fetchUserPosts();
          setShowEditModal(false);
          setEditingPost(null);
        }}
      />

      {/* Likes Modal */}
      {showLikesModal && likesData && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full max-h-96 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Likes</h3>
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
                  className="flex items-center space-x-3 p-4 hover:bg-slate-50"
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
                    <Link
                      to={`/user/${user._id}`}
                      className="font-medium text-slate-900 hover:text-indigo-600 transition-colors"
                    >
                      {user.firstName} {user.lastName}
                    </Link>
                    <p className="text-sm text-slate-500">@{user.username}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Followers Modal */}
      {showFollowersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full max-h-96 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
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
                        className="font-medium text-slate-900 hover:text-indigo-600 transition-colors"
                      >
                        {follower.firstName} {follower.lastName}
                      </Link>
                      <p className="text-sm text-slate-500 dark:text-white">
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
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
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
                      <p className="text-sm text-slate-500 dark:bg-slate-100">
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
    </GradientBackground>
  );
};

export default UserProfile; 