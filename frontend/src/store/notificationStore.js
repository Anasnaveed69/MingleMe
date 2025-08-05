import { create } from 'zustand';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification, 
  getUnreadCount 
} from '../services/notificationService';
import toast from 'react-hot-toast';

const useNotificationStore = create((set, get) => ({
  // State
  notifications: [],
  unreadCount: 0,
  loading: false,
  pagination: {
    page: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
    total: 0
  },

  // Actions
  fetchNotifications: async (page = 1, limit = 20, unreadOnly = false) => {
    try {
      set({ loading: true });
      const response = await getNotifications(page, limit, unreadOnly);
      
      set({
        notifications: response.data.notifications,
        unreadCount: response.data.unreadCount,
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
      console.error('Fetch notifications error:', error);
    } finally {
      set({ loading: false });
    }
  },

  markAsRead: async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      
      // Update local state
      set(state => ({
        notifications: state.notifications.map(notification => 
          notification._id === notificationId 
            ? { ...notification, read: true }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }));
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  },

  markAllAsRead: async () => {
    try {
      await markAllNotificationsAsRead();
      
      // Update local state
      set(state => ({
        notifications: state.notifications.map(notification => ({
          ...notification,
          read: true
        })),
        unreadCount: 0
      }));
      
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      
      // Update local state
      set(state => {
        const notification = state.notifications.find(n => n._id === notificationId);
        return {
          notifications: state.notifications.filter(n => n._id !== notificationId),
          unreadCount: notification && !notification.read 
            ? Math.max(0, state.unreadCount - 1) 
            : state.unreadCount
        };
      });
      
      toast.success('Notification deleted');
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = await getUnreadCount();
      set({ unreadCount: response.data.unreadCount });
    } catch (error) {
      console.error('Fetch unread count error:', error);
    }
  },

  addNotification: (notification) => {
    set(state => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    }));
  },

  clearNotifications: () => {
    set({
      notifications: [],
      unreadCount: 0,
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
      notifications: [],
      unreadCount: 0,
      loading: false,
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

export default useNotificationStore; 