import api from '../utils/api';

// Search users
export const searchUsers = async (searchTerm, page = 1, limit = 10) => {
  try {
    const params = new URLSearchParams();
    params.append('search', searchTerm);
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);

    const response = await api.get(`/users?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to search users');
  }
};

// Get user profile by ID
export const getUserProfile = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch user profile');
  }
};

// Follow a user
export const followUser = async (userId) => {
  try {
    const response = await api.post(`/users/${userId}/follow`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to follow user');
  }
};

// Unfollow a user
export const unfollowUser = async (userId) => {
  try {
    const response = await api.delete(`/users/${userId}/follow`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to unfollow user');
  }
};

// Get user's followers
export const getUserFollowers = async (userId, page = 1, limit = 10) => {
  try {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);

    const response = await api.get(`/users/${userId}/followers?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch followers');
  }
};

// Get user's following
export const getUserFollowing = async (userId, page = 1, limit = 10) => {
  try {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);

    const response = await api.get(`/users/${userId}/following?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch following');
  }
}; 