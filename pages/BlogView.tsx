
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockBackend } from '../services/mockBackend';
import { Article } from '../types';
import { Loader2, ArrowLeft, Calendar, Clock, Share2 } from 'lucide-react';

const BlogView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const articles = await mockBackend.getArticles();
      const found = articles.find(a => a.id === id);
      setArticle(found || null);
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB]">
        <Loader2 className="animate-spin text-[#3D2B1F]" size={32} />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCFB] p-6 text-center">
        <h2 className="text-2xl font-serif font-bold text-[#3D2B1F] mb-2">Article Not Found</h2>
        <button onClick={() => navigate('/blogs')} className="text-[#C29263] font-bold underline">Return to Blog</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <div className="container mx-auto px-6 py-8">
        <button onClick={() => navigate('/blogs')} className="flex items-center gap-2 text-stone-500 hover:text-[#3D2B1F] transition-colors font-bold text-sm uppercase tracking-widest">
           <ArrowLeft size={16} /> Back to Blogs
        </button>
      </div>

      <article className="max-w-3xl mx-auto px-6 pb-24">
        <header className="mb-10 text-center">
           <div className="flex items-center justify-center gap-4 text-xs font-bold text-[#C29263] uppercase tracking-widest mb-4">
              <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(article.submissionDate).toLocaleDateString()}</span>
              <span className="w-1 h-1 rounded-full bg-[#C29263]/40"></span>
              <span className="flex items-center gap-1"><Clock size={12}/> {Math.ceil((article.content?.length || 0) / 800)} min read</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#3D2B1F] mb-6 leading-tight">
              {article.title}
           </h1>
           <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#C29263]/10 flex items-center justify-center text-[#3D2B1F] font-serif font-bold border border-[#C29263]/20">
                 {article.authorName[0]}
              </div>
              <div className="text-left">
                 <p className="text-xs font-black text-stone-400 uppercase tracking-widest">Written by</p>
                 <p className="text-sm font-bold text-[#3D2B1F]">{article.authorName}</p>
              </div>
           </div>
        </header>

        <div className="mb-12 rounded-3xl overflow-hidden shadow-2xl aspect-video relative bg-stone-200">
           <img 
             src={article.featuredImage || "https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?auto=format&fit=crop&q=80"} 
             className="w-full h-full object-cover"
             alt={article.title}
           />
        </div>

        {/* 
           Content Render 
           - 'prose' handles the HTML tags (b, i, h2, ul)
           - Jodit Editor handles the rest
        */}
        <div 
          className="prose prose-stone prose-lg max-w-none font-serif text-stone-700 leading-relaxed"
          style={{ wordWrap: 'break-word' }} 
          dangerouslySetInnerHTML={{ __html: article.content || '<p>No content available.</p>' }}
        >
        </div>

        <div className="mt-16 pt-8 border-t border-stone-200 flex justify-between items-center">
           <p className="text-stone-400 text-xs font-bold uppercase tracking-widest">Share this article</p>
           <div className="flex gap-4">
              <button className="p-2 rounded-full bg-stone-100 text-stone-600 hover:bg-[#C29263] hover:text-white transition-all">
                 <Share2 size={18} />
              </button>
           </div>
        </div>
      </article>
    </div>
  );
};

export default BlogView;
