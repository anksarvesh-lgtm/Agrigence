import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { mockBackend } from '../services/mockBackend';
import { Keyword } from '../types';

const KeywordDisplay: React.FC = () => {
  const [keywords, setKeywords] = useState<Keyword[]>([]);

  useEffect(() => {
    const fetchKeywords = async () => {
      const data = await mockBackend.getKeywords();
      setKeywords(data);
    };
    fetchKeywords();
  }, []);

  return (
    <div className="py-12 bg-white">
      <div className="container mx-auto px-6">
        <h3 className="text-xl font-serif font-bold text-agri-primary mb-6">Explore Topics</h3>
        <div className="flex flex-wrap gap-3">
          {keywords.map((keyword, index) => (
            <motion.span
              key={keyword.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="px-4 py-2 bg-stone-100 text-stone-700 rounded-full text-sm font-medium hover:bg-agri-primary hover:text-white transition-colors cursor-pointer"
            >
              {keyword.term}
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KeywordDisplay;
