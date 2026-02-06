'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register service worker after page load for better performance
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .then((registration) => {
            console.log('[PWA] Service Worker registered:', registration.scope);
            
            // Check for updates periodically
            setInterval(() => {
              registration.update();
            }, 60 * 60 * 1000); // Check every hour
            
            // Listen for updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New content available, show refresh prompt if needed
                    console.log('[PWA] New content available');
                  }
                });
              }
            });
          })
          .catch((error) => {
            console.log('[PWA] Service Worker registration failed:', error);
          });
      });

      // Handle service worker controller change (new version activated)
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          // Optionally auto-refresh when new SW takes over
          // window.location.reload();
        }
      });
    }
  }, []);

  // This component doesn't render anything
  return null;
}
