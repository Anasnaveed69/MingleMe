import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

// ...existing code...
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Layout from './components/Layout/Layout';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import OTPVerification from './pages/Auth/OTPVerification';
import Feed from './pages/Feed/Feed';
import Profile from './pages/Profile/Profile';
import UserProfile from './pages/Profile/UserProfile';
import CreatePost from './pages/CreatePost/CreatePost';
import Search from './pages/Search/Search';
import Notifications from './pages/Notifications/Notifications';
import PostDetail from './pages/Posts/PostDetail';
import NotFound from './pages/NotFound';

function App() {
  const { user } = useAuthStore();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={user ? <Navigate to="/feed" replace /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/feed" replace /> : <Signup />} />
      <Route path="/verify-otp" element={user ? <Navigate to="/feed" replace /> : <OTPVerification />} />
      
      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/feed" replace />} />
        <Route path="feed" element={<Feed />} />
        <Route path="profile" element={<Profile />} />
        <Route path="user/:id" element={<UserProfile />} />
        <Route path="create-post" element={<CreatePost />} />
        <Route path="search" element={<Search />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="post/:id" element={<PostDetail />} />
      </Route>
      
      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App; 