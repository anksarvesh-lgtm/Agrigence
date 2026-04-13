import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'dark' | 'light';
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "h-12 w-auto", variant = 'dark', showText = false }) => {
  return (
    <div className={`font-serif font-bold text-2xl ${variant === 'dark' ? 'text-agri-primary' : 'text-white'} ${className}`}>
      Agrigence
    </div>
  );
};

export default Logo;
