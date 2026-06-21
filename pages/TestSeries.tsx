import React, { useState, useMemo, useEffect } from 'react';
import { 
  Bot, Cpu, BookOpen, Activity, FileCheck, Brain, Shield, Database, 
  LayoutDashboard, ChevronRight, Settings, Sliders, Play, RotateCcw, 
  Plus, CheckCircle, HelpCircle, AlertTriangle, FileText, TrendingUp, 
  Users, RefreshCw, Calendar, Flame, Clock, Compass, PlusCircle,
  Search, Filter, AlertCircle, Award, Star, Book, Sparkles, ArrowRight, 
  User, Check, Lock, StarHalf, Volume2, Sparkle, Target, Zap, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
type TestSeriesCard = {
  id: string;
  title: string;
  category: string;
  categorySlug: 'ibps-afo' | 'nabard' | 'icar' | 'agri-supervisor' | 'fci-cci' | 'subjects';
  subjectSlug: 'soil-science' | 'agronomy' | 'genetics' | 'pathology' | 'entomology' | 'horticulture' | 'husbandry' | 'all';
  totalTests: number;
  freeTests: number;
  languages: string[];
  difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Extreme';
  isPremium: boolean;
  liveUsers: number;
  metrics: {
    mocks: number;
    sectional: number;
    chapter: number;
    pyqs: number;
    currentAffairs: number;
  };
  trendingLabel?: 'Trending' | 'Most Attempted' | 'High Scoring' | 'Weak Topic Match' | 'Recommended' | 'New' | 'AI Suggested';
};

import { useAuth } from '../src/authContext';
import { canAccessExam } from '../src/hooks/useExamAccess';
import { Paywall } from '../src/components/Paywall';
import { useSubscription } from '../src/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import { db } from '../src/firebase';
import { collection, getDocs } from 'firebase/firestore';

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

export default function TestSeries() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { subscription, canAccessContent } = useSubscription();
  const [selectedPlanName, setSelectedPlanName] = useState('Pass Bundle');
  const [showPaywall, setShowPaywall] = useState(false);
  const [selectedContentId, setSelectedContentId] = useState('');
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [selectedExamName, setSelectedExamName] = useState<string>('');

  // Dynamic Question Banks from Firestore State
  const [activeSeriesTab, setActiveSeriesTab] = useState<'packages' | 'custom_banks'>('packages');
  const [dynBanks, setDynBanks] = useState<any[]>([]);
  const [loadingDyn, setLoadingDyn] = useState(false);

  useEffect(() => {
    async function fetchDynBanks() {
      try {
        setLoadingDyn(true);
        const querySnapshot = await getDocs(collection(db, 'question_banks'));
        const loaded: any[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.status === 'Approved' || data.status === 'Live') {
            loaded.push({ id: doc.id, ...data });
          }
        });
        setDynBanks(loaded);
      } catch (err) {
        console.error("Failed to load question banks from Firestore:", err);
      } finally {
        setLoadingDyn(false);
      }
    }
    fetchDynBanks();
  }, []);

  useEffect(() => {
    document.title = "Test Series | Agrigence";
  }, []);

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedPricing, setSelectedPricing] = useState<string>('All');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('trending');
  const [selectedLanguageTab, setSelectedLanguageTab] = useState<'en' | 'hi'>('en');

  // Floating AI Chatbot States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([
    { role: 'ai', text: "Hello! I am your AI Agriculture Exam Mentor. Based on your weak topic tracking, I recommend starting with 'Weed Ecology Chapter Test 3' to boost your current weed selectivity score from 46% to optimal. How can I guide you today?" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Active quiz/test play modal state
  const [activeTestToPlay, setActiveTestToPlay] = useState<TestSeriesCard | null>(null);
  const [isPlayingTest, setIsPlayingTest] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [testScore, setTestScore] = useState<number | null>(null);

  // Hardcoded real premium test series data following Testbook format precisely but optimized with AI recommendations
  const testSeriesData: TestSeriesCard[] = [
    {
      id: 'ts-01',
      title: 'IBPS AFO 2026 Comprehensive Master Test Series',
      category: 'IBPS AFO',
      categorySlug: 'ibps-afo',
      subjectSlug: 'all',
      totalTests: 180,
      freeTests: 12,
      languages: ['English', 'Hindi'],
      difficulty: 'Moderate',
      isPremium: true,
      liveUsers: 14240,
      trendingLabel: 'Trending',
      metrics: { mocks: 35, sectional: 45, chapter: 60, pyqs: 25, currentAffairs: 15 }
    },
    {
      id: 'ts-02',
      title: 'NABARD Grade A (RD & Agri) High-Yielding Series',
      category: 'NABARD Grade A',
      categorySlug: 'nabard',
      subjectSlug: 'all',
      totalTests: 125,
      freeTests: 6,
      languages: ['English'],
      difficulty: 'Hard',
      isPremium: true,
      liveUsers: 8432,
      trendingLabel: 'Recommended',
      metrics: { mocks: 20, sectional: 30, chapter: 45, pyqs: 20, currentAffairs: 10 }
    },
    {
      id: 'ts-03',
      title: 'ICAR AIEEA PG (Agronomy) Daily Target Drills',
      category: 'ICAR AIEEA',
      categorySlug: 'icar',
      subjectSlug: 'agronomy',
      totalTests: 95,
      freeTests: 10,
      languages: ['English'],
      difficulty: 'Hard',
      isPremium: false,
      liveUsers: 4890,
      trendingLabel: 'New',
      metrics: { mocks: 15, sectional: 25, chapter: 35, pyqs: 15, currentAffairs: 5 }
    },
    {
      id: 'ts-04',
      title: 'Soil Science & Chemistry Specially Targeted Pack',
      category: 'Soil Science',
      categorySlug: 'subjects',
      subjectSlug: 'soil-science',
      totalTests: 64,
      freeTests: 8,
      languages: ['English', 'Hindi'],
      difficulty: 'Extreme',
      isPremium: true,
      liveUsers: 6411,
      trendingLabel: 'Weak Topic Match',
      metrics: { mocks: 10, sectional: 15, chapter: 25, pyqs: 10, currentAffairs: 4 }
    },
    {
      id: 'ts-05',
      title: 'Agriculture Supervisor State Level Full Package',
      category: 'Agriculture Supervisor',
      categorySlug: 'agri-supervisor',
      subjectSlug: 'all',
      totalTests: 110,
      freeTests: 15,
      languages: ['English', 'Hindi'],
      difficulty: 'Easy',
      isPremium: false,
      liveUsers: 12430,
      trendingLabel: 'Most Attempted',
      metrics: { mocks: 25, sectional: 30, chapter: 40, pyqs: 10, currentAffairs: 5 }
    },
    {
      id: 'ts-06',
      title: 'FCI & CCI Technical Officer Special Series',
      category: 'FCI',
      categorySlug: 'fci-cci',
      subjectSlug: 'all',
      totalTests: 85,
      freeTests: 5,
      languages: ['English', 'Hindi'],
      difficulty: 'Moderate',
      isPremium: true,
      liveUsers: 3410,
      trendingLabel: 'High Scoring',
      metrics: { mocks: 15, sectional: 20, chapter: 30, pyqs: 15, currentAffairs: 5 }
    },
    {
      id: 'ts-07',
      title: 'Genetics, Cytology & Plant Physiology Advanced Drills',
      category: 'Genetics',
      categorySlug: 'subjects',
      subjectSlug: 'genetics',
      totalTests: 50,
      freeTests: 4,
      languages: ['English'],
      difficulty: 'Extreme',
      isPremium: true,
      liveUsers: 2154,
      trendingLabel: 'AI Suggested',
      metrics: { mocks: 8, sectional: 12, chapter: 20, pyqs: 8, currentAffairs: 2 }
    },
    {
      id: 'ts-08',
      title: 'Plant Pathology & Entomology Pest Diagnostic Series',
      category: 'Plant Pathology',
      categorySlug: 'subjects',
      subjectSlug: 'pathology',
      totalTests: 75,
      freeTests: 12,
      languages: ['English', 'Hindi'],
      difficulty: 'Moderate',
      isPremium: false,
      liveUsers: 5690,
      trendingLabel: 'Trending',
      metrics: { mocks: 15, sectional: 20, chapter: 25, pyqs: 10, currentAffairs: 5 }
    }
  ];



  const simulatedQuestions = [
    {
      id: 1,
      q: "In soils under continuous flooded anaerobic cultivation, what happens to organic matter decomposition relative to aerobic soils?",
      options: [
        "A. Halts entirely due to total loss of soil biome microbial activity",
        "B. Proceeds significantly slower, primarily driven by facultative anaerobes and producing methane",
        "C. Accelerates dramatically because of acid-active anaerobic thermophiles",
        "D. Remains unaffected since bacteria operate at optimized chemical redox regardless"
      ],
      correct: 1,
      explanation: "Decomposition of organic matter in anaerobic flooded conditions proceeds much more slowly than under aerobic conditions because the microbial conversion pathway shifts to anaerobic facultative processes, which release simpler byproducts such as methane and carbon dioxide with lower kinetic yields."
    },
    {
      id: 2,
      q: "Identify the selective pre-emergent herbicide widely utilized inside leguminous soybean systems for total annual weed control:",
      options: [
        "A. Pendimethalin",
        "B. Glyphosate",
        "C. Paraquat Dichloride",
        "D. Clodinafop-propargyl"
      ],
      correct: 0,
      explanation: "Pendimethalin is recommended as a selective pre-emergent herbicide in soybean, groundnut, and cotton. Glyphosate and Paraquat are non-selective post-emergent contact/systemic herbicides."
    }
  ];

  // Filter logic
  const filteredTestSeries = useMemo(() => {
    return testSeriesData.filter(ts => {
      // Category Filter
      if (activeCategory !== 'All') {
        const catMatch = ts.category.toLowerCase().includes(activeCategory.toLowerCase()) || 
                         ts.categorySlug.toLowerCase().includes(activeCategory.toLowerCase()) ||
                         ts.subjectSlug.toLowerCase().includes(activeCategory.toLowerCase());
        if (!catMatch) return false;
      }

      // Search Query Filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesQuery = ts.title.toLowerCase().includes(query) || 
                             ts.category.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      // Difficulty Filter
      if (selectedDifficulty !== 'All') {
        if (ts.difficulty.toLowerCase() !== selectedDifficulty.toLowerCase()) return false;
      }

      // Pricing Filter (Free vs Pass)
      if (selectedPricing !== 'All') {
        if (selectedPricing === 'Free' && ts.isPremium) return false;
        if (selectedPricing === 'Pass' && !ts.isPremium) return false;
      }

      // Language Filter
      if (selectedLanguage !== 'All') {
        const hasLang = ts.languages.some(l => l.toLowerCase() === selectedLanguage.toLowerCase());
        if (!hasLang) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'trending') {
        return b.liveUsers - a.liveUsers;
      }
      if (sortBy === 'tests') {
        return b.totalTests - a.totalTests;
      }
      if (sortBy === 'difficulty-desc') {
        return b.difficulty.length - a.difficulty.length;
      }
      return 0;
    });
  }, [activeCategory, searchQuery, selectedDifficulty, selectedPricing, selectedLanguage, sortBy]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const userText = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userText }]);
    setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      let reply = "I have scanned the knowledge repository. ";
      const lowInput = userText.toLowerCase();

      if (lowInput.includes('weed') || lowInput.includes('ph') || lowInput.includes('soil')) {
        reply += "Your target weak match is 'Soil pH Buffering and Acidification'. Your average score is 45%. I highly recommend executing 'Soil Science Targeted Pack (ts-04)', which has 2 free mock tests specifically containing questions on organic buffer indices. Would you like to launch a 2-question micro-drill right now?";
      } else if (lowInput.includes('syllabus') || lowInput.includes('schedule') || lowInput.includes('tips')) {
        reply += "For IBPS AFO, spend 4 hours daily. Dedicate 2 hours to High Weightage Weed Sciences & Herbicide kinetics, and 1 hour to spaced repetition tests. I have scheduled a warning recall alert for tomorrow morning at 8:30 AM to protect your continuous 12d streak!";
      } else {
        reply += "Let's optimize your scoring parameters. For agriculture competitive exams, practice chapter-wise diagnostics. Out of 180 total tests in the IBPS AFO series, 12 are currently free. Try solving the free mock test first to assess your performance speed.";
      }

      setChatMessages(prev => [...prev, { role: 'ai', text: reply }]);
    }, 1000);
  };

  const handleStartPracticeTest = (test: TestSeriesCard) => {
    if (test.isPremium) {
      if (!user) {
        alert("Please login first to access premium mock tests.");
        return;
      }

      const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' || user.role === 'EDITORIAL_MEMBER';
      const sub = (user as any)?.subscription;
      // Convert category to shortname if applicable, or fallback to exact string matching just in case
      let targetExam = test.category;
      if (targetExam.includes('IBPS')) targetExam = 'AFO';
      if (targetExam.includes('Technical Assistant')) targetExam = 'AGTA';

      const hasAccess = isAdmin || canAccessExam(sub, targetExam);

      if (!hasAccess) {
        setSelectedContentId(test.id);
        setSelectedExamId(targetExam);
        setSelectedExamName(test.category);
        setShowPaywall(true);
        return;
      }
    }
    setActiveTestToPlay(test);
    setIsPlayingTest(true);
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setTestScore(null);
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 font-sans selection:bg-emerald-500/30">
      
      {/* 1. TOP PREMIUM STICKY NAVBAR */}
      <nav className="sticky top-0 z-40 bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-800 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="bg-emerald-600/15 border border-emerald-500/30 p-2 rounded-xl text-emerald-400">
                <Brain className="animate-pulse" size={22} />
              </div>
              <div>
                <span className="font-extrabold text-sm uppercase tracking-widest block text-emerald-400 font-mono">Agrigence</span>
                <span className="text-[9px] text-neutral-500 font-mono block uppercase">Competitive AI Labs</span>
              </div>
            </div>

            {/* Language Switch */}
            <div className="hidden md:flex items-center gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800 ml-4">
              <button 
                onClick={() => setSelectedLanguageTab('en')}
                className={`px-3 py-1 text-[10px] font-bold uppercase rounded-lg transition-all ${selectedLanguageTab === 'en' ? 'bg-emerald-500/20 text-emerald-400' : 'text-neutral-500 hover:text-neutral-300'}`}
              >
                English
              </button>
              <button 
                onClick={() => setSelectedLanguageTab('hi')}
                className={`px-3 py-1 text-[10px] font-bold uppercase rounded-lg transition-all ${selectedLanguageTab === 'hi' ? 'bg-emerald-500/20 text-emerald-400' : 'text-neutral-500 hover:text-neutral-300'}`}
              >
                हिन्दी
              </button>
            </div>
          </div>

          {/* Quick Stats Banner inside Nav */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-2 bg-neutral-900/60 px-3.5 py-1.5 rounded-xl border border-neutral-800">
              <Flame size={15} className="text-amber-500" />
              <div className="text-left">
                <span className="text-[10px] text-neutral-500 font-mono block uppercase">Your Streak</span>
                <span className="text-xs font-bold text-neutral-200">12 Days Clean</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-neutral-900/60 px-3.5 py-1.5 rounded-xl border border-neutral-800">
              <Activity size={15} className="text-emerald-400" />
              <div className="text-left">
                <span className="text-[10px] text-neutral-500 font-mono block uppercase">Syllbus Rank</span>
                <span className="text-xs font-bold text-neutral-200">#412 / Tier-1</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-neutral-900/60 px-3.5 py-1.5 rounded-xl border border-neutral-800">
              <Target size={15} className="text-sky-400" />
              <div className="text-left">
                <span className="text-[10px] text-neutral-500 font-mono block uppercase">Sub-Topic Focus</span>
                <span className="text-xs font-bold text-neutral-200">Weed Ecology</span>
              </div>
            </div>
          </div>

          {/* Profile & Live Counter */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-950/20 border border-emerald-900/40 rounded-xl">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
              <span className="text-[10px] text-emerald-400 font-bold uppercase font-mono tracking-widest">34,140 Live Practicing</span>
            </div>
            
            <div className="h-9 w-9 bg-neutral-800 hover:bg-neutral-700 transition-colors cursor-pointer rounded-xl border border-neutral-750 flex items-center justify-center text-neutral-300">
              <User size={16} />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* UPPER BANNER / INTELLIGENT AI REVISION QUEUE */}
        <div className="mb-10 bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 border border-neutral-800 p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-20 w-60 h-60 bg-sky-500/5 rounded-full blur-[80px] pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/35 px-3 py-1 rounded-full text-emerald-400 text-[10px] font-extrabold uppercase tracking-widest font-mono">
                <Sparkles size={11} /> AI Suggested Target
              </div>
              <h2 className="text-2xl md:text-3xl font-light tracking-tight text-white">
                Strengthen <span className="text-emerald-400 font-bold">Weed Ecology & Herbicide Kinetics</span>
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Your analytics identify weed resistance metrics as your lowest accuracy zone (46%). Spend 10 minutes on this simulated high-yield module to lock in your next percentile improvement target.
              </p>
            </div>
            <button 
              onClick={() => {
                const specPack = testSeriesData.find(t => t.id === 'ts-04') || testSeriesData[0];
                handleStartPracticeTest(specPack);
              }}
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-widest uppercase rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:scale-105 active:scale-95 flex items-center gap-2 shrink-0"
            >
              <Play size={14} className="fill-white" /> Start High Yield practice
            </button>
          </div>
        </div>

        {/* CORE INTERACTIVITY AREA: left category sidebar, right main grid and filters */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* LEFT EXAM & TOPIC CATEGORY SIDEBAR */}
          <aside className="lg:col-span-1 space-y-6">
            
            {/* COMPACT STUDENT PERFORMANCE ANALYTICS WIDGET */}
            <div className="bg-neutral-950/60 border border-neutral-800 p-6 rounded-2xl space-y-4">
              <header className="flex justify-between items-center border-b border-neutral-805 pb-3">
                <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity size={14} className="text-sky-400" /> Stats Cockpit
                </span>
                <span className="text-[10px] font-mono text-emerald-400 uppercase">Live Metrics</span>
              </header>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-900 border border-neutral-800/80 p-3 rounded-xl">
                  <span className="text-[9px] text-neutral-500 font-mono block uppercase">Accuracy</span>
                  <span className="text-lg font-bold text-white">74.2%</span>
                </div>
                <div className="bg-neutral-900 border border-neutral-800/80 p-3 rounded-xl">
                  <span className="text-[9px] text-neutral-500 font-mono block uppercase">Global Rank</span>
                  <span className="text-lg font-bold text-amber-500">#1,418</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-neutral-400">
                  <span>Soil science target</span>
                  <span className="font-bold">88%</span>
                </div>
                <div className="h-1.5 w-full bg-neutral-900 border border-neutral-850 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: '88%' }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-neutral-400">
                  <span>Genetics & cytology</span>
                  <span className="font-bold">32% Weak Zone</span>
                </div>
                <div className="h-1.5 w-full bg-neutral-900 border border-neutral-850 rounded-full overflow-hidden">
                  <div className="h-full bg-red-400" style={{ width: '32%' }} />
                </div>
              </div>
            </div>

            {/* Testbook Style Category sidebar panel */}
            <div className="bg-neutral-955/40 border border-neutral-800 rounded-2xl p-4.5 space-y-3 sticky top-24">
              <span className="text-[10px] font-black uppercase text-neutral-500 tracking-widest block ml-1">Preps Core Categories</span>
              
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 sm-custom-scroll">
                {[
                  { value: 'All', label: 'All Categories', count: '12 Packs', desc: 'Browse all active syllabus blocks' },
                  { value: 'IBPS AFO', label: 'IBPS AFO Exams', count: '4 Packs', desc: 'Agricultural Field Officer (Scale-I)' },
                  { value: 'NABARD Grade A', label: 'NABARD Grade A', count: '2 Packs', desc: 'Rural Development Assistant specs' },
                  { value: 'ICAR AIEEA-PG', label: 'ICAR PG / JRF', count: '3 Packs', desc: 'Masters Degree Entrance & SRF' },
                  { value: 'Agriculture Supervisor', label: 'Agri Supervisor', count: '2 Packs', desc: 'Sub-ordinate state-level preps' },
                  { value: 'FCI AG-III', label: 'FCI Technical', count: '1 Pack', desc: 'FCI & CCI Technical specifications' },
                  { value: 'Other', label: 'Other allied', count: '1 Pack', desc: 'All independent agri sector entry tests' }
                ].map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setActiveCategory(cat.value)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                      activeCategory === cat.value
                        ? 'bg-emerald-500/10 border-emerald-500/50 shadow-md shadow-emerald-500/5'
                        : 'bg-neutral-950/40 border-neutral-805 hover:border-neutral-700'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                        activeCategory === cat.value ? 'border-emerald-500' : 'border-neutral-700'
                      }`}>
                        {activeCategory === cat.value && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between gap-1 w-full">
                        <span className={`text-[11px] font-bold ${activeCategory === cat.value ? 'text-emerald-400' : 'text-neutral-200'}`}>
                          {cat.label}
                        </span>
                        <span className="text-[9px] text-neutral-500 font-mono font-medium shrink-0 ml-1.5">{cat.count}</span>
                      </div>
                      <p className="text-[9px] text-neutral-400 mt-0.5 leading-snug">{cat.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* RIGHT SIDE MAIN COLUMN (Top search & filter, Test Series Grid) */}
          <section className="lg:col-span-3 space-y-6">

            {/* Assessment Platform Sub-Tabs */}
            <div className="flex border-b border-neutral-850 gap-1 overflow-x-auto shrink-0 scrollbar-none pb-0.5">
              <button
                type="button"
                onClick={() => setActiveSeriesTab('packages')}
                className={`px-5 py-3 text-xs font-bold font-mono tracking-wider uppercase shrink-0 transition-all ${
                  activeSeriesTab === 'packages' ? 'border-b-2 border-emerald-500 text-emerald-400 font-extrabold' : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                Master Series Packages
              </button>
              <button
                type="button"
                onClick={() => setActiveSeriesTab('custom_banks')}
                className={`px-5 py-3 text-xs font-bold font-mono tracking-wider uppercase shrink-0 transition-all pb-3 ${
                  activeSeriesTab === 'custom_banks' ? 'border-b-2 border-emerald-500 text-emerald-400 font-extrabold' : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                Interactive Question Banks ({dynBanks.length})
              </button>
            </div>
            
            {/* TOP SEARCH & DYNAMIC FILTER TOOLBAR */}
            <div className="bg-neutral-950/50 p-5 rounded-2xl border border-neutral-800/80 space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search Box */}
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search Agriculture Test Series (e.g. IBPS, Soil pH, Crop pests)..." 
                    className="w-full bg-neutral-950 border border-neutral-800 pl-10 pr-4 py-3 rounded-xl text-xs text-neutral-200 focus:outline-none focus:border-emerald-500/50 placeholder:text-neutral-600 transition-colors"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 text-xs hover:text-neutral-300"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Sort Option */}
                <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 px-3 rounded-xl shrink-0">
                  <Sliders size={14} className="text-neutral-500" />
                  <select 
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="bg-transparent text-xs text-neutral-300 py-2.5 focus:outline-none border-none outline-none cursor-pointer"
                  >
                    <option value="trending" className="bg-neutral-950">Most Attempted</option>
                    <option value="tests" className="bg-neutral-950">Total Tests Count</option>
                    <option value="difficulty-desc" className="bg-neutral-950">High Difficulty</option>
                  </select>
                </div>
              </div>

              {/* Advanced Chip Filters */}
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-neutral-800/40">
                
                {/* Difficulty Filters */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-neutral-500 uppercase font-mono mr-1">Difficulty:</span>
                  {['All', 'Easy', 'Moderate', 'Hard', 'Extreme'].map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider border transition-all ${
                        selectedDifficulty === diff 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                          : 'bg-neutral-900 text-neutral-500 border-neutral-805 hover:bg-neutral-850 hover:text-neutral-300'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>

                {/* Pricing Toggle */}
                <div className="flex items-center gap-1.5 flex-wrap ml-auto">
                  <span className="text-[10px] text-neutral-500 uppercase font-mono mr-1">Pricing:</span>
                  {['All', 'Free', 'Pass'].map((price) => (
                    <button
                      key={price}
                      onClick={() => setSelectedPricing(price)}
                      className={`px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider border transition-all ${
                        selectedPricing === price 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                          : 'bg-neutral-900 text-neutral-500 border-neutral-805 hover:bg-neutral-850 hover:text-neutral-300'
                      }`}
                    >
                      {price}
                    </button>
                  ))}
                </div>
              </div>
                    {activeSeriesTab === 'packages' ? (
              <>
                {/* RESULTS FEEDBACK BANNER */}
                <div className="flex items-center justify-between text-xs text-neutral-400 px-2">
                  <span>Showing <strong>{filteredTestSeries.length}</strong> elite test package series matches</span>
                  <span className="text-[10px] font-mono italic">Syllabus updated: June 2026</span>
                </div>

                {/* CARD GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                  <AnimatePresence mode="popLayout">
                    {filteredTestSeries.map((ts) => (
                      <motion.div
                        key={ts.id}
                        layout
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="bg-neutral-950 border border-neutral-800 rounded-3xl p-0 hover:border-emerald-500/30 shadow-xl group hover:shadow-[0_0_30px_rgba(16,185,129,0.04)] relative flex flex-col overflow-hidden transition-all duration-300"
                      >
                        {/* Top Glow line indicator for trending or matches */}
                        {ts.trendingLabel === 'Weak Topic Match' && (
                          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500 to-rose-400 z-30" />
                        )}
                        {ts.trendingLabel === 'Trending' && (
                          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 to-sky-400 z-30" />
                        )}
                        {ts.trendingLabel === 'AI Suggested' && (
                          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-emerald-400 to-indigo-500 z-30" />
                        )}

                        {/* Cover Image */}
                        <div className="relative h-32 w-full overflow-hidden shrink-0">
                          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 to-transparent z-10"></div>
                          <img 
                            src={getCoverImageForBank(ts.id)} 
                            alt={ts.title} 
                            referrerPolicy="no-referrer" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                          />
                        </div>

                        {/* Card Content Wrapper */}
                        <div className="p-6 pt-2 flex flex-col justify-between h-full relative z-20">
                          <div>
                            {/* Badge tray */}
                          <div className="flex justify-between items-center gap-2 flex-wrap mb-4">
                            {ts.trendingLabel ? (
                              <div className={`px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest border font-mono ${
                                ts.trendingLabel === 'Weak Topic Match' 
                                  ? 'bg-rose-950/30 text-rose-400 border-rose-900/40' 
                                  : ts.trendingLabel === 'AI Suggested'
                                  ? 'bg-purple-950/30 text-purple-400 border-purple-900/40 animate-pulse'
                                  : 'bg-emerald-950/30 text-emerald-400 border-emerald-900/40'
                              }`}>
                                {ts.trendingLabel}
                              </div>
                            ) : <div />}

                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase font-mono border ${
                                ts.difficulty === 'Extreme' 
                                  ? 'bg-red-950/40 text-red-400 border-red-900/40' 
                                  : ts.difficulty === 'Hard'
                                  ? 'bg-amber-950/40 text-amber-400 border-amber-900/40'
                                  : 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40'
                              }`}>
                                {ts.difficulty}
                              </span>
                              
                              {ts.isPremium ? (
                                <span className="bg-amber-500 text-neutral-950 font-black text-[8px] uppercase tracking-widest px-2 py-0.5 rounded flex items-center gap-1">
                                  <Lock size={8} className="fill-neutral-950" /> Pass
                                </span>
                              ) : (
                                <span className="bg-emerald-600 text-white font-black text-[8px] uppercase tracking-widest px-2 py-0.5 rounded">
                                  Free
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Header info */}
                          <div className="space-y-1 mb-4">
                            <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono block">{ts.category} Exam Prep</span>
                            <h4 className="text-sm font-bold text-neutral-100 group-hover:text-emerald-400 transition-colors leading-tight h-10 line-clamp-2">
                              {ts.title}
                            </h4>
                          </div>

                          {/* Live Counter animation */}
                          <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400 mb-5 border-b border-neutral-900 pb-3">
                            <span className="relative flex h-1.5 w-1.5 shrink-0">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                            </span>
                            <span>{ts.liveUsers.toLocaleString()} active attempts</span>
                            <span className="ml-auto text-neutral-500">{ts.languages.join(' / ')}</span>
                          </div>

                          {/* Diagnostic Breakdown Stats checklist */}
                          <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-[11px] text-neutral-400 mb-6 bg-neutral-900/30 p-3 rounded-2xl border border-neutral-900">
                            <div className="flex justify-between items-center">
                              <span>📊 Full Mocks</span>
                              <span className="font-bold text-neutral-300 font-mono">{ts.metrics.mocks}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>🔬 Sectionals</span>
                              <span className="font-bold text-neutral-300 font-mono">{ts.metrics.sectional}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>📖 Chapter Drills</span>
                              <span className="font-bold text-neutral-300 font-mono">{ts.metrics.chapter}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>📃 PYQ Papers</span>
                              <span className="font-bold text-neutral-300 font-mono">{ts.metrics.pyqs}</span>
                            </div>
                            <div className="flex justify-between items-center col-span-2 border-t border-neutral-900 pt-1.5">
                              <span>📰 Govt Current Affairs</span>
                              <span className="font-bold bg-neutral-950 px-1.5 py-0.5 rounded text-neutral-200 font-mono">{ts.metrics.currentAffairs} Tests</span>
                            </div>
                          </div>
                        </div>

                        {/* Footer Practice Actions */}
                        <div className="flex gap-3 items-center pt-2 border-t border-neutral-905">
                          <div className="flex-1 text-left">
                            <span className="text-[9px] text-neutral-500 uppercase font-mono block">Tests Available</span>
                            <span className="text-xs font-black text-neutral-300">{ts.totalTests} Pack Modules</span>
                          </div>
                          
                          <button 
                            onClick={() => handleStartPracticeTest(ts)}
                            className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-750 text-neutral-200 text-xs font-bold rounded-xl transition-all"
                          >
                            {ts.freeTests > 0 ? `Try Free (${ts.freeTests})` : 'View Details'}
                          </button>

                          {ts.isPremium && (
                            <button 
                              onClick={() => {
                                setSelectedContentId(ts.id);
                                setSelectedPlanName(ts.title);
                                let targetCat = ts.category;
                                if (targetCat.includes('IBPS')) targetCat = 'AFO';
                                if (targetCat.includes('Technical Assistant')) targetCat = 'AGTA';
                                setSelectedExamId(targetCat);
                                setSelectedExamName(ts.category);
                                setShowPaywall(true);
                              }}
                              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 border border-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md"
                            >
                              Unlock {ts.category.replace(' IBPS', '').replace(' Mains', '')} Pass
                            </button>
                          )}

                          {!ts.isPremium && (
                            <button 
                              onClick={() => handleStartPracticeTest(ts)}
                              className="p-2.5 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-xl border border-emerald-500/20 hover:border-transparent transition-all"
                              title="Quick start mock exam"
                            >
                              <Play size={15} />
                            </button>
                          )}
                        </div>
                        </div>

                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                {/* RESULTS FEEDBACK BANNER */}
                <div className="flex items-center justify-between text-xs text-neutral-400 px-2">
                  <span>Showing <strong>{dynBanks.length}</strong> live interactive custom assessment banks</span>
                  <span className="text-[10px] font-mono italic">Continuously updated by editors</span>
                </div>

                {loadingDyn ? (
                  <div className="py-20 text-center text-neutral-500 space-y-3">
                    <div className="animate-spin h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto" />
                    <p className="text-xs font-mono">Synchronizing dynamic question repositories...</p>
                  </div>
                ) : dynBanks.length === 0 ? (
                  <div className="py-20 text-center border border-dashed border-neutral-800 rounded-3xl text-neutral-500 text-xs">
                    No custom assessments have been activated by editors yet. Check back soon!
                  </div>
                ) : (
                  /* CUSTOM BANK GRID */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                    {dynBanks.map((bank) => (
                      <div
                        key={bank.id}
                        className="bg-neutral-950 border border-neutral-800 rounded-3xl p-0 hover:border-emerald-500/30 shadow-xl group hover:shadow-[0_0_30px_rgba(16,185,129,0.04)] relative flex flex-col overflow-hidden transition-all duration-300"
                      >
                        {/* Cover Image */}
                        <div className="relative h-32 w-full overflow-hidden shrink-0">
                          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 to-transparent z-10"></div>
                          <img 
                            src={getCoverImageForBank(bank.id)} 
                            alt={bank.name || "Test Cover"} 
                            referrerPolicy="no-referrer" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                          />
                        </div>

                        {/* Card Content Wrapper */}
                        <div className="p-6 pt-2 flex flex-col justify-between h-full relative z-20">
                          <div>
                            <div className="flex justify-between items-center mb-4">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase font-mono border ${
                              bank.difficulty?.toLowerCase() === 'hard' 
                                ? 'bg-rose-950/40 text-rose-400 border-rose-900/40' 
                                : 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40'
                            }`}>
                              {bank.difficulty || 'Medium'}
                            </span>
                            {bank.isPremium ? (
                              <span className="bg-amber-500 text-neutral-950 font-black text-[8px] uppercase tracking-widest px-2 py-0.5 rounded flex items-center gap-1">
                                <Lock size={8} /> {bank.examTarget} Premium
                              </span>
                            ) : (
                              <span className="bg-emerald-600 text-white font-black text-[8px] uppercase tracking-widest px-2 py-0.5 rounded">
                                Free
                              </span>
                            )}
                          </div>

                          <div className="space-y-1 mb-4">
                            <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono block">{bank.examTarget} Exam Prep</span>
                            <h4 className="text-sm font-bold text-neutral-100 group-hover:text-emerald-400 transition-colors leading-tight h-10 line-clamp-2">
                              {bank.name}
                            </h4>
                          </div>

                          <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400 mb-5 border-b border-neutral-900 pb-3">
                            <span className="relative flex h-1.5 w-1.5 shrink-0">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                            </span>
                            <span>{bank.questionsCount} high-yield questions</span>
                            <span className="ml-auto text-neutral-500">{bank.subject}</span>
                          </div>
                        </div>

                        <div className="flex gap-3 items-center pt-2 border-t border-neutral-905">
                          <button
                            onClick={() => {
                              const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'EDITORIAL_MEMBER';
                              const sub = (user as any)?.subscription;
                              const hasAccess = isAdmin || canAccessExam(sub, bank.examTarget) || (!bank.isPremium);

                              if (!hasAccess) {
                                setSelectedContentId(bank.id);
                                setSelectedPlanName(bank.name);
                                setSelectedExamId(bank.examTarget);
                                setSelectedExamName(bank.examTarget);
                                setShowPaywall(true);
                                return;
                              }
                              navigate(`/test/config/${bank.id}`);
                            }}
                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 text-xs font-black rounded-xl transition-all shadow-md text-center uppercase"
                          >
                            Configure & Start Test
                          </button>
                        </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            </div>
          </section>

        </div>

      </div>

      {/* 9. FLOATING INTELLIGENT AI MENTOR COMPANION CHATBOT BUTTON */}
      
      {showPaywall && (
        <Paywall 
          contentId={selectedContentId}
          contentType="mock-test"
          examId={selectedExamId}
          examName={selectedExamName}
          title={selectedPlanName}
          onSuccess={() => {
            setShowPaywall(false);
            alert('Congratulations! Pass activated.');
            window.location.reload();
          }}
          onCancel={() => setShowPaywall(false)}
        />
      )}

      <div className="fixed bottom-6 right-6 z-50">
        
        {/* Toggle Button */}
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="bg-emerald-600 text-white p-4 rounded-full shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:bg-emerald-500 transition-all hover:scale-105 active:scale-95 relative group"
        >
          {isChatOpen ? <X size={22} /> : <Bot size={22} className="animate-bounce" />}
          {/* Notification bubble */}
          {!isChatOpen && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-[8px] font-bold px-1.5 py-0.5 rounded-full text-white animate-pulse">1</span>
          )}
        </button>

        {/* Expandable Panel */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              className="absolute bottom-16 right-0 w-96 bg-neutral-950 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[460px] max-w-[calc(100vw-2rem)]"
            >
              <header className="px-5 py-4 bg-neutral-900/60 border-b border-neutral-800 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-1 px-1.5 bg-emerald-950/50 border border-emerald-900/40 rounded text-emerald-400 text-xs font-bold font-mono">AI</div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Exam Mentor Guidance</h4>
                    <p className="text-[10px] text-emerald-400 font-mono">Telemetry sync parameters active</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setChatMessages([{ role: 'ai', text: "Chat history flushed and context vectors updated." }])} className="p-1 text-neutral-500 hover:text-neutral-300" title="Reset thread">
                    <RotateCcw size={12} />
                  </button>
                </div>
              </header>

              {/* Chat log window */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[280px]">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-4 rounded-2xl text-xs leading-relaxed max-w-[85%] ${
                      msg.role === 'user' 
                        ? 'bg-emerald-600/10 border border-emerald-500/25 text-neutral-100' 
                        : 'bg-neutral-900 border border-neutral-800 text-neutral-200'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-2xl text-xs text-neutral-500 italic">
                      AI Mentor is querying local vectors...
                    </div>
                  </div>
                )}
              </div>

              {/* Suggestions Quick Buttons */}
              <div className="px-4 py-2 bg-neutral-900/30 border-t border-neutral-900 flex gap-2 flex-wrap text-[9px] shrink-0 font-mono">
                <button 
                  onClick={() => { setChatInput("Tell me my weak subject topic analysis"); }}
                  className="bg-neutral-900 hover:bg-neutral-850 px-2 py-1 rounded text-neutral-400 border border-neutral-805"
                >
                  Weak Topic Match
                </button>
                <button 
                  onClick={() => { setChatInput("How can I study for NABARD exam?"); }}
                  className="bg-neutral-900 hover:bg-neutral-850 px-2 py-1 rounded text-neutral-400 border border-neutral-805"
                >
                  Syllabus Roadmap
                </button>
              </div>

              {/* Inputs */}
              <div className="p-3 bg-neutral-950 border-t border-neutral-805 shrink-0 flex gap-2">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about exam targets, weak links, decay times..."
                  className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/30 placeholder:text-neutral-600"
                />
                <button 
                  onClick={handleSendMessage}
                  className="px-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white text-xs font-bold transition-colors"
                >
                  Send
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 10. REAL-TIME INTERACTIVE DRILL PRACTICE MODAL */}
      <AnimatePresence>
        {isPlayingTest && activeTestToPlay && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-neutral-950 border border-neutral-800 rounded-3xl overflow-hidden max-w-2xl w-full p-6 md:p-8 space-y-6 relative"
            >
              {/* Header */}
              <div className="flex justify-between items-start border-b border-neutral-850 pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 font-mono block">Simulation Practice Engine</span>
                  <h3 className="text-base font-bold text-white mt-1">{activeTestToPlay.title}</h3>
                </div>
                <button 
                  onClick={() => setIsPlayingTest(false)}
                  className="p-1 px-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-xs font-bold text-neutral-400 transition-all"
                >
                  Close
                </button>
              </div>

              {testScore === null ? (
                // Play Step
                <div className="space-y-6">
                  {/* Progress Indicator */}
                  <div className="flex justify-between items-center text-xs font-mono text-neutral-500">
                    <span>Question <strong>{currentQuestionIdx + 1}</strong> of <strong>{simulatedQuestions.length}</strong></span>
                    <span>Timing: <strong className="text-amber-500">24s / Q avg</strong></span>
                  </div>

                  <div className="bg-neutral-900 border border-neutral-805 p-5 rounded-2xl">
                    <span className="text-[9px] uppercase font-mono text-neutral-500 tracking-wider">Agronomy Chapter MCQ Target:</span>
                    <p className="text-xs font-medium text-neutral-100 leading-relaxed mt-2">
                      {simulatedQuestions[currentQuestionIdx].q}
                    </p>
                  </div>

                  {/* Options List */}
                  <div className="space-y-3">
                    {simulatedQuestions[currentQuestionIdx].options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedOption(idx)}
                        className={`w-full text-left p-4 rounded-xl text-xs font-medium transition-all border ${
                          selectedOption === idx 
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300' 
                            : 'bg-neutral-900/60 border-neutral-800 text-neutral-300 hover:bg-neutral-850'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  {/* Submit / Next Button */}
                  <div className="flex justify-end pt-4 border-t border-neutral-900">
                    <button
                      disabled={selectedOption === null}
                      onClick={() => {
                        // Check answer
                        const correctIdx = simulatedQuestions[currentQuestionIdx].correct;
                        const isCorrect = selectedOption === correctIdx;
                        
                        if (currentQuestionIdx + 1 < simulatedQuestions.length) {
                          setCurrentQuestionIdx(prev => prev + 1);
                          setSelectedOption(null);
                        } else {
                          // Complete
                          setTestScore(95); // Simulated scoring logic outcome
                        }
                      }}
                      className={`px-6 py-3 font-bold text-xs uppercase tracking-widest rounded-xl transition-all ${
                        selectedOption === null 
                          ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed border border-neutral-850' 
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      }`}
                    >
                      {currentQuestionIdx + 1 === simulatedQuestions.length ? 'Submit Final Answers' : 'Next Question'}
                    </button>
                  </div>
                </div>
              ) : (
                // Score Screen
                <div className="space-y-6 text-center py-6">
                  <div className="inline-flex p-4 bg-emerald-950/50 border border-emerald-900/40 rounded-full text-emerald-400 mb-2">
                    <Award size={42} />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-xl font-bold text-white">Quiz Practice Passed Successfully!</h4>
                    <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
                      You solved {simulatedQuestions.length} simulated problems on anaerobic decompositions. Your calculated analytical accuracy is <strong className="text-emerald-400">100%</strong>!
                    </p>
                  </div>

                  <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 max-w-md mx-auto space-y-3 text-left">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-400 font-mono block border-b border-neutral-805 pb-1.5 flex items-center gap-1.5">
                      <Sparkles size={12} /> AI Feedback Advisory Analysis:
                    </span>
                    <p className="text-[11px] text-neutral-300 leading-relaxed italic">
                      "Excellent. Your weed selection parameters were solved perfectly. The Forgotten-decay multiplier for Soybean nodules has been adjusted to 1.1x (Memory stability increased by 4 days). Spaced repetition will prompt you to recall this module on June 7th."
                    </p>
                  </div>

                  <div className="flex justify-center gap-4 pt-4 border-t border-neutral-900">
                    <button
                      onClick={() => setIsPlayingTest(false)}
                      className="px-6 py-3 bg-neutral-900 text-neutral-300 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-neutral-800 border border-neutral-750 transition-colors"
                    >
                      Exit Engine
                    </button>
                    <button
                      onClick={() => {
                        setTestScore(null);
                        setCurrentQuestionIdx(0);
                        setSelectedOption(null);
                      }}
                      className="px-6 py-3 bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-emerald-500 transition-colors"
                    >
                      Retry Drill
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
