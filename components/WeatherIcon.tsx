import React from 'react';

interface WeatherIconProps {
  code: number;
  className?: string; // Extra wrapper classes
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ code, className = '' }) => {
   // WMO code mapping
   
   // Clear Sky
   if (code === 0) {
      return (
         <div className={`shrink-0 ${className}`}>
           <div className="sun-container mx-auto"></div>
         </div>
      );
   } 
   // Partly Cloudy
   else if (code >= 1 && code <= 3) {
      return (
         <div className={`shrink-0 ${className}`}>
           <div className="cloud-container mx-auto">
             <div className="cloud-anim moving-cloud"></div>
           </div>
         </div>
      );
   }
   // Fog
   else if (code === 45 || code === 48) {
      return (
         <div className={`shrink-0 ${className}`}>
           <div className="fog-container mx-auto">
              <div className="fog-bar"></div>
              <div className="fog-bar"></div>
              <div className="fog-bar"></div>
           </div>
         </div>
      );
   }
   // Rain / Drizzle / Showers
   else if ((code >= 51 && code <= 65) || (code >= 80 && code <= 82)) {
      return (
         <div className={`shrink-0 ${className}`}>
           <div className="rain-container mx-auto">
              <div className="drop"></div>
              <div className="drop"></div>
              <div className="drop"></div>
              <div className="drop"></div>
              <div className="drop"></div>
           </div>
         </div>
      );
   } 
   // Thunderstorm
   else if (code >= 95) {
      return (
         <div className={`shrink-0 ${className}`}>
           <div className="thunder-container mx-auto">
              <div className="storm-cloud"></div>
              <div className="lightning"></div>
           </div>
         </div>
      );
   } 
   // Default Fallback
   else {
      return (
         <div className={`shrink-0 ${className}`}>
           <div className="cloud-container mx-auto bg-stone-300">
             <div className="cloud-anim"></div>
           </div>
         </div>
      );
   }
};
