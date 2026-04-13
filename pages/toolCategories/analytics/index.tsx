import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mockBackend } from '../../../services/mockBackend';
import { Tool, ToolCategory } from '../../../types';
import { ChevronRight, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

import DataStorageNotice from '../../../components/DataStorageNotice';

const AnalyticsTools: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [categories, setCategories] = useState<ToolCategory[]>([]);
  const [tools, setTools] = useState<Record<string, Tool[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const fetchedCategories = await mockBackend.getToolCategories('analytics');
        setCategories(fetchedCategories);

        const toolMap: Record<string, Tool[]> = {};
        for (const category of fetchedCategories) {
          const fetchedTools = await mockBackend.getTools(category.id);
          toolMap[category.id] = fetchedTools;
        }
        setTools(toolMap);
      } catch (error) {
        console.error("Failed to load analytics tools", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return null;

  return (
    <div className="space-y-8">
      <DataStorageNotice />
      <button 
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-stone-500 hover:text-agri-primary transition-colors font-medium"
      >
        <ChevronRight className="rotate-180" size={20} /> Back to Categories
      </button>

      <div className="flex items-center gap-4 mb-10">
        <h2 className="text-3xl font-serif font-bold text-agri-primary">Analytics Tools</h2>
        <div className="flex-grow h-px bg-stone-200"></div>
      </div>

      <div className="grid gap-10">
      {categories.map((category) => (
        <div key={category.id} className="space-y-6">
          <h3 className="text-lg font-bold text-stone-700 flex items-center gap-2">
            <ChevronRight size={18} className="text-agri-secondary" />
            {category.name}
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools[category.id]?.map((tool) => (
              <motion.div
                key={tool.id}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="flex flex-col h-full">
                  <h4 className="font-bold text-agri-primary text-lg mb-2 group-hover:text-agri-secondary transition-colors">
                    {tool.name}
                  </h4>
                  <p className="text-stone-500 text-sm mb-6 flex-grow">
                    {tool.description || "No description available."}
                  </p>
                  {tool.route ? (
                    <Link 
                      to={tool.route}
                      className="w-full py-3 bg-stone-50 text-agri-primary border border-stone-100 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:bg-agri-primary hover:text-white hover:border-agri-primary"
                    >
                      Open Tool <ChevronRight size={12} />
                    </Link>
                  ) : (
                    <button className="w-full py-3 bg-stone-50 text-agri-primary border border-stone-100 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group-hover:bg-agri-primary group-hover:text-white group-hover:border-agri-primary">
                      Open Tool <ExternalLink size={12} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
      </div>
    </div>
  );
};

export default AnalyticsTools;
