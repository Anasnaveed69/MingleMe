import React from "react";
import { motion } from "framer-motion";

const GradientBackground = ({
  children,
  variant = "default",
  className = "",
  animate = true,
}) => {
  const variants = {
    default: {
      light:"bg-gradient-to-br from-purple-600 to-teal-500 text-white px-6 py-3 rounded-lg font-medium transition-all duration-20",

      dark: "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
    },

    auth: {
      light: "bg-gradient-to-br from-purple-600 to-teal-500 text-white px-6 py-3 rounded-lg font-medium transition-all duration-20",
      dark: "bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900",
    },
    feed: {
      light: "bg-gradient-to-br from-purple-600 to-teal-500 text-white px-6 py-3 rounded-lg font-medium transition-all duration-20",
      dark: "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
    },
    profile: {
      light: "bg-gradient-to-br from-purple-600 to-teal-500 text-white px-6 py-3 rounded-lg font-medium transition-all duration-20",
      dark: "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
    },
  };

  const currentVariant = variants[variant] || variants.default;
  const backgroundClass = `${currentVariant.light} dark:${currentVariant.dark}`;

  const Component = animate ? motion.div : "div";
  const motionProps = animate
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.5 },
      }
    : {};

  return (
    <Component
      {...motionProps}
      className={`min-h-screen w-full ${backgroundClass} ${className}`}
    >
      {children}
    </Component>
  );
};

export default GradientBackground;
