
import React from 'react';
import { motion } from 'framer-motion';

const Preloader: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-[#FDFCFB] z-50 flex flex-col items-center justify-center overflow-hidden">
      {/* Background Glow */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1.2 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        className="absolute w-96 h-96 bg-orange-100 rounded-full blur-[100px] pointer-events-none"
      />

      <div className="relative w-40 h-40 flex items-end justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
          {/* Soil */}
          <motion.path 
            d="M 20 95 Q 50 105 80 95" 
            fill="none" 
            stroke="#8B5E34" 
            strokeWidth="3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          />

          {/* Stem Growing */}
          <motion.path 
            d="M 50 95 Q 52 70 50 40" 
            fill="none" 
            stroke="#4A7C59" 
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
          />

          {/* Left Leaf */}
          <motion.path 
            d="M 50 70 Q 30 65 35 55 Q 45 60 50 70" 
            fill="#6A9955"
            stroke="none"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            style={{ originX: 1, originY: 1 }}
          />

          {/* Right Leaf */}
          <motion.path 
            d="M 50 60 Q 70 55 65 45 Q 55 50 50 60" 
            fill="#6A9955"
            stroke="none"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            style={{ originX: 0, originY: 1 }}
          />

          {/* Top Bud/Flower */}
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.5, type: "spring" }}
          >
             <circle cx="50" cy="40" r="6" fill="#D4A373" />
             <circle cx="50" cy="40" r="3" fill="#FFF" />
          </motion.g>
        </svg>
      </div>

      <div className="z-10 text-center mt-4">
        <motion.h1 
          className="text-4xl font-serif text-[#3D2B1F] font-bold tracking-tight"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
        >
          Agrigence
        </motion.h1>
        <motion.div
          className="overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: "auto" }}
          transition={{ delay: 2.0, duration: 1 }}
        >
          <p className="text-[#4A7C59] text-xs font-bold uppercase tracking-[0.2em] whitespace-nowrap px-1">
            Where Agri-Intelligence Meets Agricultural Generation
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Preloader;
