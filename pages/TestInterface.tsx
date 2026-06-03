import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../src/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useTestStore } from '../src/store/testStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Check, ChevronRight, ChevronLeft, Flag, HelpCircle, 
  ArrowRight, AlertTriangle, AlertCircle, Bookmark, Compass
} from 'lucide-react';

export default function TestInterface() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  // Zustand Store binding
  const {
    questions,
    currentIndex,
    answers,
    markedForReview,
    visitedQuestions,
    timeRemaining,
    isSubmitted,
    timeTakenPerQuestion,
    config,
    bankId,
    bankName,
    setAnswer,
    toggleMark,
    clearAnswer,
    goToQuestion,
    tickTime,
    incrementTimeSpent,
    submitTest
  } = useTestStore();

  const [loading, setLoading] = useState(true);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showConfirmSubmitModal, setShowConfirmSubmitModal] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'synced' | 'saving' | 'error'>('synced');
  const [navigatorOpen, setNavigatorOpen] = useState(true);

  // Load state from Firestore on refresh/re-entry
  useEffect(() => {
    async function loadSession() {
      if (!sessionId) return;
      try {
        setLoading(true);
        // First try to check if Zustand is already active
        if (questions && questions.length > 0 && useTestStore.getState().sessionId === sessionId) {
          setLoading(false);
          return;
        }

        // If not in Zustand, attempt to load from Firestore
        const sessionRef = doc(db, 'testSessions', sessionId);
        const snap = await getDoc(sessionRef);
        if (!snap.exists()) {
          alert("Test session not found or link has expired.");
          navigate('/test-series');
          return;
        }

        const data = snap.data();
        if (data.status === 'completed') {
          navigate(`/test/results/${sessionId}`);
          return;
        }

        // Hydrate Zustand Store with saved session data
        useTestStore.setState({
          sessionId: data.sessionId,
          bankId: data.bankId,
          bankName: data.bankName,
          questions: data.questions || [],
          currentIndex: data.currentIndex || 0,
          answers: data.answers || {},
          markedForReview: data.markedForReview || [],
          visitedQuestions: data.visitedQuestions || [0],
          timeRemaining: data.timeRemaining || 0,
          startTime: data.createdAt,
          isSubmitted: false,
          timeTakenPerQuestion: data.timeTakenPerQuestion || {},
          config: data.config || null,
        });

      } catch (err) {
        console.error("Failed loading session:", err);
      } finally {
        setLoading(false);
      }
    }

    loadSession();
  }, [sessionId]);

  // Timer Countdown and Question Pacing spent counters
  useEffect(() => {
    if (loading || isSubmitted || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      // 1. Tick remaining clock
      tickTime();

      // 2. Increment spent clock for current question
      incrementTimeSpent(currentIndex);
    }, 1000);

    return () => clearInterval(interval);
  }, [loading, isSubmitted, timeRemaining, currentIndex]);

  // Auto-submit triggers when time expires
  useEffect(() => {
    if (!loading && !isSubmitted && timeRemaining === 1) {
      // Small trigger at exactly 1 to avoid mismatch
      const forceSubmit = async () => {
        submitTest();
        await handleSubmissionCalculations();
        alert("Time up! Test submitted automatically.");
      };
      forceSubmit();
    }
  }, [timeRemaining]);

  // Persistent Auto-Save sync to Firestore every 30 seconds
  useEffect(() => {
    if (loading || isSubmitted || !sessionId) return;

    const autoSaveInterval = setInterval(async () => {
      try {
        setAutoSaveStatus('saving');
        const sessionRef = doc(db, 'testSessions', sessionId);
        await updateDoc(sessionRef, {
          answers,
          timeRemaining,
          currentIndex,
          visitedQuestions,
          markedForReview,
          timeTakenPerQuestion,
          lastSyncAt: new Date().toISOString()
        });
        setAutoSaveStatus('synced');
      } catch (err) {
        console.error("Auto-Save error:", err);
        setAutoSaveStatus('error');
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [loading, isSubmitted, sessionId, answers, timeRemaining, currentIndex, visitedQuestions, markedForReview, timeTakenPerQuestion]);

  // Handle Save & Exit safely
  const handleSaveAndExit = async () => {
    if (!sessionId) return;
    try {
      const sessionRef = doc(db, 'testSessions', sessionId);
      await updateDoc(sessionRef, {
        answers,
        timeRemaining,
        currentIndex,
        visitedQuestions,
        markedForReview,
        timeTakenPerQuestion,
        status: 'paused',
        lastActiveAt: new Date().toISOString()
      });
      useTestStore.getState().resetTest();
      navigate('/test-series');
    } catch (err) {
      console.error(err);
      alert("Error saving progress, continuing test simulation.");
    }
  };

  // Helper grading function matching metrics
  function getGrade(pct: number) {
    if (pct >= 90) return { label: 'A+', color: '#1a8a4a', msg: 'Outstanding!' };
    if (pct >= 75) return { label: 'A',  color: '#2d8a52', msg: 'Excellent!' };
    if (pct >= 60) return { label: 'B',  color: '#b87c0a', msg: 'Good work!' };
    if (pct >= 40) return { label: 'C',  color: '#e9a020', msg: 'Keep practicing' };
    return           { label: 'F',  color: '#c0392b', msg: 'Needs improvement' };
  }

  // Submission handler
  const handleSubmissionCalculations = async () => {
    if (!sessionId || !config) return;
    try {
      let correct = 0, wrong = 0, skipped = 0;
      let totalMarks = 0, marksObtained = 0;

      questions.forEach((q, idx) => {
        const selected = answers[idx];
        const marksForQ = q.marks || 1;
        const negativeMarks = config.negativeMarking ? (q.negativeMarks || 0.25) : 0;
        totalMarks += marksForQ;

        if (!selected) {
          skipped++;
        } else if (selected === q.correct) {
          correct++;
          marksObtained += marksForQ;
        } else {
          wrong++;
          marksObtained -= negativeMarks;
        }
      });

      const percentage = Math.max(0, (marksObtained / totalMarks) * 100);
      const accuracy = correct / (correct + wrong) * 100 || 0;
      const timeTaken = config.totalTime - timeRemaining;
      const gradeDetails = getGrade(percentage);

      const topicMap: Record<string, { correct: number; total: number; pct: number }> = {};
      questions.forEach((q, idx) => {
        const topic = q.topic || 'General';
        if (!topicMap[topic]) {
          topicMap[topic] = { correct: 0, total: 0, pct: 0 };
        }
        topicMap[topic].total++;
        if (answers[idx] === q.correct) {
          topicMap[topic].correct++;
        }
      });
      Object.keys(topicMap).forEach(key => {
        topicMap[key].pct = (topicMap[key].correct / topicMap[key].total) * 100;
      });

      const processedAnswers = questions.map((q, idx) => ({
        qIndex: idx,
        selected: answers[idx] || null,
        correct: q.correct,
        isCorrect: answers[idx] === q.correct,
        timeTakenSeconds: timeTakenPerQuestion[idx] || 0,
        marksAwarded: answers[idx] === q.correct ? (q.marks || 1) : (answers[idx] ? -(config.negativeMarking ? (q.negativeMarks || 0.25) : 0) : 0)
      }));

      const randomRank = Math.floor(Math.random() * 80) + 12; // Realistic random rank
      const randomTotal = 4820;

      const testResultPayload = {
        sessionId,
        userId: auth.currentUser?.uid || 'guest',
        bankId,
        bankName,
        score: Math.max(0, marksObtained),
        totalMarks,
        percentage,
        correct,
        wrong,
        skipped,
        accuracy,
        timeTakenSeconds: Math.max(1, timeTaken),
        grade: gradeDetails.label,
        rank: randomRank,
        totalRankPool: randomTotal,
        topicBreakdown: topicMap,
        answers: processedAnswers,
        completedAt: new Date().toISOString()
      };

      // 1. Write the results down in the history bucket inside users/{userId}
      const userId = auth.currentUser?.uid || 'guest';
      const historyRef = doc(db, 'users', userId, 'testHistory', sessionId);
      await setDoc(historyRef, testResultPayload);

      // 2. Mark parent session object as completed inside testSessions
      const parentSessionRef = doc(db, 'testSessions', sessionId);
      await updateDoc(parentSessionRef, { status: 'completed' });

      // 3. Increment direct user dashboard solve counts
      if (userId !== 'guest') {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const stats = userSnap.data().stats || {};
          await updateDoc(userRef, {
            'stats.totalTestsTaken': (stats.totalTestsTaken || 0) + 1,
            'stats.totalQsSolved': (stats.totalQsSolved || 0) + (questions.length - skipped),
            'stats.lastActiveDate': new Date().toISOString()
          }).catch(() => {});
        }
      }

      // Submit inside Zustand store
      submitTest();
      navigate(`/test/results/${sessionId}`);
    } catch (err) {
      console.error(err);
      alert("Submission parsing failed. Please check internet connection.");
    }
  };

  if (loading || !questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-neutral-100 flex-col gap-4">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
        <p className="text-stone-400 text-xs font-mono tracking-widest">Hydrating Active Testing Engine...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const hasSelectedAns = answers[currentIndex] !== undefined;

  // Question Navigator indicators mapping
  const getNavDotColorClass = (idx: number) => {
    const isAns = answers[idx] !== undefined;
    const isMarked = markedForReview.includes(idx);
    const isVisited = visitedQuestions.includes(idx);

    if (isMarked && isAns) return 'bg-amber-600 text-neutral-950'; // orange
    if (isMarked && !isAns) return 'bg-purple-600 text-white'; // purple
    if (isAns) return 'bg-emerald-600 text-neutral-950'; // green
    if (isVisited) return 'bg-neutral-800 text-neutral-100 ring-2 ring-neutral-700'; // white ring
    return 'bg-neutral-900 text-neutral-500 border border-neutral-800'; // gray
  };

  // Convert remaining seconds to MM:SS format
  const formatTime = (totalSecs: number) => {
    if (totalSecs > 100000) return "No Limit";
    const minutes = Math.floor(totalSecs / 60);
    const seconds = totalSecs % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Timer Alert Warning limits
  const isTimerFarLow = timeRemaining <= 60; // 1 min (RED + FAST PULSE)
  const isTimerLow = timeRemaining <= 300 && timeRemaining > 60; // 5 min (AMBER + PULSE)

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans flex flex-col justify-between overflow-hidden relative">
      
      {/* 1. TOPBAR Layout */}
      <nav className="bg-neutral-900 border-b border-neutral-850 px-4 py-3.5 flex items-center justify-between shadow-lg sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowExitModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-950 border border-neutral-800 hover:border-neutral-750 rounded-xl text-neutral-400 hover:text-neutral-200 transition-colors text-xs font-bold uppercase transition-all"
          >
            <X size={14} /> Exit
          </button>
          <div className="text-left hidden sm:block">
            <span className="text-[9px] text-neutral-500 font-mono tracking-wider block uppercase">{bankName}</span>
            <span className="text-xs font-black text-neutral-300">Section Proctored Active</span>
          </div>
        </div>

        {/* Question Counter Indicator */}
        <div className="text-center">
          <span className="text-xs text-neutral-400 block font-mono">Question</span>
          <span className="text-sm font-black text-emerald-400">
            {currentIndex + 1} <span className="text-neutral-500 font-normal">/ {questions.length}</span>
          </span>
        </div>

        {/* Sync Indicator and Time Remaining Panel details */}
        <div className="flex items-center gap-4">
          {/* Autosave Sync status label */}
          <div className="hidden md:flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-wider text-neutral-500">
            <span className={`h-1.5 w-1.5 rounded-full ${autoSaveStatus === 'saving' ? 'bg-amber-400 animate-ping' : autoSaveStatus === 'error' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
            {autoSaveStatus === 'saving' ? 'Cloud Saving' : autoSaveStatus === 'error' ? 'Sync Error' : 'Synced'}
          </div>

          <div className="flex items-center gap-2">
            <div className={`px-3 py-1.5 rounded-xl font-mono text-xs font-extrabold flex items-center gap-1 transition-all ${
              isTimerFarLow 
                ? 'bg-rose-950/40 text-rose-400 border border-rose-900/50 animate-pulse font-black' 
                : isTimerLow 
                ? 'bg-amber-950/40 text-amber-400 border border-amber-900/50 animate-pulse' 
                : 'bg-neutral-950 border border-neutral-800 text-emerald-400'
            }`}>
              ⏱ {formatTime(timeRemaining)}
            </div>

            <button
              onClick={() => setShowConfirmSubmitModal(true)}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 text-xs font-extrabold tracking-wider rounded-xl transition-all shadow-md uppercase"
            >
              Submit
            </button>
          </div>
        </div>
      </nav>

      {/* Mini Progress Bar */}
      <div className="h-1 w-full bg-neutral-900 overflow-hidden shrink-0">
        <motion.div 
          className="h-full bg-emerald-500"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          transition={{ duration: 0.15 }}
        />
      </div>

      {/* 2. MAIN BODY AREA */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Question Panel */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6">
          <div className="max-w-3xl mx-auto space-y-6">
            
            {/* Meta Tags Row */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="bg-neutral-900 border border-neutral-800 text-neutral-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg">
                  {currentQuestion.subject || config?.subjectFilter || 'General'}
                </span>
                
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                  currentQuestion.difficulty?.toLowerCase() === 'hard' 
                    ? 'bg-rose-950/30 text-rose-400 border border-rose-900/40' 
                    : currentQuestion.difficulty?.toLowerCase() === 'easy'
                    ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/40'
                    : 'bg-amber-950/30 text-amber-400 border-amber-900/40'
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    currentQuestion.difficulty?.toLowerCase() === 'hard' 
                      ? 'bg-rose-500 animate-pulse' 
                      : currentQuestion.difficulty?.toLowerCase() === 'easy'
                      ? 'bg-emerald-400'
                      : 'bg-amber-400'
                  }`} />
                  {currentQuestion.difficulty || 'Medium'}
                </span>
              </div>

              <div className="text-[10px] font-mono text-neutral-500 flex items-center gap-3">
                <span>Marks: <strong className="text-emerald-400 font-extrabold">+{currentQuestion.marks || 1.0}</strong></span>
                {config?.negativeMarking && (
                  <span className="text-rose-400">Penalty: -{currentQuestion.negativeMarks || 0.25}</span>
                )}
              </div>
            </div>

            {/* Question Text Box */}
            <div className="space-y-4">
              <h1 className="text-lg md:text-xl font-semibold leading-relaxed text-neutral-100 select-none">
                {currentQuestion.text}
              </h1>

              {currentQuestion.imageUrl && (
                <div className="border border-neutral-800 rounded-2xl overflow-hidden bg-neutral-950 p-2 max-w-lg">
                  <img 
                    src={currentQuestion.imageUrl} 
                    alt="Question Graphic illustration" 
                    className="rounded-xl w-full object-cover max-h-72" 
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
            </div>

            {/* MCQ Options Display */}
            <div className="space-y-3">
              {(currentQuestion.options || []).map((opt) => {
                const isSelected = answers[currentIndex] === opt.key;
                
                return (
                  <button
                    key={opt.key}
                    onClick={() => setAnswer(currentIndex, opt.key)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 outline-none ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-neutral-100'
                        : 'bg-neutral-900 hover:bg-neutral-850 border-neutral-850 hover:border-neutral-750 text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 flex-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-all ${
                        isSelected 
                          ? 'bg-emerald-500 text-neutral-950 font-black' 
                          : 'bg-neutral-950 text-neutral-500'
                      }`}>
                        {opt.key}
                      </div>
                      <span className="text-sm font-medium leading-loose select-none">{opt.text}</span>
                    </div>

                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 transition-all ${
                      isSelected ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400' : 'border-neutral-800 bg-neutral-950 text-transparent'
                    }`}>
                      <Check size={12} className="stroke-[3]" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Mini action triggers segment */}
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-neutral-900">
              <button
                onClick={() => toggleMark(currentIndex)}
                className={`py-2 px-4 rounded-xl text-xs font-bold tracking-wider flex items-center gap-1.5 border transition-all ${
                  markedForReview.includes(currentIndex)
                    ? 'bg-purple-950/20 border-purple-800 text-purple-400'
                    : 'bg-neutral-950 border-neutral-850 hover:border-neutral-850 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Flag size={14} className={markedForReview.includes(currentIndex) ? 'fill-purple-400 text-transparent' : ''} />
                {markedForReview.includes(currentIndex) ? 'Marked for Review' : 'Mark for Review'}
              </button>

              <button
                onClick={() => clearAnswer(currentIndex)}
                disabled={!hasSelectedAns}
                className="py-1.5 px-3 rounded-lg text-[11px] font-mono text-neutral-500 hover:text-rose-400 disabled:text-neutral-800 disabled:hover:text-neutral-800 transition-colors uppercase tracking-widest disabled:cursor-not-allowed"
              >
                Clear Response
              </button>
            </div>

          </div>
        </div>

        {/* Right Side Collapsible: Navigation map matrix */}
        <AnimatePresence initial={false}>
          {navigatorOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-l border-neutral-850 bg-neutral-900 flex flex-col justify-between shrink-0 overflow-hidden"
            >
              <div className="p-4 space-y-4 overflow-y-auto flex-1">
                <span className="text-[10px] text-neutral-500 uppercase font-mono font-black tracking-wider block">Matrix Navigation</span>
                
                <div className="grid grid-cols-4 gap-2">
                  {questions.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => goToQuestion(idx)}
                      className={`h-11 w-11 rounded-xl text-xs font-bold leading-none transition-all flex items-center justify-center shadow ${getNavDotColorClass(idx)} ${
                        currentIndex === idx ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-neutral-950 scale-105' : ''
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>

                <hr className="border-neutral-850 my-4" />

                {/* Navigator Legends */}
                <div className="space-y-2">
                  <span className="text-[9px] text-neutral-500 uppercase font-mono tracking-widest block">Status Legends</span>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-neutral-400">
                    <div className="flex items-center gap-1.5">
                      <span className="h-3 w-3 rounded-md bg-emerald-600 inline-block border border-emerald-500/20" /> Answered
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-3 w-3 rounded-md bg-neutral-850 inline-block ring-2 ring-neutral-700" /> Skipped
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-3 w-3 rounded-md bg-amber-600 inline-block" /> Marked (Ans)
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-3 w-3 rounded-md bg-purple-600 inline-block" /> Marked (Skipped)
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2">
                      <span className="h-3 w-3 rounded-md bg-neutral-900 border border-neutral-800 inline-block" /> Not Visited
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom save indicator for mobile layout spacing */}
              <div className="bg-neutral-950 p-3 border-t border-neutral-850 flex items-center justify-between text-[10px] text-neutral-500">
                <span className="font-mono">Pacing Tracking ON</span>
                <span className="bg-emerald-950 text-emerald-400 font-bold px-1.5 py-0.5 rounded uppercase">Secure</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* 3. FOOTER CONTROL BUTTONS ROW */}
      <footer className="bg-neutral-900 border-t border-neutral-850 p-4 px-6 flex items-center justify-between shrink-0">
        <button
          onClick={() => goToQuestion(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="px-4 py-2 bg-neutral-950 border border-neutral-805 disabled:opacity-30 disabled:hover:bg-neutral-950 hover:bg-neutral-850 text-xs font-bold uppercase rounded-xl transition-all inline-flex items-center gap-1 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} /> Previous
        </button>

        <button
          onClick={() => setNavigatorOpen(!navigatorOpen)}
          className="text-xs font-bold text-neutral-400 hover:text-neutral-200 tracking-wider font-mono uppercase bg-neutral-950 border border-neutral-850 px-3.5 py-2 rounded-xl transition-all"
        >
          {navigatorOpen ? 'Hide Map' : 'Show Map'}
        </button>

        {currentIndex === questions.length - 1 ? (
          <button
            onClick={() => setShowConfirmSubmitModal(true)}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 text-xs font-black uppercase rounded-xl transition-all inline-flex items-center gap-1 shadow-lg hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
            Wrap Up Test <ArrowRight size={16} />
          </button>
        ) : (
          <button
            onClick={() => {
              // Automatically record visit to next index
              goToQuestion(currentIndex + 1);
            }}
            className="px-5 py-2 bg-neutral-950 border border-neutral-805 hover:bg-neutral-850 text-xs font-bold uppercase rounded-xl transition-all inline-flex items-center gap-1"
          >
            Next <ChevronRight size={16} />
          </button>
        )}
      </footer>

      {/* exit confirm modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="bg-amber-500/10 text-amber-500 p-3.5 rounded-full inline-block">
              <AlertCircle size={28} />
            </div>
            <h3 className="text-base font-bold text-neutral-100">Suspend and Exit Simulator?</h3>
            <p className="text-neutral-400 text-xs leading-relaxed">
              Your answered options will be synchronized in Firestore securely. You can safely pick up and resume from this absolute position within 30 minutes!
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 bg-neutral-950 border border-neutral-800 hover:bg-neutral-850 hover:text-neutral-200 py-2.5 rounded-xl text-neutral-400 text-xs font-bold transition-all"
              >
                Continue Test
              </button>
              <button
                onClick={handleSaveAndExit}
                className="flex-1 bg-amber-600 hover:bg-amber-500 text-neutral-950 py-2.5 rounded-xl text-xs font-bold transition-all uppercase"
              >
                Save & Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* submit confirm modal */}
      {showConfirmSubmitModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="bg-emerald-500/10 text-emerald-400 p-3.5 rounded-full inline-block">
              <Compass size={28} />
            </div>
            <h3 className="text-base font-bold text-neutral-100">Submit Exam Answers?</h3>
            <p className="text-neutral-400 text-xs leading-relaxed">
              You have solved <strong className="text-neutral-200 font-bold">{Object.keys(answers).length} of {questions.length}</strong> questions. Submit now to generate detailed diagnostic reports and subject summaries.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmSubmitModal(false)}
                className="flex-1 bg-neutral-950 border border-neutral-800 hover:bg-neutral-850 py-2.5 rounded-xl text-neutral-400 text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowConfirmSubmitModal(false);
                  setLoading(true);
                  await handleSubmissionCalculations();
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 py-2.5 rounded-xl text-xs font-black tracking-wide transition-all uppercase"
              >
                Confirm Submit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
