
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
    const unsubUsers = mockBackend.subscribeToUsers(setUsers);
    const unsubArticles = mockBackend.subscribeToArticles(setArticles);
    const unsubProducts = mockBackend.subscribeToProducts(setProducts);
    const unsubPayments = mockBackend.subscribeToPayments(setPayments);
    const unsubNews = mockBackend.subscribeToNews(setNews);
    const unsubMags = mockBackend.subscribeToMagazines(setMagazines);
    
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
    { label: 'Platform Users', value: users.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Subscriptions', value: activeSubscriptions, icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Pending QR Payments', value: payments.filter(p => p.status === 'PENDING').length, icon: ShieldCheck, color: 'text-amber-600', bg: 'bg-amber-50' },
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
      <div className="bg-white border border-gray-200 rounded-[2rem] p-10 relative overflow-hidden group shadow-sm">
         <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-agri-secondary/5 to-transparent"></div>
         <div className="relative z-10">
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Administrator Command Center</h1>
            <p className="text-gray-500 text-sm font-bold uppercase tracking-[0.3em] flex items-center gap-3">
              <Activity size={16} className="text-green-500 animate-pulse" /> System v2.0 Live & Healthy
            </p>
         </div>
      </div>

      {/* Grid Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white border border-gray-200 p-8 rounded-2xl hover:shadow-md transition-all group shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={28} />
              </div>
              <TrendingUp size={20} className="text-gray-300 group-hover:text-agri-secondary transition-colors" />
            </div>
            <h3 className="text-4xl font-bold text-gray-900 mb-1 tracking-tighter">{stat.value}</h3>
            <p className="text-[10px] uppercase font-black tracking-widest text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Content Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {contentStats.map((cs, i) => (
          <div key={i} className="bg-white border border-gray-200 p-6 rounded-2xl flex flex-col items-center text-center shadow-sm hover:border-agri-secondary/50 transition-all">
            <cs.icon size={20} className="text-agri-secondary mb-3" />
            <span className="text-xl font-bold text-gray-900">{cs.count}</span>
            <span className="text-[9px] uppercase font-black text-gray-400 tracking-wide mt-1">{cs.label}</span>
          </div>
        ))}
      </div>

      {/* Status Hub */}
      <div className="grid lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-white border border-gray-200 rounded-[2rem] p-10 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-gray-400 mb-8 flex items-center gap-3">
               <Terminal size={18} className="text-agri-secondary"/> Activity Log & Status
            </h3>
            <div className="space-y-4">
               <div className="flex items-center justify-between p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Hash size={20}/></div>
                     <div>
                        <p className="text-xs font-bold text-gray-900 uppercase tracking-widest">ISSN Allocation</p>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">{settings.issn || 'NO_DATA_LINKED'}</p>
                     </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${settings.issn ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {settings.issn ? 'LINKED' : 'REQUIRED'}
                  </span>
               </div>

               <div className="flex items-center justify-between p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-pink-50 text-pink-600 rounded-xl"><Megaphone size={20}/></div>
                     <div>
                        <p className="text-xs font-bold text-gray-900 uppercase tracking-widest">Global Popup Status</p>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">{settings.popup.isEnabled ? 'SESSION_BROADCAST_ACTIVE' : 'IDLE'}</p>
                     </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${settings.popup.isEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                    {settings.popup.isEnabled ? 'ON' : 'OFF'}
                  </span>
               </div>
            </div>
         </div>

         <div className="bg-white border border-gray-200 rounded-[2rem] p-10 flex flex-col justify-between shadow-sm">
            <div>
               <h3 className="text-xs font-black uppercase tracking-[0.3em] text-agri-secondary mb-6">Action Hub</h3>
               <p className="text-gray-600 text-sm leading-relaxed mb-10">All platform controls are live. You can manage <b>{articles.length + news.length}</b> content entries and <b>{products.length}</b> store products.</p>
            </div>
            <div className="grid gap-3">
               <button className="w-full bg-agri-secondary text-white py-4 rounded-xl font-bold shadow-lg shadow-agri-secondary/20 hover:scale-105 transition-all text-xs uppercase tracking-widest">
                  Quick Publication
               </button>
               <button className="w-full bg-white border border-gray-300 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all text-xs uppercase tracking-widest text-gray-600">
                  Site Backup
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
