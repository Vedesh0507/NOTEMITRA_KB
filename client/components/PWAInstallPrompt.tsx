'use client';

import { useEffect, useState } from 'react';
import { X, Download, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone 
      || document.referrer.includes('android-app://');
    setIsStandalone(standalone);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Check if user dismissed the prompt before
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

    // Listen for the beforeinstallprompt event (Chrome/Edge/Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt if not dismissed recently (within 7 days)
      if (daysSinceDismissed > 7 && !standalone) {
        setTimeout(() => setShowPrompt(true), 3000); // Show after 3 seconds
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show iOS instructions if on iOS and not installed
    if (iOS && !standalone && daysSinceDismissed > 7) {
      setTimeout(() => setShowPrompt(true), 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA installed');
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Install prompt error:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  // Don't show if already installed or prompt hidden
  if (isStandalone || !showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Smartphone className="w-5 h-5" />
          <span className="font-semibold">Install NoteMitra</span>
        </div>
        <button 
          onClick={handleDismiss}
          className="text-white/80 hover:text-white p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {isIOS ? (
          // iOS Instructions
          <div>
            <p className="text-gray-600 text-sm mb-3">
              Install NoteMitra on your iPhone for quick access:
            </p>
            <ol className="text-sm text-gray-700 space-y-2 mb-4">
              <li className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                <span>Tap the <strong>Share</strong> button in Safari</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                <span>Scroll down and tap <strong>Add to Home Screen</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                <span>Tap <strong>Add</strong> to install</span>
              </li>
            </ol>
            <button
              onClick={handleDismiss}
              className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
            >
              Got it!
            </button>
          </div>
        ) : (
          // Android/Chrome Install Button
          <div>
            <p className="text-gray-600 text-sm mb-4">
              Get faster access! Install NoteMitra on your device for a native app experience.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Install App
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
              >
                Later
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
