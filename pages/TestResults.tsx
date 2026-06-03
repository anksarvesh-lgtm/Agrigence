import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../src/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, TrendingUp, CheckCircle2, AlertOctagon, HelpCircle, 
  Share2, ArrowDownToLine, RefreshCcw, Eye, Clock, BarChart3, 
  Map, ChevronRight, Compass, ShieldCheck 
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, 
  Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine 
} from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function TestResults() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [resultsData, setResultsData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'analytics' | 'topics' | 'time' | 'comparison'>('analytics');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadResults() {
      if (!sessionId) return;
      try {
        setLoading(true);
        const userId = auth.currentUser?.uid || 'guest';
        const historyRef = doc(db, 'users', userId, 'testHistory', sessionId);
        const snap = await getDoc(historyRef);

        if (snap.exists()) {
          setResultsData(snap.data());
        } else {
          // fallback if session is stored as guest but user has logged in
          const guestRef = doc(db, 'users', 'guest', 'testHistory', sessionId);
          const guestSnap = await getDoc(guestRef);
          if (guestSnap.exists()) {
            setResultsData(guestSnap.data());
          } else {
            console.error("Results snap not found at target history path.");
          }
        }
      } catch (err) {
        console.error("Error loading results:", err);
      } finally {
        setLoading(false);
      }
    }
    loadResults();
  }, [sessionId]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-neutral-100 flex-col gap-4">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
        <p className="text-stone-400 text-xs font-mono tracking-widest">Generating performance metrics...</p>
      </div>
    );
  }

  if (!resultsData) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-neutral-100 p-6">
        <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
          <div className="bg-amber-500/10 text-amber-500 p-4 rounded-full inline-block">
            <AlertOctagon size={32} />
          </div>
          <h3 className="text-lg font-bold text-neutral-100">Historical Metrics Lost</h3>
          <p className="text-neutral-400 text-sm">We could not retrieve details for this session. Make sure you completed the mock exam successfully.</p>
          <button 
            onClick={() => navigate('/test-series')}
            className="w-full bg-neutral-900 border border-neutral-850 hover:bg-neutral-850 py-3 rounded-2xl font-bold transition-all text-sm"
          >
            Go to Mock Hub
          </button>
        </div>
      </div>
    );
  }

  // Desired metrics variables
  const {
    percentage = 0,
    score = 0,
    totalMarks = 0,
    correct = 0,
    wrong = 0,
    skipped = 0,
    accuracy = 0,
    timeTakenSeconds = 0,
    rank = 12,
    totalRankPool = 4820,
    bankName = "Agriculture Mock Test",
    bankId = "",
    topicBreakdown = {},
    answers = []
  } = resultsData;

  const formattedTime = (totalSecs: number) => {
    const minutes = Math.floor(totalSecs / 60);
    const seconds = totalSecs % 60;
    return `${minutes} mins ${seconds} secs`;
  };

  const getPercentageColor = (pct: number) => {
    if (pct >= 90) return 'text-emerald-400 border-emerald-500/30';
    if (pct >= 75) return 'text-emerald-500 border-emerald-600/20';
    if (pct >= 60) return 'text-amber-500 border-amber-600/20';
    return 'text-rose-500 border-rose-600/20';
  };

  const getPercentageMessage = (pct: number) => {
    if (pct >= 90) return 'Outstanding Performance!';
    if (pct >= 75) return 'Excellent Work!';
    if (pct >= 60) return 'Well Done!';
    if (pct >= 40) return 'Passed. Keep Practicing!';
    return 'Needs Improvement.';
  };

  const getPercentageGradeLabel = (pct: number) => {
    if (pct >= 90) return 'A+';
    if (pct >= 75) return 'A';
    if (pct >= 60) return 'B';
    if (pct >= 40) return 'C';
    return 'F';
  };

  // 1. Recharts Pie Chart Data
  const donutData = [
    { name: 'Correct', value: correct, color: '#10b981' },
    { name: 'Wrong', value: wrong, color: '#ef4444' },
    { name: 'Skipped', value: skipped, color: '#eab308' },
  ];

  // 2. Subject/Topic Breakdown Data
  const breakdownEntries = Object.entries(topicBreakdown);
  const topicChartData = breakdownEntries.map(([topic, metrics]: [string, any]) => ({
    name: topic.length > 10 ? `${topic.substring(0, 10)}...` : topic,
    score: Math.round(metrics.pct || 0),
    correct: metrics.correct,
    total: metrics.total
  }));

  // Identify Strongest & Weakest topics
  let strongestTopic = "N/A";
  let weakestTopic = "N/A";
  if (breakdownEntries.length > 0) {
    const sorted = [...breakdownEntries].sort((a: any, b: any) => b[1].pct - a[1].pct);
    strongestTopic = sorted[0][0];
    weakestTopic = sorted[sorted.length - 1][0];
  }

  // 3. Time Spent per question timeline mapping data
  const timeBarChartData = answers.map((ans: any, idx: number) => ({
    name: `Q${idx + 1}`,
    time: ans.timeTakenSeconds || 0,
    fill: (ans.timeTakenSeconds || 0) > 120 ? '#ef4444' : '#10b981'
  }));

  const totalQuestions = answers.length;
  const avgTimePerQuestion = totalQuestions > 0 ? Math.round(timeTakenSeconds / totalQuestions) : 0;

  // Fastest vs Slowest questions
  let fastestQ = { index: 0, seconds: 999999 };
  let slowestQ = { index: 0, seconds: 0 };
  let questionsTooLongCount = 0;

  answers.forEach((ans: any, idx: number) => {
    const seconds = ans.timeTakenSeconds || 0;
    if (seconds > 0) {
      if (seconds < fastestQ.seconds) {
        fastestQ = { index: idx + 1, seconds };
      }
      if (seconds > slowestQ.seconds) {
        slowestQ = { index: idx + 1, seconds };
      }
    }
    if (seconds > 120) {
      questionsTooLongCount++;
    }
  });

  const fastestText = fastestQ.seconds === 999999 ? "N/A" : `Q${fastestQ.index} — ${fastestQ.seconds}s`;
  const slowestText = slowestQ.seconds === 0 ? "N/A" : `Q${slowestQ.index} — ${formattedTime(slowestQ.seconds)}`;

  // Share score action
  const handleShareScore = async () => {
    const text = `I completed the ${bankName} Mock Assessment on AgriTest!\n🎯 Score: ${percentage.toFixed(0)}% (Grade: ${getPercentageGradeLabel(percentage)})\n✅ Correct: ${correct} | ❌ Wrong: ${wrong}\n🏆 Rank: #${rank} / ${totalRankPool}\n\nPrepare with proctored simulators on AgriTest 👉 agritest.in`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My AgriTest Performance Score',
          text: text,
        });
        triggerToast("Score shared successfully!");
      } catch (err) {
        console.log("Web Share cancelled/failed");
      }
    } else {
      await navigator.clipboard.writeText(text);
      triggerToast("Score details copied to Clipboard!");
    }
  };

  // PDF report downloader
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF() as any;
      
      // Document branding
      doc.setFillColor(16, 185, 129); // emerald green
      doc.rect(0, 0, 220, 28, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("AgriTest Academic Report", 14, 18);
      
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated on ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 140, 18);
      
      // Test details
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(14);
      doc.text("Assessment Performance Summary", 14, 40);
      doc.setFontSize(11);
      doc.text(`Mock Title: ${bankName}`, 14, 47);
      doc.text(`Total Questions: ${answers.length}`, 14, 52);
      doc.text(`Completed In: ${formattedTime(timeTakenSeconds)}`, 14, 57);
      
      // Stats Table
      const statsHeaders = [["Parameter", "Metric Details"]];
      const statsRows = [
        ["Total Assessment Marks", `${totalMarks}`],
        ["Marks Obtained", `${score.toFixed(2)}`],
        ["Scoring Percentage", `${percentage.toFixed(1)}%`],
        ["Grading Label", `${getPercentageGradeLabel(percentage)} - ${getPercentageMessage(percentage)}`],
        ["Accuracy Ratio", `${accuracy.toFixed(1)}%`],
        ["Correct Submissions", `${correct}`],
        ["Incorrect Entries", `${wrong}`],
        ["Skipped Queries", `${skipped}`],
        ["Global Rank Pool", `#${rank} of ${totalRankPool}`]
      ];
      
      doc.autoTable({
        startY: 65,
        head: statsHeaders,
        body: statsRows,
        theme: 'striped',
        headStyles: { fillColor: [40, 40, 40] }
      });
      
      // Topic Breakdown Table
      const topicHeaders = [["Diagnostic Category", "Correct Answers", "Total Questions", "Percentage Score"]];
      const topicRows = breakdownEntries.map(([topic, metrics]: [string, any]) => [
        topic,
        `${metrics.correct}`,
        `${metrics.total}`,
        `${metrics.pct.toFixed(0)}%`
      ]);
      
      doc.setFontSize(14);
      doc.text("Diagnostic Category Performance", 14, doc.autoTable.previous.finalY + 15);
      
      doc.autoTable({
        startY: doc.autoTable.previous.finalY + 20,
        head: topicHeaders,
        body: topicRows,
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129] }
      });

      // Quick Notice footer
      const lastY = doc.autoTable.previous.finalY;
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text("AgriTest Competitive AI Labs © 2026. All academic evaluation parameters are strictly verified.", 14, lastY + 20);
      doc.text("Review individual step explanations by launching review mode in your web browser interface directly.", 14, lastY + 25);

      doc.save(`AgriTest-Report-${sessionId}.pdf`);
      triggerToast("Academic Evaluation PDF saved successfully!");
    } catch (err) {
      console.error(err);
      triggerToast("Failed to compile evaluation details into PDF file context.");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 font-sans selection:bg-emerald-500/30 p-4 md:p-6 pb-20">
      
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Toast Alerts Overlay */}
        <AnimatePresence>
          {toastMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-6 left-1/2 -translate-x-1/2 bg-neutral-950 border border-emerald-500/30 text-emerald-400 px-6 py-3 rounded-full text-xs font-mono font-bold uppercase tracking-wider shadow-2xl z-50 flex items-center gap-2"
            >
              <CheckCircle2 size={14} /> {toastMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* HERO GREEN GRADIENT HEADER */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-950/40 via-neutral-950 to-neutral-950 border border-emerald-500/10 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-4 text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-xs font-bold text-emerald-400 font-mono tracking-wider uppercase">
              <ShieldCheck size={14} className="animate-pulse" /> Mock Evaluation Safe
            </div>
            <div className="space-y-1">
              <h1 className="text-xl md:text-2xl font-black text-neutral-100 tracking-tight leading-tight">{bankName}</h1>
              <p className="text-xs text-neutral-400 font-mono">Attempt took {formattedTime(timeTakenSeconds)}</p>
            </div>
            <h2 className="text-lg font-bold text-emerald-400 font-mono uppercase tracking-widest animate-pulse">
              "{getPercentageMessage(percentage)}"
            </h2>
          </div>

          {/* Central Score Ring layout */}
          <div className="shrink-0 flex flex-col items-center justify-center p-4 bg-neutral-900/40 border border-neutral-850 rounded-2xl relative w-48 h-48 md:w-52 md:h-52">
            <div className="absolute inset-2 rounded-full border border-neutral-800" />
            
            <span className="text-4xl font-black tracking-tighter text-emerald-400 font-mono">
              {percentage.toFixed(0)}<span className="text-lg text-emerald-600">%</span>
            </span>
            
            <span className="text-[10px] text-neutral-500 font-mono block uppercase mt-1">Marks Obtained</span>
            <span className="text-xs font-bold text-neutral-200 block">{score.toFixed(2)} / {totalMarks}</span>

            {/* Sub-label Rank */}
            <div className="mt-3 text-[10px] bg-neutral-950 border border-neutral-850 px-3 py-1 rounded-full text-neutral-400 font-mono tracking-wide">
              Grade: <strong className="text-emerald-400 font-black">{getPercentageGradeLabel(percentage)}</strong> • Rank #{rank}
            </div>
          </div>
        </div>

        {/* METRICS GRID STATUS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-neutral-950 border border-neutral-850 p-4 rounded-2xl relative overflow-hidden group">
            <span className="text-[9px] text-neutral-500 font-mono block uppercase mb-1">Correct Answers</span>
            <span className="text-xl font-black text-emerald-400 font-mono">{correct}</span>
            <span className="text-[9px] text-neutral-600 block font-mono mt-0.5">+{correct * 1.0} total score increment</span>
          </div>

          <div className="bg-neutral-950 border border-neutral-850 p-4 rounded-2xl relative overflow-hidden group">
            <span className="text-[9px] text-neutral-500 font-mono block uppercase mb-1">Incorrect Answers</span>
            <span className="text-xl font-black text-rose-500 font-mono">{wrong}</span>
            <span className="text-[9px] text-neutral-600 block font-mono mt-0.5">-{wrong * 0.25} negative deduction</span>
          </div>

          <div className="bg-neutral-950 border border-neutral-850 p-4 rounded-2xl relative overflow-hidden group">
            <span className="text-[9px] text-neutral-500 font-mono block uppercase mb-1">Skipped Queries</span>
            <span className="text-xl font-black text-amber-500 font-mono">{skipped}</span>
            <span className="text-[9px] text-neutral-600 block font-mono mt-0.5">0 penalty applied</span>
          </div>

          <div className="bg-neutral-950 border border-neutral-850 p-4 rounded-2xl relative overflow-hidden group">
            <span className="text-[9px] text-neutral-500 font-mono block uppercase mb-1">Accuracy Index</span>
            <span className="text-xl font-black text-neutral-100 font-mono">{accuracy.toFixed(1)}%</span>
            <span className="text-[9px] text-neutral-600 block font-mono mt-0.5">Correct over answered ratio</span>
          </div>
        </div>

        {/* NAVIGATION TAB CONTROLS */}
        <div className="flex border-b border-neutral-800 gap-1 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-5 py-3 text-xs font-bold font-mono tracking-wider uppercase shrink-0 transition-all ${
              activeTab === 'analytics' ? 'border-b-2 border-emerald-500 text-emerald-400' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('topics')}
            className={`px-5 py-3 text-xs font-bold font-mono tracking-wider uppercase shrink-0 transition-all ${
              activeTab === 'topics' ? 'border-b-2 border-emerald-500 text-emerald-400' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Topic Breakdown
          </button>
          <button
            onClick={() => setActiveTab('time')}
            className={`px-5 py-3 text-xs font-bold font-mono tracking-wider uppercase shrink-0 transition-all ${
              activeTab === 'time' ? 'border-b-2 border-emerald-500 text-emerald-400' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Time Analysis
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-5 py-3 text-xs font-bold font-mono tracking-wider uppercase shrink-0 transition-all ${
              activeTab === 'comparison' ? 'border-b-2 border-emerald-500 text-emerald-400' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Class Comparison
          </button>
        </div>

        {/* TAB PANELS CONTAINER */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-5 md:p-6 shadow-xl">
          
          {/* A. ANALYTICS PANEL */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Donut Area */}
                <div className="space-y-2 text-center md:text-left">
                  <h3 className="text-sm font-bold text-neutral-200">Answer Distribution</h3>
                  <p className="text-xs text-neutral-400">Proportional correct vs wrong vs skipped indices breakdown</p>
                  
                  <div className="h-44 md:h-48 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={donutData}
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {donutData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', color: '#fff' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Info summary */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-neutral-200">High Resolution Indicators</h3>
                  <div className="space-y-3">
                    <div className="bg-neutral-900/50 p-3.5 rounded-xl border border-neutral-850 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-neutral-500 uppercase font-mono">Strongest Zone</span>
                        <span className="text-xs font-bold text-emerald-400 block">{strongestTopic}</span>
                      </div>
                      <span className="text-xs font-bold px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg">Optimal</span>
                    </div>

                    <div className="bg-neutral-900/50 p-3.5 rounded-xl border border-neutral-850 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-neutral-500 uppercase font-mono">Weakest Area</span>
                        <span className="text-xs font-bold text-rose-400 block">{weakestTopic}</span>
                      </div>
                      <span className="text-xs font-bold px-2 py-1 bg-rose-500/10 text-rose-400 rounded-lg">Review Suggested</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* B. TOPICS PANEL */}
          {activeTab === 'topics' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-bold text-neutral-200">Subject Category Insights</h3>
                <p className="text-xs text-neutral-400">Evaluating correct ratios mapped by individual question modules</p>
              </div>

              {topicChartData.length > 0 ? (
                <div className="space-y-4">
                  <div className="h-52 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topicChartData} barSize={26}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                        <XAxis dataKey="name" stroke="#525252" fontSize={11} />
                        <YAxis stroke="#525252" fontSize={11} domain={[0, 100]} />
                        <Tooltip formatter={(value) => [`${value}%`, 'Score']} contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', color: '#fff' }} />
                        <Bar dataKey="score" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* List breakdown style list */}
                  <div className="space-y-2.5">
                    {breakdownEntries.map(([topic, metrics]: [string, any]) => (
                      <div key={topic} className="bg-neutral-900/30 border border-neutral-850/80 p-3.5 rounded-xl flex items-center justify-between">
                        <span className="text-xs font-black text-neutral-300">{topic}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-mono font-bold text-neutral-500">{metrics.correct} / {metrics.total} Correct</span>
                          <span className={`text-xs font-black px-2 py-0.5 rounded ${metrics.pct >= 75 ? 'bg-emerald-500/10 text-emerald-400' : metrics.pct >= 50 ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'}`}>{metrics.pct.toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-neutral-500">No category tags inside JSON bank payload.</p>
              )}
            </div>
          )}

          {/* C. TIME ANALYSIS PANEL */}
          {activeTab === 'time' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-neutral-900 p-3.5 rounded-xl border border-neutral-850">
                  <span className="text-[10px] text-neutral-500 uppercase font-mono block">Avg. Pacing</span>
                  <span className="text-sm font-bold text-emerald-400">{avgTimePerQuestion}s / Q</span>
                </div>
                <div className="bg-neutral-900 p-3.5 rounded-xl border border-neutral-850">
                  <span className="text-[10px] text-neutral-500 uppercase font-mono block">Fastest Question</span>
                  <span className="text-sm font-bold text-neutral-200">{fastestText}</span>
                </div>
                <div className="bg-neutral-900 p-3.5 rounded-xl border border-neutral-850">
                  <span className="text-[10px] text-neutral-500 uppercase font-mono block">Slowest Question</span>
                  <span className="text-sm font-bold text-rose-400">{slowestText}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-neutral-300">Section Timeline chart (Time spent per question)</h4>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={timeBarChartData} barSize={20}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                      <XAxis dataKey="name" stroke="#525252" fontSize={11} />
                      <YAxis stroke="#525252" fontSize={11} label={{ value: 'seconds', angle: -90, position: 'insideLeft', fill: '#525252' }} />
                      <Tooltip formatter={(value) => [`${value} seconds`, 'Duration']} contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', color: '#fff' }} />
                      <Bar dataKey="time" radius={[3, 3, 0, 0]}>
                        {timeBarChartData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                      <ReferenceLine y={120} stroke="#ef4444" strokeDasharray="3 3" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                {questionsTooLongCount > 0 && (
                  <div className="bg-rose-950/20 text-rose-400 border border-rose-900/30 p-3.5 rounded-xl flex items-center gap-2 mt-3 text-xs leading-normal">
                    <Clock size={16} /> You spent more than 2 minutes on {questionsTooLongCount} questions. High density time was recorded on these modules and they represent potential review targets.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* D. COMPARISON PANEL */}
          {activeTab === 'comparison' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-bold text-neutral-200">Percentile Class Comparison</h3>
                <p className="text-xs text-neutral-400 font-mono">Assessing your outcome score vs global testing averages</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-3.5">
                  <div>
                    <div className="flex justify-between text-xs text-neutral-400 mb-1.5">
                      <span>Our top 10% Percentile bar</span>
                      <span className="font-extrabold text-neutral-200 font-mono">91% score average</span>
                    </div>
                    <div className="h-2 w-full bg-neutral-900 rounded-full overflow-hidden border border-neutral-850">
                      <div className="h-full bg-emerald-500/20" style={{ width: '91%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-neutral-400 mb-1.5">
                      <span>Your Evaluation Score mark</span>
                      <span className="font-extrabold text-emerald-400 font-mono">{percentage.toFixed(0)}% score</span>
                    </div>
                    <div className="h-2 w-full bg-neutral-900 rounded-full overflow-hidden border border-neutral-850">
                      <div className="h-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-neutral-400 mb-1.5">
                      <span>Class Average standard</span>
                      <span className="font-extrabold text-neutral-400 font-mono">62% score</span>
                    </div>
                    <div className="h-2 w-full bg-neutral-900 rounded-full overflow-hidden border border-neutral-850">
                      <div className="h-full bg-neutral-700 font-mono" style={{ width: '62%' }} />
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-900 border border-neutral-850 p-4 rounded-xl flex items-center justify-between text-xs">
                  <span>Rank performance delta</span>
                  <span className="text-emerald-400 font-bold">↑ 4 positions gained from aggregate class metrics</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* BOTTOM ACTION TRIGGERS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          <button
            onClick={() => navigate(`/test/review/${sessionId}`)}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-black tracking-widest py-3.5 rounded-2xl flex items-center justify-center gap-2 text-xs transition-all shadow-xl uppercase"
          >
            <Eye size={14} className="stroke-[3]" /> Review Answers
          </button>

          <button
            onClick={() => navigate(`/test/config/${bankId}`)}
            className="w-full bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 text-neutral-200 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 text-xs transition-all uppercase"
          >
            <RefreshCcw size={14} /> Reattempt Practice
          </button>

          <button
            onClick={handleShareScore}
            className="w-full bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 text-neutral-200 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 text-xs transition-all uppercase"
          >
            <Share2 size={14} /> Share Results
          </button>

          <button
            onClick={handleDownloadPDF}
            className="w-full bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 text-neutral-200 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 text-xs transition-all uppercase"
          >
            <ArrowDownToLine size={14} /> Download PDF
          </button>
        </div>

      </div>

    </div>
  );
}
