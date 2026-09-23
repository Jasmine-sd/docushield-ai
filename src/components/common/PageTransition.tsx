import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children, className = '' }) => {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  // If user has reduced motion preference enabled, do simple instantaneous or instant fade
  if (shouldReduceMotion) {
    return <div className={`w-full ${className}`}>{children}</div>;
  }

  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{
        duration: 0.3, // 300ms smooth transition within 250-350ms requirement
        ease: [0.22, 1, 0.36, 1], // Clean smooth ease-out curve
      }}
      className={`w-full ${className}`}
    >
      {children}
    </motion.div>
  );
};
