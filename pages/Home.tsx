
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Calendar, User, 
  ChevronRight, Bookmark, Star, Quote,
  Megaphone, ShoppingBag, BookOpen, FileText, PenTool, ExternalLink
} from 'lucide-react';
import { mockBackend } from '../services/mockBackend';
import { NewsItem, Article, Magazine, Product, Feedback, SiteSettings, HomepageSection } from '../types';
import PDFAction from '../components/PDFAction';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [blogs, setBlogs] = useState<Article[]>([]);
  const [books, setBooks] = useState<Product[]>([]);
  const [magazine, setMagazine] = useState<Magazine | null>(null);
  const [reviews, setReviews] = useState<Feedback[]>([]);

  useEffect(() => {
    // Load Settings
    const s = mockBackend.getSettings();
    setSettings(s);

    // Real-time listeners
    const unsubNews = mockBackend.subscribeToNews((data) => setNews(data)); 
    
    const unsubArticles = mockBackend.subscribeToArticles(async (data) => {
        // --- Access Control Filtering ---
        // 1. Fetch Users to identify Admins
        // Use getPublicAdmins to securely fetch only permitted profiles (Admins)
        const users = await mockBackend.getPublicAdmins();
        const adminIds = new Set(users.map(u => u.id));

        const publicContent = data.filter(a => {
            // Must be published/approved
            if (a.status !== 'PUBLISHED' && a.status !== 'APPROVED') return false;
            
            // Check authorship: Public if no authorId (System) or author is Admin
            if (!a.authorId) return true; 
            return adminIds.has(a.authorId); 
        });

        setArticles(publicContent.filter(a => a.type === 'ARTICLE'));
        setBlogs(publicContent.filter(a => a.type === 'BLOG'));
    });

    const unsubProducts = mockBackend.subscribeToProducts((data) => {
        setBooks(data.filter(p => p.category === 'Book' || p.category === 'Store'));
    });

    const unsubMags = mockBackend.subscribeToMagazines((data) => {
        // Sort manually
        const sorted = data.sort((a,b) => (b.year - a.year) || (new Date(`${b.month} 1`).getTime() - new Date(`${a.month} 1`).getTime()));
        setMagazine(sorted.length > 0 ? sorted[0] : null);
    });

    const unsubReviews = mockBackend.subscribeToFeedback((data) => {
        setReviews(data);
    });

    return () => {
        unsubNews();
        unsubArticles();
        unsubProducts();
        unsubMags();
        unsubReviews();
    };
  }, []);

  const SectionHeader = ({ title, link, linkText = "View All", isExternal = false }: { title: string; link: string; linkText?: string; isExternal?: boolean }) => (
    <div className="flex justify-between items-end mb-10">
      <div>
        <h2 className="text-3xl font-serif font-bold text-agri-primary relative inline-block">
          {title}
          <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-agri-secondary rounded-full"></span>
        </h2>
      </div>
      {isExternal ? (
        <a href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-agri-secondary hover:text-agri-primary transition-all">
            {linkText} <ExternalLink size={14} />
        </a>
      ) : (
        <Link to={link} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-agri-secondary hover:text-agri-primary transition-all">
            {linkText} <ChevronRight size={14} />
        </Link>
      )}
    </div>
  );

  const GlassCard: React.FC<{ children: React.ReactNode; onClick?: () => void; className?: string }> = ({ children, onClick, className = "" }) => (
    <motion.div
      whileHover={{ y: -5, shadow: "0 25px 50px -12px rgba(61, 43, 31, 0.15)" }}
      onClick={onClick}
      className={`bg-white/40 backdrop-blur-md border border-white/20 rounded-[2rem] shadow-premium cursor-pointer transition-all overflow-hidden p-6 ${className}`}
    >
      {children}
    </motion.div>
  );

  // --- DYNAMIC SECTION RENDERER ---
  const renderSection = (section: HomepageSection) => {
    if (!section.isEnabled) return null;

    switch (section.id) {
      case 'news':
        return (
          <section key={section.id} className="container mx-auto px-6 mb-24">
            <SectionHeader title={section.label || "News & Updates"} link="/news" />
            <div className="grid lg:grid-cols-3 gap-8">
              {news.length > 0 && (
                <motion.div 
                  onClick={() => navigate(`/news`)}
                  className="lg:col-span-1 bg-agri-primary rounded-[2.5rem] p-10 text-white relative overflow-hidden group cursor-pointer shadow-2xl"
                >
                  <div className="absolute top-0 right-0 p-10 text-white/5">
                    <Megaphone size={120} className="group-hover:rotate-12 transition-transform duration-700" />
                  </div>
                  <div className="relative z-10">
                    <span className="bg-agri-secondary text-agri-primary px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest mb-6 inline-block">FEATURED_POST</span>
                    <h3 className="text-3xl font-serif font-bold mb-4 leading-tight group-hover:text-agri-secondary transition-colors">{news[0].title}</h3>
                    <p className="text-white/60 text-sm leading-relaxed mb-10 line-clamp-4">{news[0].description}</p>
                    <div className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest border-t border-white/10 pt-6">
                      <Calendar size={14}/> {news[0].date}
                    </div>
                  </div>
                </motion.div>
              )}
              <div className="lg:col-span-2 grid md:grid-cols-2 gap-8">
                {news.slice(1, section.itemsToShow).map((item) => (
                  <GlassCard key={item.id} onClick={() => navigate(`/news`)}>
                    <div className="flex items-center gap-2 text-[10px] font-black text-agri-secondary uppercase tracking-widest mb-4">
                      <Calendar size={12} /> {item.date}
                    </div>
                    <h4 className="text-xl font-serif font-bold text-agri-primary mb-3 line-clamp-2">{item.title}</h4>
                    <p className="text-stone-500 text-xs leading-relaxed line-clamp-2 mb-6">{item.description}</p>
                    <div className="text-[10px] font-black text-agri-primary uppercase tracking-widest flex items-center gap-1 opacity-40 group-hover:opacity-100">
                      Protocol Details <ArrowRight size={10} />
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          </section>
        );

      case 'magazine':
        if (!magazine) return null;
        return (
          <section key={section.id} className="mb-24 px-6">
             <div className="container mx-auto">
                <motion.div 
                  whileHover={{ y: -10 }}
                  className="bg-agri-primary rounded-[3rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row group"
                >
                   <div className="lg:w-1/3 aspect-[3/4] overflow-hidden cursor-pointer" onClick={() => navigate('/journals')}>
                      <img src={magazine.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="" />
                   </div>
                   <div className="lg:w-2/3 p-12 md:p-20 flex flex-col justify-center text-white relative">
                      <div className="absolute top-0 right-0 p-12 opacity-5">
                         <Bookmark size={200} />
                      </div>
                      <div className="flex items-center gap-4 mb-8">
                         <span className="bg-agri-secondary text-agri-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">CURRENT_RELEASE</span>
                         <span className="text-agri-secondary/60 text-xs font-serif italic">Vol {magazine.volume} • Issue {magazine.issueNumber}</span>
                      </div>
                      <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6 group-hover:text-agri-secondary transition-colors cursor-pointer" onClick={() => navigate('/journals')}>{magazine.title}</h2>
                      <p className="text-lg text-white/50 font-light leading-relaxed mb-12 max-w-2xl">{magazine.description}</p>
                      <div className="flex gap-4">
                         <PDFAction 
                            title={magazine.title}
                            type="MAGAZINE"
                            accessLevel={magazine.downloadAccess}
                            fileUrl={magazine.pdfUrl}
                          />
                      </div>
                   </div>
                </motion.div>
             </div>
          </section>
        );

      case 'blogs':
        return (
          <section key={section.id} className="container mx-auto px-6 mb-24">
            <SectionHeader title={section.label || "Expert Insights & Blogs"} link="/blogs" />
            {blogs.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-8">
                {blogs.slice(0, section.itemsToShow).map((blog, i) => (
                  <GlassCard key={blog.id} onClick={() => navigate(`/blog/${blog.id}`)}>
                     <div className="h-48 rounded-2xl overflow-hidden mb-6 relative">
                        <img src={blog.featuredImage || `https://images.unsplash.com/photo-1592419044706-39796d40f98c?auto=format&fit=crop&q=80&w=500&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`} className="w-full h-full object-cover" alt="" />
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest text-agri-primary">
                           BLOG_POST
                        </div>
                     </div>
                     <h4 className="text-xl font-serif font-bold text-agri-primary mb-3 line-clamp-2 leading-tight">{blog.title}</h4>
                     <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-full bg-agri-secondary/20 flex items-center justify-center text-agri-secondary text-xs">
                           <User size={12} />
                        </div>
                        <span className="text-xs text-stone-500 font-bold">{blog.authorName}</span>
                     </div>
                     <p className="text-stone-500 text-xs leading-relaxed line-clamp-3 mb-6">
                        {blog.excerpt || blog.content.substring(0, 100)}...
                     </p>
                     <div className="text-[10px] font-black text-agri-secondary uppercase tracking-widest flex items-center gap-2">
                        READ ARTICLE <ArrowRight size={12} />
                     </div>
                  </GlassCard>
                ))}
              </div>
            ) : (
              <div className="bg-stone-50 border border-stone-100 rounded-[2rem] p-12 text-center">
                 <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-stone-300 shadow-sm">
                    <PenTool size={32} />
                 </div>
                 <h3 className="text-lg font-serif font-bold text-agri-primary">Insights Loading...</h3>
                 <p className="text-stone-400 text-xs mt-2 max-w-md mx-auto">Our experts are currently curating new blog content. Check back soon for fresh agricultural insights.</p>
              </div>
            )}
          </section>
        );

      case 'books':
        if (books.length === 0) return null;
        return (
          <section key={section.id} className="container mx-auto px-6 mb-24">
             <SectionHeader title={section.label || "Agri-Store & Resources"} link="/products" />
             <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {books.slice(0, section.itemsToShow).map((book) => (
                   <motion.div 
                     key={book.id}
                     whileHover={{ y: -5 }}
                     className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 group cursor-pointer"
                     onClick={() => navigate('/products')}
                   >
                      <div className="aspect-[3/4] rounded-xl overflow-hidden bg-stone-100 mb-4 relative">
                         <img src={book.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={book.name} />
                         <div className="absolute top-2 right-2 bg-agri-secondary text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg">
                            ₹{book.price}
                         </div>
                      </div>
                      <h4 className="font-serif font-bold text-agri-primary text-sm mb-1 line-clamp-1">{book.name}</h4>
                      <p className="text-xs text-stone-400 mb-3 line-clamp-1">{book.description}</p>
                      <button className="w-full py-2 rounded-lg border border-agri-secondary/30 text-agri-secondary text-[10px] font-black uppercase tracking-widest hover:bg-agri-secondary hover:text-white transition-all flex items-center justify-center gap-2">
                         <ShoppingBag size={12} /> View Details
                      </button>
                   </motion.div>
                ))}
             </div>
          </section>
        );

      case 'reviews':
        if (reviews.length === 0) return null;
        return (
          <section key={section.id} className="py-20 bg-stone-50 mb-24">
             <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                   <h2 className="text-3xl font-serif font-bold text-agri-primary mb-3">{section.label || "Community Voices"}</h2>
                   <p className="text-stone-400 text-xs font-bold uppercase tracking-widest">Feedback from our network</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                   {reviews.slice(0, section.itemsToShow).map((review) => (
                      <div key={review.id} className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-100 relative">
                         <div className="text-agri-secondary mb-4 opacity-20"><Quote size={40} /></div>
                         <p className="text-stone-600 text-sm leading-relaxed mb-6 italic">"{review.comment}"</p>
                         <div className="flex items-center gap-3 border-t border-stone-100 pt-4">
                            <div className="w-10 h-10 rounded-full bg-agri-primary text-white flex items-center justify-center font-serif font-bold">
                               {review.userName[0]}
                            </div>
                            <div>
                               <p className="text-xs font-bold text-agri-primary">{review.userName}</p>
                               <div className="flex text-agri-secondary">
                                  {[...Array(review.rating)].map((_, i) => <Star key={i} size={10} fill="currentColor" />)}
                               </div>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </section>
        );

      case 'mission':
        return (
          <section key={section.id} className="container mx-auto px-6 mb-24">
             <div className="bg-agri-primary rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="relative z-10 max-w-4xl mx-auto">
                   <div className="w-16 h-16 bg-agri-secondary text-agri-primary rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
                      <BookOpen size={32} />
                   </div>
                   <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-8">{section.label || "Our Mission"}</h2>
                   <p className="text-lg md:text-xl text-white/70 font-light leading-relaxed mb-10">
                      {settings?.missionText || "To create a seamless bridge between agricultural research and practical application, empowering the next generation of farmers and scientists with verified knowledge."}
                   </p>
                   <Link to="/about-contact" className="inline-flex items-center gap-2 bg-white text-agri-primary px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-agri-secondary hover:text-white transition-all">
                      Read Our Story <ArrowRight size={16} />
                   </Link>
                </div>
             </div>
          </section>
        );

      default:
        return null;
    }
  };

  // Get active layout from settings, or fallback to default order
  let layout = settings?.homepageLayout 
    ? [...settings.homepageLayout].sort((a,b) => a.order - b.order) 
    : [];

  return (
    <div className="bg-agri-bg min-h-screen">
      
      {/* --- HERO SECTION (Static / Always Top) --- */}
      <section className="relative h-[85vh] flex items-center bg-agri-primary text-white overflow-hidden mb-24">
        {/* Updated Background Image: Modern Agriculture Drone */}
        <div className="absolute inset-0">
           <img 
             src="https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?q=80&w=2070&auto=format&fit=crop" 
             alt="Modern Agriculture Drone Technology" 
             className="w-full h-full object-cover opacity-60"
           />
           <div className="absolute inset-0 bg-gradient-to-r from-[#1C1510] via-[#1C1510]/80 to-transparent"></div>
           <div className="absolute inset-0 bg-gradient-to-t from-[#1C1510] via-transparent to-transparent"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-12 bg-agri-secondary"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-agri-secondary">Verified Academic Excellence</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-8 leading-[1.1]">
              Advancing <span className="text-agri-secondary italic">Indian Agriculture</span> Through Peer-Review
            </h1>
            <p className="text-lg text-white/70 font-light leading-relaxed mb-12 max-w-xl">
              Building a Trusted Digital Agriculture Magazine and Research Publishing Platform for Knowledge Sharing and Innovation in Modern Farming.
            </p>
            <div className="flex flex-wrap gap-6">
               <Link to="/submission" className="bg-agri-secondary text-agri-primary px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all shadow-2xl">
                 Initialize Submission
               </Link>
               <Link to="/journals" className="bg-white/5 backdrop-blur-xl border border-white/10 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3">
                 Explore Archive <ArrowRight size={16}/>
               </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- DYNAMIC SECTIONS --- */}
      {layout.map(section => renderSection(section))}

    </div>
  );
};

export default Home;
