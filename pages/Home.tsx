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
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden rounded-b-[3rem] mx-2 mt-2 shadow-sm">
        <div className="absolute inset-0">
           <OptimizedImage 
             src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=2000&auto=format&fit=crop" 
             alt="Agriculture innovation and technology" 
             className="w-full h-full object-cover"
             priority={true}
           />
           <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-agri-primary/80 z-10"></div>
        </div>

        <div className="container mx-auto px-6 relative z-30 flex flex-col items-center text-center mt-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-5xl"
          >
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-8 flex flex-col items-center"
            >
              <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                <Leaf size={14} className="text-agri-secondary" />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white">Modern Agriculture Hub</span>
              </div>
            </motion.div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold mb-6 leading-[1.1] text-white tracking-tight">
              Cultivating <span className="text-transparent bg-clip-text bg-gradient-to-r from-agri-secondary to-emerald-400">Intelligence</span>
            </h1>
            <p className="text-lg md:text-2xl text-white/90 font-light leading-relaxed mb-12 max-w-3xl mx-auto">
              Empowering farmers, students, researchers, and innovators with smart agricultural tools, expert research insights, and a global academic community.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 md:gap-6 w-full px-4 sm:px-0">
               <Link to="/tools" className="w-full sm:w-auto justify-center bg-agri-secondary text-agri-primary px-8 py-4 rounded-full font-bold text-sm hover:bg-white transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] flex items-center gap-2 group">
                 <Wrench size={18} className="group-hover:rotate-12 transition-transform" /> EXPLORE TOOLS
               </Link>
               <Link to="/blogs" className="w-full sm:w-auto justify-center bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-full font-bold text-sm hover:bg-white/20 transition-all flex items-center gap-2 group">
                 <BookOpen size={18} className="group-hover:-translate-y-1 transition-transform" /> READ BLOGS
               </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 hidden md:flex flex-col items-center gap-2"
        >
          <span className="text-white/50 text-[10px] uppercase tracking-widest font-bold">Scroll</span>
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <motion.div 
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="w-1 h-2 bg-agri-secondary rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* 3. NEWS & UPDATES */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-6">
          <SectionHeader title="News & Updates" link="/news" />
          <div className="grid md:grid-cols-2 gap-8">
            {news.length > 0 ? news.slice(0, 2).map((item, i) => (
              <GlassCard 
                key={i}
                onClick={() => navigate(`/news/${item.id}`)}
                className="p-8"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-2 h-2 rounded-full bg-agri-secondary"></span>
                  <span className="text-stone-500 text-xs font-bold uppercase tracking-widest">{new Date(item.date).toLocaleDateString()}</span>
                </div>
                <h4 className="text-2xl font-serif font-bold text-agri-primary group-hover:text-agri-secondary transition-colors leading-snug">{item.title}</h4>
              </GlassCard>
            )) : (
              <div className="col-span-full text-center py-12 text-stone-400 italic">No recent news updates available.</div>
            )}
          </div>
        </div>
      </section>

      {/* 4. BLOGS & EXPERT INSIGHTS */}
      <section className="py-24 relative z-10 bg-white">
        <div className="container mx-auto px-6">
          <SectionHeader title="Blogs & Expert Insights" link="/blogs" />
          <div className="grid md:grid-cols-3 gap-8">
            {blogs.length > 0 ? blogs.map((blog, i) => (
              <GlassCard 
                key={i}
                onClick={() => navigate(`/blog/${blog.id}`)}
                className="flex flex-col p-0"
              >
                <div className="h-64 relative overflow-hidden">
                  <OptimizedImage 
                    src={blog.featuredImage || blog.fileUrl || `https://images.unsplash.com/photo-1586771107445-d3af22d1031c?q=80&w=800&auto=format&fit=crop&sig=${i}`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    alt={blog.title} 
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-bold text-agri-primary uppercase tracking-widest shadow-sm">
                    {blog.categoryId || 'Agriculture'}
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-4 text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                    <span className="flex items-center gap-1"><User size={12} /> {blog.authorName}</span>
                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(blog.submissionDate).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-2xl font-serif font-bold text-agri-primary mb-4 group-hover:text-agri-secondary transition-colors line-clamp-2 leading-snug">{blog.title}</h4>
                  <p className="text-stone-600 text-sm mb-8 line-clamp-3 leading-relaxed">{blog.excerpt || blog.content?.substring(0, 150)}...</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs font-bold text-agri-secondary uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
                      READ ARTICLE <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </GlassCard>
            )) : (
              <div className="col-span-full text-center py-12 text-stone-400 italic">No recent blog posts available.</div>
            )}
          </div>
        </div>
      </section>

      {/* 5. MAGAZINE SECTION */}
      <section className="py-24 relative overflow-hidden z-10 mx-4 rounded-[3rem] my-12 shadow-xl">
        <div className="absolute inset-0 bg-stone-100/90 backdrop-blur-2xl"></div>
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-5 pointer-events-none">
           <svg viewBox="0 0 100 100" className="w-full h-full fill-current text-agri-primary">
              <path d="M0,0 L100,0 L100,100 L0,100 Z" />
           </svg>
        </div>
        <div className="container mx-auto px-6 relative z-10 text-agri-primary">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 tracking-tight">Agriculture Magazines</h2>
              <p className="text-stone-600 font-medium text-lg">Explore our featured publications, research journals, and monthly agriculture digests.</p>
            </div>
            <Link to="/journals" className="text-xs font-bold uppercase tracking-widest text-agri-secondary hover:text-agri-primary transition-all flex items-center gap-2 group">
              VIEW ALL ISSUES <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {magazines.length > 0 ? magazines.map((mag, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-stone-200 rounded-[2.5rem] p-8 flex flex-col items-center text-center group hover:shadow-2xl transition-all"
              >
                <div className="w-48 h-64 bg-stone-200 rounded-xl mb-8 shadow-xl overflow-hidden relative group-hover:-translate-y-2 transition-transform duration-500">
                  <OptimizedImage 
                    src={mag.coverImage || `https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=400&auto=format&fit=crop`} 
                    className="w-full h-full object-cover" 
                    alt={mag.title} 
                  />
                  <div className="absolute inset-0 bg-agri-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <BookOpen size={48} className="text-white" />
                  </div>
                </div>
                <h4 className="text-2xl font-serif font-bold mb-2 text-agri-primary leading-snug">{mag.title}</h4>
                <p className="text-stone-500 text-xs mb-6 uppercase tracking-widest font-bold">Issue {mag.issueNumber} • {mag.year}</p>
                <div className="flex gap-4 mt-auto">
                   <PDFAction 
                     fileUrl={mag.pdfUrl} 
                     title={mag.title} 
                   />
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full text-center py-12 text-stone-400 italic">No magazines available at the moment.</div>
            )}
          </div>
        </div>
      </section>

      {/* 6. STORE SECTION */}
      <section className="py-24 relative z-10 bg-white">
        <div className="container mx-auto px-6">
          <SectionHeader title="Store" link="/products" />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.length > 0 ? products.map((prod, i) => (
              <GlassCard 
                key={i}
                onClick={() => navigate(`/product/${prod.id}`)}
                className="flex flex-col p-0"
              >
                <div className="h-64 relative bg-white overflow-hidden p-6">
                  <OptimizedImage 
                    src={prod.imageUrl || `https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=500&auto=format&fit=crop`} 
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" 
                    alt={prod.name} 
                  />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h4 className="font-bold text-lg text-agri-primary mb-2 truncate group-hover:text-agri-secondary transition-colors">{prod.name}</h4>
                  <p className="text-stone-600 text-sm mb-6 line-clamp-2">{prod.description}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-2xl font-serif font-bold text-agri-primary">₹{prod.price}</span>
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-agri-primary shadow-sm border border-stone-100 group-hover:bg-agri-secondary group-hover:text-white transition-all">
                      <ShoppingBag size={20} />
                    </div>
                  </div>
                </div>
              </GlassCard>
            )) : (
              <div className="col-span-full text-center py-12 text-stone-400 italic">Store items are being updated.</div>
            )}
          </div>
        </div>
      </section>


      {/* 7. REVIEWS & TESTIMONIALS */}
      <section className="py-24 relative overflow-hidden z-10 bg-stone-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-agri-primary mb-4 tracking-tight">Community Feedback</h2>
            <p className="text-stone-600 font-medium text-lg">What farmers, researchers, and students say about Agrigence.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {feedbacks.length > 0 ? feedbacks.map((fb, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-stone-200 relative hover:shadow-xl transition-all"
              >
                <Quote size={48} className="absolute top-8 right-8 text-agri-secondary/20" />
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={14} className={j < (fb.rating || 5) ? "fill-agri-secondary text-agri-secondary" : "text-stone-200"} />
                  ))}
                </div>
                <p className="text-stone-700 font-medium italic mb-8 leading-relaxed">"{fb.comment}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-agri-primary/10 rounded-full flex items-center justify-center text-agri-primary font-bold">
                    {fb.userName[0]}
                  </div>
                  <div>
                    <h5 className="font-bold text-agri-primary text-sm">{fb.userName}</h5>
                    <p className="text-[10px] text-stone-500 uppercase tracking-widest font-bold">{fb.userOccupation || 'Verified User'}</p>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full text-center py-12 text-stone-400 italic">No testimonials available yet.</div>
            )}
          </div>
        </div>
      </section>

      {/* 8. OUR MISSION */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-agri-primary rounded-[3rem] overflow-hidden relative shadow-2xl border border-stone-800"
          >
            <div className="absolute inset-0 opacity-30 mix-blend-overlay">
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
                  <span className="text-xs font-bold uppercase tracking-widest text-agri-secondary">Our Purpose</span>
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-8 leading-tight">Empowering Farmers, Students, and Researchers</h2>
                <p className="text-lg text-white/90 leading-relaxed mb-12 font-light">
                  {settings?.missionText || "Agrigence is dedicated to building a trusted digital ecosystem for agricultural knowledge, research publishing, and academic excellence. We bridge the gap between scientific research, student learning, and field application."}
                </p>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-4xl font-serif font-bold text-agri-secondary mb-2">10k+</h4>
                    <p className="text-xs font-bold uppercase tracking-widest text-white/70">Active Users</p>
                  </div>
                  <div>
                    <h4 className="text-4xl font-serif font-bold text-agri-secondary mb-2">500+</h4>
                    <p className="text-xs font-bold uppercase tracking-widest text-white/70">Research Papers</p>
                  </div>
                </div>
              </div>
              <div className="md:w-1/2">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-10 rounded-[2.5rem] text-white">
                  <h3 className="text-2xl font-serif font-bold mb-8">How we help:</h3>
                  <ul className="space-y-6">
                    {[
                      { icon: <CheckCircle size={20} />, text: "Providing high-precision agricultural calculators" },
                      { icon: <CheckCircle size={20} />, text: "Publishing peer-reviewed research journals" },
                      { icon: <CheckCircle size={20} />, text: "Academic resources and study materials for students" },
                      { icon: <CheckCircle size={20} />, text: "Connecting farmers with expert insights" }
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <span className="text-agri-secondary mt-1">{item.icon}</span>
                        <span className="text-base text-white/90 font-medium">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/about-contact" className="mt-10 flex items-center justify-center gap-2 w-full bg-agri-secondary text-agri-primary py-4 rounded-full font-bold text-sm hover:bg-white transition-all group">
                    LEARN MORE ABOUT US <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 9. FAQ (AI SEO) */}
      <section className="py-24 relative z-10 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-agri-primary mb-4 tracking-tight">Frequently Asked Questions</h2>
              <p className="text-stone-600 font-medium text-lg">Common questions about agricultural intelligence and our platform.</p>
            </div>
            <div className="space-y-6">
              {[
                { q: "What is Agrigence?", a: "Agrigence is an international platform for agricultural research, innovation, and scholarly publication connecting students, farmers, and institutions worldwide." },
                { q: "How can students benefit from this platform?", a: "Students can access a vast archive of research journals, use precision calculators for their studies, and stay updated with the latest agricultural innovations." },
                { q: "How do I submit a research paper?", a: "Login to your account and visit the 'Submission' page. Ensure your manuscript follows our Author Guidelines." },
                { q: "Are the calculators accurate?", a: "Yes, our calculators are built using scientifically validated formulas from organizations like ICAR and FAO." }
              ].map((faq, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-stone-50 p-8 rounded-3xl border border-stone-200 hover:shadow-md transition-all"
                >
                  <h3 className="font-bold text-xl text-agri-primary mb-4 flex items-start gap-3">
                    <span className="text-agri-secondary mt-1"><CheckCircle size={20} /></span>
                    {faq.q}
                  </h3>
                  <p className="text-stone-600 pl-8 leading-relaxed">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 10. QUICK TOOLS SECTION */}
      <section className="py-32 relative overflow-hidden z-10 bg-stone-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-agri-primary mb-6 tracking-tight">Quick Access Tools</h2>
            <p className="text-stone-600 text-lg max-w-3xl mx-auto">High-precision calculators and academic resources for modern farming and agricultural studies.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Soil Health", desc: "Analyze soil parameters instantly.", link: "/tools/nutrient-req", icon: <Leaf size={24} />, color: "bg-emerald-100 text-emerald-600" },
              { title: "Water Req", desc: "Precision irrigation scheduling.", link: "/tools/water-req", icon: <Droplets size={24} />, color: "bg-blue-100 text-blue-600" },
              { title: "Yield Estimator", desc: "Predict your harvest accurately.", link: "/tools/yield-estimator", icon: <Activity size={24} />, color: "bg-amber-100 text-amber-600" },
              { title: "Economics", desc: "Farm profitability analysis.", link: "/tools/economics", icon: <Calculator size={24} />, color: "bg-purple-100 text-purple-600" }
            ].map((tool, i) => (
              <GlassCard 
                key={i}
                onClick={() => navigate(tool.link)}
                className="p-8"
              >
                <div className={`w-16 h-16 ${tool.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  {tool.icon}
                </div>
                <h3 className="font-bold text-xl text-agri-primary mb-3">{tool.title}</h3>
                <p className="text-stone-600 text-sm mb-8 leading-relaxed">{tool.desc}</p>
                <div className="text-xs font-bold text-agri-secondary uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
                  OPEN TOOL <ArrowRight size={14} />
                </div>
              </GlassCard>
            ))}
          </div>
          <div className="mt-16 text-center">
            <Link to="/tools" className="inline-flex items-center gap-2 bg-white border border-stone-200 text-agri-primary px-8 py-4 rounded-full font-bold text-sm hover:bg-stone-50 transition-all shadow-sm group">
              VIEW ALL 20+ TOOLS <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* 11. TRUST SIGNALS */}
      <section className="relative z-10 mx-4 mb-4 rounded-[3rem] overflow-hidden shadow-xl bg-stone-900">
        <div className="absolute inset-0 opacity-10">
           <svg viewBox="0 0 100 100" className="w-full h-full fill-current text-white">
              <path d="M0,0 L100,0 L100,100 L0,100 Z" />
           </svg>
        </div>
        <div className="container mx-auto px-6 text-center py-24 relative z-10 text-white">
          <Shield size={48} className="text-agri-secondary mx-auto mb-8" />
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-16 tracking-tight">Trusted by Farmers, Students, and Researchers</h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-all">
              <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-8">Agriculture Data Sources</h3>
              <div className="flex flex-wrap justify-center gap-3">
                {['ICAR', 'FAO', 'Agricultural Universities', 'Research Centers', 'Govt. Portals'].map((source, i) => (
                  <span key={i} className="bg-white/10 px-6 py-3 rounded-full font-bold text-xs border border-white/10 hover:bg-agri-secondary hover:text-agri-primary transition-colors">{source}</span>
                ))}
              </div>
            </div>
            <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-all flex flex-col justify-center items-center">
              <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-8">Author & Research</h3>
              <div className="bg-agri-secondary/20 border border-agri-secondary/30 px-8 py-8 rounded-3xl inline-block">
                <p className="font-serif text-2xl font-bold text-agri-secondary">Agrigence Research Team</p>
                <p className="text-sm text-white/70 mt-2">Dedicated to advancing agricultural science through digital innovation.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
