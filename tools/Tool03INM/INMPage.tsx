
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Trash2, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  ChevronDown, 
  ChevronUp,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Droplets,
  Leaf,
  Database,
  Zap,
  ShieldCheck,
  Scale
} from 'lucide-react';
import { INMRequirement, INMSource, INMSettings, LPSolution } from './inmTypes';
import { FERTILIZER_DATABASE } from '../Tool02Nutrient/fertilizerDatabase';
import { runOptimization } from './inmModel';
import { useAuth } from '../../App';
import { mockBackend } from '../../services/mockBackend';
import { isPlanExpired } from '../../utils/planAccess';

const INMPage: React.FC = () => {
  const { user, planDetails } = useAuth();
  const isPlanActive = user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || (planDetails && planDetails.id !== 'free' && !isPlanExpired(user)));
  const [requirement, setRequirement] = useState<INMRequirement>({
    N: 120,
    P: 60,
    K: 40
  });

  const [sources, setSources] = useState<INMSource[]>([
    { id: `src_${Date.now()}`, material: FERTILIZER_DATABASE.find((f: any) => f.id === 'fym') || FERTILIZER_DATABASE[0], maxQty: 10000, price: 2 },
    { id: `src_${Date.now() + 1}`, material: FERTILIZER_DATABASE.find((f: any) => f.id === 'urea') || FERTILIZER_DATABASE[0], maxQty: 1000, price: 6 }
  ]);

  const [settings, setSettings] = useState<INMSettings>({
    maxOrganicSubstitution: 40,
    budgetLimit: 15000,
    sustainabilityPriority: 5
  });

  const [solution, setSolution] = useState<LPSolution | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReqChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRequirement(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const addSource = () => {
    setSources(prev => [
      ...prev,
      { id: `src_${Date.now()}`, material: FERTILIZER_DATABASE[0], maxQty: 1000, price: 10 }
    ]);
  };

  const removeSource = (id: string) => {
    setSources(prev => prev.filter(s => s.id !== id));
  };

  const updateSource = (id: string, field: string, value: any) => {
    setSources(prev => prev.map(s => {
      if (s.id === id) {
        if (field === 'material') {
          const mat = FERTILIZER_DATABASE.find((f: any) => f.id === value);
          return { ...s, material: mat || s.material };
        }
        return { ...s, [field]: value };
      }
      return s;
    }));
  };

  const optimize = () => {
    setLoading(true);
    // Simulate slight delay for "thinking" feel
    setTimeout(() => {
      const sol = runOptimization(requirement, sources, settings);
      setSolution(sol);
      setLoading(false);

      if (user && isPlanActive) {
        try {
          mockBackend.saveToolHistory({
            userId: user.id,
            toolName: 'Integrated Nutrient Management',
            inputData: { requirement, sources, settings },
            outputData: { status: 'Generated' },
            status: 'SUCCESS',
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error("Failed to save tool history", error);
        }
      }
    }, 600);
  };

  const InputField = ({ label, name, value, onChange, type = "number", min, max, step, icon: Icon }: any) => (
    <div className="space-y-1">
      <label className="text-[10px] font-black uppercase tracking-widest text-agri-primary/60 block flex items-center gap-1">
        {Icon && <Icon size={10} />} {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-agri-secondary focus:border-transparent outline-none transition-all"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-agri-bg pb-20">
      {/* Header */}
      <div className="bg-[#1B4332] text-white py-16 px-6 relative overflow-hidden mb-12">
        <div className="absolute inset-0 opacity-10">
          <Zap size={400} className="absolute -right-20 -bottom-20 rotate-12" />
        </div>
        <div className="container mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10 mb-6">
            <Zap size={16} className="text-agri-secondary" />
            <span className="text-xs font-bold tracking-widest uppercase">Agri-Intelligence Tool 03</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4">INM Planner & Optimizer</h1>
          <p className="text-xl text-stone-300 font-light max-w-2xl">
            Linear Programming (Simplex) engine to minimize costs while maximizing soil health and nutrient efficiency.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Left Panel: Inputs */}
          <div className="lg:col-span-5 space-y-8">
            {/* 1. Nutrient Targets */}
            <div className="bg-white p-8 rounded-[3rem] shadow-premium border border-stone-100">
              <h2 className="text-xl font-serif font-bold text-agri-primary mb-8 flex items-center gap-2">
                <Target size={20} className="text-agri-secondary" /> Nutrient Targets
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <InputField label="Req. N (kg)" name="N" value={requirement.N} onChange={handleReqChange} />
                <InputField label="Req. P (kg)" name="P" value={requirement.P} onChange={handleReqChange} />
                <InputField label="Req. K (kg)" name="K" value={requirement.K} onChange={handleReqChange} />
              </div>
            </div>

            {/* 2. Source Selection */}
            <div className="bg-white p-8 rounded-[3rem] shadow-premium border border-stone-100">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-serif font-bold text-agri-primary flex items-center gap-2">
                  <Database size={20} className="text-agri-secondary" /> Available Sources
                </h2>
                <button onClick={addSource} className="text-[10px] font-black uppercase tracking-widest text-agri-primary hover:text-agri-secondary flex items-center gap-1">
                  <Plus size={12} /> Add Source
                </button>
              </div>
              
              <div className="space-y-4">
                {sources.map((s) => (
                  <div key={s.id} className="p-5 bg-stone-50 rounded-2xl border border-stone-100 space-y-4 relative group">
                    <button onClick={() => removeSource(s.id)} className="absolute top-3 right-3 text-stone-300 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-stone-400 block">Material</label>
                      <select 
                        value={s.material.id} 
                        onChange={(e) => updateSource(s.id, "material", e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs outline-none"
                      >
                        {FERTILIZER_DATABASE.map((f: any) => <option key={f.id} value={f.id}>{f.name} ({f.category})</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <InputField label="Max Avail (kg)" name="maxQty" value={s.maxQty} onChange={(e: any) => updateSource(s.id, "maxQty", parseFloat(e.target.value) || 0)} />
                      <InputField label="Price (₹/kg)" name="price" value={s.price} onChange={(e: any) => updateSource(s.id, "price", parseFloat(e.target.value) || 0)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Constraints & Settings */}
            <div className="bg-white p-8 rounded-[3rem] shadow-premium border border-stone-100">
              <h2 className="text-xl font-serif font-bold text-agri-primary mb-8 flex items-center gap-2">
                <Scale size={20} className="text-agri-secondary" /> Constraints & Priorities
              </h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-widest text-agri-primary/60">Max Organic Substitution</label>
                    <span className="text-xs font-bold text-agri-secondary">{settings.maxOrganicSubstitution}%</span>
                  </div>
                  <input 
                    type="range" 
                    name="maxOrganicSubstitution" 
                    min="0" max="100" 
                    value={settings.maxOrganicSubstitution} 
                    onChange={handleSettingsChange}
                    className="w-full h-2 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-agri-secondary"
                  />
                </div>

                <InputField label="Budget Limit (₹/ha)" name="budgetLimit" value={settings.budgetLimit} onChange={handleSettingsChange} icon={DollarSign} />

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-widest text-agri-primary/60">Sustainability Priority</label>
                    <span className="text-xs font-bold text-agri-secondary">{settings.sustainabilityPriority}/10</span>
                  </div>
                  <input 
                    type="range" 
                    name="sustainabilityPriority" 
                    min="1" max="10" 
                    value={settings.sustainabilityPriority} 
                    onChange={handleSettingsChange}
                    className="w-full h-2 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-agri-secondary"
                  />
                  <p className="text-[9px] text-stone-400 italic">Higher priority favors organic sources even at higher costs.</p>
                </div>
              </div>

              <button
                onClick={optimize}
                disabled={loading}
                className="w-full mt-8 py-5 bg-agri-secondary text-agri-primary rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-agri-primary hover:text-white transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? "Solving Simplex..." : "Optimize Plan"} <Zap size={16} />
              </button>
            </div>
          </div>

          {/* Right Panel: Solution */}
          <div className="lg:col-span-7 space-y-8">
            <AnimatePresence mode="wait">
              {solution ? (
                <motion.div
                  key="solution"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-8"
                >
                  {solution.status === 'OPTIMAL' ? (
                    <>
                      {/* Status Header */}
                      <div className="bg-emerald-50 border border-emerald-100 rounded-[3rem] p-8 flex items-center gap-6">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                          <ShieldCheck size={32} />
                        </div>
                        <div>
                          <h3 className="text-2xl font-serif font-bold text-emerald-900">Optimal Solution Found</h3>
                          <p className="text-emerald-700/70 text-sm">Mathematically minimized cost while meeting all nutrient and sustainability constraints.</p>
                        </div>
                      </div>

                      {/* Key Metrics */}
                      <div className="grid grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm">
                          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Total Cost</p>
                          <p className="text-2xl font-serif font-bold text-agri-primary">₹{solution.cost.toFixed(0)}</p>
                        </div>
                        <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm">
                          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Organic Share</p>
                          <p className="text-2xl font-serif font-bold text-emerald-600">{solution.organicShare.toFixed(1)}%</p>
                        </div>
                        <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm">
                          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Efficiency</p>
                          <p className="text-2xl font-serif font-bold text-blue-600">High</p>
                        </div>
                      </div>

                      {/* Recommended Plan */}
                      <div className="bg-white rounded-[3rem] border border-stone-100 overflow-hidden shadow-premium">
                        <div className="px-8 py-6 bg-stone-50 border-b border-stone-100 flex justify-between items-center">
                          <h3 className="text-xs font-black uppercase tracking-widest text-agri-primary">Recommended Fertilizer Plan</h3>
                          <span className="text-[10px] text-stone-400 italic">Quantities in kg/ha</span>
                        </div>
                        <div className="p-8">
                          <div className="space-y-4">
                            {sources.map((s, idx) => {
                              const qty = solution.variables[idx];
                              if (qty < 0.1) return null;
                              return (
                                <div key={s.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl">
                                  <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.material.category === 'Organic' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                                      {s.material.category === 'Organic' ? <Leaf size={20} /> : <Database size={20} />}
                                    </div>
                                    <div>
                                      <p className="font-bold text-agri-primary">{s.material.name}</p>
                                      <p className="text-[10px] text-stone-400 uppercase tracking-widest">{s.material.category}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xl font-serif font-bold text-agri-primary">{qty.toFixed(1)} <span className="text-xs font-sans font-normal text-stone-400">kg</span></p>
                                    <p className="text-[10px] text-stone-400">₹{(qty * s.price).toFixed(0)}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Nutrient Achievement */}
                      <div className="bg-[#1B4332] rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-5">
                          <CheckCircle2 size={150} />
                        </div>
                        <div className="relative z-10">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-agri-secondary mb-6">Nutrient Achievement</p>
                          <div className="grid grid-cols-3 gap-10">
                            <div>
                              <h4 className="text-[10px] font-bold text-white/60 mb-2 uppercase tracking-widest">N Supplied</h4>
                              <p className="text-4xl font-serif font-bold text-white">{solution.supplied.N.toFixed(1)} <span className="text-xs font-sans font-normal text-white/40">kg</span></p>
                              <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                                <div className="h-full bg-agri-secondary" style={{ width: `${Math.min(100, (solution.supplied.N / requirement.N) * 100)}%` }}></div>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-[10px] font-bold text-white/60 mb-2 uppercase tracking-widest">P Supplied</h4>
                              <p className="text-4xl font-serif font-bold text-white">{solution.supplied.P.toFixed(1)} <span className="text-xs font-sans font-normal text-white/40">kg</span></p>
                              <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                                <div className="h-full bg-agri-secondary" style={{ width: `${Math.min(100, (solution.supplied.P / requirement.P) * 100)}%` }}></div>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-[10px] font-bold text-white/60 mb-2 uppercase tracking-widest">K Supplied</h4>
                              <p className="text-4xl font-serif font-bold text-white">{solution.supplied.K.toFixed(1)} <span className="text-xs font-sans font-normal text-white/40">kg</span></p>
                              <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                                <div className="h-full bg-agri-secondary" style={{ width: `${Math.min(100, (solution.supplied.K / requirement.K) * 100)}%` }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="bg-red-50 border border-red-100 rounded-[3rem] p-12 text-center space-y-6">
                      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto">
                        <AlertTriangle size={40} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-serif font-bold text-red-900">No Feasible Solution</h3>
                        <p className="text-red-700/70 text-sm max-w-md mx-auto mt-2">The current constraints make it impossible to meet the nutrient requirements. Try the following adjustments:</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-left">
                        <div className="p-4 bg-white rounded-2xl border border-red-50 text-xs text-red-800">
                          <p className="font-bold mb-1">1. Increase Budget</p>
                          <p className="opacity-70">Your cost limit might be too low for the required NPK.</p>
                        </div>
                        <div className="p-4 bg-white rounded-2xl border border-red-50 text-xs text-red-800">
                          <p className="font-bold mb-1">2. Add Sources</p>
                          <p className="opacity-70">Add more fertilizer types to give the solver more options.</p>
                        </div>
                        <div className="p-4 bg-white rounded-2xl border border-red-50 text-xs text-red-800">
                          <p className="font-bold mb-1">3. Relax Organic Limit</p>
                          <p className="opacity-70">The 50% organic cap might be too strict for your targets.</p>
                        </div>
                        <div className="p-4 bg-white rounded-2xl border border-red-50 text-xs text-red-800">
                          <p className="font-bold mb-1">4. Check Availability</p>
                          <p className="opacity-70">Ensure "Max Avail" quantities are sufficient.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-[3rem] border border-stone-100 border-dashed">
                  <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center text-stone-300 mb-6">
                    <Zap size={40} />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-agri-primary mb-2">Optimization Engine Idle</h3>
                  <p className="text-stone-400 text-sm max-w-xs">Define your nutrient targets and available sources, then click "Optimize Plan" to run the Simplex solver.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default INMPage;
