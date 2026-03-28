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
    <div className="flex justify-between items-end mb-8 relative">
      <h2 className="text-3xl font-serif font-bold text-agri-primary">
        {title}
      </h2>
      {link && (
        <Link to={link} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-agri-secondary hover:text-agri-primary transition-all">
            {linkText} <ChevronRight size={14} />
        </Link>
      )}
    </div>
  );

  const GlassCard: React.FC<{ children: React.ReactNode; onClick?: () => void; className?: string }> = ({ children, onClick, className = "" }) => (
    <motion.div
      whileHover={{ y: -5, shadow: "0 25px 50px -12px rgba(31, 38, 135, 0.15)" }}
      onClick={onClick}
      className={`bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] hover:bg-white/50 cursor-pointer transition-all overflow-hidden p-6 ${className}`}
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
    <div className="min-h-screen relative bg-[#f8f9fa] overflow-hidden">
      {/* Decorative background blobs for glass effect to show over */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-agri-primary/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-agri-secondary/10 blur-[120px] pointer-events-none" />
      <div className="fixed top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />

      <SEO 
        title="Agricultural Intelligence & Education Platform | Agrigence"
        description="Smart agricultural tools, academic resources, and research insights for farmers and students. Optimize your farming and studies with data-driven decisions."
        schema={faqSchema}
      />
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden rounded-b-[3rem] mx-2 mt-2 shadow-sm">
        <div className="absolute inset-0">
           <OptimizedImage 
             src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=2000&auto=format&fit=crop" 
             alt="Agriculture innovation and technology" 
             className="w-full h-full object-cover"
             priority={true}
           />
           <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10"></div>
        </div>

        <div className="container mx-auto px-6 relative z-30 flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <div className="mb-6 flex flex-col items-center">
              <div className="flex items-center gap-3">
                <span className="h-px w-12 bg-agri-secondary"></span>
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-agri-secondary">Agriculture & Education Hub</span>
                <span className="h-px w-12 bg-agri-secondary"></span>
              </div>
            </div>
            <h1 className="text-4xl md:text-7xl font-serif font-bold mb-6 leading-[1.1] text-white">
              Pioneering the Future of <span className="text-agri-secondary">Agri-Education</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-light leading-relaxed mb-10 max-w-3xl mx-auto">
              Empowering farmers, students, researchers, and innovators with smart agricultural tools, expert research insights, and a global academic community.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 md:gap-6 w-full px-4 sm:px-0">
               <Link to="/tools" className="w-full sm:w-auto justify-center bg-white/20 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/30 transition-all shadow-lg flex items-center gap-2">
                 <Wrench size={18} /> EXPLORE TOOLS
               </Link>
               <Link to="/blogs" className="w-full sm:w-auto justify-center bg-black/30 backdrop-blur-md border border-white/10 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black/50 transition-all shadow-lg flex items-center gap-2">
                 <BookOpen size={18} /> READ BLOGS
               </Link>
               <Link to="/products" className="w-full sm:w-auto justify-center bg-white/80 backdrop-blur-md border border-white/50 text-agri-primary px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all shadow-lg flex items-center gap-2">
                 <ShoppingBag size={18} /> VISIT STORE
               </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 animate-bounce hidden md:block">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white rounded-full"></div>
          </div>
        </div>
      </section>

      {/* 3. NEWS & UPDATES */}
      <section className="py-24 relative z-10 bg-stone-50">
        <div className="container mx-auto px-6">
          <SectionHeader title="News & Updates" link="/news" />
          
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden relative" style={{ height: '400px' }}>
            {/* Gradient masks for smooth fade in/out */}
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none"></div>
            
            {news.length > 0 ? (
              <div className="h-full overflow-hidden relative group">
                <style>{`
                  @keyframes scrollUp {
                    0% { transform: translateY(100%); }
                    100% { transform: translateY(-100%); }
                  }
                  .news-ticker {
                    animation: scrollUp 20s linear infinite;
                  }
                  .group:hover .news-ticker {
                    animation-play-state: paused;
                  }
                `}</style>
                <div className="news-ticker absolute w-full px-8 md:px-12">
                  <ul className="space-y-8 pb-8">
                    {news.map((item, i) => (
                      <li key={i} className="relative pl-8 cursor-pointer group/item" onClick={() => navigate(`/news/${item.id}`)}>
                        <div className="absolute left-0 top-2 w-3 h-3 rounded-full bg-agri-secondary group-hover/item:scale-150 transition-transform"></div>
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                          <span className="text-xs font-black text-agri-secondary uppercase tracking-widest flex items-center gap-1">
                            <Calendar size={12} /> {item.date}
                          </span>
                          {item.isBreaking && (
                            <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[10px] font-black uppercase flex items-center gap-1 animate-pulse w-max">
                              BREAKING
                            </span>
                          )}
                        </div>
                        <h4 className="text-xl font-serif font-bold text-agri-primary mb-2 group-hover/item:text-agri-secondary transition-colors">{item.title}</h4>
                        <p className="text-stone-600 text-sm line-clamp-2 mb-2">{item.description || item.content}</p>
                        
                        {item.highlights && item.highlights.length > 0 && (
                          <ul className="list-disc list-inside text-xs text-stone-500 mb-3 ml-2 space-y-1">
                            {item.highlights.slice(0, 2).map((highlight, hIdx) => (
                              <li key={hIdx} className="line-clamp-1">{highlight}</li>
                            ))}
                          </ul>
                        )}

                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {item.tags.slice(0, 3).map((tag, tIdx) => (
                              <span key={tIdx} className="bg-stone-100 text-stone-500 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </li>
                    ))}
                    {/* Duplicate for seamless looping if needed, but simple scroll is fine for now */}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-stone-400 italic">No recent news updates available.</div>
            )}
          </div>
        </div>
      </section>

      {/* 4. BLOGS & EXPERT INSIGHTS */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-6">
          <SectionHeader title="Blogs & Expert Insights" link="/blogs" />
          <div className="grid md:grid-cols-3 gap-8">
            {blogs.length > 0 ? blogs.map((blog, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                onClick={() => navigate(`/blog/${blog.id}`)}
                className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] hover:bg-white/50 transition-all cursor-pointer group flex flex-col"
              >
                <div className="h-56 relative overflow-hidden">
                  <OptimizedImage 
                    src={blog.featuredImage || blog.fileUrl || `https://images.unsplash.com/photo-1586771107445-d3af22d1031c?q=80&w=800&auto=format&fit=crop&sig=${i}`} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    alt={blog.title} 
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black text-agri-primary uppercase tracking-widest">
                    {blog.categoryId || 'Agriculture'}
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-4 text-[10px] font-black text-stone-600 uppercase tracking-widest">
                    <span className="flex items-center gap-1"><User size={12} /> {blog.authorName}</span>
                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(blog.submissionDate).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-xl font-serif font-bold text-agri-primary mb-4 group-hover:text-agri-secondary transition-colors line-clamp-2">{blog.title}</h4>
                  <p className="text-stone-700 text-sm mb-6 line-clamp-3 leading-relaxed font-medium">{blog.excerpt || blog.content?.substring(0, 150)}...</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-agri-secondary uppercase tracking-widest flex items-center gap-2">
                      READ ARTICLE <ArrowRight size={12} />
                    </span>
                    <Bookmark size={16} className="text-stone-300 hover:text-agri-secondary transition-colors" />
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full text-center py-12 text-stone-400 italic">No recent blog posts available.</div>
            )}
          </div>
        </div>
      </section>

      {/* 5. MAGAZINE SECTION */}
      <section className="py-24 relative overflow-hidden z-10 mx-4 rounded-[3rem] my-12 shadow-xl">
        <div className="absolute inset-0 bg-[#F5F5DC]/90 backdrop-blur-2xl"></div>
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-20 pointer-events-none">
           <svg viewBox="0 0 100 100" className="w-full h-full fill-current text-[#3D2B1F]">
              <path d="M0,0 L100,0 L100,100 L0,100 Z" />
           </svg>
        </div>
        <div className="container mx-auto px-6 relative z-10 text-[#3D2B1F]">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-xl">
              <h2 className="text-4xl font-serif font-bold mb-4">Agriculture Magazines</h2>
              <p className="text-[#3D2B1F]/90 font-medium">Explore our featured publications, research journals, and monthly agriculture digests.</p>
            </div>
            <Link to="/journals" className="text-[10px] font-black uppercase tracking-widest text-agri-secondary hover:text-agri-primary transition-all flex items-center gap-2">
              VIEW ALL ISSUES <ChevronRight size={14} />
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {magazines.length > 0 ? magazines.map((mag, i) => (
              <div key={i} className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-8 flex flex-col items-center text-center group hover:bg-white/60 hover:border-white/80 transition-all shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
                <div className="w-48 h-64 bg-stone-200 rounded-xl mb-8 shadow-xl overflow-hidden relative group-hover:-translate-y-2 transition-transform duration-500">
                  <OptimizedImage 
                    src={mag.coverImage || `https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=400&auto=format&fit=crop`} 
                    className="w-full h-full object-cover" 
                    alt={mag.title} 
                  />
                  <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <BookOpen size={48} className="text-[#3D2B1F]" />
                  </div>
                </div>
                <h4 className="text-xl font-serif font-bold mb-2 text-[#3D2B1F]">{mag.title}</h4>
                <p className="text-[#3D2B1F]/80 text-xs mb-6 uppercase tracking-widest font-black">Issue {mag.issueNumber} • {mag.year}</p>
                <div className="flex gap-4 mt-auto">
                   <PDFAction 
                     fileUrl={mag.pdfUrl} 
                     title={mag.title} 
                   />
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-12 text-[#3D2B1F]/50 italic">No magazines available at the moment.</div>
            )}
          </div>
        </div>
      </section>

      {/* 6. STORE SECTION */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-6">
          <SectionHeader title="Store" link="/products" />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.length > 0 ? products.map((prod, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] hover:bg-white/50 transition-all group overflow-hidden flex flex-col"
              >
                <div className="h-64 relative bg-white/50 overflow-hidden">
                  <OptimizedImage 
                    src={prod.imageUrl || `https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=500&auto=format&fit=crop`} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    alt={prod.name} 
                  />
                </div>
                <div className="p-6">
                  <h4 className="font-bold text-agri-primary mb-2 truncate">{prod.name}</h4>
                  <p className="text-stone-700 text-xs mb-4 line-clamp-1 font-medium">{prod.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-serif font-bold text-agri-secondary">₹{prod.price}</span>
                    <Link to="/products" className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center text-agri-primary hover:bg-agri-primary hover:text-white transition-all">
                      <ShoppingBag size={18} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full text-center py-12 text-stone-400 italic">Store items are being updated.</div>
            )}
          </div>
        </div>
      </section>


      {/* 8. REVIEWS & TESTIMONIALS */}
      <section className="py-24 relative overflow-hidden z-10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-agri-primary mb-4">Community Feedback</h2>
            <p className="text-stone-700 font-medium">What farmers, researchers, and students say about Agrigence.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {feedbacks.length > 0 ? feedbacks.map((fb, i) => (
              <div key={i} className="bg-white/40 backdrop-blur-xl p-10 rounded-[3rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/60 relative hover:bg-white/50 transition-all">
                <Quote size={48} className="absolute top-8 right-8 text-agri-secondary/10" />
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={14} className={j < (fb.rating || 5) ? "fill-agri-secondary text-agri-secondary" : "text-stone-200"} />
                  ))}
                </div>
                <p className="text-stone-800 font-medium italic mb-8 leading-relaxed">"{fb.comment}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-agri-primary/10 rounded-full flex items-center justify-center text-agri-primary font-bold">
                    {fb.userName[0]}
                  </div>
                  <div>
                    <h5 className="font-bold text-agri-primary text-sm">{fb.userName}</h5>
                    <p className="text-[10px] text-stone-600 uppercase tracking-widest font-black">{fb.userOccupation || 'Verified User'}</p>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-12 text-stone-400 italic">No testimonials available yet.</div>
            )}
          </div>
        </div>
      </section>

      {/* 8. OUR MISSION */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-6">
          <div className="bg-agri-primary/90 backdrop-blur-2xl rounded-[4rem] overflow-hidden relative shadow-xl border border-white/20">
            <div className="absolute inset-0 opacity-20">
               <OptimizedImage 
                 src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000&auto=format&fit=crop" 
                 className="w-full h-full object-cover" 
                 alt="Agriculture Mission" 
               />
            </div>
            <div className="relative z-10 p-12 md:p-24 flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2 text-white">
                <div className="flex items-center gap-3 mb-6">
                  <span className="h-px w-12 bg-agri-secondary"></span>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-agri-secondary">Our Purpose</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-serif font-bold mb-8">Empowering Farmers, Students, and Researchers</h2>
                <p className="text-lg text-white leading-relaxed mb-8 font-medium">
                  {settings?.missionText || "Agrigence is dedicated to building a trusted digital ecosystem for agricultural knowledge, research publishing, and academic excellence. We bridge the gap between scientific research, student learning, and field application."}
                </p>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-3xl font-serif font-bold text-agri-secondary mb-1">10k+</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/90">Active Users</p>
                  </div>
                  <div>
                    <h4 className="text-3xl font-serif font-bold text-agri-secondary mb-1">500+</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/90">Research Papers</p>
                  </div>
                </div>
              </div>
              <div className="md:w-1/2">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[3rem] text-white shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]">
                  <h3 className="text-xl font-serif font-bold mb-6">How we help:</h3>
                  <ul className="space-y-4">
                    {[
                      { icon: <CheckCircle size={18} />, text: "Providing high-precision agricultural calculators" },
                      { icon: <CheckCircle size={18} />, text: "Publishing peer-reviewed research journals" },
                      { icon: <CheckCircle size={18} />, text: "Academic resources and study materials for students" },
                      { icon: <CheckCircle size={18} />, text: "Connecting farmers with expert insights" }
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-agri-secondary mt-1">{item.icon}</span>
                        <span className="text-sm text-white font-medium">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/about-contact" className="mt-10 block text-center bg-white/20 backdrop-blur-md border border-white/30 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/30 transition-all shadow-lg">
                    LEARN MORE ABOUT US
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQ (AI SEO) */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-serif font-bold text-agri-primary mb-4">Frequently Asked Questions</h2>
              <p className="text-stone-700 font-medium">Common questions about agricultural intelligence and our platform.</p>
            </div>
            <div className="space-y-4">
              {[
                { q: "What is Agrigence?", a: "Agrigence is an international platform for agricultural research, innovation, and scholarly publication connecting students, farmers, and institutions worldwide." },
                { q: "How can students benefit from this platform?", a: "Students can access a vast archive of research journals, use precision calculators for their studies, and stay updated with the latest agricultural innovations." },
                { q: "How do I submit a research paper?", a: "Login to your account and visit the 'Submission' page. Ensure your manuscript follows our Author Guidelines." },
                { q: "Are the calculators accurate?", a: "Yes, our calculators are built using scientifically validated formulas from organizations like ICAR and FAO." }
              ].map((faq, i) => (
                <div key={i} className="bg-white/40 backdrop-blur-xl p-8 rounded-3xl border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] hover:bg-white/50 transition-all">
                  <h3 className="font-bold text-lg text-agri-primary mb-4 flex items-start gap-3">
                    <span className="text-agri-secondary mt-1"><CheckCircle size={18} /></span>
                    {faq.q}
                  </h3>
                  <p className="text-stone-800 pl-7 leading-relaxed font-medium">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. QUICK TOOLS SECTION */}
      <section className="py-32 relative overflow-hidden z-10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-serif font-bold text-[#3D2B1F] mb-6">Quick Access Tools</h2>
            <p className="text-stone-700 text-lg max-w-3xl mx-auto font-medium">High-precision calculators and academic resources for modern farming and agricultural studies.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Soil Health", desc: "Analyze soil parameters instantly.", link: "/tools/nutrient-req", icon: <Leaf size={24} />, color: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" },
              { title: "Water Req", desc: "Precision irrigation scheduling.", link: "/tools/water-req", icon: <Droplets size={24} />, color: "bg-blue-500/10 text-blue-600 border border-blue-500/20" },
              { title: "Yield Estimator", desc: "Predict your harvest accurately.", link: "/tools/yield-estimator", icon: <Activity size={24} />, color: "bg-amber-500/10 text-amber-600 border border-amber-500/20" },
              { title: "Economics", desc: "Farm profitability analysis.", link: "/tools/economics", icon: <Calculator size={24} />, color: "bg-purple-500/10 text-purple-600 border border-purple-500/20" }
            ].map((tool, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white/40 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/60 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] hover:bg-white/50 transition-all group"
              >
                <div className={`w-16 h-16 ${tool.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  {tool.icon}
                </div>
                <h3 className="font-bold text-xl text-agri-primary mb-3">{tool.title}</h3>
                <p className="text-stone-700 text-sm mb-6 leading-relaxed font-medium">{tool.desc}</p>
                <Link to={tool.link} className="text-[10px] font-black text-agri-secondary uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
                  OPEN TOOL <ArrowRight size={12} />
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link to="/tools" className="inline-flex items-center gap-2 text-agri-primary font-bold hover:text-agri-secondary transition-colors">
              View All 20+ Agriculture Tools <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 10. TRUST SIGNALS */}
      <section className="relative z-10 mx-4 mb-4 rounded-[3rem] overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-stone-900/90 backdrop-blur-2xl"></div>
        <div className="container mx-auto px-6 text-center py-24 relative z-10 text-white">
          <Shield size={64} className="text-agri-secondary mx-auto mb-8" />
          <h2 className="text-4xl font-serif font-bold mb-16">Trusted by Farmers, Students, and Researchers</h2>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:bg-white/10 transition-all">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-300 mb-8">Agriculture Data Sources</h3>
              <div className="flex flex-wrap justify-center gap-4">
                {['ICAR', 'FAO', 'Agricultural Universities', 'Research Centers', 'Govt. Portals'].map((source, i) => (
                  <span key={i} className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-xl font-bold text-xs border border-white/20 hover:bg-agri-secondary/30 transition-colors shadow-sm">{source}</span>
                ))}
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:bg-white/10 transition-all">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-300 mb-8">Author & Research</h3>
              <div className="bg-agri-secondary/20 backdrop-blur-md border border-agri-secondary/30 px-8 py-8 rounded-[2rem] inline-block shadow-lg">
                <p className="font-serif text-2xl font-bold text-agri-secondary">Agrigence Research Team</p>
                <p className="text-sm text-white/90 mt-2 font-medium">Dedicated to advancing agricultural science through digital innovation.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
