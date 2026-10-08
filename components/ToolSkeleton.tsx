import React from 'react';
import { motion } from 'framer-motion';

const ToolSkeleton: React.FC = () => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: i * 0.1 }}
          className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm"
        >
          <div className="flex flex-col h-full animate-pulse">
            <div className="h-6 bg-stone-200 rounded-md w-3/4 mb-4"></div>
            <div className="space-y-2 mb-6 flex-grow">
              <div className="h-4 bg-stone-100 rounded-md w-full"></div>
              <div className="h-4 bg-stone-100 rounded-md w-5/6"></div>
              <div className="h-4 bg-stone-100 rounded-md w-4/6"></div>
            </div>
            <div className="h-10 bg-stone-100 rounded-xl w-full mt-auto"></div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ToolSkeleton;
