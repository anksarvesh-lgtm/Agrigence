import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, GitBranch, Calculator, FileText } from 'lucide-react';

const ToolsNavigation: React.FC = () => {
  const location = useLocation();
  const tools = [
    { name: 'Dashboard', path: '/analytics', icon: LayoutDashboard },
    { name: 'Pipeline Builder', path: '/analytics/pipeline', icon: GitBranch },
    { name: 'Agrigence ANOVA Engine', path: '/analytics/anova', icon: Calculator },
  ];

  return (
    <div className="w-64 bg-white border-r border-stone-200 h-screen p-6 flex flex-col">
      <h2 className="text-xl font-bold text-stone-800 mb-8 font-serif">Analytics Tools</h2>
      <nav className="space-y-2">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = location.pathname === tool.path;
          return (
            <Link
              key={tool.path}
              to={tool.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                isActive 
                  ? 'bg-agri-primary text-white' 
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Icon size={20} />
              {tool.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default ToolsNavigation;
