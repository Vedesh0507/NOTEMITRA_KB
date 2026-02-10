import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50">
      <div className="text-center page-scale">
        {/* Animated logo/spinner */}
        <div className="relative mb-6">
          {/* Outer ring */}
          <div className="w-16 h-16 rounded-full border-4 border-blue-100 mx-auto"></div>
          {/* Spinning ring */}
          <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-blue-600 mx-auto animate-spin"></div>
          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        {/* Loading text with gradient */}
        <p className="text-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Loading...
        </p>
        
        {/* Subtle subtext */}
        <p className="text-sm text-gray-400 mt-1">
          Just a moment
        </p>
      </div>
    </div>
  );
}

