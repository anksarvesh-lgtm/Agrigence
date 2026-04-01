import React from 'react';
import { Leaf } from 'lucide-react';

interface LogoProps {
  className?: string;
  variant?: 'dark' | 'light';
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "h-12 w-auto", variant = 'dark', showText = false }) => {
  return (
    <div className={`flex items-center gap-2 ${className} ${variant === 'light' ? 'text-white' : 'text-agri-primary'}`}>
      <Leaf size={24} />
      {showText && <span className="font-serif font-bold text-xl tracking-tight">Agrigence</span>}
    </div>
  );
};

export default Logo;
