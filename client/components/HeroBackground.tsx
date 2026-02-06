'use client';

import { useEffect, useState } from 'react';

// Lightweight CSS-based animated background for hero section
// Respects prefers-reduced-motion and pauses on low-end devices

export default function HeroBackground() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isLowEnd, setIsLowEnd] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    // Detect low-end device (basic heuristic)
    const isLowEndDevice = 
      navigator.hardwareConcurrency <= 2 || 
      (navigator as any).deviceMemory < 4 ||
      /Android [1-5]/i.test(navigator.userAgent);
    setIsLowEnd(isLowEndDevice);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Skip animation for reduced motion or low-end devices
  if (reducedMotion || isLowEnd) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-purple-50/40" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />
      
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 opacity-60">
        <div className="absolute inset-0 bg-gradient-radial from-blue-200/30 via-transparent to-transparent animate-pulse-slow" />
      </div>

      {/* Floating Elements Container */}
      <div className="absolute inset-0">
        {/* Floating Note Cards */}
        <div className="absolute top-[10%] left-[5%] w-16 h-20 md:w-24 md:h-28 animate-float-slow opacity-20">
          <svg viewBox="0 0 80 100" fill="none" className="w-full h-full">
            <rect x="5" y="5" width="70" height="90" rx="4" fill="currentColor" className="text-blue-400" />
            <line x1="15" y1="25" x2="65" y2="25" stroke="currentColor" strokeWidth="2" className="text-blue-600" />
            <line x1="15" y1="40" x2="55" y2="40" stroke="currentColor" strokeWidth="2" className="text-blue-600" />
            <line x1="15" y1="55" x2="60" y2="55" stroke="currentColor" strokeWidth="2" className="text-blue-600" />
            <line x1="15" y1="70" x2="45" y2="70" stroke="currentColor" strokeWidth="2" className="text-blue-600" />
          </svg>
        </div>

        <div className="absolute top-[60%] right-[8%] w-14 h-18 md:w-20 md:h-24 animate-float-medium opacity-15">
          <svg viewBox="0 0 80 100" fill="none" className="w-full h-full rotate-12">
            <rect x="5" y="5" width="70" height="90" rx="4" fill="currentColor" className="text-purple-400" />
            <line x1="15" y1="25" x2="65" y2="25" stroke="currentColor" strokeWidth="2" className="text-purple-600" />
            <line x1="15" y1="40" x2="55" y2="40" stroke="currentColor" strokeWidth="2" className="text-purple-600" />
            <line x1="15" y1="55" x2="60" y2="55" stroke="currentColor" strokeWidth="2" className="text-purple-600" />
          </svg>
        </div>

        {/* Floating Book */}
        <div className="absolute top-[25%] right-[15%] w-20 h-16 md:w-28 md:h-20 animate-float-fast opacity-15">
          <svg viewBox="0 0 100 80" fill="none" className="w-full h-full -rotate-6">
            <path d="M10 10 Q50 5 50 40 Q50 5 90 10 L90 70 Q50 65 50 40 Q50 65 10 70 Z" fill="currentColor" className="text-indigo-300" />
            <path d="M50 10 L50 70" stroke="currentColor" strokeWidth="2" className="text-indigo-500" />
          </svg>
        </div>

        <div className="absolute bottom-[15%] left-[12%] w-16 h-14 md:w-24 md:h-18 animate-float-slow opacity-20 delay-1000">
          <svg viewBox="0 0 100 80" fill="none" className="w-full h-full rotate-6">
            <path d="M10 10 Q50 5 50 40 Q50 5 90 10 L90 70 Q50 65 50 40 Q50 65 10 70 Z" fill="currentColor" className="text-blue-300" />
            <path d="M50 10 L50 70" stroke="currentColor" strokeWidth="2" className="text-blue-500" />
          </svg>
        </div>

        {/* Floating Academic Icons */}
        {/* Graduation Cap */}
        <div className="absolute top-[40%] left-[20%] w-12 h-12 md:w-16 md:h-16 animate-float-medium opacity-15">
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <polygon points="32,8 4,24 32,40 60,24" fill="currentColor" className="text-indigo-400" />
            <polygon points="12,28 12,44 32,56 52,44 52,28" fill="currentColor" className="text-indigo-300" />
            <line x1="52" y1="24" x2="52" y2="44" stroke="currentColor" strokeWidth="3" className="text-indigo-500" />
            <circle cx="52" cy="48" r="4" fill="currentColor" className="text-indigo-500" />
          </svg>
        </div>

        {/* Pencil */}
        <div className="absolute bottom-[30%] right-[20%] w-10 h-10 md:w-14 md:h-14 animate-float-fast opacity-20">
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full rotate-45">
            <rect x="20" y="8" width="12" height="40" rx="1" fill="currentColor" className="text-yellow-400" />
            <polygon points="26,48 20,58 32,58" fill="currentColor" className="text-yellow-600" />
            <rect x="20" y="8" width="12" height="8" fill="currentColor" className="text-pink-400" />
          </svg>
        </div>

        {/* Light Bulb (Idea) */}
        <div className="absolute top-[70%] left-[30%] w-10 h-10 md:w-12 md:h-12 animate-float-slow delay-500 opacity-15">
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <path d="M32 8 C18 8 8 20 8 32 C8 40 14 48 22 52 L22 56 L42 56 L42 52 C50 48 56 40 56 32 C56 20 46 8 32 8" fill="currentColor" className="text-yellow-300" />
            <rect x="22" y="56" width="20" height="4" fill="currentColor" className="text-gray-400" />
            <rect x="24" y="60" width="16" height="2" fill="currentColor" className="text-gray-400" />
          </svg>
        </div>

        {/* Floating particles/dots */}
        <div className="absolute top-[15%] right-[30%] w-3 h-3 md:w-4 md:h-4 rounded-full bg-blue-400/30 animate-float-particle" />
        <div className="absolute top-[50%] left-[8%] w-2 h-2 md:w-3 md:h-3 rounded-full bg-purple-400/25 animate-float-particle delay-300" />
        <div className="absolute bottom-[25%] right-[35%] w-2 h-2 rounded-full bg-indigo-400/30 animate-float-particle delay-700" />
        <div className="absolute top-[35%] left-[40%] w-2 h-2 rounded-full bg-blue-300/20 animate-float-particle delay-1000" />
        <div className="absolute bottom-[40%] left-[25%] w-3 h-3 rounded-full bg-purple-300/25 animate-float-particle delay-500" />
        <div className="absolute top-[80%] right-[15%] w-2 h-2 rounded-full bg-indigo-300/30 animate-float-particle delay-200" />
      </div>

      {/* Soft blur overlay for depth */}
      <div className="absolute inset-0 backdrop-blur-[1px] bg-white/10" />
    </div>
  );
}
