
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockBackend } from '../services/mockBackend';
import { NewsItem } from '../types';
import { Loader2, ArrowLeft, Calendar, Share2, ExternalLink, Megaphone } from 'lucide-react';

const NewsView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const allNews = await mockBackend.getNews();
      const found = allNews.find(n => n.id === id);
      setNewsItem(found || null);
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB]">
        <Loader2 className="animate-spin text-[#0F392B]" size={32} />
      </div>
    );
  }

  if (!newsItem) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCFB] p-6 text-center">
        <h2 className="text-2xl font-serif font-bold text-[#0F392B] mb-2">News Item Not Found</h2>
        <button onClick={() => navigate('/news')} className="text-agri-secondary font-bold underline">Return to News</button>
      </div>
    );
  }

  const formatContent = (text: string) => {
    return text.split('\n').filter(p => p.trim() !== '').map((paragraph, idx) => (
      <p key={idx} className="mb-6 leading-relaxed text-lg text-stone-700 font-serif">
        {paragraph}
      </p>
    ));
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <div className="container mx-auto px-6 py-8">
        <button onClick={() => navigate('/news')} className="flex items-center gap-2 text-stone-500 hover:text-[#0F392B] transition-colors font-bold text-sm uppercase tracking-widest">
           <ArrowLeft size={16} /> Back to News
        </button>
      </div>

      <article className="max-w-4xl mx-auto px-6 pb-24">
        <header className="mb-10">
           <div className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-widest mb-6">
              <span className="flex items-center gap-2 text-agri-gold">
                  <Calendar size={14}/> {newsItem.date}
              </span>
              {newsItem.isBreaking && (
                <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full flex items-center gap-2 border border-red-100">
                  <Megaphone size={12} /> BREAKING NEWS
                </span>
              )}
           </div>
           
           <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#0F392B] mb-6 leading-tight">
              {newsItem.title}
           </h1>
           
           <p className="text-xl text-stone-500 font-light leading-relaxed border-l-4 border-agri-secondary pl-6 italic">
              {newsItem.description}
           </p>
        </header>

        {newsItem.thumbnail && (
            <div className="mb-12 rounded-[2rem] overflow-hidden shadow-2xl aspect-video relative bg-stone-200">
                <img 
                    src={newsItem.thumbnail} 
                    className="w-full h-full object-cover"
                    alt={newsItem.title}
                />
            </div>
        )}

        <div className="prose prose-stone prose-lg max-w-none mb-12">
           {formatContent(newsItem.content || "Full details are available in the attached resources or contact our press office.")}
        </div>

        {newsItem.relevantLink && (
            <div className="bg-[#0F392B]/5 border border-[#0F392B]/10 rounded-2xl p-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h3 className="text-lg font-bold text-[#0F392B] mb-1">Additional Resources</h3>
                    <p className="text-sm text-stone-500">Access external reports, documents, or official statements related to this story.</p>
                </div>
                <a 
                    href={newsItem.relevantLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-[#0F392B] text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-agri-secondary transition-all shadow-lg text-sm whitespace-nowrap"
                >
                    View Resource <ExternalLink size={16} />
                </a>
            </div>
        )}

        <div className="pt-8 border-t border-stone-200 flex justify-between items-center">
           <p className="text-stone-400 text-xs font-bold uppercase tracking-widest">Share this update</p>
           <div className="flex gap-4">
              <button className="p-3 rounded-full bg-stone-100 text-stone-600 hover:bg-agri-secondary hover:text-white transition-all">
                 <Share2 size={18} />
              </button>
           </div>
        </div>
      </article>
    </div>
  );
};

export default NewsView;
