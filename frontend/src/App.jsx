import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Store
import useAuthStore from './store/authStore';

// Components
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Pages
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import OTPVerification from './pages/Auth/OTPVerification';
import Feed from './pages/Feed/Feed';
import Profile from './pages/Profile/Profile';
import UserProfile from './pages/Profile/UserProfile';
import PostDetail from './pages/Posts/PostDetail';
import CreatePost from './pages/CreatePost/CreatePost';
import Search from './pages/Search/Search';
import Notifications from './pages/Notifications/Notifications';
import NotFound from './pages/NotFound';

// Loading component
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="loading-spinner w-12 h-12 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading MingleMe...</p>
    </div>
  </div>
);

function App() {
  const { isAuthenticated, initializeAuth, checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    // Initialize auth state
    initializeAuth();
    
    // Only check auth on app startup if we have a token but not authenticated
    const { token } = useAuthStore.getState();
    if (token && !isAuthenticated) {
      checkAuth();
    }
  }, []); // Only run on mount

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <div className="App">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={
                isAuthenticated ? (
                  <Navigate to="/feed" replace />
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Login />
                  </motion.div>
                )
              } 
            />
            
            <Route 
              path="/signup" 
              element={
                isAuthenticated ? (
                  <Navigate to="/feed" replace />
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Signup />
                  </motion.div>
                )
              } 
            />
            
            <Route 
              path="/verify-otp" 
              element={
                isAuthenticated ? (
                  <Navigate to="/feed" replace />
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <OTPVerification />
                  </motion.div>
                )
              } 
            />

            {/* Protected Routes */}
            <Route 
              path="/feed" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Feed />
                    </motion.div>
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Profile />
                    </motion.div>
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/user/:id" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <UserProfile />
                    </motion.div>
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/post/:id" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <PostDetail />
                    </motion.div>
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/create-post" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CreatePost />
                    </motion.div>
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
                    <Route
          path="/search"
          element={
            <ProtectedRoute>
              <Layout>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Search />
                </motion.div>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Layout>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Notifications />
                </motion.div>
              </Layout>
            </ProtectedRoute>
          }
        />

            {/* Default redirect */}
            <Route 
              path="/" 
              element={
                isAuthenticated ? (
                  <Navigate to="/feed" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />

            {/* 404 Route */}
            <Route 
              path="*" 
              element={
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <NotFound />
                </motion.div>
              } 
            />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default App; 