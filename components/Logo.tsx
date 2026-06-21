import React, { useState, useEffect } from 'react';
import { mockBackend } from '../services/mockBackend';

interface LogoProps {
  className?: string;
  variant?: 'dark' | 'light';
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "h-12 w-auto", variant = 'dark', showText = false }) => {
  const defaultLogo = "https://kpnttmkkjq9kpa0f.public.blob.vercel-storage.com/settings/1778090902639-WhatsApp_Image_2026-04-05_at_21.20.18-removebg-preview.png";
  const [logoPath, setLogoPath] = useState(defaultLogo);

  useEffect(() => {
    const handleUrl = (url?: string) => {
      if (!url || url.includes('/logo.png') || url === 'null' || url === 'undefined') {
        setLogoPath(defaultLogo);
      } else {
        setLogoPath(url);
      }
    };

    // Initial fetch
    const settings = mockBackend.getSettings();
    handleUrl(settings?.logoUrl);

    // Subscribe to future updates
    const unsub = mockBackend.subscribeToSettings((data) => {
      handleUrl(data?.logoUrl);
    });

    return () => unsub();
  }, []);

  return (
    <div className="flex items-center gap-2 shrink-0 max-w-[200px]">
      <img 
        src={logoPath} 
        alt="Agrigence Logo" 
        className={`object-contain shrink-0 ${className} ${logoPath === defaultLogo ? 'opacity-90' : ''}`}
        referrerPolicy="no-referrer"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          if (target.src !== defaultLogo) {
            target.src = defaultLogo;
          }
        }}
        key={logoPath}
      />
      {showText && (
        <span className={`font-serif font-bold text-2xl ${variant === 'dark' ? 'text-agri-primary' : 'text-white'}`}>
          Agrigence Publication
        </span>
      )}
    </div>
  );
};

export default Logo;
