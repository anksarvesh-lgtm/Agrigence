
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, LucideIcon } from 'lucide-react';

interface ToolCardProps {
  name: string;
  description: string;
  route: string;
  icon: LucideIcon;
  category: string;
  isLocked?: boolean;
}

const ToolCard: React.FC<ToolCardProps> = ({ name, description, route, icon: Icon, category, isLocked }) => {
  return (
    <div className={`bg-white rounded-3xl p-6 border border-stone-100 group hover:border-agri-secondary/30 transition-all ${isLocked ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="bg-agri-secondary/10 p-3 rounded-2xl text-agri-secondary">
          <Icon size={24} />
        </div>
        <span className="text-[9px] font-black bg-agri-secondary/10 text-agri-secondary px-3 py-1 rounded-full uppercase tracking-widest">
          {category}
        </span>
      </div>
      <h4 className="font-bold text-agri-primary text-lg mb-2">{name}</h4>
      <p className="text-stone-500 text-sm mb-6 leading-relaxed">
        {description}
      </p>
      {isLocked ? (
        <div className="w-full py-3 bg-stone-100 text-stone-400 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-not-allowed">
          Upgrade to Access
        </div>
      ) : (
        <Link 
          to={route}
          className="w-full py-3 bg-white text-agri-primary border border-stone-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:bg-agri-secondary hover:text-white hover:border-agri-secondary"
        >
          Open Tool <ChevronRight size={14} />
        </Link>
      )}
    </div>
  );
};

export default ToolCard;
