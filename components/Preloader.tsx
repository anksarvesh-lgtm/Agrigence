import React from 'react';
import { motion } from 'framer-motion';

const Preloader: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-stone-50 z-50 flex flex-col items-center justify-center">
      <div className="relative w-32 h-32">
        {/* Seed */}
        <motion.div
          className="absolute bottom-0 left-1/2 w-4 h-4 bg-agri-soil rounded-full transform -translate-x-1/2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        />
        
        {/* Stem */}
        <motion.div
          className="absolute bottom-2 left-1/2 w-1 bg-agri-green origin-bottom transform -translate-x-1/2"
          initial={{ height: 0 }}
          animate={{ height: 60 }}
          transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
        />

        {/* Left Leaf */}
        <motion.div
          className="absolute bottom-10 left-1/2 w-8 h-8 bg-agri-green rounded-tr-3xl rounded-bl-3xl transform -translate-x-full origin-bottom-right"
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: -45 }}
          transition={{ delay: 1, duration: 0.5 }}
        />

        {/* Right Leaf */}
        <motion.div
          className="absolute bottom-16 left-1/2 w-6 h-6 bg-agri-green rounded-tl-3xl rounded-br-3xl origin-bottom-left"
          initial={{ scale: 0, rotate: 45 }}
          animate={{ scale: 1, rotate: 45 }}
          transition={{ delay: 1.3, duration: 0.5 }}
        />
      </div>
      <motion.h1 
        className="mt-4 text-3xl font-serif text-agri-darkGreen font-bold"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        Agrigence
      </motion.h1>
      <motion.p
        className="text-agri-green text-sm font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
      >
        Cultivating Knowledge
      </motion.p>
    </div>
  );
};

export default Preloader;
