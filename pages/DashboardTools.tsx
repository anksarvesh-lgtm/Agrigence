
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  Database, 
  Calculator, 
  TrendingUp, 
  BarChart2, 
  FileText, 
  Plus, 
  Trash2, 
  Save, 
  Download, 
  ChevronRight,
  Settings2,
  Table as TableIcon,
  ClipboardPaste,
  Search,
  Filter,
  Zap,
  LayoutGrid,
  List,
  Wand2,
  FlaskConical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../App';
import { mockBackend } from '../services/mockBackend';
import { Tool, UserFieldData } from '../types';
import { hasActivePlan, isPlanExpired, canAccessTool } from '../utils/planAccess';
import UpgradeNotice from '../components/UpgradeNotice';
import ToolCard from '../components/ToolCard';
import DataEntryGrid from '../components/DataEntryGrid';
import StatisticalPanel from '../components/StatisticalPanel';
import { CheckPlan } from '../middleware/checkPlan';

const DashboardTools: React.FC = () => {
  const { user, planDetails } = useAuth();
  const isPlanActive = hasActivePlan(user);
  const isExpired = isPlanExpired(user);
  const isFree = !user?.subscriptionTier || user?.subscriptionTier === 'FREE';
  const [activeTab, setActiveTab] = useState<'tools' | 'data' | 'analysis'>('tools');
  const [tools, setTools] = useState<Tool[]>([]);
  const [datasets, setDatasets] = useState<UserFieldData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const allTools = await mockBackend.getAllTools();
        setTools(allTools);
        
        const userDatasets = await mockBackend.getUserFieldData(user.id);
        setDatasets(userDatasets);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         tool.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || tool.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'ALL', name: 'All Tools' },
    { id: 'planning-tools', name: 'Farm Planning' },
    { id: 'mgmt-tools', name: 'Crop Management' },
    { id: 'perf-tools', name: 'Performance' },
    { id: 'design-tools', name: 'Experimental Design' },
    { id: 'analysis-tools', name: 'Data Science' },
    { id: 'pub-tools', name: 'Publication' },
    { id: 'soil-health', name: 'Soil Health' },
    { id: 'stats-advanced', name: 'Advanced Statistics' }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-agri-primary">My Tools & Analysis</h1>
          <p className="text-stone-400 text-xs uppercase tracking-widest font-black mt-1">Research Hub v2.0</p>
        </div>
        
        {isPlanActive && (
          <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-stone-100">
            <button 
              onClick={() => setActiveTab('tools')}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'tools' ? 'bg-agri-primary text-white shadow-lg shadow-agri-primary/20' : 'text-stone-400 hover:text-stone-600'}`}
            >
              My Tools
            </button>
            <button 
              onClick={() => setActiveTab('data')}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'data' ? 'bg-agri-primary text-white shadow-lg shadow-agri-primary/20' : 'text-stone-400 hover:text-stone-600'}`}
            >
              Field Data Entry
            </button>
            <button 
              onClick={() => setActiveTab('analysis')}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'analysis' ? 'bg-agri-primary text-white shadow-lg shadow-agri-primary/20' : 'text-stone-400 hover:text-stone-600'}`}
            >
              Statistical Analysis
            </button>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'tools' && (
          <motion.div 
            key="tools"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search for tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-2xl pl-12 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-agri-secondary/20 focus:border-agri-secondary transition-all"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                {categories.map(cat => (
                  <button 
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap border transition-all ${selectedCategory === cat.id ? 'bg-agri-secondary/10 border-agri-secondary text-agri-secondary' : 'bg-white border-stone-200 text-stone-400 hover:border-stone-300'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map(tool => {
                const isLocked = !canAccessTool(user, planDetails, tool.id);
                return (
                  <ToolCard 
                    key={tool.id}
                    name={tool.name}
                    description={tool.description || ''}
                    route={tool.route || '#'}
                    icon={tool.categoryId === 'ds-tools' ? Activity : tool.categoryId === 'nutrient-tools' ? Zap : Wand2}
                    category={categories.find(c => c.id === tool.categoryId)?.name || 'General'}
                    isLocked={isLocked}
                  />
                );
              })}
              {filteredTools.length === 0 && (
                <div className="col-span-full py-20 text-center">
                  <div className="bg-stone-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search size={32} className="text-stone-300" />
                  </div>
                  <h3 className="font-serif font-bold text-xl text-stone-400">No tools found matching your search</h3>
                  <p className="text-stone-400 text-sm mt-2">Try adjusting your filters or search query</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'data' && (
          <motion.div 
            key="data"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10"
          >
            <div className="bg-white rounded-[2.5rem] shadow-premium border border-stone-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/30">
                <div className="flex items-center gap-3">
                  <div className="bg-agri-primary text-white p-2 rounded-lg">
                    <Database size={18} />
                  </div>
                  <h3 className="font-serif font-bold text-lg text-agri-primary">Dataset Management</h3>
                </div>
                <div className="flex items-center gap-4">
                  <Link 
                    to="/dashboard/research-lab"
                    className="bg-agri-secondary text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-agri-secondary/20 hover:scale-105 transition-all flex items-center gap-2"
                  >
                    <FlaskConical size={14} /> Launch Research Lab
                  </Link>
                  <span className="text-[10px] font-black bg-stone-100 px-4 py-1.5 rounded-full text-stone-500 uppercase tracking-widest">
                    {datasets.length} Saved Datasets
                  </span>
                </div>
              </div>
              <div className="p-8">
                <DataEntryGrid onSave={(newDataset) => setDatasets([newDataset, ...datasets])} />
              </div>
            </div>

            {datasets.length > 0 && (
              <div className="bg-white rounded-[2.5rem] shadow-premium border border-stone-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-stone-100 bg-stone-50/30">
                  <h3 className="font-serif font-bold text-lg text-agri-primary">Your Datasets</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-stone-50/50 text-[10px] uppercase font-black tracking-[0.2em] text-stone-400 border-b border-stone-100">
                        <th className="px-8 py-5">Dataset Name</th>
                        <th className="px-8 py-5">Variables</th>
                        <th className="px-8 py-5">Observations</th>
                        <th className="px-8 py-5">Created At</th>
                        <th className="px-8 py-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {datasets.map(ds => (
                        <tr key={ds.id} className="hover:bg-stone-50/80 transition-colors">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-agri-primary text-sm">{ds.dataset_name}</p>
                              {ds.is_temporary && (
                                <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[8px] font-black uppercase tracking-widest rounded-full border border-amber-100">
                                  Temporary
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex flex-wrap gap-1">
                              {ds.variables.map((v: string, i: number) => (
                                <span key={i} className="text-[9px] bg-stone-100 px-2 py-0.5 rounded-md text-stone-500 font-mono">{v}</span>
                              ))}
                            </div>
                          </td>
                          <td className="px-8 py-5 text-xs font-bold text-stone-600">{ds.data.length}</td>
                          <td className="px-8 py-5 text-xs text-stone-400">{new Date(ds.created_at).toLocaleDateString()}</td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => setActiveTab('analysis')}
                                className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-all"
                                title="Run Analysis"
                              >
                                <Calculator size={14} />
                              </button>
                              <button 
                                onClick={async () => {
                                  if (confirm('Are you sure you want to delete this dataset?')) {
                                    await mockBackend.deleteUserFieldData(ds.id);
                                    setDatasets(datasets.filter(d => d.id !== ds.id));
                                  }
                                }}
                                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'analysis' && (
          <motion.div 
            key="analysis"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10"
          >
            <div className="bg-white rounded-[2.5rem] shadow-premium border border-stone-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/30">
                <div className="flex items-center gap-3">
                  <div className="bg-agri-secondary text-white p-2 rounded-lg">
                    <TrendingUp size={18} />
                  </div>
                  <h3 className="font-serif font-bold text-lg text-agri-primary">Statistical Engine</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Engine Status:</span>
                  <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Ready
                  </span>
                </div>
              </div>
                <div className="p-8">
                  <StatisticalPanel />
                </div>
              </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardTools;
