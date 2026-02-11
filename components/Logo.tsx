
import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'dark' | 'light';
}

const Logo: React.FC<LogoProps> = ({ className = "h-12 w-auto", variant = 'dark' }) => {
  const primary = variant === 'dark' ? '#3D2B1F' : '#FFFFFF';
  const leafColor = '#4A7C59'; // Nature Green
  const techColor = variant === 'dark' ? '#C29263' : '#D4A373'; // Circuit Copper/Gold

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        aria-label="Agrigence Logo"
      >
        <defs>
          <linearGradient id="organicGrad" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={leafColor} stopOpacity="0.9"/>
            <stop offset="100%" stopColor="#2E5D3B" stopOpacity="1"/>
          </linearGradient>
        </defs>

        {/* --- LEFT: ORGANIC LEAF (Agriculture) --- */}
        <path
          d="M 50 10 Q 10 10 10 55 Q 10 85 50 95 L 50 10 Z"
          fill="url(#organicGrad)"
        />
        {/* Natural Veins */}
        <path d="M 50 30 Q 30 35 20 25" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" strokeLinecap="round"/>
        <path d="M 50 50 Q 25 55 15 45" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" strokeLinecap="round"/>
        <path d="M 50 70 Q 35 75 25 65" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" strokeLinecap="round"/>


        {/* --- RIGHT: TECH CIRCUIT (Technology) --- */}
        {/* The shape outline mirrors the leaf but constructed of lines */}
        <path
          d="M 50 10 Q 90 10 90 55 Q 90 85 50 95"
          stroke={primary}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Circuit Nodes & Traces */}
        <g fill={techColor}>
           <circle cx="75" cy="30" r="3" />
           <circle cx="85" cy="55" r="3" />
           <circle cx="70" cy="80" r="3" />
        </g>
        
        <g stroke={primary} strokeWidth="2" strokeLinecap="round">
           {/* Top Trace */}
           <path d="M 50 30 L 65 30 L 75 30" />
           {/* Mid Trace */}
           <path d="M 50 50 L 70 50 L 85 55" />
           {/* Bottom Trace */}
           <path d="M 50 70 L 60 70 L 70 80" />
           
           {/* Vertical Connector */}
           <path d="M 75 30 L 75 40" strokeWidth="1.5"/>
        </g>


        {/* --- CENTER: STEM (Knowledge) --- */}
        {/* A strong central line binding them */}
        <path
          d="M 50 5 L 50 98"
          stroke={primary}
          strokeWidth="3"
          strokeLinecap="round"
        />
        
        {/* Book Base / Horizon (Subtle grounding) */}
        <path 
          d="M 40 95 L 60 95" 
          stroke={primary} 
          strokeWidth="3" 
          strokeLinecap="round" 
        />

      </svg>
    </div>
  );
};

export default Logo;
