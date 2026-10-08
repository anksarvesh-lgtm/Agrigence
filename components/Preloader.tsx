import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Shifting agricultural intelligence statuses
const STATUSES = [
  "Initializing Agri-Intelligence Core...",
  "Calibrating Predictive Soil Models...",
  "Analyzing Real-Time Market Trends...",
  "Harvesting Scientific Databases...",
  "Formatting Academic Journal Archives...",
  "Cultivating Next-Gen Agriculture..."
];

const Preloader: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);

  // Dynamically increment progress from 0 to 100 over 1.9 seconds, allowing 100ms of final view
  useEffect(() => {
    let currentProgress = 0;
    const startTime = Date.now();
    const duration = 1800; // 1.8 seconds

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(1, elapsed / duration);
      
      // Use an easing out cubic function to make it feel super organic and responsive
      // Start fast, slow down as it gets closer to 100%
      const easedPct = 1 - Math.pow(1 - pct, 3);
      currentProgress = Math.floor(easedPct * 100);

      if (currentProgress >= 100) {
        setProgress(100);
      } else {
        setProgress(currentProgress);
        requestAnimationFrame(updateProgress);
      }
    };

    const frameId = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Sync statuses with current progress range
  useEffect(() => {
    const index = Math.min(
      Math.floor((progress / 100) * STATUSES.length),
      STATUSES.length - 1
    );
    setStatusIndex(index);
  }, [progress]);

  // Stable generation of drifting environmental particles to avoid layout shifts
  const particles = React.useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      size: Math.random() * 5 + 3, // 3px to 8px
      left: `${(i * 7 + Math.random() * 5) % 100}%`, // Distribute evenly
      duration: Math.random() * 3 + 4, // 4s to 7s slow drift
      delay: Math.random() * 1.5,
      opacity: Math.random() * 0.25 + 0.1,
    }));
  }, []);

  return (
    <div className="fixed inset-0 bg-[#FDFCFB] dark:bg-[#0F172A] z-[9999] flex flex-col items-center justify-center overflow-hidden transition-colors duration-500">
      
      {/* Decorative Rising Soil Energy Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: "110vh", opacity: 0 }}
          animate={{ 
            y: "-10vh", 
            opacity: [0, p.opacity, p.opacity, 0] 
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeOut"
          }}
          style={{
            position: "absolute",
            left: p.left,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            backgroundColor: p.id % 2 === 0 ? "var(--secondary-journal, #1A3C40)" : "var(--accent-journal, #C29263)",
            filter: "blur(0.5px)",
            pointerEvents: "none",
            zIndex: 1
          }}
        />
      ))}

      {/* Background Dual Ambient Glows (Forest & Gold/Navy) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.5, scale: 1.1 }}
          transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
          className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[120px]"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 0.4, scale: 1.2 }}
          transition={{ duration: 5, repeat: Infinity, repeatType: "reverse", delay: 1 }}
          className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-[150px]"
        />
      </div>

      <div className="relative flex flex-col items-center justify-center z-10 w-full max-w-md px-6">
        
        {/* Modern Interactive SVG Growth Loader */}
        <div className="relative w-44 h-44 flex items-center justify-center mb-8">
          
          {/* Main Tracking Ring with Glow */}
          <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible drop-shadow-[0_12px_32px_rgba(26,60,64,0.12)] dark:drop-shadow-[0_12px_32px_rgba(74,222,128,0.08)]">
            <defs>
              <linearGradient id="primary-harvest-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10B981" /> {/* Forest Emerald */}
                <stop offset="60%" stopColor="#2563EB" /> {/* Deep Royal Blue */}
                <stop offset="100%" stopColor="#C29263" /> {/* Premium Harvest Gold */}
              </linearGradient>
            </defs>

            {/* Backdashed Track */}
            <circle
              cx="60"
              cy="60"
              r="48"
              fill="none"
              stroke="var(--border-journal, #E5E7EB)"
              className="dark:stroke-slate-800"
              strokeWidth="2.5"
              strokeDasharray="4 4"
              opacity="0.6"
            />

            {/* Running Glowing Arc */}
            <motion.circle
              cx="60"
              cy="60"
              r="48"
              fill="none"
              stroke="url(#primary-harvest-grad)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="301.59"
              strokeDashoffset={301.59 * (1 - progress / 100)}
              transform="rotate(-90 60 60)"
              className="drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
            />

            {/* The Earth Line */}
            <motion.path 
              d="M 35 96 Q 60 102 85 96" 
              fill="none" 
              stroke="#8B5E34" 
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
            />

            {/* Active Sprout Stem in Perfect Sync with Progress */}
            <motion.path 
              d="M 60 96 Q 63 70 60 42" 
              fill="none" 
              stroke="#10B981" 
              strokeWidth="3.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: progress / 100 }}
              transition={{ type: "tween", ease: "easeInOut" }}
            />

            {/* Left Primary Leaf */}
            {progress > 30 && (
              <motion.path 
                d="M 60 72 Q 44 67 48 58 Q 56 63 60 72" 
                fill="#34D399"
                stroke="none"
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
                style={{ originX: "60px", originY: "72px" }}
              />
            )}

            {/* Right Secondary Leaf */}
            {progress > 62 && (
              <motion.path 
                d="M 60 60 Q 76 55 72 46 Q 64 51 60 60" 
                fill="#059669"
                stroke="none"
                initial={{ scale: 0, rotate: 20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.4, type: "spring", stiffness: 120, delay: 0.05 }}
                style={{ originX: "60px", originY: "60px" }}
              />
            )}

            {/* Radiant Blooming Flower Bud */}
            {progress > 88 && (
              <motion.g
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 180 }}
              >
                <circle cx="60" cy="42" r="7.5" fill="#FBBF24" />
                <circle cx="60" cy="42" r="3" fill="#FFF" />
              </motion.g>
            )}
          </svg>

          {/* Floating Monospace Percentage Count inside Loader Center */}
          <div className="absolute inset-x-0 bottom-4 flex flex-col items-center justify-center">
            <motion.span 
              className="text-sm font-mono font-semibold tracking-wider text-slate-500 dark:text-slate-400 opacity-80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {progress}<span className="text-[10px]">%</span>
            </motion.span>
          </div>
        </div>

        {/* Dynamic Branded Context */}
        <div className="text-center w-full">
          <motion.h1 
            className="text-4xl font-serif text-[#002147] dark:text-[#E2E8F0] font-bold tracking-tight mb-2 selection:bg-none"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Agrigence
          </motion.h1>

          <motion.div
            className="h-6 flex items-center justify-center overflow-hidden mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-[#1A3C40] dark:text-emerald-400 text-[10px] font-sans font-extrabold uppercase tracking-[0.25em] whitespace-nowrap">
              Where Agri-Intelligence Meets Agricultural Generations
            </p>
          </motion.div>

          {/* Dynamic Status Progress bar and Shifting Action Statement */}
          <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-full h-[3px] mb-4 overflow-hidden relative">
            <motion.div 
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ ease: "easeInOut" }}
            />
          </div>

          <div className="h-5 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p 
                key={statusIndex}
                className="text-xs text-slate-400 dark:text-slate-500 font-mono tracking-wide selection:bg-none"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                {STATUSES[statusIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Preloader;
