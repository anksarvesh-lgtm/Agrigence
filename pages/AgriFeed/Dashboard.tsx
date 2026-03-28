
import React, { useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { mockBackend } from '../../services/mockBackend';
import { User, AgriPost, AgriConnection } from '../../types';
import { 
  BarChart3, 
  MessageSquare, 
  Heart, 
  Users, 
  Bookmark, 
  Activity, 
  Edit3, 
  Settings, 
  ArrowRight,
  TrendingUp,
  Calendar,
  Zap,
  BookOpen,
  Sparkles,
  Wrench
} from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const Dashboard: React.FC = () => {
  const { user: currentUser } = useOutletContext<{ user: User }>();
  const [posts, setPosts] = useState<AgriPost[]>([]);
  const [connections, setConnections] = useState<AgriConnection[]>([]);
  const [savedPosts, setSavedPosts] = useState<AgriPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [p, c, s, feed] = await Promise.all([
          mockBackend.getAgriPosts(),
          mockBackend.getAgriConnections(currentUser.id),
          mockBackend.getAgriFeed(), // Just for demo
          mockBackend.getAgriFeed() // All posts
        ]);
        setPosts(p.filter(post => post.authorId === currentUser.id));
        setConnections(c.filter(conn => conn.status === 'ACCEPTED'));
        setSavedPosts(s.slice(0, 3));
        
        // Categorize feed for the dashboard sections
        const researchPosts = feed.filter(p => p.type === 'RESEARCH_QUESTION').slice(0, 2);
        const farmerPosts = feed.filter(p => p.type === 'FARMER_PROBLEM').slice(0, 2);
        const latestPosts = feed.slice(0, 3);
        
        setDashboardFeed({
          latest: latestPosts,
          research: researchPosts,
          farmer: farmerPosts
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser.id]);

  const [dashboardFeed, setDashboardFeed] = useState<{
    latest: AgriPost[];
    research: AgriPost[];
    farmer: AgriPost[];
  }>({ latest: [], research: [], farmer: [] });

  const totalLikes = posts.reduce((acc, curr) => acc + curr.likes.length, 0);

  const stats = [
    { label: 'Posts', value: posts.length, icon: <MessageSquare className="w-5 h-5" />, color: 'bg-blue-500', lightColor: 'bg-blue-50' },
    { label: 'Likes Received', value: totalLikes, icon: <Heart className="w-5 h-5" />, color: 'bg-red-500', lightColor: 'bg-red-50' },
    { label: 'Connections', value: connections.length, icon: <Users className="w-5 h-5" />, color: 'bg-green-500', lightColor: 'bg-green-50' },
    { label: 'Saved Posts', value: savedPosts.length, icon: <Bookmark className="w-5 h-5" />, color: 'bg-purple-500', lightColor: 'bg-purple-50' },
  ];

  return (
    <div className="flex flex-col p-4 md:p-8 space-y-10 bg-white min-h-screen">
      {/* 1. Attractive Top Banner in Landscape */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2.5rem] min-h-[450px] flex items-center shadow-2xl shadow-green-900/10 group"
      >
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=2000" 
            alt="Agriculture Field" 
            className="w-full h-full object-cover transition-transform duration-10000 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-950/90 via-green-900/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        <div className="relative z-10 p-8 md:p-20 w-full">
          <div className="max-w-3xl space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-xl text-[10px] font-black uppercase tracking-[0.2em] border border-white/20 text-emerald-300 shadow-xl"
            >
              <Sparkles size={14} className="animate-pulse" />
              Agrigence Intelligence Network
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-7xl font-black text-white tracking-tight leading-[1.05]"
            >
              Connect, <span className="text-emerald-400">Research</span>, and Solve Real Agricultural Problems Together.
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-2xl text-emerald-50/80 font-medium leading-relaxed max-w-xl"
            >
              The unified platform for farmers, researchers, and students to exchange ideas and innovate.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-5 pt-4"
            >
              <Link to="/agri-feed/feed" className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-emerald-900/40 transition-all hover:scale-105 active:scale-95 flex items-center gap-3">
                Explore AgriFeed <ArrowRight size={18} />
              </Link>
              <Link to="/agri-feed/feed?tab=research" className="bg-white/10 backdrop-blur-xl border border-white/30 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/20 transition-all active:scale-95">
                Start a Discussion
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* 2. Researcher Toolkit Banner */}
      <div className="space-y-8 py-4">
        <div className="flex items-center justify-between px-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-stone-900 tracking-tight flex items-center gap-3">
              <div className="p-2.5 bg-green-100 rounded-2xl text-green-700 shadow-sm">
                <Wrench size={28} />
              </div>
              Researcher Toolkit
            </h2>
            <p className="text-stone-400 text-sm font-medium ml-14">Quick access to professional research-related tools and resources.</p>
          </div>
          <Link to="/tools" className="bg-stone-100 text-stone-600 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-stone-200 transition-all flex items-center gap-2">
            All Tools <ArrowRight size={14} />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 px-2">
          {[
            { title: 'Research Questions', desc: 'Scientific Q&A and discussions', icon: <BookOpen />, path: '/agri-feed/feed?tab=research', color: 'bg-blue-50 text-blue-600', border: 'hover:border-blue-200', shadow: 'hover:shadow-blue-900/5' },
            { title: 'Field Problems', desc: 'Real-world crop & pest issues', icon: <Activity />, path: '/agri-feed/feed?tab=farmer_help', color: 'bg-orange-50 text-orange-600', border: 'hover:border-orange-200', shadow: 'hover:shadow-orange-900/5' },
            { title: 'Data Resources', desc: 'Agri datasets and statistics', icon: <BarChart3 />, path: '/tools/data-resources', color: 'bg-green-50 text-green-600', border: 'hover:border-green-200', shadow: 'hover:shadow-green-900/5' },
            { title: 'Observations', desc: 'Field observation posts', icon: <Edit3 />, path: '/agri-feed/feed', color: 'bg-emerald-50 text-emerald-600', border: 'hover:border-emerald-200', shadow: 'hover:shadow-emerald-900/5' },
            { title: 'Collaboration', desc: 'Find research partners', icon: <Users />, path: '/agri-feed/researchers', color: 'bg-purple-50 text-purple-600', border: 'hover:border-purple-200', shadow: 'hover:shadow-purple-900/5' },
          ].map((tool, i) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (i * 0.1) }}
              whileHover={{ y: -8 }}
              className={`bg-white border border-stone-100 p-6 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group ${tool.border} ${tool.shadow}`}
            >
              <Link to={tool.path} className="space-y-5 block">
                <div className={`w-14 h-14 ${tool.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                  {React.cloneElement(tool.icon as React.ReactElement, { size: 28 })}
                </div>
                <div>
                  <h4 className="font-black text-stone-900 text-base tracking-tight">{tool.title}</h4>
                  <p className="text-xs text-stone-500 leading-relaxed mt-2 font-medium">{tool.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 3. Well Organized Dashboard Layout - Center Area Content */}
      <div className="grid grid-cols-1 gap-12 pt-4">
        {/* Latest AgriFeed Posts */}
        <section className="space-y-8">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-8 bg-emerald-500 rounded-full" />
              <h3 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-3">
                Latest AgriFeed
              </h3>
            </div>
            <Link to="/agri-feed/feed" className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] hover:text-emerald-700 transition-colors">Explore All Posts</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-48 bg-stone-50 rounded-[2.5rem] animate-pulse" />)
            ) : dashboardFeed.latest.map(post => (
              <Link key={post.id} to={`/agri-feed/feed`} className="block bg-stone-50/50 border border-stone-100 p-8 rounded-[2.5rem] hover:bg-white hover:shadow-2xl hover:shadow-stone-200 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight size={20} className="text-emerald-500" />
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <img 
                    src={post.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorName}`} 
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-md" 
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <p className="text-sm font-black text-stone-900">{post.authorName}</p>
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">{format(new Date(post.timestamp), 'MMM dd, yyyy')}</p>
                  </div>
                </div>
                <p className="text-stone-600 text-sm leading-relaxed line-clamp-3 group-hover:text-stone-900 transition-colors font-medium">{post.content}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Research Discussions & Farmer Problems Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Research Discussions */}
          <section className="space-y-8">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-8 bg-blue-500 rounded-full" />
                <h3 className="text-2xl font-black text-stone-900 tracking-tight">
                  Research Discussions
                </h3>
              </div>
              <Link to="/agri-feed/feed?tab=research" className="text-blue-600 text-[10px] font-black uppercase tracking-[0.2em]">View Feed</Link>
            </div>
            <div className="space-y-4">
              {loading ? (
                [1, 2].map(i => <div key={i} className="h-48 bg-stone-50 rounded-[2.5rem] animate-pulse" />)
              ) : dashboardFeed.research.map(post => (
                <Link key={post.id} to={`/agri-feed/feed`} className="block bg-blue-50/30 border border-blue-100 p-8 rounded-[2.5rem] hover:bg-blue-50 transition-all group">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 text-[9px] font-black uppercase tracking-[0.15em] rounded-full mb-5">
                    <Zap size={12} /> Research Question
                  </div>
                  <p className="text-stone-900 font-bold text-base leading-relaxed line-clamp-3 mb-6 group-hover:text-blue-900 transition-colors">{post.content}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-blue-100/50">
                    <div className="flex items-center gap-3">
                      <img 
                        src={post.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorName}`} 
                        className="w-8 h-8 rounded-full object-cover shadow-sm" 
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-xs font-bold text-stone-600">{post.authorName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-600">
                      <TrendingUp size={14} />
                      <span className="text-xs font-black">{post.upvotes?.length || 0} Upvotes</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Farmer Problem Posts */}
          <section className="space-y-8">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-8 bg-orange-500 rounded-full" />
                <h3 className="text-2xl font-black text-stone-900 tracking-tight">
                  Farmer Help Needed
                </h3>
              </div>
              <Link to="/agri-feed/feed?tab=farmer_help" className="text-orange-600 text-[10px] font-black uppercase tracking-[0.2em]">Help Now</Link>
            </div>
            <div className="space-y-4">
              {loading ? (
                <div className="h-48 bg-stone-50 rounded-[2.5rem] animate-pulse" />
              ) : dashboardFeed.farmer.map(post => (
                <Link key={post.id} to={`/agri-feed/feed`} className="block bg-orange-50/30 border border-orange-100 p-8 rounded-[2.5rem] hover:bg-orange-50 transition-all group">
                  <div className="flex flex-col sm:flex-row gap-6">
                    {post.attachments?.[0] && (
                      <div className="w-full sm:w-32 h-32 rounded-3xl overflow-hidden shadow-lg flex-shrink-0">
                        <img 
                          src={post.attachments[0].url} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-700 text-[9px] font-black uppercase tracking-[0.15em] rounded-full mb-3">
                          <Activity size={12} /> Field Problem
                        </div>
                        <p className="text-stone-900 font-bold text-base leading-relaxed line-clamp-2 group-hover:text-orange-900 transition-colors">{post.content}</p>
                      </div>
                      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-orange-100/50">
                        <span className="text-xs font-bold text-stone-500">By {post.authorName}</span>
                        <div className="flex items-center gap-2 text-orange-600">
                          <MessageSquare size={14} />
                          <span className="text-xs font-black uppercase tracking-widest">{post.replies?.length || 0} Solutions</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>

  );
};

export default Dashboard;
