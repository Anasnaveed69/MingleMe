import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';

const UserProfile = () => {
  const { userId } = useParams();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border p-8 text-center"
      >
                   <div className="w-24 h-24 bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="text-white w-12 h-12" />
        </div>
                   <h1 className="text-2xl font-bold text-slate-900 mb-2">User Profile</h1>
           <p className="text-slate-600">User ID: {userId}</p>
           <p className="text-slate-500 mt-4">This feature is coming soon!</p>
      </motion.div>
    </div>
  );
};

export default UserProfile; 