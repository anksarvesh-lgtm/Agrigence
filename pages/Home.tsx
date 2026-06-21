import React, { useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Play, TrendingUp, Target, BookOpen, Clock, FileText, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';

const TEST_COVER_IMAGES = [
  'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=800&auto=format&fit=crop', // wheat
  'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?q=80&w=800&auto=format&fit=crop', // tractor
  'https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=800&auto=format&fit=crop', // greenhouse
  'https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=800&auto=format&fit=crop', // field
  'https://images.unsplash.com/photo-1592982537447-6f296317bc32?q=80&w=800&auto=format&fit=crop', // soil
  'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?q=80&w=800&auto=format&fit=crop', // orchard
  'https://images.unsplash.com/photo-1588614959060-4d144f28b207?q=80&w=800&auto=format&fit=crop', // vegetables
  'https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=800&auto=format&fit=crop', // wheat closeup
  'https://images.unsplash.com/photo-1523741543316-bab7fc325628?q=80&w=800&auto=format&fit=crop', // crops
  'https://images.unsplash.com/photo-1628102491629-7785710bc447?q=80&w=800&auto=format&fit=crop'  // drone
];

const getCoverImageForBank = (idStr: string) => {
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = (hash << 5) - hash + idStr.charCodeAt(i);
    hash = hash & hash;
  }
  const index = Math.abs(hash) % TEST_COVER_IMAGES.length;
  return TEST_COVER_IMAGES[index];
};

const courses = [
  { id: 1, title: 'ICAR JRF Agronomy 2024', tests: 120, free: 5, category: 'Foundation', rating: 4.8, students: '12k+', tag: 'Trending' },
  { id: 2, title: 'IBPS AFO Mains Full Mock', tests: 45, free: 2, category: 'Mock Tests', rating: 4.9, students: '8k+', tag: 'Live' },
  { id: 3, title: 'Plant Science Complete Bundle', tests: 85, free: 3, category: 'Subject-wise', rating: 4.7, students: '5k+', tag: 'AI Recommended' },
  { id: 4, title: 'CUET PG Agriculture', tests: 60, free: 5, category: 'Crash Course', rating: 4.6, students: '15k+', tag: 'New' },
  { id: 5, title: 'State PSC Agriculture Officer', tests: 90, free: 10, category: 'Foundation', rating: 4.9, students: '20k+', tag: 'Popular' },
  { id: 6, title: 'UPSC Agriculture Optional', tests: 30, free: 1, category: 'Subject-wise', rating: 4.8, students: '3k+', tag: 'Pass' },
];

