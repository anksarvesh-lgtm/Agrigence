import React from 'react';

interface AgriFeedLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  layout?: 'vertical' | 'horizontal';
  variant?: 'dark' | 'light';
}

const AgriFeedLogo: React.FC<AgriFeedLogoProps> = ({ 
  className = "", 
  size = 40, 
  showText = true, 
  layout = 'horizontal',
  variant = 'dark'
}) => {
  const primaryColor = variant === 'dark' ? "#1B5E20" : "#FFFFFF"; // Deep green or White
  const secondaryColor = variant === 'dark' ? "#4CAF50" : "#A5D6A7"; // Fresh green or Light green
  const textColor = variant === 'dark' ? '#1B5E20' : '#FFFFFF';

  const Icon = () => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      {/* Field Lines / Signal Waves */}
      <path 
        d="M6 32C6 32 11 22 20 22C29 22 34 32 34 32" 
        stroke={secondaryColor} 
        strokeWidth="4.5" 
        strokeLinecap="round"
      />
      <path 
        d="M12 22C12 22 15 14 20 14C25 14 28 22 28 22" 
        stroke={primaryColor} 
        strokeWidth="4.5" 
        strokeLinecap="round"
      />
      <path 
        d="M17 14C17 14 18.5 10 20 10C21.5 10 23 14 23 14" 
        stroke={secondaryColor} 
        strokeWidth="4.5" 
        strokeLinecap="round"
      />
      
      {/* Subtle "Feed" dot at the top */}
      <circle cx="20" cy="5" r="2.5" fill={primaryColor} />
    </svg>
  );

  if (!showText) {
    return <Icon />;
  }

  return (
    <div className={`flex items-center ${layout === 'vertical' ? 'flex-col gap-2' : 'flex-row gap-3'} ${className}`}>
      <Icon />
      <div className={`flex items-baseline font-sans tracking-tight ${layout === 'vertical' ? 'text-center' : ''}`}>
        <span 
          style={{ color: primaryColor, fontSize: size * 0.7, fontWeight: 800 }}
          className="leading-none"
        >
          Agri
        </span>
        <span 
          style={{ color: secondaryColor, fontSize: size * 0.7, fontWeight: 400 }}
          className="leading-none"
        >
          gence
        </span>
      </div>
    </div>
  );
};

export default AgriFeedLogo;
