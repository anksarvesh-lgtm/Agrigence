import React from 'react';
import { useAuth } from '../src/authContext';
import { 
  BarChart2, TrendingUp, AlertCircle, CheckCircle, Clock, Award, 
  HelpCircle, AlignLeft, ShieldAlert, Sparkles, BookOpen, ChevronRight
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Cell } from 'recharts';

export default function Analytics() {
  const { user } = useAuth();

  // Simulated score history over recent mocks
  const scoreHistory = [
    { name: 'Mock 1', score: 55, topper: 82, avg: 50 },
    { name: 'Mock 2', score: 64, topper: 84, avg: 52 },
    { name: 'Mock 3', score: 58, topper: 85, avg: 55 },
    { name: 'Mock 4', score: 72, topper: 89, avg: 58 },
    { name: 'Mock 5', score: 81, topper: 88, avg: 57 },
    { name: 'Mock 6', score: 74, topper: 90, avg: 59 },
  ];

  // Subject-wise accuracy split
  const subjectAccuracy = [
    { subject: 'Soil Science', accuracy: 88, color: '#10b981' },
    { subject: 'Agronomy', accuracy: 71, color: '#06b6d4' },
    { subject: 'Pathology', accuracy: 32, color: '#ef4444' },
    { subject: 'Entomology', accuracy: 61, color: '#f59e0b' },
    { subject: 'Horticulture', accuracy: 45, color: '#a855f7' },
    { subject: 'Genetics', accuracy: 54, color: '#3b82f6' },
  ];

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 p-6 md:p-8 relative overflow-hidden font-sans">
      
      {/* Background radial overlays */}
      <div className="absolute top-1/3 left-1/2 w-96 h-96 bg-emerald-600/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* Header Block */}
        <header className="space-y-1.5 border-b border-slate-800/80 pb-6">
          <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest font-mono">Performance Analytics</span>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Diagnostic Cockpit</h1>
          <p className="text-xs text-slate-400">
            Real-time analytics mapping, tracking weak-topic zones, and spaced repetition calibration for {user?.name}.
          </p>
        </header>

        {/* Highlight Widgets */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/30 border border-slate-800 p-5 rounded-2xl">
            <span className="text-[9px] text-slate-500 block uppercase font-mono tracking-widest">Syllabus Completion</span>
            <p className="text-2xl font-black text-slate-100 mt-1">68.4%</p>
            <div className="h-1 w-full bg-slate-950 rounded-full mt-2 overflow-hidden border border-slate-850">
              <div className="h-full bg-emerald-500" style={{ width: '68.4%' }} />
            </div>
          </div>

          <div className="bg-slate-900/30 border border-slate-800 p-5 rounded-2xl">
            <span className="text-[9px] text-slate-500 block uppercase font-mono tracking-widest">Total Practiced Qs</span>
            <p className="text-2xl font-black text-slate-101 mt-1">480 +</p>
            <span className="text-[10px] text-emerald-450 mt-1 block font-semibold">+42 solved today</span>
          </div>

          <div className="bg-slate-900/30 border border-slate-800 p-5 rounded-2xl">
            <span className="text-[9px] text-slate-500 block uppercase font-mono tracking-widest">Speed Indicator</span>
            <p className="text-2xl font-black text-amber-500 mt-1">42s / q</p>
            <span className="text-[10px] text-slate-400 mt-1 block">Optimal is ~45s for AFO</span>
          </div>

          <div className="bg-slate-900/30 border border-slate-800 p-5 rounded-2xl">
            <span className="text-[9px] text-slate-500 block uppercase font-mono tracking-widest">Percentile standing</span>
            <p className="text-2xl font-black text-sky-400 mt-1">94.8 %</p>
            <span className="text-[10px] text-slate-400 mt-1 block">Upper 5% category group</span>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recent Mock Performance Curve */}
          <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl space-y-4">
            <header className="flex justify-between items-center border-b border-slate-800 pb-4">
              <span className="text-xs font-bold text-slate-201 flex items-center gap-1.5 uppercase tracking-wider">
                <TrendingUp size={14} className="text-emerald-400" /> Score Telemetry history
              </span>
              <span className="text-[10px] font-mono text-slate-400">Comparing with Toppers</span>
            </header>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scoreHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="score" stroke="#10b981" fillOpacity={0.1} fill="url(#colorScore)" strokeWidth={2} name="My Performance" />
                  <Area type="monotone" dataKey="topper" stroke="#eab308" fillOpacity={0} strokeWidth={1.5} strokeDasharray="4 4" name="Topper Average" />
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Subject-Wise Accuracy Bar Graph */}
          <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl space-y-4">
            <header className="border-b border-slate-800 pb-4">
              <span className="text-xs font-bold text-slate-201 flex items-center gap-1.5 uppercase tracking-wider">
                <BarChart2 size={14} className="text-sky-400" /> Subject accuracy splits
              </span>
            </header>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectAccuracy} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="subject" type="category" stroke="#94a3b8" fontSize={9} axisLine={false} tickLine={false} width={80} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} />
                  <Bar dataKey="accuracy" radius={4} barSize={12}>
                    {subjectAccuracy.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Strengths & Weaknesses (AI recommendation source) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Performance Strengths */}
          <div className="bg-slate-900/20 border border-emerald-500/10 p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <CheckCircle size={15} /> Primary Strengths (Practice Zone)
            </h3>
            
            <div className="space-y-3">
              <div className="p-3.5 bg-slate-950/40 border border-slate-850 rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold block text-slate-200">Soil Micronutrient Indexing</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">88% average accuracy over last 4 mocks</span>
                </div>
                <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-[9px] text-emerald-400 uppercase font-mono font-black">Strong</div>
              </div>

              <div className="p-3.5 bg-slate-950/40 border border-slate-850 rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold block text-slate-200">Crop Production Logistics</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">79% accuracy on kharif seed-rate ratios</span>
                </div>
                <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-[9px] text-emerald-400 uppercase font-mono font-black">Strong</div>
              </div>
            </div>
          </div>

          {/* Performance Weaknesses */}
          <div className="bg-slate-900/20 border border-red-500/10 p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-red-400 flex items-center gap-2">
              <ShieldAlert size={15} /> Weakness Warning Alert (Highest Priority)
            </h3>
            
            <div className="space-y-3">
              <div className="p-3.5 bg-slate-950/40 border border-slate-850 rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold block text-slate-200">Herbicide Kinetics & Selectivity</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">32% accuracy &bull; average 68 seconds spend per Q</span>
                </div>
                <div className="px-2 py-1 bg-red-500/10 border border-red-500/20 rounded text-[9px] text-red-500 uppercase font-mono font-black">Weak</div>
              </div>

              <div className="p-3.5 bg-slate-950/40 border border-slate-850 rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold block text-slate-200">Fungal reproduction rates</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">41% accuracy on Soybean rust spore ratios</span>
                </div>
                <div className="px-2 py-1 bg-red-500/10 border border-red-500/20 rounded text-[9px] text-red-500 uppercase font-mono font-black">Weak</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
