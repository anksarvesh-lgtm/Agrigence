
import React, { useState, useEffect } from 'react';
import { mockBackend } from '../services/mockBackend';
import { motion } from 'framer-motion';
import { Calendar, ExternalLink, Megaphone } from 'lucide-react';
import { NewsItem } from '../types';

const News: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    const load = async () => {
      const n = await mockBackend.getNews();
      setNews(n);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-agri-bg">
      
      {/* Header */}
      <div className="bg-[#0F392B] text-white py-16 px-6 relative overflow-hidden">
         {/* Background Image */}
         <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format&fit=crop" 
              alt="Agricultural News" 
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0F392B] to-[#0F392B]/80"></div>
         </div>

         <div className="container mx-auto relative z-10">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">News & Announcements</h1>
            <p className="text-xl text-stone-300 font-light">Stay updated with the latest in agricultural research and Agrigence events.</p>
         </div>
      </div>

      <div className="container mx-auto px-6 py-12 -mt-8">
        <div className="grid gap-8 max-w-4xl mx-auto">
          {news.map((item, idx) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl shadow-premium border border-stone-100 overflow-hidden hover:border-agri-gold/50 transition-all group flex flex-col md:flex-row"
            >
              {item.thumbnail && (
                <div className="md:w-1/3 h-48 md:h-auto overflow-hidden">
                  <img src={item.thumbnail} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="News Thumbnail" />
                </div>
              )}
              <div className="p-8 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-agri-gold font-bold text-xs uppercase tracking-widest">
                    <Calendar size={14} />
                    <span>{item.date}</span>
                  </div>
                  {item.isBreaking && (
                    <span className="bg-red-50 text-red-600 px-2 py-1 rounded text-[10px] font-black uppercase flex items-center gap-1 animate-pulse">
                      <Megaphone size={10} /> BREAKING
                    </span>
                  )}
                </div>
                
                <h2 className="text-2xl font-serif font-bold text-[#0F392B] mb-4 group-hover:text-agri-secondary transition-colors leading-tight">{item.title}</h2>
                <p className="text-stone-600 leading-relaxed mb-6 line-clamp-3">{item.description}</p>
                
                {item.content && (
                  <div className="bg-stone-50 p-6 rounded-lg text-sm text-stone-700 italic border-l-4 border-[#0F392B] mb-6">
                     {item.content}
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-6 border-t border-stone-100">
                   {item.relevantLink ? (
                     <a 
                      href={item.relevantLink} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="inline-flex items-center gap-2 text-agri-secondary font-bold text-xs uppercase tracking-widest hover:underline"
                     >
                        View Attached Resource <ExternalLink size={14} />
                     </a>
                   ) : <div />}
                   <button className="text-sm font-bold text-[#0F392B] hover:text-agri-gold transition-colors uppercase tracking-widest">Read More</button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        {news.length === 0 && <div className="text-center py-20 text-stone-400 italic">No news items found. Check back later.</div>}
      </div>
    </div>
  );
};

export default News;
