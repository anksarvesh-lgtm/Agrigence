import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../src/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { 
  Play, Clock, HelpCircle, AlertTriangle, ShieldCheck, 
  ChevronLeft, BookOpen, Sliders, Settings2 
} from 'lucide-react';
import { useTestStore } from '../src/store/testStore';
import ContentGate from '../src/components/ContentGate';

interface QuestionOption {
  key: string;
  text: string;
}

interface FetchedQuestion {
  text: string;
  options: QuestionOption[];
  correct: string;
  explanation: string;
  subject?: string;
  topic?: string;
  difficulty?: string;
  marks?: number;
  negativeMarks?: number;
  prevYearRef?: string;
  imageUrl?: string;
}

export default function TestConfig() {
  const { bankId } = useParams<{ bankId: string }>();
  const navigate = useNavigate();
  const initTestStore = useTestStore((state) => state.initTest);

  // Question bank state
  const [bankMetadata, setBankMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subjectsList, setSubjectsList] = useState<string[]>([]);

  // User Config State
  const [numQuestions, setNumQuestions] = useState<number | 'all'>(25);
  const [timePerQuestion, setTimePerQuestion] = useState<number | 'no_limit'>(60); // in seconds
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [subjectFilter, setSubjectFilter] = useState<string>('All');
  const [negativeMarking, setNegativeMarking] = useState<boolean>(true);

  useEffect(() => {
    async function fetchBankMetadata() {
      if (!bankId) return;
      try {
        setLoading(true);
        const ref = doc(db, 'question_banks', bankId);
        const snap = await getDoc(ref);
        
        if (!snap.exists()) {
          setError("Question Bank not found");
          setLoading(false);
          return;
        }

        const data = snap.data();
        setBankMetadata(data);

        // Fetch the full JSON questions file to figure out unique subjects inside this bank
        if (data.blobUrl) {
          const res = await fetch(data.blobUrl);
          const fullData = await res.json();
          const questions = Array.isArray(fullData) ? fullData : (fullData.questions || []);
          
          // Pull unique subjects
          const uniqSubjects: string[] = [];
          questions.forEach((q: any) => {
            if (q.subject && !uniqSubjects.includes(q.subject)) {
              uniqSubjects.push(q.subject);
            }
          });
          setSubjectsList(uniqSubjects);
        }
      } catch (err: any) {
        console.error("Error loading bank metadata:", err);
        setError("Failed to retrieve question details. Make sure you are online.");
      } finally {
        setLoading(false);
      }
    }

    fetchBankMetadata();
  }, [bankId]);

  function shuffle<T>(array: T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  const handleStartTest = async () => {
    if (!bankMetadata || !bankId) return;

    setLoading(true);
    try {
      // 1. Fetch full test resource from Vercel Blob URL
      const res = await fetch(bankMetadata.blobUrl);
      if (!res.ok) throw new Error("Failed to load questions payload from storage.");
      const fullData = await res.json();
      
      let fetchedQuestionsList: FetchedQuestion[] = Array.isArray(fullData) 
        ? fullData 
        : (fullData.questions || []);

      if (fetchedQuestionsList.length === 0) {
        throw new Error("This question bank does not possess any validated queries.");
      }

      // 2. Perform filters
      let filtered = [...fetchedQuestionsList];
      
      if (difficultyFilter !== 'All') {
        filtered = filtered.filter(
          q => q.difficulty?.toLowerCase() === difficultyFilter.toLowerCase()
        );
      }

      if (subjectFilter !== 'All') {
        filtered = filtered.filter(
          q => q.subject?.toLowerCase() === subjectFilter.toLowerCase()
        );
      }

      if (filtered.length === 0) {
        throw new Error(`No questions matched filter constraints (Difficulty: ${difficultyFilter}, Subject: ${subjectFilter}). Please broaden your criteria.`);
      }

      // Determine real size
      const maxCount = numQuestions === 'all' ? filtered.length : Math.min(numQuestions, filtered.length);

      // Shuffle entire filtered array & options inside sliced count
      let selectedAndShuffled = shuffle(filtered).slice(0, maxCount).map((q) => ({
        ...q,
        options: shuffle(q.options || [])
      }));

      // Calculate total time
      const totalTimeSeconds = timePerQuestion === 'no_limit' 
        ? 999999 
        : maxCount * timePerQuestion;

      const sessionId = `test_${Date.now()}_` + Math.random().toString(36).substring(2, 11);
      const userId = auth.currentUser?.uid || 'guest';

      const configObject = {
        numQuestions: maxCount,
        timePerQuestion,
        difficultyFilter,
        subjectFilter,
        negativeMarking,
        totalTime: totalTimeSeconds
      };

      // 3. Save initial draft active session in Firestore
      const sessionRef = doc(db, 'testSessions', sessionId);
      await setDoc(sessionRef, {
        sessionId,
        userId,
        bankId,
        bankName: bankMetadata.name,
        questions: selectedAndShuffled,
        answers: {},
        timeRemaining: totalTimeSeconds,
        currentIndex: 0,
        status: 'active',
        config: configObject,
        createdAt: new Date().toISOString()
      });

      // 4. Initialize Local Zustand State
      initTestStore(
        sessionId,
        bankId,
        bankMetadata.name,
        selectedAndShuffled,
        totalTimeSeconds,
        configObject
      );

      // 5. Navigate to Interface
      navigate(`/test/${sessionId}`);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Something went wrong booting up the test.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !bankMetadata) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-neutral-100 flex-col gap-4">
        <div className="relative flex h-10 w-10">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-10 w-10 bg-emerald-500"></span>
        </div>
        <p className="text-stone-400 text-xs font-mono tracking-widest uppercase">Calibrating Diagnostic Simulator...</p>
      </div>
    );
  }

  if (error || !bankMetadata) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-neutral-100 p-6">
        <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
          <div className="bg-red-500/10 text-red-500 p-4 rounded-full inline-block">
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-lg font-bold text-neutral-100">Setup Calibration Failed</h3>
          <p className="text-neutral-400 text-sm whitespace-pre-wrap">{error || "Could not retrieve question bank information."}</p>
          <button 
            onClick={() => navigate('/test-series')}
            className="w-full bg-neutral-900 border border-neutral-850 hover:bg-neutral-850 py-3 rounded-2xl font-bold transition-all text-sm"
          >
            Back to Mock Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <ContentGate content={bankMetadata}>
      <div className="min-h-screen bg-neutral-900 text-neutral-100 font-sans p-6 selection:bg-emerald-500/30 flex items-center justify-center">
      <div className="max-w-3xl w-full">
        {/* Back Link */}
        <button 
          onClick={() => navigate('/test-series')}
          className="flex items-center gap-1.5 text-neutral-400 hover:text-neutral-200 text-xs font-semibold mb-6 transition-colors"
        >
          <ChevronLeft size={16} /> Back to Mock Hub
        </button>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Main Config Form Area */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-6">
              <div>
                <span className="text-[10px] text-emerald-500 uppercase font-mono font-black tracking-wider block mb-1">Interactive Diagnostic Lab</span>
                <h2 className="text-2xl font-black text-neutral-100 tracking-tight leading-tight">{bankMetadata.name}</h2>
                <div className="flex items-center gap-2 mt-2 text-xs text-neutral-400 flex-wrap">
                  <span className="bg-neutral-900 px-2 py-0.5 rounded border border-neutral-850 font-medium">{bankMetadata.subject}</span>
                  <span>•</span>
                  <span>Target: {bankMetadata.examTarget}</span>
                  <span>•</span>
                  <span>{bankMetadata.questionsCount} Available Questions</span>
                </div>
              </div>

              <hr className="border-neutral-900" />

              {/* Number of Questions */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 flex items-center gap-1">
                  <HelpCircle size={12} /> Total Test Length
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {([10, 25, 50, 100, 'all'] as const).map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setNumQuestions(count === 'all' ? 'all' : Number(count))}
                      className={`py-2 text-xs font-bold rounded-xl border uppercase tracking-wider transition-all ${
                        (count === 'all' && numQuestions === 'all') || (typeof count === 'number' && numQuestions === count)
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-neutral-900 text-neutral-400 border-neutral-850 hover:bg-neutral-850'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration / Question */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 flex items-center gap-1">
                  <Clock size={12} /> Pacing Limit per Question
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {([30, 45, 60, 90, 'no_limit'] as const).map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setTimePerQuestion(time === 'no_limit' ? 'no_limit' : Number(time))}
                      className={`py-2 text-[10px] font-bold rounded-xl border uppercase tracking-wide transition-all ${
                        (time === 'no_limit' && timePerQuestion === 'no_limit') || (typeof time === 'number' && timePerQuestion === time)
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-neutral-900 text-neutral-400 border-neutral-850 hover:bg-neutral-850'
                      }`}
                    >
                      {time === 'no_limit' ? 'No Limit' : `${time}s`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filters Panel Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Subject Filter */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Subject Drill</label>
                  <select
                    value={subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-850 text-neutral-300 rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="All">All Subjects ({bankMetadata.subject})</option>
                    {subjectsList.map((subj) => (
                      <option key={subj} value={subj}>{subj}</option>
                    ))}
                  </select>
                </div>

                {/* Difficulty Segment */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Difficulty Bracket</label>
                  <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-850 text-neutral-300 rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="All">All Difficulties</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Penalty Toggle */}
              <div className="bg-neutral-900/50 border border-neutral-850 p-4 rounded-2xl flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-neutral-200 block">Negative Marking Scheme</span>
                  <span className="text-[10px] text-neutral-500 font-mono block">Enforces a 0.25 penalty value deduction for incorrect responses</span>
                </div>
                <button
                  type="button"
                  onClick={() => setNegativeMarking(!negativeMarking)}
                  className={`w-12 h-6.5 rounded-full p-0.5 transition-all outline-none ${
                    negativeMarking ? 'bg-emerald-600 justify-end' : 'bg-neutral-800 justify-start'
                  } flex items-center`}
                >
                  <motion.div 
                    layout 
                    className="w-5.5 h-5.5 bg-white rounded-full shadow-lg" 
                  />
                </button>
              </div>

              {/* Start Trigger Button */}
              <button
                onClick={handleStartTest}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-850 disabled:text-neutral-600 text-neutral-950 font-black tracking-wider py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] text-sm uppercase"
              >
                {loading ? (
                  <span className="animate-spin h-5 w-5 border-2 border-neutral-950 border-t-transparent rounded-full" />
                ) : (
                  <>
                    <Play size={16} className="fill-neutral-950" /> Initiate Exam Simulator
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Side Overview / Instructions Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-4">
              <span className="text-[10px] text-amber-500 uppercase font-mono font-black tracking-wider block">Simulator Guidelines</span>
              
              <div className="space-y-4 text-xs text-neutral-400">
                <div className="flex gap-3">
                  <ShieldCheck size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-neutral-200 block font-semibold">Proctor Mode Safe</strong>
                    Our testing client retains progress automatically in case of disconnects or crashes.
                  </div>
                </div>

                <div className="flex gap-3">
                  <Clock size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-neutral-200 block font-semibold">Automatic Submission</strong>
                    If a pacing time limit expires, the simulator terminates automatically and submits scores representing finished inputs.
                  </div>
                </div>

                <div className="flex gap-3">
                  <BookOpen size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-neutral-200 block font-semibold">Comprehensive Review</strong>
                    Access an absolute step-by-step complete review with detailed scientific explanations and research references upon wrap-up.
                  </div>
                </div>

                <hr className="border-neutral-900 my-4" />

                <div className="bg-amber-950/20 border border-amber-900/30 p-3.5 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
                    <Sliders size={12} /> Live Estimation Parameters
                  </div>
                  <span className="text-[11px] block text-stone-400">
                    Total Time: <strong className="text-neutral-200 font-bold">{timePerQuestion === 'no_limit' ? 'Ultimate (No Limit)' : `${Math.floor(((numQuestions === 'all' ? 50 : numQuestions) * (timePerQuestion as number)) / 60)} minutes`}</strong>
                  </span>
                  <span className="text-[11px] block text-stone-400 font-mono">
                    Marks per Question: <strong className="text-neutral-200 font-bold">1.0</strong>
                  </span>
                  {negativeMarking && (
                    <span className="text-[11px] block text-rose-400 font-mono">
                      Negative Penalty: <strong className="font-bold">-0.25</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
    </ContentGate>
  );
}
