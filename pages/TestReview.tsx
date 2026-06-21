import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../src/firebase';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Filter, Bookmark, AlertTriangle, AlertCircle, 
  Check, X, Eye, Compass, ThumbsUp, Send, Loader2, Save 
} from 'lucide-react';

export default function TestReview() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [resultsData, setResultsData] = useState<any>(null);
  const [questionsMap, setQuestionsMap] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'correct' | 'incorrect' | 'skipped' | 'bookmarked'>('all');

  // Bookmarking and report error state
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [reportingQIndex, setReportingQIndex] = useState<number | null>(null);
  const [reportType, setReportType] = useState<string>('Typo');
  const [reportComment, setReportComment] = useState<string>('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Load results metadata
  useEffect(() => {
    async function loadResults() {
      if (!sessionId) return;
      try {
        setLoading(true);
        const userId = auth.currentUser?.uid || 'guest';
        
        // 1. Fetch performance summary
        const historyRef = doc(db, 'users', userId, 'testHistory', sessionId);
        const snap = await getDoc(historyRef);
        let resData: any = null;

        if (snap.exists()) {
          resData = snap.data();
        } else {
          // fallback
          const guestRef = doc(db, 'users', 'guest', 'testHistory', sessionId);
          const guestSnap = await getDoc(guestRef);
          if (guestSnap.exists()) {
            resData = guestSnap.data();
          }
        }

        if (!resData) {
          alert("Error loading review session. Results metadata is missing.");
          navigate('/test-series');
          return;
        }

        setResultsData(resData);

        // 2. Fetch original session block questions payload to render option details 
        const sessionRef = doc(db, 'testSessions', sessionId);
        const sessionSnap = await getDoc(sessionRef);
        if (sessionSnap.exists()) {
          setQuestionsMap(sessionSnap.data().questions || []);
        }

        // 3. Load saved/bookmarked questions ids to set bookmark states
        if (userId !== 'guest') {
          // load bookmarks if user authenticated (simulate local checklist matching indices)
          const bookmarkLocalPrefix = localStorage.getItem(`bookmarks_${userId}`) || "[]";
          setBookmarkedIds(JSON.parse(bookmarkLocalPrefix));
        }

      } catch (err) {
        console.error("Failed compiling review logs:", err);
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

  // Bookmark Toggle action
  const handleToggleBookmark = async (qIdx: number) => {
    const userId = auth.currentUser?.uid || 'guest';
    const qId = `${resultsData.bankId}_q_${qIdx}`;
    const isBookmarked = bookmarkedIds.includes(qId);

    try {
      const bRef = doc(db, 'users', userId, 'savedQuestions', qId);
      if (isBookmarked) {
        // Delete BM Document
        await deleteDoc(bRef);
        const updated = bookmarkedIds.filter(id => id !== qId);
        setBookmarkedIds(updated);
        localStorage.setItem(`bookmarks_${userId}`, JSON.stringify(updated));
        triggerToast("Bookmark removed successfully");
      } else {
        // Save BM Document
        const questionObj = questionsMap[qIdx];
        await setDoc(bRef, {
          qId,
          userId,
          bankId: resultsData.bankId,
          bankName: resultsData.bankName,
          question: questionObj,
          savedAt: new Date().toISOString()
        });
        const updated = [...bookmarkedIds, qId];
        setBookmarkedIds(updated);
        localStorage.setItem(`bookmarks_${userId}`, JSON.stringify(updated));
        triggerToast("Question bookmarked for future practice!");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Failed syncing bookmark status.");
    }
  };

  // Submit Error Report
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reportingQIndex === null || !resultsData) return;

    setSubmittingReport(true);
    try {
      const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const questionObj = questionsMap[reportingQIndex];
      const userId = auth.currentUser?.uid || 'guest';

      await setDoc(doc(db, 'reports', reportId), {
        reportId,
        userId,
        sessionId,
        bankId: resultsData.bankId,
        qIndex: reportingQIndex,
        qText: questionObj.text,
        type: reportType,
        comment: reportComment,
        createdAt: new Date().toISOString()
      });

      triggerToast("Error reported. Thank you for validating!");
      setReportComment('');
      setReportingQIndex(null);
    } catch (err) {
      console.error(err);
      alert("Error reporting issue, please try again.");
    } finally {
      setSubmittingReport(false);
    }
  };

  if (loading || !resultsData || questionsMap.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-neutral-100 flex-col gap-4">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
        <p className="text-stone-400 text-xs font-mono tracking-widest">Compiling proctor solution matrix...</p>
      </div>
    );
  }

  // Answer indices matching resultsData
  const solvedAnswers = resultsData.answers || [];

  // Filtering implementation
  const filteredQuestions = questionsMap.map((q, idx) => {
    const userAnsObj = solvedAnswers.find((a: any) => a.qIndex === idx) || {};
    const hasBeenMarked = bookmarkedIds.includes(`${resultsData.bankId}_q_${idx}`);
    
    return {
      ...q,
      originalIndex: idx,
      selected: userAnsObj.selected || null,
      isCorrect: userAnsObj.isCorrect || false,
      isBookmarked: hasBeenMarked,
      isSkipped: !userAnsObj.selected
    };
  }).filter(item => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'correct') return item.selected && item.isCorrect;
    if (activeFilter === 'incorrect') return item.selected && !item.isCorrect;
    if (activeFilter === 'skipped') return item.isSkipped;
    if (activeFilter === 'bookmarked') return item.isBookmarked;
    return true;
  });

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 font-sans selection:bg-emerald-500/30 p-4 md:p-6 pb-20">
      
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Toast Notification Alert Banner */}
        <AnimatePresence>
          {toastMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-6 left-1/2 -translate-x-1/2 bg-neutral-950 border border-emerald-500/30 text-emerald-400 px-6 py-3 rounded-full text-xs font-mono font-bold uppercase tracking-wider shadow-2xl z-50 flex items-center gap-2"
            >
              <Check size={14} /> {toastMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back Link */}
        <button 
          onClick={() => navigate(`/test/results/${sessionId}`)}
          className="flex items-center gap-1.5 text-neutral-400 hover:text-neutral-200 text-xs font-semibold mb-2 transition-colors"
        >
          <ChevronLeft size={16} /> Returns to Evaluation Board
        </button>

        {/* Title area */}
        <div className="bg-neutral-950 border border-neutral-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] text-emerald-500 uppercase font-mono font-black tracking-wider block">Completed Academic Review</span>
            <h1 className="text-xl font-black text-neutral-100 leading-tight">{resultsData.bankName}</h1>
            <p className="text-xs text-neutral-500 font-mono">Answers checked based on proctored simulator parameters</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-emerald-950 text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-500/10 font-bold font-mono">
              Score: {resultsData.score?.toFixed(2)} / {resultsData.totalMarks}
            </span>
          </div>
        </div>

        {/* CONTROLS CHIP FILTER BAR */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-none border-b border-neutral-800">
          <span className="text-[10px] text-neutral-500 uppercase font-mono font-black tracking-wide shrink-0 mr-2">Filter Matrix:</span>
          {([
            { id: 'all', label: 'All Questions' },
            { id: 'correct', label: 'Correct' },
            { id: 'incorrect', label: 'Incorrect' },
            { id: 'skipped', label: 'Skipped' },
            { id: 'bookmarked', label: 'Bookmarked' }
          ] as const).map(chip => (
            <button
              key={chip.id}
              onClick={() => setActiveFilter(chip.id)}
              className={`px-4.5 py-1.5 text-xs font-bold font-mono tracking-wider uppercase rounded-xl border transition-all shrink-0 ${
                activeFilter === chip.id 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : 'bg-neutral-950 text-neutral-500 border-neutral-850 hover:bg-neutral-850 hover:text-neutral-300'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* MAIN LIST REVIEW */}
        {filteredQuestions.length > 0 ? (
          <div className="space-y-6">
            {filteredQuestions.map((q, qIndex) => {
              const statusBadgeClass = q.isSkipped 
                ? 'bg-amber-950/40 text-amber-500 border-amber-900/40'
                : q.isCorrect 
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40' 
                : 'bg-rose-950/40 text-rose-500 border-rose-900/40';

              const statusBadgeText = q.isSkipped 
                ? 'Skipped' 
                : q.isCorrect 
                ? 'Correct' 
                : 'Incorrect';

              return (
                <div key={q.originalIndex} className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 shadow-xl space-y-6 relative overflow-hidden">
                  
                  {/* Badge top line indicators */}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-black text-neutral-500">
                        Question {q.originalIndex + 1}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border font-mono ${statusBadgeClass}`}>
                        {statusBadgeText}
                      </span>
                      <span className="bg-neutral-900 border border-neutral-850 rounded px-2 py-0.5 text-[9px] text-neutral-400 font-mono">
                        {q.subject || 'General'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => handleToggleBookmark(q.originalIndex)}
                        className={`p-2 rounded-xl transition-all border shrink-0 ${
                          bookmarkedIds.includes(`${resultsData.bankId}_q_${q.originalIndex}`)
                            ? 'bg-emerald-600/15 border-emerald-600/50 text-emerald-400'
                            : 'bg-neutral-900 border-neutral-850 text-neutral-500 hover:text-neutral-300'
                        }`}
                        title="Bookmark for future drilling"
                      >
                        <Bookmark size={14} className={bookmarkedIds.includes(`${resultsData.bankId}_q_${q.originalIndex}`) ? 'fill-emerald-400 text-transparent' : ''} />
                      </button>

                      <button
                        onClick={() => setReportingQIndex(q.originalIndex)}
                        className="p-2 bg-neutral-900 hover:bg-neutral-850 border border-neutral-850 text-neutral-500 hover:text-neutral-300 rounded-xl transition-colors shrink-0"
                        title="Report typo or error in question"
                      >
                        <AlertTriangle size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Question main context header */}
                  <div className="space-y-4">
                    <h2 className="text-base font-semibold leading-relaxed text-neutral-100 select-all">
                      {q.text}
                    </h2>

                    {q.imageUrl && (
                      <div className="border border-neutral-800 rounded-2xl overflow-hidden max-w-md bg-neutral-900 p-1">
                        <img 
                          src={q.imageUrl} 
                          alt="Category illustration diagram" 
                          className="w-full object-cover max-h-56 rounded-xl"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                  </div>

                  {/* Options with color codes */}
                  <div className="space-y-2.5 text-xs">
                    {(q.options || []).map((o: any) => {
                      const isCorrectOpt = o.key === q.correct;
                      const isSelectedOpt = o.key === q.selected;

                      // Decide color boxes
                      let optBgBorderClass = "bg-neutral-900 border-neutral-850 text-neutral-300";
                      let indicatorDotClass = "bg-neutral-950 text-neutral-500";

                      if (isCorrectOpt) {
                        optBgBorderClass = "bg-emerald-950/20 border-emerald-600/40 text-neutral-100 ring-1 ring-emerald-500/10";
                        indicatorDotClass = "bg-emerald-500 text-neutral-950 font-black";
                      } else if (isSelectedOpt && !isCorrectOpt) {
                        optBgBorderClass = "bg-rose-950/20 border-rose-600/40 text-neutral-100 ring-1 ring-rose-500/10";
                        indicatorDotClass = "bg-rose-500 text-neutral-950 font-black";
                      }

                      return (
                        <div
                          key={o.key}
                          className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all leading-normal select-all ${optBgBorderClass}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${indicatorDotClass}`}>
                              {o.key}
                            </div>
                            <span className="font-semibold">{o.text}</span>
                          </div>

                          <div className="shrink-0 flex items-center gap-1.5">
                            {isCorrectOpt && (
                              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black font-mono uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1 shrink-0">
                                <Check size={10} className="stroke-[3]" /> Correct Key
                              </span>
                            )}
                            {isSelectedOpt && !isCorrectOpt && (
                              <span className="bg-rose-500/10 text-rose-400 text-[10px] font-black font-mono uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1 shrink-0">
                                <X size={10} className="stroke-[3]" /> Your Choiced key
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Scientific Explanation Panel */}
                  <div className="bg-neutral-900/50 border border-neutral-850 p-4.5 rounded-2xl space-y-2 select-all">
                    <span className="text-[10px] font-black uppercase text-emerald-400 font-mono tracking-widest flex items-center gap-1.5 leading-none">
                      <Eye size={12} /> Explanatory Reference Details
                    </span>
                    <p className="text-xs text-neutral-300 leading-loose">
                      {q.explanation || "No clarification catalogued."}
                    </p>
                    
                    {q.prevYearRef && (
                      <div className="pt-2 text-[10px] font-mono text-neutral-500 flex items-center gap-1">
                        🏆 PYQ Reference ID: <strong className="text-neutral-300">{q.prevYearRef}</strong>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-12 text-center text-neutral-500 text-xs">
            No evaluation questions matching active criteria filters. Try selecting 'All Questions' tab.
          </div>
        )}

      </div>

      {/* REPORT TYPE FORM POPUP MODAL */}
      {reportingQIndex !== null && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form 
            onSubmit={handleSubmitReport}
            className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative"
          >
            <button
              type="button"
              onClick={() => setReportingQIndex(null)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-300 bg-neutral-950 border border-neutral-850 p-1.5 rounded-lg text-xs"
            >
              <X size={14} />
            </button>

            <div className="text-center pb-2 border-b border-neutral-850">
              <span className="text-[10px] text-amber-500 uppercase font-mono font-black tracking-widest block mb-0.5">Academic Feedback</span>
              <h3 className="text-sm font-bold text-neutral-100">Report Question Flag</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-neutral-500 uppercase">Incorrect Categorization Type</label>
                <select
                  value={reportType}
                  onChange={e => setReportType(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-850 text-neutral-300 rounded-lg p-2.5 text-xs outline-none focus:border-emerald-500/50"
                >
                  <option value="Typo">Typo in statement or options</option>
                  <option value="Incorrect Key">Incorrect correct answer key</option>
                  <option value="Wrong Explanation">Factually wrong explanation</option>
                  <option value="Broken Image">Broken or incorrect illustrative diagram</option>
                  <option value="Other">Other critical failure</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-neutral-500 uppercase">Comment Clarifications</label>
                <textarea
                  required
                  value={reportComment}
                  onChange={e => setReportComment(e.target.value)}
                  rows={4}
                  placeholder="Tell us what scientific corrections or typos you spotted inside this question..."
                  className="w-full bg-neutral-950 border border-neutral-850 text-neutral-305 p-3 rounded-xl focus:outline-none focus:border-emerald-500/50 placeholder:text-neutral-700 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3.5 pt-2">
              <button
                type="button"
                onClick={() => setReportingQIndex(null)}
                className="flex-1 bg-neutral-950 border border-neutral-800 hover:bg-neutral-850 py-2.5 rounded-xl text-neutral-400 font-bold text-xs"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={submittingReport}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 py-2.5 rounded-xl text-xs font-black tracking-wide flex items-center justify-center gap-1 disabled:opacity-30"
              >
                {submittingReport ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <>
                    <Send size={12} /> Submit Report
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
