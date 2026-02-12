
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Calendar, User, 
  ChevronRight, Bookmark, Star, Quote,
  Megaphone, Rss, FileText
} from 'lucide-react';
import { mockBackend } from '../services/mockBackend';
import { NewsItem, Article, Magazine, Product, Feedback } from '../types';
import PDFAction from '../components/PDFAction';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [blogs, setBlogs] = useState<Article[]>([]);
  const [books, setBooks] = useState<Product[]>([]);
  const [magazine, setMagazine] = useState<Magazine | null>(null);
  const [reviews, setReviews] = useState<Feedback[]>([]);

  useEffect(() => {
    // Real-time listeners
    const unsubNews = mockBackend.subscribeToNews((data) => setNews(data.slice(0, 6)));
    
    const unsubArticles = mockBackend.subscribeToArticles((data) => {
        const approved = data.filter(a => a.status === 'PUBLISHED' || a.status === 'APPROVED');
        setArticles(approved.filter(a => a.type === 'ARTICLE').slice(0, 4));
        setBlogs(approved.filter(a => a.type === 'BLOG').slice(0, 6));
    });

    const unsubProducts = mockBackend.subscribeToProducts((data) => {
        setBooks(data.filter(p => p.category === 'Book').slice(0, 6));
    });

    const unsubMags = mockBackend.subscribeToMagazines((data) => {
        // Sort manually since subscription might return unsorted if complex query
        const sorted = data.sort((a,b) => (b.year - a.year) || (new Date(`${b.month} 1`).getTime() - new Date(`${a.month} 1`).getTime()));
        setMagazine(sorted.length > 0 ? sorted[0] : null);
    });

    const unsubReviews = mockBackend.subscribeToFeedback((data) => {
        setReviews(data.slice(0, 6));
    });

    return () => {
        unsubNews();
        unsubArticles();
        unsubProducts();
        unsubMags();
        unsubReviews();
    };
  }, []);

  const SectionHeader = ({ title, link, linkText = "View All" }: { title: string; link: string; linkText?: string }) => (
    <div className="flex justify-between items-end mb-10">
      <div>
        <h2 className="text-3xl font-serif font-bold text-agri-primary relative inline-block">
          {title}
          <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-agri-secondary rounded-full"></span>
        </h2>
      </div>
      <Link to={link} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-agri-secondary hover:text-agri-primary transition-all">
        {linkText} <ChevronRight size={14} />
      </Link>
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

  return (
    <div className="bg-agri-bg min-h-screen">
      
      {/* --- HERO SECTION --- */}
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
              Building a trusted digital ecosystem for agricultural knowledge, research publishing, and practical innovation.
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

      {/* --- SECTION 1: NEWS & UPDATES --- */}
      <section className="container mx-auto px-6 mb-24">
        <SectionHeader title="News & Updates" link="/news" />
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
            {news.slice(1).map((item) => (
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

      {/* --- SECTION 2: LATEST JOURNAL ARTICLES --- */}
      <section className="container mx-auto px-6 mb-24">
        <SectionHeader title="Research Articles" link="/journals" />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {articles.map((article) => (
            <GlassCard key={article.id} onClick={() => navigate('/journals')}>
              <div className="bg-stone-100 h-40 rounded-2xl mb-6 overflow-hidden relative">
                <img src={article.featuredImage || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=400'} className="w-full h-full object-cover" alt="" />
                <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded-md shadow-sm border border-stone-100 flex items-center gap-1">
                  <FileText size={10} className="text-agri-secondary" />
                  <span className="text-[8px] font-black text-agri-primary uppercase">PEER_REVIEWED</span>
                </div>
              </div>
              <h4 className="font-serif font-bold text-agri-primary text-lg mb-3 line-clamp-2 h-12 leading-tight">{article.title}</h4>
              <div className="flex items-center gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-6">
                <User size={12} className="text-agri-secondary" /> {article.authorName}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                <PDFAction 
                  title={article.title}
                  type="ARTICLE"
                  accessLevel={article.downloadAccess}
                  fileUrl={article.fileUrl || '#'}
                  variant="inline"
                />
                <ChevronRight size={14} className="text-agri-secondary" />
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* --- SECTION 5: LATEST MAGAZINE (SINGLE HIGHLIGHT) --- */}
      {magazine && (
        <section className="mb-24 px-6">
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
      )}

      {/* --- SECTION 3: LATEST BLOGS --- */}
      <section className="container mx-auto px-6 mb-24">
        <SectionHeader title="Community Blogs" link="/journals" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <GlassCard key={blog.id} onClick={() => navigate('/journals')}>
              <div className="flex items-center gap-2 text-[10px] font-black text-agri-secondary uppercase tracking-widest mb-4">
                <Rss size={12} /> Insight Feed
              </div>
              <h4 className="text-xl font-serif font-bold text-agri-primary mb-4 leading-tight">{blog.title}</h4>
              <p className="text-stone-500 text-sm leading-relaxed line-clamp-3 mb-8">{blog.excerpt || 'Practical perspectives from the ground, exploring modernization and traditional farming techniques...'}</p>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-stone-400">
                <div className="flex items-center gap-2">
                   <div className="w-6 h-6 rounded-full bg-agri-secondary/10 flex items-center justify-center text-agri-secondary font-black text-[8px]">{blog.authorName[0]}</div>
                   <span>{blog.authorName}</span>
                </div>
                <span>{new Date(blog.submissionDate).toLocaleDateString()}</span>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* --- SECTION 4: BOOKS (STORE) --- */}
      <section className="container mx-auto px-6 mb-24">
        <SectionHeader title="Academic Store" link="/products" />
        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
          {books.map((book) => (
            <motion.div
              key={book.id}
              whileHover={{ scale: 1.02, y: -5 }}
              onClick={() => navigate('/products')}
              className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4 cursor-pointer flex flex-col group"
            >
              <div className="aspect-[3/4] bg-stone-50 rounded-xl overflow-hidden mb-4 border border-stone-100">
                <img src={book.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
              </div>
              <h4 className="font-bold text-agri-primary text-xs mb-1 line-clamp-2 h-8 leading-tight">{book.name}</h4>
              <p className="text-agri-secondary font-black text-[10px] mt-auto">₹{book.price}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- SECTION 6: COMMUNITY REVIEWS --- */}
      <section className="bg-stone-100 py-24 mb-24">
        <div className="container mx-auto px-6">
          <SectionHeader title="Community Testimonials" link="/dashboard" linkText="Share Feedback" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-white p-10 rounded-[2.5rem] shadow-sm relative group border border-transparent hover:border-agri-secondary/30 transition-all">
                <div className="absolute top-8 right-8 text-agri-secondary/10 group-hover:text-agri-secondary/20 transition-colors">
                  <Quote size={64} fill="currentColor" />
                </div>
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill={i < rev.rating ? "#C29263" : "transparent"} className={i < rev.rating ? "text-agri-secondary" : "text-stone-200"} />
                  ))}
                </div>
                <p className="text-stone-600 text-sm italic leading-relaxed mb-10 min-h-[5rem]">"{rev.comment}"</p>
                <div className="flex items-center gap-4 border-t border-stone-100 pt-8">
                  <div className="w-12 h-12 bg-agri-primary rounded-full flex items-center justify-center font-black text-white text-xs border-2 border-white ring-1 ring-agri-primary/10">
                    {rev.userName[0]}
                  </div>
                  <div>
                    <h5 className="font-bold text-agri-primary text-sm">{rev.userName}</h5>
                    <p className="text-[10px] font-black uppercase text-stone-400 tracking-widest">{rev.userOccupation || 'Researcher'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECTION 7: OUR MISSION (LAST, STATIC) --- */}
      <section className="container mx-auto px-6 mb-32">
         <div className="bg-agri-primary rounded-[4rem] p-12 md:p-24 text-center relative overflow-hidden text-white">
            <div className="absolute top-0 left-0 w-64 h-64 bg-agri-secondary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-agri-secondary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
            
            <div className="max-w-4xl mx-auto relative z-10">
               <h2 className="text-4xl md:text-6xl font-serif font-bold mb-10">Our Mission</h2>
               <div className="space-y-8 text-lg md:text-xl font-light leading-relaxed text-white/80">
                  <p>Our mission is to build a trusted digital ecosystem for agriculture knowledge, research publishing, and practical innovation.</p>
                  <p>We aim to connect researchers, students, educators, and professionals through quality articles, journals, blogs, and verified resources that contribute to sustainable and modern agriculture.</p>
                  <p>By enabling structured publishing, knowledge sharing, and access to curated content, we strive to strengthen the bridge between agricultural research and real-world farming practices.</p>
               </div>
               <div className="mt-16">
                  <Link 
                    to="/journals" 
                    className="inline-flex items-center gap-3 bg-agri-secondary text-agri-primary px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-white transition-all group"
                  >
                    Explore Articles <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
               </div>
            </div>
         </div>
      </section>

    </div>
  );
};

export default Home;
