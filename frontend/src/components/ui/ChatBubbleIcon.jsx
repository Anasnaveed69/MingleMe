import React from 'react';
import { motion } from 'framer-motion';

const ChatBubbleIcon = ({ 
  size = 24, 
  className = '', 
  animate = false,
  primaryColor = "from-purple-500 to-purple-600",
  secondaryColor = "from-teal-400 to-teal-500"
}) => {
  const iconSize = size;
  const primaryBubbleWidth = iconSize * 0.7;
  const primaryBubbleHeight = iconSize * 0.6;
  const secondaryBubbleWidth = iconSize * 0.5;
  const secondaryBubbleHeight = iconSize * 0.4;
  
  const containerClasses = `relative inline-block ${className}`;
  
  const hoverAnimation = animate ? {
    scale: [1, 1.05, 1],
    rotate: [0, 1, -1, 0],
    transition: {
      duration: 0.6,
      ease: "easeInOut"
    }
  } : {};
  
  const bubbleAnimation = animate ? {
    y: [0, -1, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
      delay: 0.5
    }
  } : {};

  return (
    <motion.div 
      className={containerClasses}
      style={{ width: iconSize, height: iconSize }}
      whileHover={hoverAnimation}
    >
      {/* Primary purple bubble (larger, behind) */}
      <motion.div
        className={`absolute bg-gradient-to-br ${primaryColor} rounded-lg`}
        style={{
          width: primaryBubbleWidth,
          height: primaryBubbleHeight,
          left: 0,
          bottom: 0,
          transform: 'rotate(-3deg)',
          borderRadius: '12px 12px 12px 4px'
        }}
        animate={bubbleAnimation}
      >
        {/* Eyes in the primary bubble */}
        <div className="absolute top-2 left-2 flex space-x-1">
          <div className="w-1 h-1 bg-white rounded-full opacity-90"></div>
          <div className="w-1 h-1 bg-white rounded-full opacity-90"></div>
        </div>
      </motion.div>
      
      {/* Secondary teal bubble (smaller, overlapping) */}
      <motion.div
        className={`absolute bg-gradient-to-br ${secondaryColor} rounded-lg`}
        style={{
          width: secondaryBubbleWidth,
          height: secondaryBubbleHeight,
          right: 0,
          top: 0,
          transform: 'rotate(3deg)',
          borderRadius: '12px 12px 4px 12px'
        }}
        animate={bubbleAnimation}
      />
    </motion.div>
  );
};

export default ChatBubbleIcon; 