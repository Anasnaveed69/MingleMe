import api from '../utils/api';

// Get all posts with pagination and search
export const getPosts = async (page = 1, limit = 10, search = '') => {
  try {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (search) params.append('search', search);

    const response = await api.get(`/posts?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch posts');
  }
};

// Create a new post
export const createPost = async (postData) => {
  try {
    const response = await api.post('/posts', postData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create post');
  }
};

// Get a single post by ID
export const getPost = async (postId) => {
  try {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch post');
  }
};

// Update a post
export const updatePost = async (postId, postData) => {
  try {
    const response = await api.put(`/posts/${postId}`, postData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update post');
  }
};

// Delete a post
export const deletePost = async (postId) => {
  try {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete post');
  }
};

// Like a post
export const likePost = async (postId) => {
  try {
    const response = await api.post(`/posts/${postId}/like`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to like post');
  }
};

// Unlike a post
export const unlikePost = async (postId) => {
  try {
    const response = await api.delete(`/posts/${postId}/like`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to unlike post');
  }
};

// Add a comment to a post
export const addComment = async (postId, content) => {
  try {
    const response = await api.post(`/posts/${postId}/comments`, { content });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to add comment');
  }
};

// Delete a comment
export const deleteComment = async (postId, commentId) => {
  try {
    const response = await api.delete(`/posts/${postId}/comments/${commentId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete comment');
  }
};

// Like a comment
export const likeComment = async (postId, commentId) => {
  try {
    const response = await api.post(`/posts/${postId}/comments/${commentId}/like`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to like comment');
  }
};

// Unlike a comment
export const unlikeComment = async (postId, commentId) => {
  try {
    const response = await api.delete(`/posts/${postId}/comments/${commentId}/like`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to unlike comment');
  }
};

// Get user's posts
export const getUserPosts = async (userId, page = 1, limit = 10) => {
  try {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);

    const response = await api.get(`/users/${userId}/posts?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch user posts');
  }
};

// Upload image to Cloudinary
export const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to upload image');
  }
};

// Search posts
export const searchPosts = async (searchTerm, page = 1, limit = 10) => {
  try {
    const params = new URLSearchParams();
    params.append('search', searchTerm);
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);

    const response = await api.get(`/posts/search?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to search posts');
  }
}; 