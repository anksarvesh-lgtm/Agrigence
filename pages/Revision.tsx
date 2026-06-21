import React, { useState } from 'react';
import { useAuth } from '../src/authContext';
import { 
  BookOpen, Sparkles, AlertCircle, RefreshCw, Bookmark, Star, CheckSquare, 
  HelpCircle, Play, ChevronRight, LayoutGrid, Clock, Lightbulb, Check, Library
} from 'lucide-react';

export default function Revision() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'cards' | 'stability' | 'highlights'>('cards');
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  // Spaced Repetition / Flashcards dataset
  const revisionDecks = [
    {
      topic: 'Weed Herbicide Selectivity Kinetic Factor',
      question: 'Why does Metribuzin show selective safety in Tomato but causes severe injury in Sweet Potato crops?',
      answer: 'Metribuzin is rapidly metabolized to conjugated sugar complexes in tolerant Tomato, whereas Sweet Potato lacks specific decarboxylation pathways, leading to toxic concentration spikes inside photosystem II.',
      difficulty: 'Expert',
    },
    {
      topic: 'Soil Chemistry pH Buffering Indices',
      question: 'What constitutes the active vs potential acidity levels in weathered acidic soils?',
      answer: 'Active acidity is the H+ concentration in the soil solution. Potential acidity consists of exchangeable Al3+ and H+ ions on clay complex colloid walls, which can be active when buffer values shift.',
      difficulty: 'Moderate',
    },
    {
      topic: 'Genetics Mendelian Spore Calculations',
      question: 'Explain the reason for a 1:1:1:1 tetrad segregation ratio in Neurospora cross tests.',
      answer: 'It results from the cross of two linked genes with independent assortment without centromeric interference, illustrating normal first division segregation ratios.',
      difficulty: 'Hard',
    }
  ];

  const handleNextCard = () => {
    setShowAnswer(false);
    setCurrentCardIdx((prev) => (prev + 1) % revisionDecks.length);
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 p-6 md:p-8 relative overflow-hidden font-sans">
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-emerald-600/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-teal-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        
        {/* Header Block */}
        <header className="space-y-1.5 border-b border-slate-800 pb-6">
          <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest font-mono">Spaced Repetition</span>
          <h1 className="text-3xl font-extrabold text-slate-101 flex items-center gap-2">
            <BookOpen className="text-emerald-500" size={26} /> Revision Center
          </h1>
          <p className="text-xs text-slate-400">
            Smart cards, recall scheduling, and high-priority study notes generated based on {user?.preparationLevel} prep targets.
          </p>
        </header>

        {/* Sub-Tabs Navigation */}
        <div className="flex border-b border-slate-800 gap-1 overflow-x-auto scrollbar-none">
          {[
            { id: 'cards', label: 'Adaptive Flashcards', icon: Lightbulb },
            { id: 'stability', label: 'Memory Stability', icon: Clock },
            { id: 'highlights', label: 'Study Highlights', icon: Library }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3 text-xs font-bold font-mono tracking-wider uppercase flex items-center gap-2 transition shrink-0 ${
                activeTab === tab.id 
                  ? 'border-b-2 border-emerald-500 text-emerald-400 font-extrabold' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <tab.icon size={13} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        {activeTab === 'cards' && (
          <div className="space-y-6">
            
            {/* Flashcard container */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center min-h-[220px] flex flex-col justify-between relative overflow-hidden shadow-2xl">
              <div className="absolute top-4 left-6 px-3 py-1 bg-slate-950 border border-slate-850 rounded-xl text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                {revisionDecks[currentCardIdx].topic}
              </div>
              <div className="absolute top-4 right-6 px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 font-mono text-[9px] uppercase font-black tracking-widest rounded-md">
                {revisionDecks[currentCardIdx].difficulty}
              </div>

              <div className="my-8 space-y-4">
                <p className="text-md md:text-lg font-bold text-slate-100 max-w-xl mx-auto leading-relaxed">
                  {revisionDecks[currentCardIdx].question}
                </p>

                {showAnswer && (
                  <div className="p-5 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 text-xs text-emerald-400 max-w-xl mx-auto leading-relaxed animate-fade-in text-left">
                    <strong className="text-slate-205 block uppercase tracking-widest text-[9px] mb-2">Answer explanation:</strong>
                    {revisionDecks[currentCardIdx].answer}
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-center pt-4 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setShowAnswer(!showAnswer)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition"
                >
                  {showAnswer ? 'Hide Explanation' : 'Reveal Explanation'}
                </button>
                <button
                  type="button"
                  onClick={handleNextCard}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-black rounded-xl transition"
                >
                  Next Card
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-850 text-[10px] text-slate-450 text-center uppercase tracking-widest font-black leading-none mt-2">
              Note: This deck adapts to your wrong question analytics automatically.
            </div>
          </div>
        )}

        {activeTab === 'stability' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-202">Estimations of memory stability:</h3>
            
            <div className="space-y-3">
              <div className="p-4 bg-slate-900/30 border border-slate-800 rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold block text-slate-200">Weed selectivity indices</span>
                  <p className="text-[10px] text-slate-400 mt-1">Status: decays in 4 days. Spaced repetition alert scheduled.</p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-red-400">42% stability</div>
                  <div className="h-1 w-20 bg-slate-950 rounded-full overflow-hidden mt-1 border border-slate-850">
                    <div className="h-full bg-red-400" style={{ width: '42%' }} />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-900/30 border border-slate-800 rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold block text-slate-200">Soil Buffering calculation</span>
                  <p className="text-[10px] text-slate-400 mt-1">Status: decays in 15 days. Excellent retention rate.</p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-emerald-400">86% stability</div>
                  <div className="h-1 w-20 bg-slate-950 rounded-full overflow-hidden mt-1 border border-slate-850">
                    <div className="h-full bg-emerald-500" style={{ width: '86%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'highlights' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-202">High Yield Study Highlights</h3>

            <div className="p-6 bg-slate-900/20 border border-slate-800 rounded-2xl relative">
              <span className="absolute top-4 right-4 text-[10px] uppercase font-bold text-emerald-400 font-mono">Soil Chem</span>
              <h4 className="text-xs font-extrabold text-slate-100 uppercase tracking-wider mb-2">Nitrogen Transformation Kinetics</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Remember that <strong>Nitrosomonas</strong> converts ammonium NH4+ to nitrite NO2-, while <strong>Nitrobacter</strong> converts NO2- to plant-available nitrate NO3-. This oxidation is strictly aerobic and is heavily suppressed at soil pH levels below 5.5, leading to sudden nitrogen availability blockages.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
