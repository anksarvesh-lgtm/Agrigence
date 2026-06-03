import React, { useState } from 'react';
import { useAuth } from '../src/authContext';
import { 
  Trophy, Medal, Search, Filter, Award, Target, HelpCircle, 
  MapPin, Check, Plus, AlertCircle, Sparkles, Star
} from 'lucide-react';

export default function Leaderboard() {
  const { user } = useAuth();
  const [selectedExamTab, setSelectedExamTab] = useState<'All' | 'IBPS AFO' | 'NABARD' | 'ICAR'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Top 10 Mock Rankings (Simulating actual high score agriculture exam candidates)
  const rankings = [
    { rank: 1, name: 'Sandeep Singh', state: 'Punjab', exam: 'IBPS AFO', accuracy: '94.5%', score: '84.5 / 100', isTopper: true },
    { rank: 2, name: 'Priyanka Sharma', state: 'Rajasthan', exam: 'NABARD Grade A', accuracy: '92.1%', score: '82.0 / 100', isTopper: true },
    { rank: 3, name: 'Anshu Mishra', state: 'Uttar Pradesh', exam: 'ICAR AIEEA', accuracy: '91.8%', score: '81.5 / 100', isTopper: true },
    { rank: 4, name: 'Mohit Chaudhary', state: 'Haryana', exam: 'IBPS AFO', accuracy: '89.4%', score: '79.0 / 100', isTopper: false },
    { rank: 5, name: 'Amruta Deshmukh', state: 'Maharashtra', exam: 'NABARD Grade A', accuracy: '88.1%', score: '78.5 / 100', isTopper: false },
    { rank: 6, name: 'Vikram Patel', state: 'Gujarat', exam: 'IBPS AFO', accuracy: '87.2%', score: '77.0 / 100', isTopper: false },
    { rank: 7, name: 'Sonia Verma', state: 'Madhya Pradesh', exam: 'ICAR AIEEA', accuracy: '86.5%', score: '76.5 / 100', isTopper: false },
    { rank: 8, name: 'Karthik Rao', state: 'Karnataka', exam: 'IBPS AFO', accuracy: '85.4%', score: '75.0 / 100', isTopper: false },
    { rank: 9, name: 'Divya Nair', state: 'Kerala', exam: 'NABARD Grade A', accuracy: '85.2%', score: '74.8 / 100', isTopper: false },
  ];

  // Map filters
  const filteredRankings = rankings.filter(candidate => {
    const matchesExam = selectedExamTab === 'All' || candidate.exam.includes(selectedExamTab);
    const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) || candidate.state.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesExam && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 p-6 md:p-8 relative overflow-hidden font-sans">
      
      {/* Background radial spotlights */}
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        
        {/* Header Block */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="space-y-1">
            <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest font-mono">Agricultural Rankings</span>
            <h1 className="text-3xl font-extrabold text-slate-101 flex items-center gap-2">
              <Trophy className="text-amber-500 animate-pulse" size={28} /> Merit Leaderboard
            </h1>
            <p className="text-xs text-slate-400">
              Live National Standing of candidates across major agriculture streams. Updated every hour.
            </p>
          </div>
        </header>

        {/* Top 3 Podium Visual Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
          
          {/* Rank 2 */}
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center relative order-2 sm:order-1 mt-0 sm:mt-6">
            <div className="absolute top-4 left-4 text-xs font-black font-mono text-slate-500">#2</div>
            <div className="w-12 h-12 rounded-full border-2 border-slate-450 bg-slate-950 flex items-center justify-center font-bold text-slate-300 text-sm mb-3">PS</div>
            <h3 className="font-bold text-sm text-slate-200">Priyanka Sharma</h3>
            <span className="text-[10px] text-slate-450 mt-0.5 font-mono">Rajasthan</span>
            <div className="px-2 py-0.5 bg-slate-800 rounded font-bold text-[10px] text-slate-350 mt-2">NABARD Grade A</div>
            <p className="text-md font-bold text-slate-100 mt-2">82.0 / 100</p>
          </div>

          {/* Rank 1 */}
          <div className="bg-gradient-to-b from-slate-900/60 to-slate-900/40 border-2 border-emerald-500/20 p-8 rounded-3xl flex flex-col items-center justify-center text-center relative order-1 sm:order-2 shadow-xl shadow-emerald-500/5">
            <div className="absolute top-4 left-4 text-xs font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-500">#1</div>
            <Award className="text-amber-500 w-8 h-8 mb-2 animate-bounce" style={{ animationDuration: '3s' }} />
            <div className="w-16 h-16 rounded-full border-2 border-amber-500/80 bg-slate-950 flex items-center justify-center font-bold text-amber-500 text-lg mb-3">SS</div>
            <h3 className="font-extrabold text-md text-slate-100">Sandeep Singh</h3>
            <span className="text-[10px] text-slate-450 mt-0.5 font-mono">Punjab</span>
            <div className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded font-bold text-[10px] text-emerald-400 mt-2">IBPS AFO</div>
            <p className="text-lg font-black text-slate-100 mt-2">84.5 / 100</p>
          </div>

          {/* Rank 3 */}
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center relative order-3 sm:order-3 mt-0 sm:mt-6">
            <div className="absolute top-4 left-4 text-xs font-black font-mono text-slate-500">#3</div>
            <div className="w-12 h-12 rounded-full border-2 border-amber-800 bg-slate-950 flex items-center justify-center font-bold text-amber-700 text-sm mb-3">AM</div>
            <h3 className="font-bold text-sm text-slate-200">Anshu Mishra</h3>
            <span className="text-[10px] text-slate-455 mt-0.5 font-mono">Uttar Pradesh</span>
            <div className="px-2 py-0.5 bg-slate-800 rounded font-bold text-[10px] text-slate-350 mt-2">ICAR AIEEA</div>
            <p className="text-md font-bold text-slate-100 mt-2">81.5 / 100</p>
          </div>

        </div>

        {/* Filter bar and search */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between pt-4 bg-slate-905/30 border-b border-t border-slate-850 py-4 px-1">
          
          {/* Exam Sub tabs */}
          <div className="flex gap-1 overflow-x-auto scrollbar-none w-full md:w-auto">
            {['All', 'IBPS AFO', 'NABARD', 'ICAR'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedExamTab(tab as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition ${
                  selectedExamTab === tab 
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-64">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search candidate or State..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 pl-10 pr-4 py-2 text-xs rounded-xl outline-none text-slate-300 focus:border-emerald-500/40 transition"
            />
          </div>

        </div>

        {/* Main Leaderboard Rankings list */}
        <div className="bg-slate-900/10 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          
          <div className="grid grid-cols-12 px-6 py-3 border-b border-slate-805 text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">
            <div className="col-span-2">Rank</div>
            <div className="col-span-4">Candidate</div>
            <div className="col-span-3">State</div>
            <div className="col-span-3 text-right text-slate-300">Accuracy & Score</div>
          </div>

          <div className="divide-y divide-slate-850">
            {filteredRankings.map((candidate) => (
              <div key={candidate.rank} className="grid grid-cols-12 px-6 py-4.5 items-center hover:bg-slate-900/25 transition">
                <div className="col-span-2 font-mono font-bold text-xs flex items-center gap-1">
                  {candidate.rank <= 3 ? (
                    <Medal size={14} className={candidate.rank === 1 ? 'text-amber-500' : candidate.rank === 2 ? 'text-slate-405' : 'text-amber-700'} />
                  ) : null}
                  #{candidate.rank}
                </div>
                <div className="col-span-4 font-semibold text-xs text-slate-200 flex flex-col">
                  <span>{candidate.name}</span>
                  <span className="text-[9px] text-slate-500 mt-0.5 font-normal font-mono">{candidate.exam}</span>
                </div>
                <div className="col-span-3 text-xs text-slate-400 font-medium flex items-center gap-1">
                  <MapPin size={11} className="text-slate-600" /> {candidate.state}
                </div>
                <div className="col-span-3 font-mono text-xs text-right space-y-0.5 font-bold">
                  <div className="text-emerald-400">{candidate.accuracy} Accuracy</div>
                  <div className="text-slate-500 text-[10px] font-medium">{candidate.score}</div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Logged in User rank spotlight footer card */}
        <footer className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center font-black text-emerald-400 text-sm border border-emerald-500/20">
              #1,418
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                Your National Standing <Sparkles size={14} className="text-emerald-400" />
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Practice more Weed selective drills to raise your accuracy standing to #1,200 percentile group!
              </p>
            </div>
          </div>
          <div className="text-right flex flex-col items-end shrink-0">
            <span className="text-xs font-bold text-slate-203 font-mono uppercase tracking-wider">{user?.name}</span>
            <span className="text-[10px] text-emerald-405 font-mono font-medium">74.2% global accuracy</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
