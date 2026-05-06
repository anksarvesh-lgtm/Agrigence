
import React, { useState, useEffect } from 'react';
import { mockBackend } from '../services/mockBackend';
import { BookOpen, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import PDFAction from '../components/PDFAction';
import { motion } from 'framer-motion';
import { Magazine, Article } from '../types';
import OptimizedImage from '../components/OptimizedImage';
import SEO from '../components/SEO';

const Journals: React.FC = () => {
  const [journals, setJournals] = useState<Magazine[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    const load = async () => {
      setJournals(await mockBackend.getJournals());
      
      // Access Control Filter for Archive
      const allArticles = await mockBackend.getArticles();
      // Use getPublicAdmins to securely fetch only permitted profiles (Admins)
      const users = await mockBackend.getPublicAdmins();
      const adminIds = new Set(users.map(u => u.id));
      
      const publicArticles = allArticles.filter(a => {
          if (a.status !== 'PUBLISHED' && a.status !== 'APPROVED') return false;
          // Public if System (no ID) or Admin author
          if (!a.authorId) return true;
          return adminIds.has(a.authorId);
      });
      
      setArticles(publicArticles);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-agri-bg">
      <SEO 
        title="Journal Archive & Publications | Agrigence"
        description="Access our complete repository of peer-reviewed agricultural research, monthly magazines, and scientific publications."
      />
      
      {/* Header */}
      <section className="relative h-[50vh] flex items-center bg-agri-primary text-white overflow-hidden mb-16">
         <div className="absolute inset-0">
            <OptimizedImage 
              src="https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=2070&auto=format&fit=crop" 
              alt="Agricultural research journals and library archive" 
              title="Agrigence Journal Archive"
              className="w-full h-full object-cover"
              priority={true}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-900 via-stone-900/80 to-transparent z-10"></div>
         </div>

         <div className="container mx-auto px-6 relative z-30">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-12 bg-agri-secondary"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-agri-secondary">Publications</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-[1.1] text-white">
              Journal Archive
            </h1>
            <p className="text-lg text-white/80 font-light leading-relaxed max-w-xl">
              Access our complete repository of peer-reviewed agricultural research and monthly magazines.
            </p>
         </div>
      </section>

      <div className="container mx-auto px-6 pb-24">
        
        {/* Magazines Grid */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-[#0F392B] mb-8 flex items-center gap-3">
             <span className="w-8 h-1 bg-agri-gold rounded-full"></span>
             Latest Issues
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {journals.map((journal, idx) => (
               <motion.div 
                 key={journal.id}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: idx * 0.1 }}
                 className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden hover:shadow-premium transition-all group flex flex-col"
               >
                 <div className="h-64 bg-stone-200 overflow-hidden relative">
                   <OptimizedImage src={journal.coverImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={journal.title} />
                   <div className="absolute inset-0 bg-gradient-to-t from-[#0F392B]/90 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                   <div className="absolute bottom-6 right-6">
                      <PDFAction 
                        title={journal.title} 
                        type="MAGAZINE" 
                        accessLevel={journal.downloadAccess} 
                        fileUrl={journal.pdfUrl} 
                        driveUrl={journal.driveUrl}
                      />
                   </div>
                 </div>
                 <div className="p-8 flex-1 flex flex-col">
                   <div className="flex justify-between items-center mb-4">
                     <span className="text-[10px] font-bold text-agri-gold uppercase tracking-widest border border-agri-gold/20 px-2 py-1 rounded">Vol {journal.volume} • Issue {journal.issueNumber}</span>
                     <span className="text-xs text-stone-400 font-serif italic">{journal.month} {journal.year}</span>
                   </div>
                   <h3 className="font-serif font-bold text-2xl mb-3 text-[#0F392B] leading-tight">{journal.title}</h3>
                   <p className="text-stone-600 mb-6 flex-1 leading-relaxed line-clamp-3">{journal.description}</p>
                   <div className="flex items-center gap-4">
                     <PDFAction 
                        title={journal.title} 
                        type="MAGAZINE" 
                        accessLevel={journal.downloadAccess} 
                        fileUrl={journal.pdfUrl}
                        driveUrl={journal.driveUrl}
                        variant="inline"
                      />
                   </div>
                 </div>
               </motion.div>
            ))}
          </div>
        </section>

        {/* Articles List */}
        <section>
          <h2 className="text-2xl font-bold text-[#0F392B] mb-8 flex items-center gap-3">
             <span className="w-8 h-1 bg-agri-gold rounded-full"></span>
             Recent Blogs
          </h2>
          <div className="space-y-4">
            {articles.map((article, idx) => (
              <motion.div 
                key={article.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white p-6 rounded-xl border border-stone-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md transition-shadow hover:border-agri-gold/30"
              >
                 <div className="flex-1">
                   <div className="flex items-center gap-3 mb-2">
                     <span className="bg-[#0F392B]/5 text-[#0F392B] text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">{article.type || 'ARTICLE'}</span>
                     <span className="text-xs text-stone-400">{new Date(article.submissionDate).toLocaleDateString()}</span>
                   </div>
                   <h3 className="font-serif font-bold text-[#0F392B] text-xl mb-1">{article.title}</h3>
                   <p className="text-sm text-stone-500 font-medium">By <span className="text-agri-gold">{article.authorName}</span></p>
                 </div>
                 <div className="flex gap-4">
                   <Link 
                     to={`/blog/${article.id}`}
                     className="px-5 py-2.5 rounded-lg border border-stone-200 text-stone-600 font-bold text-sm hover:bg-stone-50 hover:text-[#0F392B] transition-colors flex items-center gap-2"
                   >
                     Read More <ArrowRight size={14} />
                   </Link>
                   <PDFAction 
                      title={article.title}
                      type={article.type as any || 'ARTICLE'}
                      accessLevel={article.downloadAccess}
                      fileUrl={article.fileUrl || '#'}
                      driveUrl={article.driveUrl}
                      id={article.id}
                   />
                 </div>
              </motion.div>
            ))}
            {articles.length === 0 && (
                <div className="text-center py-20 text-stone-400 italic bg-stone-50 rounded-2xl">
                    No public articles available at this time.
                </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Journals;
