import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import CreatePostComponent from '../../components/Posts/CreatePost';
import usePostsStore from '../../store/postsStore';
import { useNavigate } from 'react-router-dom';

const CreatePost = () => {
  const { posts } = usePostsStore();
  const navigate = useNavigate();

  const handlePostCreated = () => {
    // Redirect to feed after successful post creation
    navigate('/feed');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Link
          to="/feed"
          className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Feed</span>
        </Link>
      </div>

      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Create New Post</h1>
        <p className="text-slate-600 mt-1">Share what's on your mind with the community</p>
      </div>

      {/* Create Post Component */}
      <CreatePostComponent onPostCreated={handlePostCreated} />
    </motion.div>
  );
};

export default CreatePost; 