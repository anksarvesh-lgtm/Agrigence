import React, { useState, useEffect } from 'react';
import { useAuth } from '../src/authContext';
import { db } from '../src/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Sparkles, BookOpen, Clock, Activity, Trophy, ShieldCheck, 
  Settings, CheckCircle, TrendingUp, HelpCircle, ArrowRight, Save, 
  MapPin, GraduationCap, Flame, Star, Book, Edit3, X, Globe, Plus, LogOut,
  Target, Calendar, Play, ChevronRight, BarChart2, Bell, Crown, RefreshCw, Bookmark
} from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Area, AreaChart, Tooltip, XAxis } from 'recharts';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, login } = useAuth();
  
  // Profile editing states
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editState, setEditState] = useState(user?.state || '');
  const [editLang, setEditLang] = useState(user?.preferredLanguage || 'English');
  const [editPrep, setEditPrep] = useState(user?.preparationLevel || 'Beginner');
  const [editQual, setEditQual] = useState(user?.qualification || '12th Pass');
  const [editExams, setEditExams] = useState<string[]>(user?.targetExams || []);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [greeting, setGreeting] = useState('Welcome back');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const weakTopicsData = [
    { subject: 'Agronomy', score: 85, fullMark: 100 },
    { subject: 'Soil Sci.', score: 45, fullMark: 100 },
    { subject: 'Genetics', score: 70, fullMark: 100 },
    { subject: 'Pathology', score: 55, fullMark: 100 },
    { subject: 'Engg.', score: 60, fullMark: 100 },
    { subject: 'Ext.', score: 90, fullMark: 100 },
  ];

  const progressData = [
    { name: 'Mon', score: 65 },
    { name: 'Tue', score: 68 },
    { name: 'Wed', score: 72 },
    { name: 'Thu', score: 80 },
    { name: 'Fri', score: 76 },
    { name: 'Sat', score: 85 },
    { name: 'Sun', score: 82 },
  ];

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 
    'Uttarakhand', 'West Bengal', 'Delhi'
  ];

  const examOptions = [
    'IBPS AFO', 'NABARD Grade A', 'ICAR AIEEA', 'Agriculture Supervisor', 
    'FCI', 'CCI', 'State Agriculture Officer', 'JRF/SRF'
  ];

  const handleToggleExam = (exam: string) => {
    if (editExams.includes(exam)) {
      setEditExams(editExams.filter(e => e !== exam));
    } else {
      setEditExams([...editExams, exam]);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSuccessMsg('');

    try {
      const userRef = doc(db, 'users', user.id);
      const updatedData = {
        name: editName,
        state: editState,
        preferredLanguage: editLang,
        preparationLevel: editPrep as any,
        qualification: editQual,
        targetExams: editExams
      };
      
      // Update Core Node
      await setDoc(userRef, updatedData, { merge: true });

      // Update User Profiles
      await setDoc(doc(db, 'user_profiles', user.id), {
        userId: user.id,
        fullName: editName,
        qualification: editQual,
        state: editState,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // Update target_exams Table
      await setDoc(doc(db, 'target_exams', user.id), {
        userId: user.id,
        exams: editExams,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      login({
        ...user,
        ...updatedData
      });

      setSuccessMsg('Profile and preferences updated successfully!');
      setTimeout(() => {
        setIsEditing(false);
        setSuccessMsg('');
      }, 1500);
    } catch (err) {
      console.error(err);
      alert('Fail to update preferences. Please retry.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 p-4 md:p-6 lg:p-8 relative overflow-hidden font-sans">
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        
        {/* WELCOME SECTION */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-900/40 p-6 md:p-8 rounded-3xl border border-slate-800/80 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-[1.25rem] bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-slate-950 text-4xl shadow-lg shadow-emerald-500/20">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">{greeting}, {user?.name?.split(' ')[0]}!</h1>
                <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] uppercase font-black tracking-widest rounded-lg">
                  {user?.preparationLevel || 'Beginner'}
                </span>
              </div>
              <p className="text-slate-400 text-sm flex items-center gap-2 font-medium">
                <Target size={14} className="text-emerald-400" /> Target: {user?.targetExams?.[0] || 'IBPS AFO'}
                <span className="text-slate-600">•</span>
                <Sparkles size={14} className="text-amber-400" /> "Consistency is the root of all success."
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => {
              setEditName(user?.name || '');
              setEditState(user?.state || '');
              setEditLang(user?.preferredLanguage || 'English');
              setEditPrep(user?.preparationLevel || 'Beginner');
              setEditQual(user?.qualification || '12th Pass');
              setEditExams(user?.targetExams || []);
              setIsEditing(true);
            }} 
            className="w-full lg:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-2xl text-sm font-bold tracking-wide flex items-center justify-center gap-2 border border-slate-700 hover:border-slate-600 transition-all shadow-md group shrink-0"
          >
            <Edit3 size={16} className="group-hover:scale-110 transition-transform" /> Edit Profile
          </button>
        </header>

        {/* DASHBOARD GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          
          {/* LEFT/MAIN PANEL (Spans 3 cols on xl) */}
          <div className="xl:col-span-3 space-y-6">
            
            {/* PERFORMANCE OVERVIEW WIDGETS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-3xl hover:bg-slate-800/40 transition-colors group">
                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl w-max mb-4 group-hover:scale-110 transition-transform">
                  <Flame size={22} className="fill-amber-500/20" />
                </div>
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest flex items-center gap-1.5"><ArrowRight size={10} className="text-emerald-500" /> Daily Streak</span>
                <p className="text-2xl font-black text-white mt-1">12 <span className="text-sm font-medium text-slate-500 tracking-normal">Days</span></p>
              </div>

              <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-3xl hover:bg-slate-800/40 transition-colors group">
                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl w-max mb-4 group-hover:scale-110 transition-transform">
                  <Activity size={22} />
                </div>
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest flex items-center gap-1.5"><ArrowRight size={10} className="text-emerald-500" /> Avg Accuracy</span>
                <p className="text-2xl font-black text-white mt-1">74.2<span className="text-sm font-medium text-slate-500 tracking-normal">%</span></p>
              </div>

              <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-3xl hover:bg-slate-800/40 transition-colors group">
                <div className="p-3 bg-teal-500/10 text-teal-500 rounded-2xl w-max mb-4 group-hover:scale-110 transition-transform">
                  <CheckCircle size={22} />
                </div>
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest flex items-center gap-1.5"><ArrowRight size={10} className="text-emerald-500" /> Tests Attempted</span>
                <p className="text-2xl font-black text-white mt-1">38 <span className="text-sm font-medium text-slate-500 tracking-normal">Tests</span></p>
              </div>

              <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-3xl hover:bg-slate-800/40 transition-colors group">
                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl w-max mb-4 group-hover:scale-110 transition-transform">
                  <Trophy size={22} className="fill-blue-500/20" />
                </div>
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest flex items-center gap-1.5"><ArrowRight size={10} className="text-emerald-500" /> Percentile</span>
                <p className="text-2xl font-black text-white mt-1">82.4<span className="text-sm font-medium text-slate-500 tracking-normal">%ile</span></p>
              </div>
            </div>

            {/* PROGRESS & WEAK TOPICS SPLIT */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Weak Topics Analysis */}
              <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-bold text-white flex items-center gap-2">
                      <Target size={18} className="text-rose-400" /> Weak Topic Analysis
                    </h3>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">AI Identified Gaps</p>
                  </div>
                  <Link to="/analytics" className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition-colors">
                    <ChevronRight size={16} />
                  </Link>
                </div>
                <div className="flex-1 min-h-[220px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={weakTopicsData}>
                      <PolarGrid stroke="#1E293B" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} />
                      <Radar name="Score" dataKey="score" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.2} />
                    </RadarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-x-0 bottom-0 flex justify-center pb-2">
                    <span className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-widest rounded-lg">
                      Focus: Soil Sci.
                    </span>
                  </div>
                </div>
              </div>

              {/* Weekly Performance Trend */}
              <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-bold text-white flex items-center gap-2">
                      <TrendingUp size={18} className="text-emerald-400" /> Weekly Performance
                    </h3>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">Average Mock Scores</p>
                  </div>
                  <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-lg">+12% vs last week</span>
                </div>
                <div className="flex-1 min-h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={progressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} dy={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '12px' }} itemStyle={{ color: '#10b981', fontWeight: 700 }} />
                      <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* CONTINUE LEARNING & SMART STUDY PLAN */}
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white flex items-center gap-2 text-lg">
                    <Calendar size={20} className="text-emerald-400" /> Smart Study Plan
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">AI-generated daily targets based on your weak topics.</p>
                </div>
                <button className="text-emerald-400 text-xs font-bold hover:text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                  View All <ChevronRight size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Task 1 */}
                <div className="bg-[#131C31] border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 pt-4">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-emerald-500 text-slate-400 group-hover:text-white transition-colors cursor-pointer shadow-lg">
                      <Play size={16} className="ml-1" />
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 text-[9px] font-black tracking-widest uppercase rounded">High Priority</span>
                  <h4 className="font-bold text-sm text-slate-200 mt-3 mb-1 pr-12 line-clamp-2">Soil pH & Buffering Capcitiy Micro-Drill</h4>
                  <p className="text-[10px] text-slate-400">10 Questions • 5 Mins</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-mono">Suggested by AI Mentor</span>
                  </div>
                </div>

                {/* Task 2 */}
                <div className="bg-[#131C31] border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 pt-4">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-emerald-500 text-slate-400 group-hover:text-white transition-colors cursor-pointer shadow-lg">
                      <Play size={16} className="ml-1" />
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[9px] font-black tracking-widest uppercase rounded">Resume Test</span>
                  <h4 className="font-bold text-sm text-slate-200 mt-3 mb-1 pr-12 line-clamp-2">IBPS AFO comprehensive Mock Test #4</h4>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="h-1.5 flex-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-[60%]"></div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">60%</span>
                  </div>
                </div>

                {/* Task 3 */}
                <div className="bg-[#131C31] border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 pt-4">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-amber-500 text-slate-400 group-hover:text-white transition-colors cursor-pointer shadow-lg">
                      <BookOpen size={16} />
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[9px] font-black tracking-widest uppercase rounded">Revision</span>
                  <h4 className="font-bold text-sm text-slate-200 mt-3 mb-1 pr-12 line-clamp-2">Review 15 Genetics Incorrect Questions</h4>
                  <p className="text-[10px] text-slate-400">Spaced Repetition Alert</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-mono">Last attempted 3 days ago</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI RECOMMENDATION ENGINE SECTION */}
            <div className="bg-gradient-to-br from-[#0c1827] to-[#111e33] border border-emerald-500/20 p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-2xl shadow-emerald-900/10">
              <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 blur-[80px] pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                <div className="p-4 bg-emerald-500/10 rounded-2xl shrink-0 border border-emerald-500/20">
                  <Sparkles size={32} className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
                </div>
                <div className="flex-1 space-y-2 text-center md:text-left">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-widest">
                    AI Mentor Diagnostics
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white">Your Weed Biology accuracy is critically low (32%)</h3>
                  <p className="text-sm text-slate-400">Based on your recent 3 mock tests, you consistently lose marks on Herbicide Classification. Taking a focused drill can improve your overall score by ~4 marks.</p>
                </div>
                <button className="w-full md:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm tracking-wide rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shrink-0">
                  <Play size={16} className="fill-white" /> Start AI Drill
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT SIDEBAR (Spans 1 col on xl) */}
          <div className="space-y-6">
            
            {/* MY PASS PRO STATUS */}
            <div className="bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 p-1 rounded-3xl shadow-xl">
              <div className="bg-[#0B1120] rounded-[1.35rem] p-5 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 blur-[40px]"></div>
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div>
                    <h3 className="font-bold text-white flex items-center gap-1.5 text-sm uppercase tracking-widest">
                      <ShieldCheck size={16} className="text-amber-500" /> Agrigence Pro
                    </h3>
                    <p className="text-[10px] text-emerald-400 font-bold tracking-wide mt-1">ACTIVE SUBSCRIPTION</p>
                  </div>
                  <Crown size={24} className="text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]" />
                </div>
                
                <div className="space-y-3 relative z-10">
                  <div className="flex justify-between text-xs py-2 border-b border-slate-800">
                    <span className="text-slate-400">Validity</span>
                    <span className="font-bold text-white">Ends in 245 Days</span>
                  </div>
                  <div className="flex justify-between text-xs py-2 border-b border-slate-800">
                    <span className="text-slate-400">Access Level</span>
                    <span className="font-bold text-white">All Tests + AI</span>
                  </div>
                </div>

                <button className="w-full mt-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-200 text-xs font-bold transition-colors">
                  Manage Pass
                </button>
              </div>
            </div>

            {/* AI REVISION CENTER SUMMARY */}
            <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-3xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-white flex items-center gap-2 text-sm uppercase tracking-widest">
                  <RefreshCw size={14} className="text-emerald-400" /> Revision Center
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400"><X size={14} /></div>
                    <div>
                      <p className="text-xs font-bold text-slate-200">Wrong Answers</p>
                      <p className="text-[9px] text-slate-500 font-mono">142 pending</p>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-emerald-400"><ArrowRight size={14}/></button>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400"><Bookmark size={14} fill="currentColor" /></div>
                    <div>
                      <p className="text-xs font-bold text-slate-200">Bookmarks</p>
                      <p className="text-[9px] text-slate-500 font-mono">38 saved</p>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-emerald-400"><ArrowRight size={14}/></button>
                </div>
              </div>
            </div>

            {/* CURRENT AFFAIRS */}
            <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-3xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-white flex items-center gap-2 text-sm uppercase tracking-widest">
                  <Globe size={14} className="text-blue-400" /> Current Affairs
                </h3>
              </div>
              <div className="space-y-3">
                <div className="group cursor-pointer">
                  <span className="text-[9px] text-blue-400 uppercase font-black tracking-widest">New Scheme</span>
                  <p className="text-xs font-medium text-slate-300 group-hover:text-emerald-400 transition-colors line-clamp-2 mt-0.5">PM KISAN 14th Installment Released along with new Urea Gold guidelines...</p>
                  <span className="text-[9px] text-slate-600 mt-1 block">2 hours ago</span>
                </div>
                <div className="h-px w-full bg-slate-800"></div>
                <div className="group cursor-pointer">
                  <span className="text-[9px] text-teal-400 uppercase font-black tracking-widest">NABARD Update</span>
                  <p className="text-xs font-medium text-slate-300 group-hover:text-emerald-400 transition-colors line-clamp-2 mt-0.5">Agriculture Infrastructure Fund crosses 30,000 Crore investment milestone...</p>
                  <span className="text-[9px] text-slate-600 mt-1 block">5 hours ago</span>
                </div>
              </div>
              <button className="w-full mt-4 py-2 border border-slate-700 rounded-lg text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors">
                View All Affairs
              </button>
            </div>

            {/* LEADERBOARD SNIPPET */}
            <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-3xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-white flex items-center gap-2 text-sm uppercase tracking-widest">
                  <Trophy size={14} className="text-amber-400" /> Top Rankers
                </h3>
                <Link to="/leaderboard" className="text-[10px] text-emerald-400 uppercase font-bold hover:underline tracking-widest">Full List</Link>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 bg-slate-800/30 rounded-xl">
                  <span className="w-6 text-center font-bold text-amber-500 text-xs">1</span>
                  <div className="w-6 h-6 rounded-md bg-emerald-700 flex items-center justify-center text-[10px] font-bold">A</div>
                  <span className="flex-1 text-xs font-medium text-slate-200">Arjun Singh</span>
                  <span className="text-[10px] font-mono text-emerald-400">98.5%</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-slate-800/30 rounded-xl">
                  <span className="w-6 text-center font-bold text-slate-400 text-xs">2</span>
                  <div className="w-6 h-6 rounded-md bg-blue-700 flex items-center justify-center text-[10px] font-bold">P</div>
                  <span className="flex-1 text-xs font-medium text-slate-200">Priya Sharma</span>
                  <span className="text-[10px] font-mono text-emerald-400">97.2%</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-slate-800/80 border border-emerald-500/20 rounded-xl relative mt-2">
                  <span className="w-6 text-center font-bold text-slate-500 text-xs">1k+</span>
                  <div className="w-6 h-6 rounded-md bg-slate-700 flex items-center justify-center text-[10px] font-bold">Y</div>
                  <span className="flex-1 text-xs font-medium text-emerald-400">You</span>
                  <span className="text-[10px] font-mono text-emerald-400">74.2%</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Profile Editing Modal Overlay */}
        {isEditing && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 relative max-h-[85vh] overflow-y-auto python-scrollbar"
            >
              <button 
                onClick={() => setIsEditing(false)} 
                className="absolute top-4 right-4 p-2 bg-slate-805 hover:bg-slate-800 hover:text-white rounded-lg text-slate-400 transition"
              >
                <X size={16} />
              </button>

              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-4">
                <Settings size={18} className="text-emerald-400" /> Edit Profile & Preferences
              </h3>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                
                {successMsg && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-xl text-center">
                    {successMsg}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Full Name</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-emerald-500 text-slate-100 text-sm font-medium transition"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">State</label>
                    <select 
                      value={editState}
                      onChange={e => setEditState(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-emerald-500 text-slate-100 text-sm font-medium transition cursor-pointer"
                    >
                      {indianStates.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Language</label>
                    <select 
                      value={editLang}
                      onChange={e => setEditLang(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-emerald-500 text-slate-100 text-sm font-medium transition cursor-pointer"
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi (हिंदी)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Preparation Level</label>
                    <select 
                      value={editPrep}
                      onChange={e => setEditPrep(e.target.value as any)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-emerald-500 text-slate-100 text-sm font-medium transition cursor-pointer"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Qualification</label>
                    <select 
                      value={editQual}
                      onChange={e => setEditQual(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-emerald-500 text-slate-100 text-sm font-medium transition cursor-pointer"
                    >
                      <option value="12th Pass">12th Pass</option>
                      <option value="Diploma Agriculture">Diploma Agriculture</option>
                      <option value="B.Sc Agriculture">B.Sc Agriculture</option>
                      <option value="M.Sc Agriculture">M.Sc Agriculture</option>
                      <option value="B.Tech Agriculture">B.Tech Agriculture</option>
                      <option value="Veterinary Science">Veterinary Science</option>
                      <option value="Agriculture Engineering">Agriculture Engineering</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 block">Modify Target Exams</label>
                  <div className="flex flex-wrap gap-2">
                    {examOptions.map((exam) => {
                      const isSelected = editExams.includes(exam);
                      return (
                        <button
                          type="button"
                          key={exam}
                          onClick={() => handleToggleExam(exam)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition ${
                            isSelected 
                              ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' 
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          {exam}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-705 text-slate-200 font-bold uppercase text-xs tracking-wider rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold uppercase text-xs tracking-wider rounded-xl transition flex items-center justify-center gap-1"
                  >
                    {saving ? 'Saving...' : 'Save Updates'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

      </div>
    </div>
  );
}
