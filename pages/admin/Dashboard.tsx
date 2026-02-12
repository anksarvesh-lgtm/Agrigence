
import React, { useState, useEffect } from 'react';
import { 
  Users, FileText, ShoppingBag, TrendingUp, DollarSign, Rss, Newspaper, 
  ShieldCheck, Megaphone, Terminal, Hash, Activity, BookOpen, CreditCard, Tag 
} from 'lucide-react';
import { mockBackend } from '../../services/mockBackend';
import { User, Article, Product, PaymentRecord, NewsItem, SiteSettings, Magazine, Coupon } from '../../types';

const Dashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    // Real-time subscriptions
    const unsubUsers = mockBackend.subscribeToUsers(setUsers);
    const unsubArticles = mockBackend.subscribeToArticles(setArticles);
    const unsubProducts = mockBackend.subscribeToProducts(setProducts);
    const unsubPayments = mockBackend.subscribeToPayments(setPayments);
    const unsubNews = mockBackend.subscribeToNews(setNews);
    const unsubMags = mockBackend.subscribeToMagazines(setMagazines);
    
    // One-off or local refresh for settings/coupons (could be real-time too if needed)
    mockBackend.getCoupons().then(setCoupons);
    setSettings(mockBackend.getSettings());

    return () => {
        unsubUsers();
        unsubArticles();
        unsubProducts();
        unsubPayments();
        unsubNews();
        unsubMags();
    };
  }, []);

  if (!settings) return null;

  const blogs = articles.filter(a => a.type === 'BLOG');
  const publications = articles.filter(a => a.type === 'ARTICLE');

  const totalRevenue = payments
    .filter(p => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0);

  const activeSubscriptions = users.filter(u => u.subscriptionExpiry && new Date(u.subscriptionExpiry) > new Date()).length;

  const stats = [
    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-agri-secondary', bg: 'bg-agri-secondary/10' },
    { label: 'Platform Users', value: users.length, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Active Subscriptions', value: activeSubscriptions, icon: CreditCard, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Pending QR Payments', value: payments.filter(p => p.status === 'PENDING').length, icon: ShieldCheck, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  ];

  const contentStats = [
    { label: 'Research Articles', count: publications.length, icon: FileText },
    { label: 'Community Blogs', count: blogs.length, icon: Rss },
    { label: 'Magazines', count: magazines.length, icon: BookOpen },
    { label: 'News Updates', count: news.length, icon: Newspaper },
    { label: 'Store Products', count: products.length, icon: ShoppingBag },
    { label: 'Active Coupons', count: coupons.length, icon: Tag },
  ];

  return (
    <div className="space-y-10">
      {/* Welcome Banner */}
      <div className="bg-agri-secondary/10 border border-agri-secondary/20 rounded-[3rem] p-12 relative overflow-hidden group">
         <div className="absolute -right-20 -top-20 w-80 h-80 bg-agri-secondary/10 rounded-full blur-3xl group-hover:bg-agri-secondary/20 transition-all"></div>
         <div className="relative z-10">
            <h1 className="text-4xl font-serif font-bold text-white mb-3">Administrator Command Center</h1>
            <p className="text-white/40 text-sm font-bold uppercase tracking-[0.3em] flex items-center gap-3">
              <Activity size={16} className="text-agri-secondary animate-pulse" /> System v2.0 Live & Healthy
            </p>
         </div>
      </div>

      {/* Grid Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white/5 border border-white/5 p-8 rounded-3xl hover:bg-white/10 transition-all group shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={28} />
              </div>
              <TrendingUp size={20} className="text-white/10 group-hover:text-agri-secondary transition-colors" />
            </div>
            <h3 className="text-4xl font-bold text-white mb-1 tracking-tighter">{stat.value}</h3>
            <p className="text-[10px] uppercase font-black tracking-widest text-white/30">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Content Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {contentStats.map((cs, i) => (
          <div key={i} className="bg-black/20 border border-white/5 p-4 rounded-2xl flex flex-col items-center text-center">
            <cs.icon size={20} className="text-agri-secondary mb-2" />
            <span className="text-xl font-bold text-white">{cs.count}</span>
            <span className="text-[9px] uppercase font-black text-white/20 tracking-tighter">{cs.label}</span>
          </div>
        ))}
      </div>

      {/* Status Hub */}
      <div className="grid lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-white/5 border border-white/5 rounded-[2.5rem] p-10">
            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-agri-secondary mb-8 flex items-center gap-3">
               <Terminal size={18} /> Activity Log & Status
            </h3>
            <div className="space-y-6">
               <div className="flex items-center justify-between p-6 bg-black/20 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl"><Hash size={20}/></div>
                     <div>
                        <p className="text-xs font-bold text-white uppercase tracking-widest">ISSN Allocation</p>
                        <p className="text-[10px] text-white/30 font-mono mt-0.5">{settings.issn || 'NO_DATA_LINKED'}</p>
                     </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${settings.issn ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {settings.issn ? 'LINKED' : 'REQUIRED'}
                  </span>
               </div>

               <div className="flex items-center justify-between p-6 bg-black/20 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-pink-500/10 text-pink-400 rounded-xl"><Megaphone size={20}/></div>
                     <div>
                        <p className="text-xs font-bold text-white uppercase tracking-widest">Global Popup Status</p>
                        <p className="text-[10px] text-white/30 font-mono mt-0.5">{settings.popup.isEnabled ? 'SESSION_BROADCAST_ACTIVE' : 'IDLE'}</p>
                     </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${settings.popup.isEnabled ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {settings.popup.isEnabled ? 'ON' : 'OFF'}
                  </span>
               </div>
            </div>
         </div>

         <div className="bg-agri-secondary/10 border border-agri-secondary/20 rounded-[2.5rem] p-10 flex flex-col justify-between">
            <div>
               <h3 className="text-xs font-black uppercase tracking-[0.3em] text-agri-secondary mb-6">Action Hub</h3>
               <p className="text-white/60 text-sm leading-relaxed mb-10">All platform controls are live. You can manage <b>{articles.length + news.length}</b> content entries and <b>{products.length}</b> store products.</p>
            </div>
            <div className="grid gap-3">
               <button className="w-full bg-agri-secondary text-agri-primary py-4 rounded-2xl font-bold shadow-xl hover:scale-105 transition-all text-xs uppercase tracking-widest">
                  Quick Publication
               </button>
               <button className="w-full bg-white/5 border border-white/10 py-4 rounded-2xl font-bold hover:bg-white/10 transition-all text-xs uppercase tracking-widest text-white/60">
                  Site Backup
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
