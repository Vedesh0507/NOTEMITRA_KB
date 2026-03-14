export default function PreviewLoading() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header Skeleton */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-20 h-6 bg-gray-700 rounded animate-pulse"></div>
          <div className="hidden sm:block">
            <div className="w-48 h-5 bg-gray-700 rounded animate-pulse mb-1"></div>
            <div className="w-32 h-4 bg-gray-700/50 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="w-24 h-10 bg-blue-500/50 rounded-lg animate-pulse"></div>
        </div>
      </header>
      
      {/* PDF Viewer Skeleton */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-400 text-sm">Loading PDF...</p>
        </div>
      </div>
    </div>
  );
}
