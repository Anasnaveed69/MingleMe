import { create } from 'zustand';
import { 
  getPosts, 
  createPost, 
  getPost, 
  updatePost, 
  deletePost, 
  likePost, 
  unlikePost,
  addComment,
  deleteComment,
  likeComment,
  unlikeComment,
  getUserPosts,
  uploadImage,
  searchPosts
} from '../services/postsService';
import toast from 'react-hot-toast';

const usePostsStore = create((set, get) => ({
  // State
  posts: [],
  currentPost: null,
  userPosts: [],
  loading: false,
  submitting: false,
  uploading: false,
  pagination: {
    page: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
    total: 0
  },
  searchResults: [],
  searchLoading: false,

  // Actions
  setLoading: (loading) => set({ loading }),
  setSubmitting: (submitting) => set({ submitting }),
  setUploading: (uploading) => set({ uploading }),

  // Fetch all posts
  fetchPosts: async (page = 1, limit = 10, search = '') => {
    try {
      set({ loading: true });
      const response = await getPosts(page, limit, search);
      
      set({
        posts: response.data.posts,
        pagination: {
          page: response.data.page,
          totalPages: response.data.totalPages,
          hasNext: response.data.hasNext,
          hasPrev: response.data.hasPrev,
          total: response.data.total
        }
      });
    } catch (error) {
      toast.error(error.message);
      console.error('Fetch posts error:', error);
    } finally {
      set({ loading: false });
    }
  },

  // Create a new post
  createNewPost: async (postData) => {
    try {
      set({ submitting: true });
      const response = await createPost(postData);
      
      // Add the new post to the beginning of the posts array
      set(state => ({
        posts: [response.data.post, ...state.posts],
        pagination: {
          ...state.pagination,
          total: state.pagination.total + 1
        }
      }));
      
      toast.success('Post created successfully!');
      return response.data.post;
    } catch (error) {
      toast.error(error.message);
      throw error;
    } finally {
      set({ submitting: false });
    }
  },

  // Get a single post
  fetchPost: async (postId) => {
    try {
      set({ loading: true });
      const response = await getPost(postId);
      set({ currentPost: response.data.post });
      return response.data.post;
    } catch (error) {
      toast.error(error.message);
      console.error('Fetch post error:', error);
    } finally {
      set({ loading: false });
    }
  },

  // Update a post
  updateExistingPost: async (postId, postData) => {
    try {
      set({ submitting: true });
      const response = await updatePost(postId, postData);
      
      // Update the post in the posts array
      set(state => ({
        posts: state.posts.map(post => 
          post._id === postId ? response.data.post : post
        ),
        currentPost: response.data.post
      }));
      
      toast.success('Post updated successfully!');
      return response.data.post;
    } catch (error) {
      toast.error(error.message);
      throw error;
    } finally {
      set({ submitting: false });
    }
  },

  // Delete a post
  deleteExistingPost: async (postId) => {
    try {
      set({ submitting: true });
      await deletePost(postId);
      
      // Remove the post from the posts array
      set(state => ({
        posts: state.posts.filter(post => post._id !== postId),
        currentPost: state.currentPost?._id === postId ? null : state.currentPost,
        pagination: {
          ...state.pagination,
          total: state.pagination.total - 1
        }
      }));
      
      toast.success('Post deleted successfully!');
    } catch (error) {
      toast.error(error.message);
      throw error;
    } finally {
      set({ submitting: false });
    }
  },

  // Like a post
  likePostAction: async (postId) => {
    try {
      await likePost(postId);
      
      // Update the post in the posts array
      set(state => ({
        posts: state.posts.map(post => {
          if (post._id === postId) {
            return {
              ...post,
              isLiked: true,
              likeCount: post.likeCount + 1
            };
          }
          return post;
        }),
        currentPost: state.currentPost?._id === postId ? {
          ...state.currentPost,
          isLiked: true,
          likeCount: state.currentPost.likeCount + 1
        } : state.currentPost
      }));
    } catch (error) {
      toast.error(error.message);
      console.error('Like post error:', error);
    }
  },

  // Unlike a post
  unlikePostAction: async (postId) => {
    try {
      await unlikePost(postId);
      
      // Update the post in the posts array
      set(state => ({
        posts: state.posts.map(post => {
          if (post._id === postId) {
            return {
              ...post,
              isLiked: false,
              likeCount: Math.max(0, post.likeCount - 1)
            };
          }
          return post;
        }),
        currentPost: state.currentPost?._id === postId ? {
          ...state.currentPost,
          isLiked: false,
          likeCount: Math.max(0, state.currentPost.likeCount - 1)
        } : state.currentPost
      }));
    } catch (error) {
      toast.error(error.message);
      console.error('Unlike post error:', error);
    }
  },

  // Add a comment
  addCommentAction: async (postId, content) => {
    try {
      const response = await addComment(postId, content);
      
      // Update the post in the posts array
      set(state => ({
        posts: state.posts.map(post => {
          if (post._id === postId) {
            return {
              ...post,
              comments: [...post.comments, response.data.comment],
              commentCount: post.commentCount + 1
            };
          }
          return post;
        }),
        currentPost: state.currentPost?._id === postId ? {
          ...state.currentPost,
          comments: [...state.currentPost.comments, response.data.comment],
          commentCount: state.currentPost.commentCount + 1
        } : state.currentPost
      }));
      
      toast.success('Comment added successfully!');
      return response.data.comment;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  },

  // Delete a comment
  deleteCommentAction: async (postId, commentId) => {
    try {
      await deleteComment(postId, commentId);
      
      // Update the post in the posts array
      set(state => ({
        posts: state.posts.map(post => {
          if (post._id === postId) {
            return {
              ...post,
              comments: post.comments.filter(comment => comment._id !== commentId),
              commentCount: Math.max(0, post.commentCount - 1)
            };
          }
          return post;
        }),
        currentPost: state.currentPost?._id === postId ? {
          ...state.currentPost,
          comments: state.currentPost.comments.filter(comment => comment._id !== commentId),
          commentCount: Math.max(0, state.currentPost.commentCount - 1)
        } : state.currentPost
      }));
      
      toast.success('Comment deleted successfully!');
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  },

  // Like a comment
  likeCommentAction: async (postId, commentId) => {
    try {
      await likeComment(postId, commentId);
      
      // Update the comment in the posts array
      set(state => ({
        posts: state.posts.map(post => {
          if (post._id === postId) {
            return {
              ...post,
              comments: post.comments.map(comment => {
                if (comment._id === commentId) {
                  return {
                    ...comment,
                    isLiked: true,
                    likeCount: comment.likeCount + 1
                  };
                }
                return comment;
              })
            };
          }
          return post;
        })
      }));
    } catch (error) {
      toast.error(error.message);
      console.error('Like comment error:', error);
    }
  },

  // Unlike a comment
  unlikeCommentAction: async (postId, commentId) => {
    try {
      await unlikeComment(postId, commentId);
      
      // Update the comment in the posts array
      set(state => ({
        posts: state.posts.map(post => {
          if (post._id === postId) {
            return {
              ...post,
              comments: post.comments.map(comment => {
                if (comment._id === commentId) {
                  return {
                    ...comment,
                    isLiked: false,
                    likeCount: Math.max(0, comment.likeCount - 1)
                  };
                }
                return comment;
              })
            };
          }
          return post;
        })
      }));
    } catch (error) {
      toast.error(error.message);
      console.error('Unlike comment error:', error);
    }
  },

  // Get user posts
  fetchUserPosts: async (userId, page = 1, limit = 10) => {
    try {
      set({ loading: true });
      const response = await getUserPosts(userId, page, limit);
      
      set({
        userPosts: response.data.posts,
        pagination: {
          page: response.data.page,
          totalPages: response.data.totalPages,
          hasNext: response.data.hasNext,
          hasPrev: response.data.hasPrev,
          total: response.data.total
        }
      });
    } catch (error) {
      toast.error(error.message);
      console.error('Fetch user posts error:', error);
    } finally {
      set({ loading: false });
    }
  },

  // Upload image
  uploadImageAction: async (file) => {
    try {
      set({ uploading: true });
      const response = await uploadImage(file);
      return response.data;
    } catch (error) {
      toast.error(error.message);
      throw error;
    } finally {
      set({ uploading: false });
    }
  },

  // Search posts
  searchPostsAction: async (searchTerm, page = 1, limit = 10) => {
    try {
      set({ searchLoading: true });
      const response = await searchPosts(searchTerm, page, limit);
      
      set({
        searchResults: response.data.posts,
        pagination: {
          page: response.data.page,
          totalPages: response.data.totalPages,
          hasNext: response.data.hasNext,
          hasPrev: response.data.hasPrev,
          total: response.data.total
        }
      });
    } catch (error) {
      toast.error(error.message);
      console.error('Search posts error:', error);
    } finally {
      set({ searchLoading: false });
    }
  },

  // Clear search results
  clearSearchResults: () => {
    set({ searchResults: [], searchLoading: false });
  },

  // Clear current post
  clearCurrentPost: () => {
    set({ currentPost: null });
  },

  // Reset store
  reset: () => {
    set({
      posts: [],
      currentPost: null,
      userPosts: [],
      loading: false,
      submitting: false,
      uploading: false,
      pagination: {
        page: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
        total: 0
      },
      searchResults: [],
      searchLoading: false
    });
  }
}));

export default usePostsStore; 