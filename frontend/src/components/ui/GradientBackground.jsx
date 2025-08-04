import React from 'react';
import { motion } from 'framer-motion';

const GradientBackground = ({ children, className = '', variant = 'default' }) => {
  const variants = {
    default: 'bg-gradient-to-br from-indigo-50 via-purple-50 to-teal-50',
    primary: 'bg-gradient-to-br from-indigo-100 via-purple-100 to-teal-100',
    secondary: 'bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50',
    hero: 'bg-gradient-to-br from-indigo-600 via-purple-600 to-teal-500',
    card: 'bg-gradient-to-br from-white via-slate-50 to-indigo-50',
  };

  return (
    <div className={`min-h-screen ${variants[variant]} ${className}`}>
      {/* Animated gradient orbs */}
      <div className="relative overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-teal-400/20 to-cyan-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
};

export default GradientBackground; 