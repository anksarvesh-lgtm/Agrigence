import React from 'react';
import { Plus, Database, GitBranch, LayoutDashboard, Calculator } from 'lucide-react';
import { Link } from 'react-router-dom';
import ToolsNavigation from '../components/ToolsNavigation';

const DashboardHome: React.FC = () => {
  // Mock data for frontend-only build
  const projects = [
    { id: '1', name: 'Crop Yield Analysis 2025', date: 'Just now' },
    { id: '2', name: 'Soil Moisture Trends', date: '2 hours ago' },
  ];

  return (
    <div className="flex bg-[#E4E3E0] min-h-screen">
      <ToolsNavigation />
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <h1 className="text-4xl font-bold text-stone-900 font-serif tracking-tight">Analytics Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l border-stone-900">
            {/* Recent Projects */}
            <div className="bg-[#E4E3E0] p-6 border-r border-b border-stone-900">
              <h2 className="font-serif italic text-sm uppercase tracking-widest mb-6 flex items-center gap-2 text-stone-600">
                <LayoutDashboard size={16}/> Recent Projects
              </h2>
              <div className="space-y-3">
                {projects.map(p => (
                  <div key={p.id} className="p-4 bg-white/80 backdrop-blur-sm border border-stone-900 hover:bg-stone-900 hover:text-white transition-colors cursor-pointer group glossy">
                    <p className="font-medium text-stone-900 group-hover:text-white">{p.name}</p>
                    <p className="text-xs text-stone-500 group-hover:text-stone-300 mt-1 font-mono">Updated: {p.date}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Assets */}
            <div className="bg-[#E4E3E0] p-6 border-r border-b border-stone-900">
              <h2 className="font-serif italic text-sm uppercase tracking-widest mb-6 flex items-center gap-2 text-stone-600">
                <Database size={16}/> Data Assets
              </h2>
              <div className="flex items-baseline gap-2">
                <p className="text-6xl font-light text-stone-900 font-mono">12</p>
                <span className="text-sm text-stone-600 font-medium uppercase tracking-wider">Datasets</span>
              </div>
              <div className="mt-8 space-y-4">
                <div className="flex justify-between text-sm border-b border-stone-300 pb-2">
                  <span className="text-stone-600">Total Size</span>
                  <span className="font-mono font-medium">1.2 GB</span>
                </div>
                <div className="flex justify-between text-sm border-b border-stone-300 pb-2">
                  <span className="text-stone-600">Connected Sources</span>
                  <span className="font-mono font-medium">3</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#E4E3E0] p-6 border-b border-stone-900">
              <h2 className="font-serif italic text-sm uppercase tracking-widest mb-6 flex items-center gap-2 text-stone-600">
                <Plus size={16}/> Quick Actions
              </h2>
              <div className="flex flex-col gap-3">
                <button className="flex items-center justify-between w-full p-4 bg-white/80 backdrop-blur-sm border border-stone-900 hover:bg-stone-900 hover:text-white transition-colors font-medium group glossy">
                  Upload Dataset <Database size={16} className="group-hover:text-white"/>
                </button>
                <Link to="/analytics/pipeline" className="flex items-center justify-between w-full p-4 bg-white/80 backdrop-blur-sm border border-stone-900 hover:bg-stone-900 hover:text-white transition-colors font-medium group glossy">
                  Create Pipeline <GitBranch size={16} className="group-hover:text-white"/>
                </Link>
                <Link to="/analytics/anova" className="flex items-center justify-between w-full p-4 bg-agri-primary/80 backdrop-blur-md text-white hover:bg-stone-900 transition-colors font-medium glossy">
                  Agrigence ANOVA Engine <Calculator size={16}/>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
