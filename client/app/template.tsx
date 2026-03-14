'use client';

import { useEffect, useState } from 'react';

export default function Template({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    setMounted(true);
  }, []);

  return (
    <div 
      className={`page-transition ${mounted ? 'opacity-100' : 'opacity-0'}`}
      style={{ 
        willChange: 'opacity, transform',
        // Hardware acceleration for smoother animations
        transform: 'translateZ(0)'
      }}
    >
      {children}
    </div>
  );
}
