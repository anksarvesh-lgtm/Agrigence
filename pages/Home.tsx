import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Calendar, User, 
  ChevronRight, Bookmark, Star, Quote,
  Megaphone, ShoppingBag, BookOpen, FileText, PenTool, ExternalLink, Wrench,
  Calculator, Droplets, Leaf, Activity, CheckCircle, Shield, Newspaper, Store, Info, MessageSquare
} from 'lucide-react';
import { mockBackend } from '../services/mockBackend';
import { NewsItem, Article, Magazine, Product, Feedback, SiteSettings, HomepageSection } from '../types';
import PDFAction from '../components/PDFAction';
import OptimizedImage from '../components/OptimizedImage';
import SEO from '../components/SEO';
import KeywordDisplay from '../components/KeywordDisplay';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [blogs, setBlogs] = useState<Article[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  useEffect(() => {
    const unsubSettings = mockBackend.subscribeToSettings(setSettings);

    const unsubArticles = mockBackend.subscribeToArticles(async (data) => {
        const users = await mockBackend.getPublicAdmins();
        const adminIds = new Set(users.map(u => u.id));

        const publicContent = data.filter(a => {
            if (a.status !== 'PUBLISHED' && a.status !== 'APPROVED') return false;
            if (!a.authorId) return true; 
            return adminIds.has(a.authorId); 
        });

        setBlogs(publicContent.filter(a => a.type === 'BLOG').slice(0, 3));
    });

    const unsubNews = mockBackend.subscribeToNews(data => setNews(data.slice(0, 4)));
    const unsubMagazines = mockBackend.subscribeToMagazines(data => setMagazines(data.slice(0, 3)));
    const unsubProducts = mockBackend.subscribeToProducts(data => setProducts(data.slice(0, 4)));
    const unsubFeedback = mockBackend.subscribeToFeedback(data => setFeedbacks(data.filter(f => f.status === 'APPROVED').slice(0, 3)));

    return () => {
        unsubSettings();
        unsubArticles();
        unsubNews();
        unsubMagazines();
        unsubProducts();
        unsubFeedback();
    };
  }, []);

  const SectionHeader = ({ title, link, linkText = "View All" }: { title: string; link?: string; linkText?: string }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      className="flex justify-between items-end mb-12 relative"
    >
      <div className="relative">
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-agri-primary tracking-tight">
          {title}
        </h2>
        <div className="absolute -bottom-4 left-0 text-agri-secondary">
          <svg width="100" height="20" viewBox="0 0 100 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <motion.path 
              d="M0 10 Q 50 0 100 10" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
          </svg>
        </div>
      </div>
      {link && (
        <Link to={link} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-agri-secondary hover:text-agri-primary transition-all group">
            {linkText} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      )}
    </motion.div>
  );

  const GlassCard: React.FC<{ children: React.ReactNode; onClick?: () => void; className?: string }> = ({ children, onClick, className = "" }) => (
    <motion.div
      whileHover={{ y: -5, shadow: "0 25px 50px -12px rgba(31, 38, 135, 0.15)" }}
      onClick={onClick}
      className={`glossy glossy-card rounded-[2rem] cursor-pointer transition-all overflow-hidden p-6 ${className}`}
    >
      {children}
    </motion.div>
  );

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is soil fertility?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Soil fertility is the ability of soil to sustain agricultural plant growth, providing essential plant nutrients and favorable chemical, physical, and biological characteristics as a habitat for plant growth."
        }
      },
      {
        "@type": "Question",
        "name": "How to calculate fertilizer requirement?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Fertilizer requirement is calculated based on soil test results, crop type, and target yield. It involves determining the existing nutrient levels in the soil and supplementing the deficit with appropriate fertilizers."
        }
      },
      {
        "@type": "Question",
        "name": "Why is soil testing important?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Soil testing is crucial because it helps farmers understand the exact nutrient status of their land, allowing for precise fertilizer application, reducing costs, and minimizing environmental impact."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen relative bg-stone-50 overflow-hidden">
      {/* Decorative background blobs for glass effect to show over */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/5 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-amber-600/5 blur-[120px] pointer-events-none" />
      <div className="fixed top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-green-500/5 blur-[100px] pointer-events-none" />

      <SEO 
        title="Agricultural Intelligence & Education Platform | Agrigence"
        description="Smart agricultural tools, academic resources, and research insights for farmers and students. Optimize your farming and studies with data-driven decisions."
        schema={faqSchema}
      />
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
           <img 
             src="https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?q=80&w=2070&auto=format&fit=crop" 
             alt="Agriculture innovation and technology" 
             className="w-full h-full object-cover scale-105"
             referrerPolicy="no-referrer"
           />
           <div className="absolute inset-0 bg-gradient-to-br from-agri-primary/95 via-agri-primary/80 to-transparent z-10"></div>
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 z-11"></div>
        </div>

        <div className="container mx-auto px-6 relative z-30 grid lg:grid-cols-2 gap-12 items-center pt-20">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-6"
            >
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-agri-secondary/20 backdrop-blur-md border border-agri-secondary/30">
                <Leaf size={14} className="text-agri-secondary" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-agri-secondary">Next-Gen Agritech</span>
              </div>
            </motion.div>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif font-bold mb-8 leading-[0.9] text-white tracking-tighter">
              Future <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-agri-secondary via-amber-200 to-emerald-400">Harvest</span>
            </h1>
            <p className="text-lg md:text-xl text-white/70 font-light leading-relaxed mb-10 max-w-xl">
              Merging deep agricultural wisdom with cutting-edge digital intelligence. Empowering the global farming community through data-driven innovation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
               <Link to="/tools" className="group relative px-8 py-4 bg-agri-secondary text-agri-primary font-bold text-sm tracking-widest overflow-hidden rounded-xl transition-all hover:scale-105 active:scale-95">
                 <span className="relative z-10 flex items-center gap-2">
                   <Wrench size={18} /> EXPLORE ECOSYSTEM
                 </span>
                 <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
               </Link>
               <Link to="/blogs" className="group px-8 py-4 bg-white/5 backdrop-blur-xl border border-white/10 text-white font-bold text-sm tracking-widest rounded-xl hover:bg-white/10 transition-all flex items-center gap-2">
                 <BookOpen size={18} /> RESEARCH LAB
               </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, delay: 0.3 }}
            className="hidden lg:block relative"
          >
            <div className="relative z-10 glossy glossy-card rounded-[3rem] p-2 border border-white/20 aspect-square max-w-md mx-auto overflow-hidden">
               <OptimizedImage 
                 src="https://images.unsplash.com/photo-1586771107445-d3af22d1031c?q=80&w=800&auto=format&fit=crop" 
                 className="w-full h-full object-cover rounded-[2.8rem]" 
                 alt="Tech Agriculture" 
               />
               <div className="absolute inset-0 bg-gradient-to-t from-agri-primary/60 to-transparent"></div>
               <div className="absolute bottom-10 left-10 right-10">
                  <div className="p-6 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl">
                    <div className="flex items-center gap-4 mb-2">
                      <Activity size={20} className="text-agri-secondary" />
                      <span className="text-xs font-bold text-white uppercase tracking-widest">Live Analytics</span>
                    </div>
                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        animate={{ width: ["20%", "80%", "40%", "90%"] }}
                        transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
                        className="h-full bg-agri-secondary"
                      />
                    </div>
                  </div>
               </div>
            </div>
            {/* Floating elements */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="absolute -top-10 -right-10 w-32 h-32 glossy rounded-3xl flex items-center justify-center border border-white/20 z-20"
            >
              <Droplets size={40} className="text-blue-400" />
            </motion.div>
            <motion.div 
              animate={{ y: [0, 20, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-10 -left-10 w-40 h-40 glossy rounded-full flex items-center justify-center border border-white/20 z-20"
            >
              <Leaf size={48} className="text-emerald-400" />
            </motion.div>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-3"
        >
          <div className="w-px h-20 bg-gradient-to-b from-transparent via-agri-secondary to-transparent"></div>
          <span className="text-white/30 text-[9px] uppercase tracking-[0.5em] font-bold rotate-90 origin-left translate-x-1 mt-4">Discover</span>
        </motion.div>
      </section>

      {/* 2. NEWS & UPDATES (Technical Grid Style) - MOVED HERE */}
      <section className="py-32 relative z-10 bg-stone-900 text-white overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-4 mb-16">
            <div className="w-12 h-px bg-agri-secondary"></div>
            <h2 className="text-xs font-bold uppercase tracking-[0.5em] text-agri-secondary">Global Intelligence Feed</h2>
          </div>
          
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <h3 className="text-5xl md:text-6xl font-serif font-bold mb-8 leading-tight">Latest <br /> Breakthroughs</h3>
              <p className="text-stone-400 text-lg mb-12 font-light">Real-time updates from the intersection of technology and agriculture.</p>
              <Link to="/news" className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-white hover:text-agri-secondary transition-colors group">
                VIEW ALL UPDATES <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
            
            <div className="lg:col-span-8 grid md:grid-cols-2 gap-px bg-white/10 border border-white/10 rounded-3xl overflow-hidden">
              {news.length > 0 ? news.slice(0, 4).map((item, i) => (
                <div 
                  key={i}
                  onClick={() => navigate(`/news/${item.id}`)}
                  className="p-10 bg-stone-900 hover:bg-stone-800 transition-colors cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-0 bg-agri-secondary group-hover:h-full transition-all duration-500"></div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-mono text-stone-500 uppercase tracking-widest">
                      {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <Megaphone size={14} className="text-stone-700 group-hover:text-agri-secondary transition-colors" />
                  </div>
                  <h4 className="text-xl font-bold leading-snug group-hover:text-agri-secondary transition-colors">{item.title}</h4>
                </div>
              )) : (
                <div className="col-span-full text-center py-24 text-stone-500 italic">No active intelligence feeds.</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. QUICK TOOLS SECTION (Bento Grid Style) */}
      <section className="py-32 relative z-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-5xl md:text-7xl font-serif font-bold text-agri-primary mb-6 tracking-tighter leading-none">
                Precision <br />
                <span className="text-agri-secondary">Instruments</span>
              </h2>
              <p className="text-stone-500 text-lg font-medium">Advanced computational tools designed for the modern agronomist.</p>
            </div>
            <Link to="/tools" className="group flex items-center gap-4 px-8 py-4 bg-stone-900 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-agri-primary transition-all">
              FULL CATALOG <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Large Feature Tool */}
            <div className="md:col-span-2 md:row-span-2">
              <GlassCard 
                onClick={() => navigate('/tools/nutrient-req')}
                className="h-full flex flex-col justify-between bg-emerald-900/5 border-emerald-900/10"
              >
                <div>
                  <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-8">
                    <Leaf size={32} className="text-emerald-600" />
                  </div>
                  <h3 className="text-4xl font-serif font-bold text-agri-primary mb-4">Soil Health Intelligence</h3>
                  <p className="text-stone-600 text-lg leading-relaxed mb-8">Comprehensive nutrient analysis and fertilizer recommendation engine based on global soil standards.</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-stone-200 overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />
                      </div>
                    ))}
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-agri-secondary flex items-center justify-center text-[10px] font-bold text-agri-primary">
                      +2k
                    </div>
                  </div>
                  <span className="text-xs font-bold text-agri-secondary uppercase tracking-widest">Launch Tool →</span>
                </div>
              </GlassCard>
            </div>

            {/* Smaller Tools */}
            <GlassCard onClick={() => navigate('/tools/water-req')} className="bg-blue-50/50 border-blue-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Droplets size={24} className="text-blue-600" />
              </div>
              <h3 className="font-bold text-xl text-agri-primary mb-2">Hydro-Sync</h3>
              <p className="text-stone-500 text-sm mb-6">Precision irrigation scheduling.</p>
              <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Active</div>
            </GlassCard>

            <GlassCard onClick={() => navigate('/tools/yield-estimator')} className="bg-amber-50/50 border-amber-100">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-6">
                <Activity size={24} className="text-amber-600" />
              </div>
              <h3 className="font-bold text-xl text-agri-primary mb-2">Yield Predictor</h3>
              <p className="text-stone-500 text-sm mb-6">Harvest estimation engine.</p>
              <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">98% Accuracy</div>
            </GlassCard>

            <GlassCard onClick={() => navigate('/tools/economics')} className="md:col-span-2 bg-purple-50/50 border-purple-100">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center shrink-0">
                  <Calculator size={32} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-2xl text-agri-primary mb-1">Agri-Finance Suite</h3>
                  <p className="text-stone-500 text-sm">Profitability analysis and cost optimization for large-scale farming.</p>
                </div>
                <div className="ml-auto">
                  <ChevronRight size={24} className="text-stone-300" />
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>


      {/* 4. BLOGS & EXPERT INSIGHTS (Editorial Style) */}
      <section className="py-32 relative z-10 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-5xl md:text-7xl font-serif font-bold text-agri-primary mb-6 tracking-tighter">Blogs</h2>
            <p className="text-stone-500 text-lg">In-depth analysis, peer-reviewed insights, and expert perspectives on the future of food systems.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {blogs.length > 0 ? blogs.map((blog, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => navigate(`/blog/${blog.id}`)}
                className="group cursor-pointer"
              >
                <div className="aspect-[4/5] relative overflow-hidden rounded-[2rem] mb-8 glossy-card">
                  <OptimizedImage 
                    src={blog.featuredImage || blog.fileUrl || `https://images.unsplash.com/photo-1586771107445-d3af22d1031c?q=80&w=800&auto=format&fit=crop&sig=${i}`} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                    alt={blog.title} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-agri-primary/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                  <div className="absolute bottom-8 left-8 right-8">
                    <div className="inline-block px-4 py-1 bg-agri-secondary text-agri-primary text-[10px] font-bold uppercase tracking-widest rounded-full mb-4">
                      {blog.categoryId || 'Agriculture'}
                    </div>
                    <h4 className="text-2xl font-serif font-bold text-white leading-tight line-clamp-2">{blog.title}</h4>
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-agri-primary font-bold text-[10px]">
                    {blog.authorName[0]}
                  </div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{blog.authorName} • {new Date(blog.submissionDate).toLocaleDateString()}</span>
                </div>
                <p className="text-stone-600 text-sm leading-relaxed line-clamp-3 mb-6">{blog.excerpt || blog.content?.substring(0, 150)}...</p>
                <div className="w-full h-px bg-stone-100 group-hover:bg-agri-secondary transition-colors"></div>
              </motion.div>
            )) : (
              <div className="col-span-full text-center py-24 text-stone-400 italic">No research papers found.</div>
            )}
          </div>
        </div>
      </section>

      {/* 5. MAGAZINE SECTION (Immersive Style) */}
      <section className="py-32 relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-stone-50"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="lg:w-1/3">
              <h2 className="text-5xl md:text-7xl font-serif font-bold mb-8 tracking-tighter text-agri-primary">The <br /> <span className="text-agri-secondary">Archives</span></h2>
              <p className="text-stone-600 font-medium text-lg mb-10 leading-relaxed">Curated publications, research journals, and monthly digests documenting the evolution of agricultural science.</p>
              <Link to="/journals" className="inline-flex items-center gap-3 px-8 py-4 bg-agri-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-agri-secondary transition-all group">
                EXPLORE ALL ISSUES <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
            
            <div className="lg:w-2/3 grid md:grid-cols-3 gap-8">
              {magazines.length > 0 ? magazines.map((mag, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group"
                >
                  <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden shadow-2xl mb-6 glossy-card">
                    <OptimizedImage 
                      src={mag.coverImage || `https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=400&auto=format&fit=crop`} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      alt={mag.title} 
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                       <PDFAction 
                         fileUrl={mag.pdfUrl} 
                         title={mag.title} 
                       />
                    </div>
                  </div>
                  <h4 className="text-xl font-serif font-bold text-agri-primary mb-1 text-center">{mag.title}</h4>
                  <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest text-center">Issue {mag.issueNumber} • {mag.year}</p>
                </motion.div>
              )) : (
                <div className="col-span-full text-center py-24 text-stone-400 italic">Archives are currently being digitized.</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 6. OUR MISSION (Split Layout Style) */}
      <section className="py-32 relative z-10 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="bg-agri-primary rounded-[4rem] overflow-hidden grid lg:grid-cols-2 shadow-2xl">
            <div className="relative min-h-[500px]">
               <OptimizedImage 
                 src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000&auto=format&fit=crop" 
                 className="w-full h-full object-cover" 
                 alt="Agriculture Mission" 
               />
               <div className="absolute inset-0 bg-agri-primary/40 mix-blend-multiply"></div>
               <div className="absolute inset-0 bg-gradient-to-r from-agri-primary to-transparent"></div>
               <div className="absolute bottom-12 left-12">
                  <div className="flex items-center gap-4 text-white">
                    <div className="w-16 h-16 rounded-full bg-agri-secondary flex items-center justify-center text-agri-primary">
                      <Shield size={32} />
                    </div>
                    <div>
                      <h4 className="text-2xl font-serif font-bold">Verified Data</h4>
                      <p className="text-white/60 text-sm">Scientifically validated resources.</p>
                    </div>
                  </div>
               </div>
            </div>
            <div className="p-12 md:p-24 flex flex-col justify-center text-white">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-8 h-px bg-agri-secondary"></div>
                <span className="text-xs font-bold uppercase tracking-[0.4em] text-agri-secondary">Our Core Purpose</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-serif font-bold mb-10 leading-tight tracking-tighter">Empowering the <br /> <span className="italic font-normal">Next Generation</span></h2>
              <p className="text-lg text-white/70 leading-relaxed mb-12 font-light max-w-lg">
                {settings?.missionText || "Agrigence is dedicated to building a trusted digital ecosystem for agricultural knowledge, research publishing, and academic excellence. We bridge the gap between scientific research, student learning, and field application."}
              </p>
              
              <div className="grid grid-cols-2 gap-12 mb-12">
                <div>
                  <div className="text-5xl font-serif font-bold text-agri-secondary mb-2">10k+</div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Active Contributors</p>
                </div>
                <div>
                  <div className="text-5xl font-serif font-bold text-agri-secondary mb-2">500+</div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Published Papers</p>
                </div>
              </div>

              <Link to="/about-contact" className="group inline-flex items-center gap-4 text-sm font-bold uppercase tracking-widest text-agri-secondary hover:text-white transition-colors">
                LEARN MORE ABOUT OUR IMPACT <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. STORE SECTION (Minimal Grid Style) */}
      <section className="py-32 relative z-10 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-20">
            <div>
              <h2 className="text-5xl md:text-7xl font-serif font-bold text-agri-primary tracking-tighter">The <span className="text-agri-secondary">Market</span></h2>
              <p className="text-stone-500 mt-4 font-medium">Premium agricultural products and academic resources.</p>
            </div>
            <Link to="/products" className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400 hover:text-agri-primary transition-colors">
              Enter Store →
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-stone-100 border border-stone-100 rounded-[3rem] overflow-hidden">
            {products.length > 0 ? products.map((prod, i) => (
              <div 
                key={i}
                onClick={() => navigate(`/product/${prod.id}`)}
                className="bg-white p-10 flex flex-col hover:bg-stone-50 transition-colors cursor-pointer group"
              >
                <div className="aspect-square relative mb-10 p-4">
                  <OptimizedImage 
                    src={prod.imageUrl || `https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=500&auto=format&fit=crop`} 
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" 
                    alt={prod.name} 
                  />
                </div>
                <h4 className="font-bold text-lg text-agri-primary mb-2 line-clamp-1">{prod.name}</h4>
                <p className="text-stone-400 text-xs mb-8 line-clamp-2 leading-relaxed">{prod.description}</p>
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-2xl font-serif font-bold text-agri-primary">₹{prod.price}</span>
                  <div className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 group-hover:bg-agri-primary group-hover:text-white group-hover:border-agri-primary transition-all">
                    <ShoppingBag size={18} />
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-24 text-stone-400 italic">Marketplace is being restocked.</div>
            )}
          </div>
        </div>
      </section>

      {/* 8. REVIEWS & TESTIMONIALS */}
      <section className="py-32 relative overflow-hidden z-10 bg-stone-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-serif font-bold text-agri-primary mb-6 tracking-tighter">Voices of the <span className="text-agri-secondary">Field</span></h2>
            <p className="text-stone-500 text-lg">Trusted by thousands of agricultural professionals worldwide.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {feedbacks.length > 0 ? feedbacks.map((fb, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-12 rounded-[3rem] shadow-premium border border-stone-100 relative hover:shadow-2xl transition-all group"
              >
                <Quote size={64} className="absolute top-10 right-10 text-agri-secondary/10 group-hover:text-agri-secondary/20 transition-colors" />
                <div className="flex gap-1 mb-8">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={14} className={j < (fb.rating || 5) ? "fill-agri-secondary text-agri-secondary" : "text-stone-200"} />
                  ))}
                </div>
                <p className="text-stone-700 font-medium italic mb-10 leading-relaxed text-lg">"{fb.comment}"</p>
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-agri-primary text-white rounded-full flex items-center justify-center font-bold text-xl">
                    {fb.userName[0]}
                  </div>
                  <div>
                    <h5 className="font-bold text-agri-primary text-base">{fb.userName}</h5>
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">{fb.userOccupation || 'Verified User'}</p>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full text-center py-24 text-stone-400 italic">No community feedback yet.</div>
            )}
          </div>
        </div>
      </section>

      {/* 9. FAQ (AI SEO) */}
      <section className="py-32 relative z-10 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-20">
              <div>
                <h2 className="text-5xl md:text-7xl font-serif font-bold text-agri-primary mb-8 tracking-tighter leading-none">Common <br /> <span className="text-agri-secondary">Inquiries</span></h2>
                <p className="text-stone-500 text-lg mb-12">Everything you need to know about our agricultural intelligence platform.</p>
                <div className="p-8 bg-stone-50 rounded-3xl border border-stone-100">
                  <h4 className="font-bold text-agri-primary mb-4">Still have questions?</h4>
                  <p className="text-stone-500 text-sm mb-6">Our support team is ready to help you with any specific technical or academic queries.</p>
                  <Link to="/about-contact" className="text-xs font-bold text-agri-secondary uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                    CONTACT SUPPORT <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
              
              <div className="space-y-8">
                {[
                  { q: "What is Agrigence?", a: "Agrigence is an international platform for agricultural research, innovation, and scholarly publication connecting students, farmers, and institutions worldwide." },
                  { q: "How can students benefit?", a: "Students can access a vast archive of research journals, use precision calculators for their studies, and stay updated with the latest agricultural innovations." },
                  { q: "How do I submit a paper?", a: "Login to your account and visit the 'Submission' page. Ensure your manuscript follows our Author Guidelines." },
                  { q: "Are the calculators accurate?", a: "Yes, our calculators are built using scientifically validated formulas from organizations like ICAR and FAO." }
                ].map((faq, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="group"
                  >
                    <h3 className="font-bold text-xl text-agri-primary mb-4 flex items-start gap-4 group-hover:text-agri-secondary transition-colors">
                      <span className="text-agri-secondary mt-1"><CheckCircle size={20} /></span>
                      {faq.q}
                    </h3>
                    <p className="text-stone-500 pl-9 leading-relaxed text-sm">{faq.a}</p>
                    <div className="mt-8 h-px w-full bg-stone-100"></div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. TRUST SIGNALS */}
      <section className="py-32 relative z-10 bg-stone-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent"></div>
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-24">
            <Shield size={64} className="text-agri-secondary mx-auto mb-10" />
            <h2 className="text-5xl md:text-7xl font-serif font-bold mb-8 tracking-tighter">Global Trust Network</h2>
            <p className="text-stone-400 text-xl font-light">Collaborating with world-class institutions to ensure data integrity and academic excellence.</p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="bg-white/5 p-12 rounded-[3rem] border border-white/10 hover:bg-white/10 transition-all">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-agri-secondary mb-10">Data Sources</h3>
              <div className="flex flex-wrap gap-3">
                {['ICAR', 'FAO', 'Global Universities', 'Research Centers', 'Govt. Portals'].map((source, i) => (
                  <span key={i} className="bg-white/5 px-6 py-3 rounded-full font-bold text-[10px] border border-white/10">{source}</span>
                ))}
              </div>
            </div>
            
            <div className="lg:col-span-2 bg-white/5 p-12 rounded-[3rem] border border-white/10 hover:bg-white/10 transition-all flex flex-col md:flex-row items-center gap-12">
              <div className="shrink-0">
                <div className="w-32 h-32 rounded-full border-4 border-agri-secondary/30 p-2">
                   <img 
                     src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=200&auto=format&fit=crop" 
                     className="w-full h-full object-cover rounded-full" 
                     alt="Agrigence Logo" 
                     referrerPolicy="no-referrer"
                   />
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-serif font-bold text-agri-secondary mb-4">Agrigence</h3>
                <p className="text-stone-400 text-lg font-light leading-relaxed">Our dedicated team of scientists and agronomists ensures every tool, article, and resource meets the highest standards of scientific accuracy.</p>
              </div>
            </div>
          </div>
          
        </div>
      </section>
    </div>
  );
};

export default Home;
