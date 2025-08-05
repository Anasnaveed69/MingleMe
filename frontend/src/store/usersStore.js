import { create } from 'zustand';
import { searchUsers, followUser, unfollowUser } from '../services/usersService';
import toast from 'react-hot-toast';

const useUsersStore = create((set, get) => ({
  // State
  searchResults: [],
  searchLoading: false,
  pagination: {
    page: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
    total: 0
  },

  // Actions
  searchUsersAction: async (searchTerm, page = 1, limit = 10) => {
    try {
      set({ searchLoading: true });
      const response = await searchUsers(searchTerm, page, limit);
      
      set({
        searchResults: response.data.users,
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
      console.error('Search users error:', error);
    } finally {
      set({ searchLoading: false });
    }
  },

  followUserAction: async (userId) => {
    try {
      const response = await followUser(userId);
      
      // Update the user in search results to show they're now being followed
      set(state => ({
        searchResults: state.searchResults.map(user => 
          user.id === userId 
            ? { ...user, isFollowing: true, followerCount: user.followerCount + 1 }
            : user
        )
      }));
      
      toast.success('User followed successfully!');
      return response;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  },

  unfollowUserAction: async (userId) => {
    try {
      const response = await unfollowUser(userId);
      
      // Update the user in search results to show they're no longer being followed
      set(state => ({
        searchResults: state.searchResults.map(user => 
          user.id === userId 
            ? { ...user, isFollowing: false, followerCount: Math.max(0, user.followerCount - 1) }
            : user
        )
      }));
      
      toast.success('User unfollowed successfully!');
      return response;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  },

  // Clear search results
  clearSearchResults: () => {
    set({ 
      searchResults: [], 
      searchLoading: false,
      pagination: {
        page: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
        total: 0
      }
    });
  },

  // Reset store
  reset: () => {
    set({
      searchResults: [],
      searchLoading: false,
      pagination: {
        page: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
        total: 0
      }
    });
  }
}));

export default useUsersStore; 