import React from 'react';
import AgriFeedLogo from './AgriFeed/AgriFeedLogo';

interface LogoProps {
  className?: string;
  variant?: 'dark' | 'light';
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "h-12 w-auto", variant = 'dark', showText = false }) => {
  // Extract height from className if possible to set size
  const heightMatch = className.match(/h-(\d+)/);
  const size = heightMatch ? parseInt(heightMatch[1]) * 4 : 40;

  return (
    <AgriFeedLogo 
      className={className} 
      size={size} 
      showText={showText} 
      variant={variant} 
    />
  );
};

export default Logo;