const ExamDashboard: React.FC = () => {
  const { darkTheme } = useOutletContext<any>();

  useEffect(() => {
    document.title = "Agrigence | Where Agri-Intelligence Meets Agricultural Generations";
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-8 w-full max-w-7xl mx-auto">
      
      {/* LEFT FILTER PANEL (Hidden on mobile by default) */}
      <div className={`hidden lg:flex flex-col gap-6 w-64 shrink-0 ${darkTheme ? 'text-slate-300' : 'text-slate-700'}`}>
        
        {/* Progress Card */}
        <div className={`p-5 rounded-2xl border ${darkTheme ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-3 mb-4">
            <Target className="text-emerald-500" size={20} />
            <span className="font-bold">Daily Goal</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 mb-2">
            <div className="bg-emerald-500 h-2 rounded-full w-[65%]"></div>
          </div>
          <p className="text-xs text-slate-400">65% (13/20 Questions)</p>
        </div>

        {/* Categories */}
        <div className="flex flex-col gap-1">
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-2 px-2">Categories</h3>
          <CategoryItem active label="All Courses" count={124} />
          <CategoryItem label="Foundation" count={32} />
          <CategoryItem label="Crash Courses" count={18} />
          <CategoryItem label="Mock Tests" count={45} />
          <CategoryItem label="Current Affairs" count={12} />
          <CategoryItem label="PYQs" count={28} />
          <CategoryItem label="Revision" count={15} />
          <CategoryItem label="Subject-wise Tests" count={56} />
        </div>

      </div>

      {/* RIGHT MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col gap-8">
        
        {/* Banner Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 p-8 sm:p-10 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl shadow-emerald-900/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-[10px] font-bold uppercase tracking-widest mb-4">
              <Sparkles size={14} className="text-amber-300" /> AI-Powered Preparation
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">Master Agriculture Exams with Smart Analytics</h1>
            <p className="text-emerald-50 mb-6 text-sm sm:text-base opacity-90">Personalized study plans, weak topic detection, and TCS iON pattern mock tests.</p>
            <button className="px-6 py-3 bg-white text-emerald-700 font-bold rounded-xl text-sm hover:bg-emerald-50 transition-colors shadow-lg">
              Start Free Trial
            </button>
          </div>
          <div className="hidden md:block relative z-10 shrink-0">
             <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500&q=80" alt="Students" className="w-48 h-48 rounded-2xl object-cover border-4 border-white/20 shadow-xl" />
          </div>
        </div>

        {/* Continue Learning / Dashboard Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <WidgetCard 
            title="Weak Topic: Plant Breeding"
            desc="You scored 45% in recent tests."
            icon={AlertCircle}
            color="text-amber-500"
            bgColor="bg-amber-500/10"
            darkTheme={darkTheme}
            action="Revise Now"
          />
          <WidgetCard 
            title="IBPS AFO Mains"
            desc="Test 4 is live. 12,000+ enrolled."
            icon={Play}
            color="text-emerald-500"
            bgColor="bg-emerald-500/10"
            darkTheme={darkTheme}
            action="Resume Test"
          />
          <WidgetCard 
            title="Rank Predictor"
            desc="Based on last 5 mocks, you are in top 15%."
            icon={TrendingUp}
            color="text-blue-500"
            bgColor="bg-blue-500/10"
            darkTheme={darkTheme}
            action="View Analysis"
          />
        </div>

        {/* Test Cards Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold ${darkTheme ? 'text-white' : 'text-slate-800'}`}>Recommended for You</h2>
            <Link to="/test-series" className="text-emerald-500 text-sm font-semibold hover:text-emerald-400 flex items-center gap-1">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {courses.map(course => (
              <TestCard key={course.id} course={course} darkTheme={darkTheme} />
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

const Sparkles = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
  </svg>
)

const CategoryItem = ({ label, count, active }: any) => (
  <button className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors
    ${active ? 'bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-500/20' : 'hover:bg-slate-800/50 hover:text-slate-200'}
  `}>
    <span>{label}</span>
    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${active ? 'bg-black/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
      {count}
    </span>
  </button>
)

const WidgetCard = ({ title, desc, icon: Icon, color, bgColor, darkTheme, action }: any) => (
  <div className={`p-5 rounded-2xl border flex flex-col gap-3 group cursor-pointer transition-all hover:scale-[1.02]
    ${darkTheme ? 'bg-[#1E293B] border-slate-800 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-slate-300'}
  `}>
    <div className="flex items-start gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bgColor}`}>
        <Icon size={20} className={color} />
      </div>
      <div>
        <h4 className={`font-bold text-sm leading-tight ${darkTheme ? 'text-slate-200' : 'text-slate-800'}`}>{title}</h4>
        <p className="text-xs text-slate-500 mt-1">{desc}</p>
      </div>
    </div>
    <div className="mt-auto pt-2 border-t border-slate-800/30 flex items-center justify-between text-xs font-semibold">
      <span className={color}>{action}</span>
      <ChevronRight size={14} className={`${color} group-hover:translate-x-1 transition-transform`} />
    </div>
  </div>
)

const TestCard = ({ course, darkTheme }: any) => (
  <div className={`flex flex-col rounded-2xl border overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 shadow-sm hover:shadow-xl
    ${darkTheme ? 'bg-[#1E293B] border-slate-800 hover:border-emerald-500/50 hover:shadow-emerald-500/10' : 'bg-white border-slate-200 hover:border-emerald-500/50 hover:shadow-emerald-500/10'}
  `}>
    {/* Thumbnail Area */}
    <div className="h-32 relative bg-slate-800 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 to-transparent z-10"></div>
      <img src={getCoverImageForBank(String(course.id))} referrerPolicy="no-referrer" alt="Cover" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
      
      <div className="absolute top-3 left-3 z-20 flex gap-2">
        <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest text-white shadow-lg backdrop-blur-sm
          ${course.tag === 'Live' ? 'bg-red-500' : 
            course.tag === 'AI Recommended' ? 'bg-purple-500' : 
            'bg-emerald-500'}
        `}>
          {course.tag}
        </span>
      </div>
      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-[10px] font-bold text-amber-400">
        <Star size={10} fill="currentColor" /> {course.rating}
      </div>
    </div>

    {/* Content Area */}
    <div className="p-5 flex flex-col flex-1 gap-4">
      <div>
        <h3 className={`font-bold text-base leading-tight mb-2 line-clamp-2 ${darkTheme ? 'text-slate-100' : 'text-slate-800'}`}>
          {course.title}
        </h3>
        <p className="text-xs text-slate-500 font-medium">Bilingual • {course.students} Enrolled</p>
      </div>

      <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
        <div className="flex items-center gap-1">
          <FileText size={14} className="text-emerald-500" />
          <span>{course.tests} Tests</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle2 size={14} className="text-blue-500" />
          <span>{course.free} Free Tests</span>
        </div>
      </div>

      <div className="mt-auto pt-4 flex gap-2">
        <button className="flex-1 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 font-bold text-xs hover:bg-emerald-500 hover:text-white transition-colors">
          View Details
        </button>
        <button className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 hover:bg-emerald-500 transition-colors">
          Start Test
        </button>
      </div>
    </div>
  </div>
)

const Star = ({ size, fill, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill || "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
)

export default ExamDashboard;
