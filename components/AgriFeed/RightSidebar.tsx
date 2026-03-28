
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { mockBackend } from '../../services/mockBackend';
import { AgriTopic, AgriFeedStats, User } from '../../types';
import { TrendingUp, Users, BarChart3, Megaphone, Search, Zap, ArrowRight, Briefcase } from 'lucide-react';

const RightSidebar: React.FC = () => {
  const [topics, setTopics] = useState<AgriTopic[]>([]);
  const [stats, setStats] = useState<AgriFeedStats | null>(null);
  const [suggestedResearchers, setSuggestedResearchers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const [t, s, u] = await Promise.all([
        mockBackend.getAgriTopics(),
        mockBackend.getAgriStats(),
        mockBackend.getUsers()
      ]);
      setTopics(t.slice(0, 5));
      setStats(s);
      setSuggestedResearchers(u.slice(0, 3));
    };
    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/agri-feed/explore?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Search AgriFeed..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-agri-bg border border-agri-border rounded-full py-3 pl-12 pr-6 focus:ring-2 focus:ring-agri-primary transition-all outline-none"
        />
      </form>

      {/* Trending Topics */}
      <div className="bg-white rounded-2xl p-5 border border-agri-border shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-agri-primary" />
          <h3 className="font-bold text-lg text-stone-900">Trending AgriTopics</h3>
        </div>
        <div className="space-y-4">
          {topics.map((topic) => (
            <div key={topic.id} className="group cursor-pointer">
              <p className="text-xs text-stone-500">Trending in Agriculture</p>
              <p className="font-bold text-stone-900 group-hover:text-agri-primary transition-colors">{topic.name}</p>
              <p className="text-xs text-stone-500">{topic.postCount} posts</p>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Researchers */}
      <div className="bg-white rounded-2xl p-5 border border-agri-border shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-agri-primary" />
          <h3 className="font-bold text-lg text-stone-900">Suggested Researchers</h3>
        </div>
        <div className="space-y-4">
          {suggestedResearchers.map((researcher) => (
            <div key={researcher.id} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 overflow-hidden">
                <img 
                  src={researcher.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${researcher.name}`} 
                  alt={researcher.name} 
                  className="w-10 h-10 rounded-full bg-stone-200 flex-shrink-0"
                />
                <div className="overflow-hidden">
                  <p className="font-bold text-sm text-stone-900 truncate">{researcher.name}</p>
                  <p className="text-stone-500 text-xs truncate">{researcher.occupation || 'Researcher'}</p>
                </div>
              </div>
              <button className="bg-stone-900 text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-stone-800 transition-colors">
                Connect
              </button>
            </div>
          ))}
        </div>
        <button className="text-agri-primary text-sm font-medium mt-4 hover:underline">Show more</button>
      </div>

      {/* Collaboration Opportunities */}
      <div className="bg-white rounded-2xl p-5 border border-agri-border shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="w-5 h-5 text-agri-primary" />
          <h3 className="font-bold text-lg text-stone-900">Collaboration Opportunities</h3>
        </div>
        <div className="space-y-3">
          <p className="text-sm text-stone-600">Looking for partners in soil health research?</p>
          <button className="w-full border border-agri-primary text-agri-primary font-bold py-2 rounded-xl text-sm hover:bg-agri-secondary/10 transition-colors">
            View Opportunities
          </button>
        </div>
      </div>

      {/* Quick Links to Tools */}
      <div className="bg-white rounded-2xl p-5 border border-agri-border shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-agri-primary" />
          <h3 className="font-bold text-lg text-stone-900">Quick Tools</h3>
        </div>
        <div className="space-y-2">
          {[
            { name: 'Statistical Engine', path: '/tools/statistical-analysis' },
            { name: 'Graph Generator', path: '/tools/auto-graph' },
            { name: 'Data Resources', path: '/tools/data-resources' },
            { name: 'Research Archive', path: '/agri-feed/saved' },
          ].map((link) => (
            <Link 
              key={link.name}
              to={link.path}
              className="flex items-center justify-between p-3 bg-agri-bg hover:bg-agri-secondary/10 rounded-xl transition-all group border border-agri-border hover:border-agri-secondary"
            >
              <span className="text-xs font-bold text-stone-700 group-hover:text-agri-primary transition-colors">{link.name}</span>
              <ArrowRight size={14} className="text-stone-400 group-hover:text-agri-primary group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </div>

      {/* Community Statistics */}
      <div className="bg-white rounded-2xl p-5 border border-agri-border shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-agri-primary" />
          <h3 className="font-bold text-lg text-stone-900">Community Statistics</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-agri-bg p-3 rounded-xl border border-agri-border">
            <p className="text-2xl font-bold text-agri-primary">{stats?.totalResearchers || 0}</p>
            <p className="text-[10px] text-stone-500 uppercase tracking-wider font-bold">Researchers</p>
          </div>
          <div className="bg-agri-bg p-3 rounded-xl border border-agri-border">
            <p className="text-2xl font-bold text-agri-primary">{stats?.postsThisWeek || 0}</p>
            <p className="text-[10px] text-stone-500 uppercase tracking-wider font-bold">Posts/Week</p>
          </div>
          <div className="bg-agri-bg p-3 rounded-xl border border-agri-border col-span-2">
            <p className="text-2xl font-bold text-agri-primary">{stats?.activeDiscussions || 0}</p>
            <p className="text-[10px] text-stone-500 uppercase tracking-wider font-bold">Active Discussions</p>
          </div>
        </div>
      </div>

      {/* Platform Announcements */}
      <div className="bg-agri-primary rounded-2xl p-5 text-white shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <Megaphone className="w-5 h-5" />
          <h3 className="font-bold">Announcements</h3>
        </div>
        <p className="text-sm opacity-90 mb-3">
          Join our upcoming webinar on "AI in Soil Health Monitoring" this Friday at 3 PM IST.
        </p>
        <button className="w-full bg-white text-agri-primary font-bold py-2 rounded-xl text-sm hover:bg-stone-50 transition-colors">
          Register Now
        </button>
      </div>
    </div>
  );
};

export default RightSidebar;
