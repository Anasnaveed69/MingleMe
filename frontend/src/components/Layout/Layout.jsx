import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  User, 
  Search, 
  Bell, 
  Plus, 
  Menu, 
  X, 
  LogOut,
  Settings
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

// ...existing code...
import ChatBubbleIcon from '../ui/ChatBubbleIcon';
import ThemeToggle from '../ui/ThemeToggle';
import NotificationDropdown from '../Notifications/NotificationDropdown';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Feed', href: '/feed', icon: Home },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Search', href: '/search', icon: Search },
    { name: 'Create Post', href: '/create-post', icon: Plus },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 z-50 h-full w-64 bg-white dark:bg-slate-900 shadow-2xl lg:hidden"
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-3">
                  <ChatBubbleIcon size={20} animate={true} />
                  <span className="text-xl font-bold text-slate-900 dark:text-white">
                    MingleMe
                  </span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-4 py-6 space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive(item.href)
                          ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 text-white shadow-lg"
                          : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Footer */}
              <div className="border-t border-slate-200 dark:border-slate-700 p-4 space-y-2">
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Theme
                  </span>
                  <ThemeToggle size="sm" />
                </div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center space-x-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-slate-900 px-6 pb-4 border-r border-slate-200 dark:border-slate-700">
          {/* Header */}
          <div className="flex h-16 shrink-0 items-center">
            <div className="flex items-center space-x-3">
              <ChatBubbleIcon size={20} animate={true} />
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                MingleMe
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-all duration-200 ${
                            isActive(item.href)
                              ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 text-white shadow-lg"
                              : "text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700"
                          }`}
                        >
                          <Icon className="h-6 w-6 shrink-0" />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            </ul>
          </nav>

          {/* Footer */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Theme
              </span>
              <ThemeToggle size="sm" />
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-all duration-200"
            >
              <LogOut className="h-6 w-6 shrink-0" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-slate-700 dark:text-slate-300 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Theme Toggle */}
              <ThemeToggle size="md" />

              {/* Notifications */}
              <NotificationDropdown />

              {/* User menu */}
              <div className="flex items-center gap-x-4">
                <Link
                  to="/profile"
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200"
                >
                  <img
                    className="w-10 h-10 bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 rounded-full flex items-center justify-centerr"
                    src={
                      user?.avatar ||
                      `https://ui-avatars.com/api/?name= ${user.username}&size=100&rounded=1&color=ffffff&background=000000  `
                    }
                    alt={user?.username || "User"}
                  />
                  <span className="hidden text-sm font-medium text-slate-700 dark:text-slate-300 lg:block">
                    {user?.username || "User"}
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
