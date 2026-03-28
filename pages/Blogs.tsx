
import React, { useState, useEffect } from 'react';
import { mockBackend } from '../services/mockBackend';
import { Article } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { User, Calendar, ArrowRight, BookOpen, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import OptimizedImage from '../components/OptimizedImage';
import SEO from '../components/SEO';

const BlogSkeleton: React.FC = () => (
  <div className="bg-white rounded-[2rem] shadow-premium border border-stone-100 overflow-hidden flex flex-col h-full animate-pulse">
    <div className="h-56 bg-stone-200" />
    <div className="p-8 flex-1 flex flex-col">
      <div className="h-8 bg-stone-200 rounded-lg w-3/4 mb-4" />
      <div className="flex items-center gap-3 mb-6 border-b border-stone-100 pb-6">
        <div className="w-8 h-8 rounded-full bg-stone-200" />
        <div className="h-4 bg-stone-200 rounded w-24" />
      </div>
      <div className="space-y-2 mb-8 flex-1">
        <div className="h-4 bg-stone-200 rounded w-full" />
        <div className="h-4 bg-stone-200 rounded w-full" />
        <div className="h-4 bg-stone-200 rounded w-2/3" />
      </div>
      <div className="flex items-center justify-between">
        <div className="h-4 bg-stone-200 rounded w-20" />
        <div className="w-4 h-4 bg-stone-200 rounded" />
      </div>
    </div>
  </div>
);

const Blogs: React.FC = () => {
  const [blogs, setBlogs] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const allArticles = await mockBackend.getArticles();
        const users = await mockBackend.getPublicAdmins();
        const adminIds = new Set(users.map(u => u.id));
        
        const publicBlogs = allArticles.filter(a => {
            if (a.type !== 'BLOG') return false;
            if (a.status !== 'PUBLISHED' && a.status !== 'APPROVED') return false;
            if (!a.authorId) return true;
            return adminIds.has(a.authorId);
        });
        
        setBlogs(publicBlogs);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         blog.authorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || blog.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...Array.from(new Set(blogs.map(b => b.category).filter((c): c is string => !!c)))];

  return (
    <div className="min-h-screen bg-agri-bg">
      <SEO 
        title="Research & Knowledge Blog | Agrigence"
        description="Read the latest agricultural research articles, opinions, and field reports from our expert community."
      />
      
      {/* Header */}
      <section className="relative h-[60vh] flex items-center bg-agri-primary text-white overflow-hidden mb-16">
         <motion.div 
           initial={{ scale: 1.1, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ duration: 1.5 }}
           className="absolute inset-0"
         >
            <OptimizedImage 
              src="https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?q=80&w=2070&auto=format&fit=crop" 
              alt="Agricultural research and knowledge sharing" 
              title="Agrigence Research Blog"
              className="w-full h-full object-cover"
              priority={true}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-900 via-stone-900/80 to-transparent z-10"></div>
         </motion.div>

         <div className="container mx-auto px-6 relative z-30">
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-3 mb-6"
            >
              <span className="h-px w-12 bg-agri-secondary"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-agri-secondary">Expert Insights</span>
            </motion.div>
            <motion.h1 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-4xl md:text-7xl font-serif font-bold mb-6 leading-[1.1] text-white"
            >
              Research & <br />Knowledge
            </motion.h1>
            <motion.p 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-lg text-white/80 font-light leading-relaxed max-w-xl"
            >
              Read the latest articles, opinions, and field reports from our expert community.
            </motion.p>
         </div>
      </section>

      <div className="container mx-auto px-6 pb-24">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value || '')}
              className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-stone-200 focus:border-agri-secondary outline-none transition-all shadow-sm"
            />
          </div>
          
          <div className="flex items-center gap-4 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                  selectedCategory === cat 
                    ? 'bg-agri-primary text-white shadow-lg' 
                    : 'bg-white text-stone-500 border border-stone-200 hover:border-agri-secondary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <BlogSkeleton key={i} />)
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredBlogs.map((blog, idx) => (
                <motion.div 
                  layout
                  key={blog.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ 
                    duration: 0.5, 
                    delay: (idx % 3) * 0.1,
                    layout: { duration: 0.3 }
                  }}
                  whileHover={{ 
                    y: -10,
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                  className="bg-white rounded-[2rem] shadow-premium border border-stone-100 overflow-hidden hover:shadow-2xl transition-all group flex flex-col h-full cursor-pointer"
                  onClick={() => navigate(`/blog/${blog.id}`)}
                >
                   <div className="h-64 relative overflow-hidden">
                      <OptimizedImage 
                        src={blog.featuredImage || `https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800`} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        alt={blog.title} 
                      />
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-agri-primary shadow-sm">
                         {new Date(blog.submissionDate).toLocaleDateString()}
                      </div>
                      {blog.category && (
                        <div className="absolute bottom-4 left-4 bg-agri-secondary/90 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-white shadow-sm">
                          {blog.category}
                        </div>
                      )}
                   </div>
                   
                   <div className="p-8 flex-1 flex flex-col">
                      <h3 className="text-2xl font-serif font-bold text-agri-primary mb-3 leading-tight group-hover:text-agri-secondary transition-colors line-clamp-2">{blog.title}</h3>
                      
                      <div className="flex items-center gap-3 mb-6 border-b border-stone-100 pb-6">
                         <div className="w-8 h-8 rounded-full bg-agri-secondary/10 flex items-center justify-center text-agri-secondary">
                            <User size={14} />
                         </div>
                         <span className="text-xs font-bold text-stone-500 uppercase tracking-wide">{blog.authorName}</span>
                      </div>

                      <p className="text-stone-600 text-sm leading-relaxed mb-8 line-clamp-3 flex-1">
                         {blog.excerpt || (blog.content ? blog.content.replace(/<[^>]*>/g, '').substring(0, 150) : (blog.fileUrl ? 'This blog post was submitted as a document. Click to read more.' : 'No content available.'))}
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
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
        
        {!loading && filteredBlogs.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-stone-50 rounded-[3rem] border border-stone-100"
            >
               <BookOpen size={48} className="mx-auto text-stone-300 mb-4" />
               <p className="text-stone-400 italic">No blog posts found matching your criteria.</p>
            </motion.div>
        )}
      </div>
    </div>
  );
};

export default Blogs;

