import React, { useState, useEffect } from 'react';
import { mockBackend } from '../services/mockBackend';

interface LogoProps {
  className?: string;
  variant?: 'dark' | 'light';
}

const Logo: React.FC<LogoProps> = ({ className = "h-12 w-auto", variant = 'dark' }) => {
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    const settings = mockBackend.getSettings();
    setLogoUrl(settings.logoUrl);
  }, []);

  // Fallback rendering logic if image fails or logoUrl is empty
  const renderFallback = () => (
    <span className={`font-serif font-bold text-2xl ${variant === 'light' ? 'text-white' : 'text-agri-primary'}`}>
      Agrigence
    </span>
  );

  if (!logoUrl) return renderFallback();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img 
        src={logoUrl} 
        alt="Agrigence Logo" 
        className={`object-contain h-full transition-all ${variant === 'light' ? 'brightness-0 invert opacity-90' : ''}`}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          const parent = e.currentTarget.parentElement;
          if (parent) {
            parent.innerHTML = `<span class="font-serif font-bold text-2xl ${variant === 'light' ? 'text-white' : 'text-agri-primary'}">Agrigence</span>`;
          }
        }}
      />
    </div>
  );
};

export default Logo;