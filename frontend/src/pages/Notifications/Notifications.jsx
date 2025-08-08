import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Heart, 
  MessageCircle, 
  UserPlus, 
  AtSign, 
  Share2,
  Check,
  Trash2,
  CheckCheck,
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import useNotificationStore from '../../store/notificationStore';
import toast from 'react-hot-toast';

const Notifications = () => {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    pagination,
    fetchNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotificationStore();
  
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchNotifications(currentPage, 20, filter === 'unread');
  }, [currentPage, filter]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'follow':
        return <UserPlus className="w-5 h-5 text-green-500" />;
      case 'mention':
        return <AtSign className="w-5 h-5 text-purple-500" />;
      case 'post_shared':
        return <Share2 className="w-5 h-5 text-orange-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center text-slate-900 dark:text-slate-100 justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Notifications
            </h1>
            <p className="text-slate-600 mt-1">
              {unreadCount > 0
                ? `${unreadCount} unread notification${
                    unreadCount !== 1 ? "s" : ""
                  }`
                : "All caught up!"}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {/* Filter Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
              <button
                onClick={() => handleFilterChange("all")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  filter === "all"
                    ? "bg-white  dark:bg-slate-800 text-indigo-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleFilterChange("unread")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  filter === "unread"
                    ? "bg-white  dark:bg-slate-800 text-indigo-600 shadow-sm"
                    : "text-slate-600 dark:text-slate-100 hover:text-slate-800"
                }`}
              >
                Unread
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Mark all read</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border-white dark:border-slate-800 shadow-sm border">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-100">
              Loading notifications...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 text-lg font-medium mb-2">
              {filter === "unread"
                ? "No unread notifications"
                : "No notifications yet"}
            </p>
            <p className="text-slate-500">
              {filter === "unread"
                ? "You're all caught up!"
                : "When you get notifications, they'll appear here"}
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-slate-100 dark:divide-slate-700 ">
              {notifications.map((notification) => (
                <motion.div
                  key={notification._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                    !notification.read ? "bg-indigo-50 dark:bg-slate-800" : ""
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Avatar */}
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                      {notification.sender?.avatar ? (
                        <img
                          src={notification.sender.avatar}
                          alt={notification.sender.firstName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold">
                          {notification.sender?.firstName?.[0]}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {notification.sender?.firstName}{" "}
                          {notification.sender?.lastName}
                        </span>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-500">
                        {notification.timeAgo}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4 text-slate-500" />
                        </button>
                      )}
                      <button
                        onClick={() =>
                          handleDeleteNotification(notification._id)
                        }
                        className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                        title="Delete notification"
                      >
                        <Trash2 className="w-4 h-4 text-slate-500" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-4 py-3 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600">
                    Showing page {pagination.page} of {pagination.totalPages}
                  </p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPrev}
                      className="px-3 py-1 text-sm text-slate-600 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-slate-600">
                      {pagination.page} / {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNext}
                      className="px-3 py-1 text-sm text-slate-600 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default Notifications; 