import React, { useState, useEffect } from 'react';
import { useAuth } from '../src/authContext';
import { 
  Bookmark, ArrowRight, HelpCircle, Star, Sparkles, BookOpen, Clock, 
  Trash2, Play, AlertCircle, Sparkle, Tag, Check, CheckCircle2
} from 'lucide-react';

export default function Bookmarks() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState([
    {
      id: 'ts-01_q_1',
      question: 'Evaluate the active translocation rate of Metribuzin in tolerant Glycine max cultivars compared to sensitive Sida spinosa.',
      options: [
        'Sugar conjugate linkages in primary thylakoids prevent binding at D1 protein loops',
        'Acyl-decarboxylation reduces concentration below critical thresholds at the active site',
        'Decationized complexation restricts systemic migration across vascular bundles',
        'Enhanced vascular transpiration routes conjugate metabolites specifically to leaf borders'
      ],
      correctIdx: 0,
      userAnswerIdx: 1,
      explanation: 'Metribuzin tolerance in soybean (Glycine max) is determined by sugar-conjugate metabolic transformations producing glucose complexes that do not bind to the thylakoid QA protein loop, preserving photosystem function.',
      subject: 'Agronomy',
      difficulty: 'Hard'
    },
    {
      id: 'ts-02_q_4',
      question: 'Which bacteria are responsible for conversion of Ammonia (NH4+) to Nitrite (NO2-) and Nitrite to Nitrate (NO3-) respectively?',
      options: [
        'Nitrobacter and Nitrosomonas',
        'Nitrosomonas and Nitrobacter',
        'Azotobacter and Clostridium',
        'Rhizobium and Bradyrhizobium'
      ],
      correctIdx: 1,
      userAnswerIdx: 1,
      explanation: 'Conversion of Ammonia to Nitrite is mediated by Nitrosomonas. Conversion of Nitrite to plant-available Nitrate is completed by Nitrobacter under aerobic soil conditions.',
      subject: 'Soil Science',
      difficulty: 'Moderate'
    }
  ]);

  const handleDeleteBookmark = (id: string) => {
    setBookmarks(bookmarks.filter(b => b.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 p-6 md:p-8 relative overflow-hidden font-sans">
      
      {/* Background radial spotlight circles */}
      <div className="absolute top-1/4 right-0 w-80 h-80 bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        
        {/* Header Block */}
        <header className="space-y-1.5 border-b border-slate-800 pb-6">
          <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest font-mono">My Repository</span>
          <h1 className="text-3xl font-extrabold text-slate-101 flex items-center gap-2">
            <Bookmark className="text-emerald-500 fill-emerald-500" size={26} /> My Bookmarks
          </h1>
          <p className="text-xs text-slate-400">
            Review and practice competitive questions pinned for key revisions. Personalized for {user?.name}.
          </p>
        </header>

        {bookmarks.length === 0 ? (
          <div className="bg-slate-900/30 border border-slate-850 p-12 text-center rounded-3xl space-y-3">
            <Bookmark size={36} className="text-slate-600 mx-auto" />
            <h3 className="font-bold text-sm text-slate-300">No Bookmarks Added Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Any questions you bookmark while playing mock test series or reviewing test answers will appear here!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Displaying Bookmark detail cards */}
            {bookmarks.map((b, idx) => (
              <div key={b.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6.5 relative overflow-hidden shadow-2xl space-y-4">
                
                {/* Topic tags row */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-850 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-slate-950 border border-slate-850 rounded-lg text-[9px] font-bold font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <Tag size={10} className="text-emerald-400" /> {b.subject}
                    </span>
                    <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded font-mono text-[9px] uppercase font-black text-amber-500 tracking-wider">
                      {b.difficulty}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleDeleteBookmark(b.id)}
                    className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-500 hover:text-red-400 border border-slate-850 hover:border-red-500/20 rounded-lg transition"
                    title="Remove Bookmark"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {/* Question Stem */}
                <div className="space-y-3">
                  <p className="text-xs font-black uppercase text-slate-500 tracking-widest font-mono">Question {idx + 1}</p>
                  <p className="text-xs md:text-sm font-bold text-slate-201 leading-relaxed">
                    {b.question}
                  </p>
                </div>

                {/* Options List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2">
                  {b.options.map((opt, oIdx) => {
                    const isCorrect = oIdx === b.correctIdx;
                    return (
                      <div 
                        key={oIdx} 
                        className={`p-3.5 rounded-xl border text-xs font-semibold leading-normal ${
                          isCorrect 
                            ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' 
                            : 'bg-slate-950/30 border-slate-850 text-slate-400'
                        }`}
                      >
                        <span className="font-mono text-[10px] mr-1.5 uppercase font-bold">{['A', 'B', 'C', 'D'][oIdx]}.</span> {opt}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Box */}
                <div className="p-4.5 bg-slate-950/50 rounded-2xl border border-slate-850 text-xs text-slate-430 line-height-relaxed">
                  <strong className="text-xs font-bold text-slate-205 flex items-center gap-1.5 mb-2 uppercase tracking-wide">
                    <CheckCircle2 size={13} className="text-emerald-400" /> AI Explanatory Context:
                  </strong>
                  {b.explanation}
                </div>

              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
}
