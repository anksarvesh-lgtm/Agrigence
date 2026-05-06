
import React, { useEffect, useState } from 'react';
import { useAuth } from '../src/authContext';
import { mockBackend } from '../services/mockBackend';
import { SubscriptionPlan, Tool } from '../types';
import { Link } from 'react-router-dom';
import { Check, X, ShieldCheck, Clock, FileText, PenTool, Zap, Activity, Info, Calculator, TrendingUp, LayoutGrid, BarChart2, FlaskConical, Wand2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const MySubscription: React.FC = () => {
  const { user } = useAuth();
  const [planDetails, setPlanDetails] = useState<SubscriptionPlan | null>(null);
  const [allTools, setAllTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.subscriptionTier) {
        const plans = await mockBackend.getPlans();
        const currentPlan = plans.find(p => p.name === user.subscriptionTier);
        setPlanDetails(currentPlan || null);
        
        const tools = await mockBackend.getAllTools();
        setAllTools(tools);
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  if (loading) return <div className="p-12 text-center font-serif text-agri-primary">Loading Subscription Details...</div>;
  if (!user) return null;

  const isPlanActive = user.subscriptionExpiry && new Date(user.subscriptionExpiry) > new Date();
  
  // Limit Calculations
  const articlePlanLimit = planDetails?.articleLimit === 'UNLIMITED' ? Infinity : (Number(planDetails?.articleLimit) || 0);
  const articleAdminLimit = user.adminArticleLimitAdjustment || 0;
  const articleTotalLimit = articlePlanLimit + articleAdminLimit;
  const articleRemaining = articleTotalLimit === Infinity ? Infinity : Math.max(0, articleTotalLimit - user.articleUsage);

  const blogPlanLimit = planDetails?.blogLimit === 'UNLIMITED' ? Infinity : (Number(planDetails?.blogLimit) || 0);
  const blogAdminLimit = user.adminBlogLimitAdjustment || 0;
  const blogTotalLimit = blogPlanLimit + blogAdminLimit;
  const blogRemaining = blogTotalLimit === Infinity ? Infinity : Math.max(0, blogTotalLimit - user.blogUsage);

  // Tools Access
  const planTools = planDetails?.allowedTools || [];
  const adminTools = user.adminEnabledTools || [];
  const allAllowedTools = Array.from(new Set([...planTools, ...adminTools]));

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-agri-primary">My Subscription</h1>
          <p className="text-stone-400 text-xs uppercase tracking-widest font-black mt-1">Plan Node Status & Limits</p>
        </div>
        <div className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest border ${isPlanActive ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
          {isPlanActive ? 'Active Protocol' : 'Protocol Inactive'}
        </div>
        <Link 
          to="/subscription" 
          className="bg-agri-secondary text-agri-primary px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest hover:bg-agri-primary hover:text-white transition-all flex items-center gap-2 shadow-lg shadow-agri-secondary/20"
        >
          {isPlanActive ? 'Upgrade Plan' : 'Buy Subscription'} <ChevronRight size={14} />
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Plan Overview Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2rem] shadow-premium border border-stone-100 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <ShieldCheck size={100} />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest mb-2">Active Tier</p>
              <h2 className="text-2xl font-serif font-bold text-agri-primary mb-4">{user.subscriptionTier || 'Free Tier'}</h2>
              
              <div className="space-y-4 pt-4 border-t border-stone-50">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-stone-400 uppercase">Price</span>
                  <span className="text-sm font-black text-agri-primary">₹{planDetails?.price || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-stone-400 uppercase">Duration</span>
                  <span className="text-sm font-black text-agri-primary">{planDetails?.durationMonths || 0} Months</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-stone-400 uppercase">Expiry</span>
                  <span className="text-sm font-black text-agri-primary">
                    {user.subscriptionExpiry ? new Date(user.subscriptionExpiry).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                {user.adminExpiryOverride && (
                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 flex items-start gap-3">
                    <Info size={14} className="text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold text-amber-700 uppercase leading-relaxed">
                      Expiry extended by Admin override
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-agri-primary rounded-[2rem] shadow-premium p-8 text-white">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-agri-secondary mb-6">Account Metadata</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-white/40 uppercase">Account Type</span>
                <span className="text-xs font-black uppercase tracking-wider">{user.userType || 'INDIVIDUAL'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-white/40 uppercase">Research Access</span>
                <span className={`text-[10px] font-black uppercase tracking-wider ${planDetails?.is_research_enabled ? 'text-green-400' : 'text-white/20'}`}>
                  {planDetails?.is_research_enabled ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Usage & Limits */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] shadow-premium border border-stone-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-stone-100 bg-stone-50/30 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-agri-primary text-white p-2 rounded-lg">
                  <Activity size={18} />
                </div>
                <h3 className="font-serif font-bold text-lg text-agri-primary">Usage Status & Limits</h3>
              </div>
            </div>
            
            <div className="p-8 space-y-10">
              {/* Article Limits */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <h4 className="text-sm font-black text-agri-primary uppercase tracking-widest flex items-center gap-2">
                      <FileText size={16} className="text-agri-secondary" /> Article Submissions
                    </h4>
                    <p className="text-[10px] text-stone-400 font-bold mt-1">
                      Plan: {planDetails?.articleLimit || 0} + Admin: {articleAdminLimit} = Total: {articleTotalLimit === Infinity ? '∞' : articleTotalLimit}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-agri-primary">{user.articleUsage}</span>
                    <span className="text-stone-300 mx-2 text-xl">/</span>
                    <span className="text-lg font-bold text-stone-400">{articleTotalLimit === Infinity ? '∞' : articleTotalLimit}</span>
                  </div>
                </div>
                <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden border border-stone-200">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: articleTotalLimit === Infinity ? '100%' : `${Math.min((user.articleUsage / articleTotalLimit) * 100, 100)}%` }}
                    className="bg-agri-primary h-full rounded-full"
                  />
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-stone-400">Used: {user.articleUsage}</span>
                  <span className="text-agri-secondary">Remaining: {articleRemaining === Infinity ? '∞' : articleRemaining}</span>
                </div>
              </div>

              {/* Blog Limits */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <h4 className="text-sm font-black text-agri-primary uppercase tracking-widest flex items-center gap-2">
                      <PenTool size={16} className="text-agri-secondary" /> Blog Publishing
                    </h4>
                    <p className="text-[10px] text-stone-400 font-bold mt-1">
                      Plan: {planDetails?.blogLimit || 0} + Admin: {blogAdminLimit} = Total: {blogTotalLimit === Infinity ? '∞' : blogTotalLimit}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-agri-primary">{user.blogUsage}</span>
                    <span className="text-stone-300 mx-2 text-xl">/</span>
                    <span className="text-lg font-bold text-stone-400">{blogTotalLimit === Infinity ? '∞' : blogTotalLimit}</span>
                  </div>
                </div>
                <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden border border-stone-200">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: blogTotalLimit === Infinity ? '100%' : `${Math.min((user.blogUsage / blogTotalLimit) * 100, 100)}%` }}
                    className="bg-agri-primary h-full rounded-full"
                  />
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-stone-400">Used: {user.blogUsage}</span>
                  <span className="text-agri-secondary">Remaining: {blogRemaining === Infinity ? '∞' : blogRemaining}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tools Access List */}
          <div className="bg-white rounded-[2.5rem] shadow-premium border border-stone-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-stone-100 bg-stone-50/30 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-agri-secondary text-agri-primary p-2 rounded-lg">
                  <Zap size={18} />
                </div>
                <h3 className="font-serif font-bold text-lg text-agri-primary">Tools Access Matrix</h3>
              </div>
            </div>
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-4">
                {allTools.map(tool => {
                  const hasAccess = allAllowedTools.includes(tool.id);
                  const isFromAdmin = adminTools.includes(tool.id) && !planTools.includes(tool.id);
                  
                  // Icon mapping based on category
                  const ToolIcon = tool.categoryId === 'ds-tools' ? Activity : 
                                  tool.categoryId === 'nutrient-tools' ? Zap : 
                                  tool.categoryId === 'planning-tools' ? Calculator :
                                  tool.categoryId === 'mgmt-tools' ? Activity :
                                  tool.categoryId === 'perf-tools' ? TrendingUp :
                                  tool.categoryId === 'design-tools' ? LayoutGrid :
                                  tool.categoryId === 'analysis-tools' ? BarChart2 :
                                  tool.categoryId === 'pub-tools' ? FileText :
                                  tool.categoryId === 'soil-health' ? FlaskConical :
                                  tool.categoryId === 'stats-advanced' ? Activity :
                                  Wand2;

                  return (
                    <div 
                      key={tool.id} 
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${hasAccess ? 'bg-stone-50 border-stone-200' : 'bg-stone-50/50 border-stone-100 opacity-50'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${hasAccess ? 'bg-white text-agri-primary shadow-sm' : 'bg-stone-100 text-stone-300'}`}>
                          <ToolIcon size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-agri-primary">{tool.name}</p>
                          {isFromAdmin && (
                            <span className="text-[8px] font-black text-agri-secondary uppercase tracking-widest">Admin Enabled</span>
                          )}
                        </div>
                      </div>
                      {hasAccess ? (
                        <Check size={16} className="text-green-500" />
                      ) : (
                        <X size={16} className="text-stone-300" />
                      )}
                    </div>
                  );
                })}
              </div>
              {allTools.length === 0 && (
                <div className="text-center py-10 text-stone-400 italic text-sm">No tools configured on platform.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MySubscription;
