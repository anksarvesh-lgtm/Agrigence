
import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'dark' | 'light';
}

const Logo: React.FC<LogoProps> = ({ className = "h-12 w-auto", variant = 'dark' }) => {
  // Brand Palette
  const primary = variant === 'dark' ? '#3D2B1F' : '#FFFFFF';
  const leafGreen = '#4A7C59';
  const leafLight = '#6A9955';

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
        aria-label="Agrigence Logo"
      >
        <defs>
          <linearGradient id="leafGradientNew" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={leafLight} />
            <stop offset="100%" stopColor={leafGreen} />
          </linearGradient>
        </defs>

        {/* --- PLANT GROWING FROM BOOK --- */}
        
        {/* Main Stem */}
        <path 
          d="M 50 72 Q 52 50 50 25" 
          stroke={leafGreen} 
          strokeWidth="3" 
          strokeLinecap="round"
        />

        {/* Top Leaf */}
        <path
          d="M 50 25 Q 30 10 50 0 Q 70 10 50 25 Z"
          fill="url(#leafGradientNew)"
        />
        
        {/* Side Leaf Left */}
        <path
          d="M 50 50 Q 25 45 15 30 Q 30 35 50 50 Z"
          fill="url(#leafGradientNew)"
        />

        {/* Side Leaf Right */}
        <path
          d="M 50 45 Q 75 40 85 25 Q 70 30 50 45 Z"
          fill="url(#leafGradientNew)"
        />

        {/* --- BOOK BASE --- */}
        <g stroke={primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
           {/* Book Spine Center */}
           <path d="M 50 72 L 50 95" />
           
           {/* Left Page Top Curve */}
           <path d="M 50 72 Q 30 82 10 68" />
           {/* Left Page Bottom Curve (Thickness) */}
           <path d="M 50 95 Q 30 105 10 90" />
           {/* Left Page Vertical Edge */}
           <path d="M 10 68 L 10 90" />
           
           {/* Right Page Top Curve */}
           <path d="M 50 72 Q 70 82 90 68" />
           {/* Right Page Bottom Curve (Thickness) */}
           <path d="M 50 95 Q 70 105 90 90" />
           {/* Right Page Vertical Edge */}
           <path d="M 90 68 L 90 90" />
           
           {/* Subtle Pages Lines (Text hint) */}
           <path d="M 20 78 Q 35 85 45 80" strokeWidth="1.5" opacity="0.5" />
           <path d="M 55 80 Q 65 85 80 78" strokeWidth="1.5" opacity="0.5" />
        </g>

      </svg>
    </div>
  );
};

export default Logo;
