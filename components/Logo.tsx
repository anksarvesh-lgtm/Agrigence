import React, { useState, useEffect } from 'react';
import { mockBackend } from '../services/mockBackend';

interface LogoProps {
  className?: string;
  variant?: 'dark' | 'light';
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "h-12 w-auto", variant = 'dark', showText = false }) => {
  const [logoPath, setLogoPath] = useState("/logo.png");

  useEffect(() => {
    const settings = mockBackend.getSettings();
    if (settings && settings.logoUrl) {
      setLogoPath(settings.logoUrl);
    }
  }, []);

  return (
    <div className="flex items-center gap-2">
      <img 
        src={logoPath} 
        alt="Agrigence Logo" 
        className={className}
        referrerPolicy="no-referrer"
        onError={(e) => {
          // Fallback to text if the image is missing
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
      {showText && (
        <span className={`font-serif font-bold text-2xl ${variant === 'dark' ? 'text-agri-primary' : 'text-white'}`}>
          Agrigence
        </span>
      )}
    </div>
  );
};

export default Logo;
