import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle = ({ className = '', size = 'md' }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className={`
        ${sizeClasses[size]}
        relative rounded-full p-2 transition-all duration-300 ease-in-out
        bg-gradient-to-r from-slate-100 to-slate-200 
        dark:from-slate-800 dark:to-slate-700
        hover:from-slate-200 hover:to-slate-300
        dark:hover:from-slate-700 dark:hover:to-slate-600
        shadow-lg hover:shadow-xl
        border border-slate-300 dark:border-slate-600
        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
        dark:focus:ring-offset-slate-900
        ${className}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDarkMode ? 180 : 0 }}
        transition={{ duration: 0.3 }}
        className="relative w-full h-full"
      >
        {isDarkMode ? (
          <Moon 
            className="w-full h-full text-slate-700 dark:text-yellow-300" 
            size={iconSizes[size]}
          />
        ) : (
          <Sun 
            className="w-full h-full text-yellow-500 dark:text-slate-300" 
            size={iconSizes[size]}
          />
        )}
      </motion.div>
      
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full opacity-0"
        animate={{
          opacity: isDarkMode ? [0, 0.1, 0] : [0, 0.1, 0],
        }}
        transition={{
          duration: 0.6,
          repeat: 0,
        }}
        style={{
          background: isDarkMode 
            ? 'radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)'
        }}
      />
    </motion.button>
  );
};

export default ThemeToggle; 