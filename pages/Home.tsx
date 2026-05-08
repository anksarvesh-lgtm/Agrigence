import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Calendar, User, 
  ChevronRight, Bookmark, Star, Quote,
  Megaphone, ShoppingBag, BookOpen, FileText, PenTool, ExternalLink, Wrench,
  Calculator, Droplets, Leaf, Activity, CheckCircle, Shield, Newspaper, Store, Info, MessageSquare, Users, Landmark, TrendingUp,
  Brain, Bot, Sparkles, Cpu, Mail
} from 'lucide-react';
import { mockBackend } from '../services/mockBackend';
import { Article, Magazine, Product, Feedback, SiteSettings, HomepageSection } from '../types';
import PDFAction from '../components/PDFAction';
import OptimizedImage from '../components/OptimizedImage';
import SEO from '../components/SEO';
import KeywordDisplay from '../components/KeywordDisplay';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [visitorCount, setVisitorCount] = useState<number>(0);
  const [mandiBhav, setMandiBhav] = useState<any[]>([]);

  useEffect(() => {
    const unsubSettings = mockBackend.subscribeToSettings(setSettings);

    const unsubMagazines = mockBackend.subscribeToMagazines(data => setMagazines(data.slice(0, 3)));
    const unsubProducts = mockBackend.subscribeToProducts(data => setProducts(data.slice(0, 4)));
    const unsubFeedback = mockBackend.subscribeToFeedback(data => setFeedbacks(data.filter(f => f.status === 'APPROVED').slice(0, 3)));
    const unsubVisitors = mockBackend.subscribeToVisitors(data => setVisitorCount(data.length));
    
    const loadMandi = async () => {
      const data = await mockBackend.getMandiBhav('Delhi'); // Default to Delhi for home
      setMandiBhav(data.slice(0, 4));
    };
    loadMandi();

    return () => {
        unsubSettings();
        unsubMagazines();
        unsubProducts();
        unsubFeedback();
        unsubVisitors();
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
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden border-b-8 border-agri-primary">
        <div className="absolute inset-0 z-0">
         <img 
              src={magazines[0]?.coverUrl || magazines[0]?.coverImage || "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=2000"}
              alt="Journal Cover"
              className="w-full h-full object-cover"
           />
           <div className="absolute inset-0 bg-gradient-to-br from-agri-primary/80 to-agri-primary/40 z-10"></div>
        </div>

        <div className="container mx-auto px-6 relative z-30 pt-20 pb-20 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white"
          >
            <div className="mb-8">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight tracking-tight mb-4 text-white">
                Agrigence Journal of <br className="hidden md:block" /> Agriculture & Allied Sciences
              </h1>
              <p className="text-xl md:text-2xl font-serif italic mb-6 text-white/90">
                An Indian Peer-Reviewed Monthly Online Journal
              </p>
              

            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-12">
               <Link to="/journals" className="px-8 py-4 bg-white text-agri-primary font-bold text-sm tracking-widest rounded-lg transition-all hover:bg-stone-100 shadow-lg transform hover:-translate-y-1">
                 CURRENT ISSUE
               </Link>
               <Link to="/submission" className="px-8 py-4 bg-agri-secondary text-agri-primary font-bold text-sm tracking-widest rounded-lg transition-all hover:bg-amber-500 shadow-lg transform hover:-translate-y-1">
                 SUBMIT MANUSCRIPT
               </Link>
               <Link to="/editorial-board" className="px-8 py-4 border-2 border-white text-white font-bold text-sm tracking-widest rounded-lg transition-all hover:bg-white hover:text-agri-primary transform hover:-translate-y-1">
                 EDITORIAL BOARD
               </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* RECENT ISSUES */}
      <section className="py-24 relative z-10 bg-stone-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-serif font-bold text-agri-primary mb-12 text-center">Recent Issues</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {magazines
                .sort((a, b) => (b.year - a.year) || (parseInt(b.issueNumber) - parseInt(a.issueNumber)))
                .slice(0, 3)
                .map((mag, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
                        <Link to={`/journals/${mag.id}`} className="block">
                            <div className="aspect-[3/4] mb-4 bg-stone-200 rounded-lg overflow-hidden">
                               <img 
                                  src={mag.coverUrl || mag.coverImage || "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=400"} 
                                  alt={mag.title}
                                  className="w-full h-full object-cover"
                               />
                            </div>
                            <h4 className="font-bold text-agri-primary">{mag.title}</h4>
                            <p className="text-sm text-stone-500">Vol {mag.volume} Issue {mag.issueNumber} • {mag.year}</p>
                        </Link>
                        <div className="mt-4 pt-4 border-t border-stone-100">
                             <PDFAction title={mag.title} fileUrl={mag.driveUrl || mag.pdfUrl || '#'} variant="inline" className="text-xs font-bold uppercase tracking-widest text-agri-secondary hover:text-agri-primary transition-colors flex items-center gap-2"/>
                        </div>
                    </div>
            ))}
          </div>
        </div>
      </section>







      {/* 4. HIGHLIGHTS / AIM & SCOPE PREVIEW */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-serif font-bold text-agri-primary mb-6">Our Aim & Scope</h2>
              <p className="text-stone-500 text-lg leading-relaxed mb-8">
                {settings?.missionText || "Agrigence Journal of Agriculture & Allied Sciences is a monthly international peer-reviewed online journal dedicated to building a trusted digital ecosystem for agriculture knowledge, research publishing, and practical innovation."}
              </p>
              <div className="space-y-4 mb-8">
                {[
                  "Crop Production and Sustainable Agronomy",
                  "Horticulture and Floriculture Advancements",
                  "Soil Science and Integrated Nutrient Management",
                  "Agricultural Economics and Agribusiness Management",
                  "Agri-Informatics and Precision Agriculture"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-agri-primary font-medium">
                    <CheckCircle className="text-agri-secondary" size={20} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <Link to="/aim-scope" className="inline-flex items-center gap-2 text-agri-secondary font-bold uppercase tracking-widest hover:text-agri-primary transition-colors">
                Read Complete Aim & Scope <ArrowRight size={18} />
              </Link>
            </div>
            <div className="relative">
              <div className="rounded-3xl shadow-2xl overflow-hidden aspect-[4/3] border-8 border-white">
                <img src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=800" alt="Agriculture Research" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-8 -left-8 bg-agri-primary text-white p-10 rounded-3xl shadow-xl max-w-sm hidden sm:block">
                <Leaf size={40} className="text-agri-secondary mb-4" />
                <h4 className="text-xl font-serif font-bold mb-2">Academic Excellence</h4>
                <p className="text-white/70 text-sm">Committed to publishing high-quality research that drives global agricultural progress.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CONTACT FOOTER BAR */}
      <section className="py-20 bg-agri-primary text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-serif font-bold mb-6">Ready to publish your research?</h2>
            <p className="text-white/70 text-lg mb-10 leading-relaxed">
              Agrigence Journal of Agriculture & Allied Sciences invites original research papers, reviews, and short communications.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link to="/submission" className="px-10 py-4 bg-agri-secondary text-agri-primary font-bold rounded-xl hover:bg-white transition-all transform hover:-translate-y-1 shadow-lg">
                Submit Manuscript
              </Link>
              <Link to="/editorial-board" className="px-10 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-agri-primary transition-all transform hover:-translate-y-1 shadow-lg">
                Editorial Board
              </Link>
            </div>
            <div className="mt-12 pt-12 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
               <div className="flex items-center gap-4">
                  <Mail className="text-agri-secondary" />
                  <a href="mailto:agrigence@gmail.com" className="text-white/80 hover:text-white transition-colors">agrigence@gmail.com</a>
               </div>
               <div className="flex items-center gap-6 text-white/50 text-xs font-bold uppercase tracking-widest">
                  <Link to="/publication-ethics" className="hover:text-white transition-colors">Ethics</Link>
                  <Link to="/author-guidelines" className="hover:text-white transition-colors">Guidelines</Link>
                  <Link to="/copyright" className="hover:text-white transition-colors">Copyright</Link>
               </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
