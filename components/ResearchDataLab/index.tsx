import React, { useState } from 'react';
import ResearcherConsole from './ResearcherConsole';
import StudentPortal from './StudentPortal';
import { FlaskConical, UploadCloud } from 'lucide-react';

const ResearchDataLab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'researcher' | 'student'>('researcher');

  return (
    <div className="min-h-screen bg-[#f7f5f0] pb-20 font-serif text-[#1a1a1a]">
      {/* Header */}
      <div className="bg-white border-b border-[#d4cfc6] pt-12 pb-8 shadow-sm relative z-10">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-[#e8f4ee] text-[#1a6b3c] p-2 rounded-xl shadow-sm border border-[#1a6b3c]/10">
                  <FlaskConical size={28} strokeWidth={2.5} />
                </div>
                <h1 className="text-4xl font-bold text-[#1a6b3c] tracking-tight">Research Data Lab</h1>
              </div>
              <p className="text-[#8a8a8a] text-xs font-black uppercase tracking-widest mt-2">
                Fivearth Farms Private Limited · Agricultural Research Division
              </p>
            </div>

            {/* Section Toggle */}
            <div className="flex bg-[#f7f5f0] p-1.5 rounded-2xl border border-[#d4cfc6] shadow-inner">
              <button
                onClick={() => setActiveTab('researcher')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === 'researcher'
                    ? 'bg-white text-[#1a6b3c] shadow-sm border-b-2 border-[#1a6b3c]'
                    : 'text-[#8a8a8a] hover:text-[#1a1a1a] hover:bg-white/50'
                }`}
              >
                <FlaskConical size={18} />
                Part A — Researcher's Console
              </button>
              <button
                onClick={() => setActiveTab('student')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === 'student'
                    ? 'bg-white text-[#1e4080] shadow-sm border-b-2 border-[#1e4080]'
                    : 'text-[#8a8a8a] hover:text-[#1a1a1a] hover:bg-white/50'
                }`}
              >
                <UploadCloud size={18} />
                Part B — Student Upload Portal
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 max-w-7xl mt-12">
        {activeTab === 'researcher' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 flex items-center gap-4">
              <span className="bg-[#1a6b3c] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">
                Part A
              </span>
              <h2 className="text-2xl font-bold text-[#1a1a1a]">Manual Data Entry Console</h2>
            </div>
            <ResearcherConsole />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 flex items-center gap-4">
              <span className="bg-[#1e4080] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">
                Part B
              </span>
              <h2 className="text-2xl font-bold text-[#1a1a1a]">Excel / CSV Upload Portal</h2>
            </div>
            <StudentPortal />
          </div>
        )}
      </div>
    </div>
  );
};

export default ResearchDataLab;
