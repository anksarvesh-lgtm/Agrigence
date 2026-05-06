
import React, { useState, useEffect } from 'react';
import { mockBackend } from '../services/mockBackend';
import { Article } from '../types';
import { motion } from 'framer-motion';
import { User, Calendar, ArrowRight, BookOpen } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import OptimizedImage from '../components/OptimizedImage';
import SEO from '../components/SEO';

const Blogs: React.FC = () => {
  const [blogs, setBlogs] = useState<Article[]>([]);

  useEffect(() => {
    const load = async () => {
      const allArticles = await mockBackend.getArticles();
      // Use getPublicAdmins to securely fetch only permitted profiles (Admins)
      const users = await mockBackend.getPublicAdmins();
      const adminIds = new Set(users.map(u => u.id));
      
      const publicBlogs = allArticles.filter(a => {
          if (a.type !== 'BLOG') return false;
          if (a.status !== 'PUBLISHED' && a.status !== 'APPROVED') return false;
          // Public if System (no ID) or Admin author
          if (!a.authorId) return true;
          return adminIds.has(a.authorId);
      });
      
      setBlogs(publicBlogs);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-agri-bg">
      <SEO 
        title="Research & Knowledge Blog | Agrigence"
        description="Read the latest agricultural research articles, opinions, and field reports from our expert community."
      />
      
      {/* Header */}
      <section className="relative h-[50vh] flex items-center bg-agri-primary text-white overflow-hidden mb-16">
         <div className="absolute inset-0">
            <OptimizedImage 
              src="https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?q=80&w=2070&auto=format&fit=crop" 
              alt="Agricultural research and knowledge sharing" 
              title="Agrigence Research Blog"
              className="w-full h-full object-cover"
              priority={true}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-900 via-stone-900/80 to-transparent z-10"></div>
         </div>

         <div className="container mx-auto px-6 relative z-30">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-12 bg-agri-secondary"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-agri-secondary">Expert Insights</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-[1.1] text-white">
              Research & Knowledge
            </h1>
            <p className="text-lg text-white/80 font-light leading-relaxed max-w-xl">
              Read the latest articles, opinions, and field reports from our expert community.
            </p>
         </div>
      </section>

      <div className="container mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {blogs.map((blog, idx) => (
              <motion.div 
                key={blog.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex"
              >
                 <Link 
                   to={`/blog/${blog.id}`}
                   className="glossy glossy-card rounded-[2rem] overflow-hidden hover:shadow-2xl transition-all group flex flex-col h-full w-full"
                 >
                   <div className="h-56 relative overflow-hidden">
                      <OptimizedImage 
                        src={blog.featuredImage || `https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800`} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        alt={blog.title} 
                      />
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-agri-primary shadow-sm">
                         {new Date(blog.submissionDate).toLocaleDateString()}
                      </div>
                   </div>
                   
                   <div className="p-8 flex-1 flex flex-col">
                      <h3 className="text-2xl font-serif font-bold text-agri-primary mb-3 leading-tight group-hover:text-agri-secondary transition-colors">{blog.title}</h3>
                      
                      <div className="flex items-center gap-3 mb-6 border-b border-stone-100 pb-6">
                         <div className="w-8 h-8 rounded-full bg-agri-secondary/10 flex items-center justify-center text-agri-secondary">
                            <User size={14} />
                         </div>
                         <span className="text-xs font-bold text-stone-500 uppercase tracking-wide">{blog.authorName}</span>
                      </div>

                      <p className="text-stone-600 text-sm leading-relaxed mb-8 line-clamp-3 flex-1">
                         {blog.excerpt || (blog.content ? blog.content.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...' : '')}
                      </p>

                      <div className="flex items-center justify-between">
                         <span 
                            className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-agri-primary group-hover:text-agri-secondary transition-colors"
                         >
                            READ ARTICLE
                         </span>
                         <span className="text-agri-secondary group-hover:translate-x-1 transition-transform"><ArrowRight size={16}/></span>
                      </div>
                   </div>
                 </Link>
              </motion.div>
            ))}
        </div>
        
        {blogs.length === 0 && (
            <div className="text-center py-20 bg-stone-50 rounded-[3rem] border border-stone-100">
               <BookOpen size={48} className="mx-auto text-stone-300 mb-4" />
               <p className="text-stone-400 italic">No blog posts found. Check back soon for updates.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Blogs;
