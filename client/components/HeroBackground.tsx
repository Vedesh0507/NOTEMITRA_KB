'use client';

import { useEffect, useState } from 'react';

// Lightweight CSS-based animated background for hero section
// Respects prefers-reduced-motion preference

export default function HeroBackground() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check for reduced motion preference only
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Skip animation for reduced motion preference
  if (reducedMotion) {
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
      
      {/* Animated gradient orbs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-400/20 to-transparent rounded-full blur-3xl animate-orb-1" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-purple-400/20 to-transparent rounded-full blur-3xl animate-orb-2" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-indigo-300/15 to-transparent rounded-full blur-3xl animate-orb-3" />

      {/* Floating Elements Container */}
      <div className="absolute inset-0">
        {/* Floating Note Card 1 - Top Left */}
        <div className="absolute top-[8%] left-[5%] w-14 h-18 md:w-20 md:h-24 animate-float-1">
          <div className="relative w-full h-full bg-white/40 backdrop-blur-sm rounded-lg shadow-lg border border-white/50 p-2">
            <div className="w-full h-1.5 bg-blue-400/60 rounded mb-1.5"></div>
            <div className="w-3/4 h-1.5 bg-blue-300/50 rounded mb-1.5"></div>
            <div className="w-5/6 h-1.5 bg-blue-300/40 rounded mb-1.5"></div>
            <div className="w-2/3 h-1.5 bg-blue-200/40 rounded"></div>
          </div>
        </div>

        {/* Floating Note Card 2 - Top Right */}
        <div className="absolute top-[15%] right-[8%] w-12 h-16 md:w-16 md:h-20 animate-float-2 rotate-6">
          <div className="relative w-full h-full bg-white/50 backdrop-blur-sm rounded-lg shadow-lg border border-white/60 p-1.5">
            <div className="w-full h-1 bg-purple-400/60 rounded mb-1"></div>
            <div className="w-4/5 h-1 bg-purple-300/50 rounded mb-1"></div>
            <div className="w-full h-1 bg-purple-300/40 rounded mb-1"></div>
            <div className="w-3/5 h-1 bg-purple-200/40 rounded"></div>
          </div>
        </div>

        {/* Floating Book - Middle Right */}
        <div className="absolute top-[35%] right-[12%] w-16 h-12 md:w-24 md:h-16 animate-float-3">
          <svg viewBox="0 0 100 70" fill="none" className="w-full h-full drop-shadow-lg">
            <path d="M10 8 Q50 3 50 35 Q50 3 90 8 L90 62 Q50 57 50 35 Q50 57 10 62 Z" fill="white" fillOpacity="0.6" />
            <path d="M10 8 Q50 3 50 35 Q50 3 90 8 L90 62 Q50 57 50 35 Q50 57 10 62 Z" stroke="url(#bookStroke)" strokeWidth="2" />
            <path d="M50 8 L50 62" stroke="#6366F1" strokeWidth="2" strokeOpacity="0.5" />
            <defs>
              <linearGradient id="bookStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.6" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Floating Book 2 - Bottom Left */}
        <div className="absolute bottom-[20%] left-[8%] w-14 h-10 md:w-20 md:h-14 animate-float-4 -rotate-6">
          <svg viewBox="0 0 100 70" fill="none" className="w-full h-full drop-shadow-lg">
            <path d="M10 8 Q50 3 50 35 Q50 3 90 8 L90 62 Q50 57 50 35 Q50 57 10 62 Z" fill="white" fillOpacity="0.5" />
            <path d="M10 8 Q50 3 50 35 Q50 3 90 8 L90 62 Q50 57 50 35 Q50 57 10 62 Z" stroke="#3B82F6" strokeWidth="2" strokeOpacity="0.4" />
            <path d="M50 8 L50 62" stroke="#3B82F6" strokeWidth="2" strokeOpacity="0.3" />
          </svg>
        </div>

        {/* Graduation Cap - Left Middle */}
        <div className="absolute top-[50%] left-[15%] w-10 h-10 md:w-14 md:h-14 animate-float-5">
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full drop-shadow-md">
            <polygon points="32,8 4,24 32,40 60,24" fill="#6366F1" fillOpacity="0.5" />
            <polygon points="14,28 14,42 32,54 50,42 50,28 32,40" fill="#818CF8" fillOpacity="0.4" />
            <line x1="50" y1="24" x2="50" y2="46" stroke="#6366F1" strokeWidth="2" strokeOpacity="0.6" />
            <circle cx="50" cy="48" r="3" fill="#FBBF24" fillOpacity="0.8" />
          </svg>
        </div>

        {/* Pencil - Bottom Right */}
        <div className="absolute bottom-[30%] right-[18%] w-8 h-8 md:w-12 md:h-12 animate-float-6 rotate-45">
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full drop-shadow-md">
            <rect x="22" y="8" width="10" height="38" rx="1" fill="#FBBF24" fillOpacity="0.7" />
            <polygon points="27,46 22,56 32,56" fill="#F59E0B" fillOpacity="0.8" />
            <rect x="22" y="8" width="10" height="6" fill="#EC4899" fillOpacity="0.6" />
            <polygon points="27,56 24,62 30,62" fill="#374151" fillOpacity="0.6" />
          </svg>
        </div>

        {/* Light Bulb - Center Left */}
        <div className="absolute top-[65%] left-[25%] w-8 h-8 md:w-10 md:h-10 animate-float-7">
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full drop-shadow-md">
            <path d="M32 6 C16 6 6 18 6 32 C6 42 12 50 22 54 L22 58 L42 58 L42 54 C52 50 58 42 58 32 C58 18 48 6 32 6" fill="#FDE047" fillOpacity="0.6" />
            <rect x="22" y="58" width="20" height="3" fill="#9CA3AF" fillOpacity="0.5" />
            <rect x="24" y="61" width="16" height="2" rx="1" fill="#6B7280" fillOpacity="0.5" />
            {/* Glow effect */}
            <circle cx="32" cy="30" r="20" fill="#FEF08A" fillOpacity="0.3" className="animate-pulse" />
          </svg>
        </div>

        {/* Floating particles - More visible */}
        <div className="absolute top-[12%] right-[25%] w-3 h-3 md:w-4 md:h-4 rounded-full bg-blue-500/40 animate-particle-1 shadow-lg shadow-blue-500/20" />
        <div className="absolute top-[45%] left-[5%] w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-purple-500/35 animate-particle-2 shadow-lg shadow-purple-500/20" />
        <div className="absolute bottom-[35%] right-[30%] w-2 h-2 md:w-3 md:h-3 rounded-full bg-indigo-500/40 animate-particle-3 shadow-lg shadow-indigo-500/20" />
        <div className="absolute top-[30%] left-[35%] w-2 h-2 rounded-full bg-blue-400/35 animate-particle-4" />
        <div className="absolute bottom-[45%] left-[20%] w-3 h-3 rounded-full bg-purple-400/30 animate-particle-5" />
        <div className="absolute top-[75%] right-[10%] w-2.5 h-2.5 rounded-full bg-indigo-400/35 animate-particle-6" />
        
        {/* Star sparkles */}
        <div className="absolute top-[20%] left-[30%] animate-sparkle-1">
          <svg className="w-4 h-4 md:w-5 md:h-5 text-yellow-400/60" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
        </div>
        <div className="absolute bottom-[25%] right-[25%] animate-sparkle-2">
          <svg className="w-3 h-3 md:w-4 md:h-4 text-yellow-300/50" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
        </div>
        <div className="absolute top-[55%] right-[35%] animate-sparkle-3">
          <svg className="w-3 h-3 text-blue-300/50" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
        </div>
      </div>

      {/* Subtle noise texture for depth */}
      <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />
    </div>
  );
}
