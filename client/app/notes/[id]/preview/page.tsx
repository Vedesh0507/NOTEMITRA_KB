'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  MessageSquare, 
  X, 
  Send, 
  Loader2,
  Download,
  RotateCw,
  FileText,
  ExternalLink,
  Bot,
  Sparkles,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { notesAPI } from '@/lib/api';

interface Note {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  subject: string;
  semester: string;
  module?: string;
  branch?: string;
  cloudinaryUrl?: string;
  fileUrl?: string;
  fileId?: string;
  fileName?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY || '';

export default function PDFPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const noteId = params?.id as string;
  
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [originalPdfUrl, setOriginalPdfUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [pdfError, setPdfError] = useState(false);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerType, setViewerType] = useState<'google' | 'office' | 'pdfjs'>('google');
  const [retryCount, setRetryCount] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // AI Chat state
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [queriesLeft, setQueriesLeft] = useState(30);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Build viewer URL - Google Docs Viewer renders PDF without downloading
  const buildViewerUrl = useCallback((rawUrl: string, type: 'google' | 'office' | 'pdfjs') => {
    const encodedUrl = encodeURIComponent(rawUrl);
    switch (type) {
      case 'google':
        // Google Docs Viewer - most reliable, works on all devices
        return `https://docs.google.com/gview?url=${encodedUrl}&embedded=true`;
      case 'office':
        // Office Online Viewer - good alternative
        return `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;
      case 'pdfjs':
        // Mozilla PDF.js - smooth zoom/scroll but slower to load
        return `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodedUrl}`;
      default:
        return `https://docs.google.com/gview?url=${encodedUrl}&embedded=true`;
    }
  }, []);

  // Fetch note details on mount
  useEffect(() => {
    if (noteId) {
      fetchNoteDetails();
    }
    
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [noteId]);

  // Build viewer URL when originalPdfUrl or viewerType changes
  useEffect(() => {
    if (originalPdfUrl) {
      const url = buildViewerUrl(originalPdfUrl, viewerType);
      setViewerUrl(url);
      setPdfLoading(true);
      setPdfError(false);
      
      // Set timeout for loading - auto-switch viewer if too slow
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
      loadTimeoutRef.current = setTimeout(() => {
        if (pdfLoading && retryCount < 2) {
          console.log('Viewer timeout, switching to next viewer');
          handleSwitchViewer();
        }
      }, 20000); // 20 second timeout
    }
  }, [originalPdfUrl, viewerType, buildViewerUrl]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Welcome message
  useEffect(() => {
    if (showChat && messages.length === 0 && note) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `👋 Hi! I'm here to help you understand "${note.title}".\n\nAsk me about:\n• Key concepts in this document\n• Clarifications on specific topics\n• Examples and explanations\n\nType your question below!`,
        timestamp: new Date()
      }]);
    }
  }, [showChat, note, messages.length]);

  const fetchNoteDetails = async () => {
    try {
      const response = await notesAPI.getNoteById(noteId);
      const fetchedNote = response.data.note;
      
      if (fetchedNote) {
        if (fetchedNote._id && !fetchedNote.id) {
          fetchedNote.id = fetchedNote._id;
        }
        
        // Get the raw PDF URL
        let rawPdfUrl = '';
        if (fetchedNote.cloudinaryUrl) {
          rawPdfUrl = fetchedNote.cloudinaryUrl;
        } else if (fetchedNote.fileUrl) {
          rawPdfUrl = fetchedNote.fileUrl;
        } else if (fetchedNote.fileId) {
          const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
          rawPdfUrl = `${apiBase}/notes/view-pdf/${fetchedNote.fileId}`;
        }
        
        if (rawPdfUrl) {
          setOriginalPdfUrl(rawPdfUrl);
        }
        setNote(fetchedNote);
      }
    } catch (error) {
      console.error('Failed to fetch note:', error);
      setPdfError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleIframeLoad = () => {
    // Clear the timeout
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }
    setPdfLoading(false);
    setRetryCount(0);
  };

  const handleIframeError = () => {
    // Clear the timeout
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }
    
    // Try next viewer type
    if (retryCount < 2 && originalPdfUrl) {
      setRetryCount(prev => prev + 1);
      handleSwitchViewer();
    } else {
      setPdfLoading(false);
      setPdfError(true);
    }
  };

  const handleRetry = () => {
    if (originalPdfUrl) {
      setPdfLoading(true);
      setPdfError(false);
      setRetryCount(0);
      // Force refresh by appending timestamp
      const url = buildViewerUrl(originalPdfUrl + (originalPdfUrl.includes('?') ? '&' : '?') + '_t=' + Date.now(), viewerType);
      setViewerUrl(url);
    }
  };

  const handleSwitchViewer = () => {
    if (originalPdfUrl) {
      const viewers: Array<'google' | 'office' | 'pdfjs'> = ['google', 'office', 'pdfjs'];
      const currentIndex = viewers.indexOf(viewerType);
      const nextType = viewers[(currentIndex + 1) % viewers.length];
      setViewerType(nextType);
      setRetryCount(prev => prev + 1);
    }
  };

  // Download PDF properly - ensures PDF format on all devices
  const handleDownload = async () => {
    if (!originalPdfUrl || !note || isDownloading) return;
    
    setIsDownloading(true);
    
    try {
      // Prepare filename with .pdf extension
      let filename = note.fileName || `${note.title}.pdf` || 'document.pdf';
      if (!filename.toLowerCase().endsWith('.pdf')) {
        filename = filename + '.pdf';
      }
      // Sanitize filename
      filename = filename.replace(/[<>:"/\\|?*]/g, '_').replace(/\s+/g, '_');
      
      console.log('📥 Starting download:', filename);
      
      // Fetch the PDF as blob
      const response = await fetch(originalPdfUrl, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Accept': 'application/pdf,application/octet-stream,*/*'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      // Get the blob data
      const arrayBuffer = await response.arrayBuffer();
      
      // Create a proper PDF blob with explicit MIME type
      const pdfBlob = new Blob([arrayBuffer], { type: 'application/pdf' });
      
      // Create object URL
      const blobUrl = URL.createObjectURL(pdfBlob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.type = 'application/pdf';
      link.style.cssText = 'position:fixed;left:-9999px;top:-9999px;';
      
      // Add to DOM
      document.body.appendChild(link);
      
      // Trigger download - use click() for all devices
      link.click();
      
      // Cleanup after delay
      setTimeout(() => {
        if (link.parentNode) {
          document.body.removeChild(link);
        }
        URL.revokeObjectURL(blobUrl);
      }, 15000);
      
      console.log('✅ Download triggered successfully');
      
      // Track download in database
      try {
        const downloadNoteId = note._id || note.id || noteId;
        await notesAPI.trackDownload(String(downloadNoteId));
        console.log('✅ Download tracked');
      } catch (trackError) {
        console.log('Track download failed:', trackError);
      }
      
    } catch (error) {
      console.error('Download error:', error);
      
      // Fallback: Try opening in new tab
      try {
        const newWindow = window.open(originalPdfUrl, '_blank');
        if (!newWindow) {
          alert('Download blocked. Please allow popups and try again, or use "Open in New Tab".');
        }
      } catch {
        alert('Download failed. Please try "Open in New Tab" option.');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping || queriesLeft <= 0) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    setQueriesLeft(prev => prev - 1);

    try {
      const systemPrompt = note 
        ? `You are a helpful study assistant. The user is studying "${note.title}" (${note.subject}, Semester ${note.semester}). Help explain concepts clearly and concisely.`
        : 'You are a helpful study assistant.';

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.filter(m => m.id !== 'welcome').map(m => ({
              role: m.role,
              content: m.content
            })),
            { role: 'user', content: userMessage.content }
          ],
          max_tokens: 1024,
          temperature: 0.7,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.choices[0]?.message?.content || 'Sorry, I could not generate a response.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Error state - no note or PDF
  if (!loading && (!note || (!originalPdfUrl && !viewerUrl))) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-white text-lg mb-2">PDF not available</p>
          <p className="text-gray-400 mb-4">The document could not be loaded</p>
          <button
            onClick={() => router.push(`/notes/${noteId}`)}
            className="text-blue-400 hover:text-blue-300 flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-3 sm:px-4 py-2 flex items-center justify-between z-50 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <button
            onClick={() => router.push(`/notes/${noteId}`)}
            className="flex items-center gap-1 sm:gap-2 text-gray-300 hover:text-white transition flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>
          
          <div className="min-w-0 flex-1">
            {note ? (
              <div className="truncate">
                <h1 className="text-white font-medium text-sm sm:text-base truncate">{note.title}</h1>
                <p className="text-gray-400 text-xs sm:text-sm truncate">{note.subject} • Sem {note.semester}</p>
              </div>
            ) : (
              <div className="animate-pulse">
                <div className="w-32 sm:w-48 h-4 sm:h-5 bg-gray-700 rounded mb-1"></div>
                <div className="w-24 sm:w-32 h-3 sm:h-4 bg-gray-700/50 rounded"></div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Viewer Switch Button */}
          <button
            onClick={handleSwitchViewer}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition"
            title={`Current: ${viewerType === 'google' ? 'Google Docs' : viewerType === 'office' ? 'Office Online' : 'PDF.js'} - Click to switch`}
          >
            <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          {/* Download Button - Green, prominent */}
          <button
            onClick={handleDownload}
            disabled={!note || isDownloading}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition text-sm font-medium"
            title="Download PDF"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            ) : (
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
            <span className="hidden sm:inline">{isDownloading ? 'Downloading...' : 'Download'}</span>
          </button>

          {/* AI Chat Button */}
          <button
            onClick={() => setShowChat(!showChat)}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg font-medium transition text-sm ${
              showChat 
                ? 'bg-blue-600 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">AI Chat</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* PDF Viewer */}
        <div className={`flex-1 relative transition-all duration-300 ${showChat ? 'lg:w-[60%]' : 'w-full'}`}>
          {/* Loading Overlay */}
          {(loading || pdfLoading) && !pdfError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
              <div className="text-center p-6">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                <p className="text-white text-lg mb-2">
                  {loading ? 'Loading document...' : 'Rendering PDF...'}
                </p>
                <p className="text-gray-400 text-sm mb-4">
                  Using {viewerType === 'google' ? 'Google Docs' : viewerType === 'office' ? 'Office Online' : 'PDF.js'} Viewer
                </p>
                <p className="text-gray-500 text-xs mb-4">
                  This may take a few seconds
                </p>
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center gap-2 mx-auto text-sm"
                >
                  <Download className="w-4 h-4" />
                  Download Instead
                </button>
              </div>
            </div>
          )}
          
          {/* Error State */}
          {pdfError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
              <div className="text-center p-6 max-w-md">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <p className="text-white text-lg mb-2">Unable to preview PDF</p>
                <p className="text-gray-400 text-sm mb-6">
                  The document viewer encountered an issue. Try a different viewer or download the file.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleRetry}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2 justify-center"
                  >
                    <RotateCw className="w-4 h-4" />
                    Retry
                  </button>
                  <button
                    onClick={() => {
                      setRetryCount(0);
                      handleSwitchViewer();
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition flex items-center gap-2 justify-center"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Different Viewer
                  </button>
                  <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center gap-2 justify-center"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                </div>
                {originalPdfUrl && (
                  <a
                    href={originalPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 justify-center"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open in New Tab
                  </a>
                )}
              </div>
            </div>
          )}
          
          {/* PDF Iframe - Uses embedded viewer (Google Docs/Office/PDF.js) - never direct PDF URL */}
          {viewerUrl && (
            <iframe
              ref={iframeRef}
              src={viewerUrl}
              className="w-full h-full border-0 bg-gray-800"
              title={note?.title || 'PDF Preview'}
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
              loading="eager"
              style={{ minHeight: '100%' }}
            />
          )}
        </div>

        {/* AI Chat Panel */}
        <div 
          className={`fixed lg:relative right-0 bg-gray-800 border-l border-gray-700 flex flex-col transform transition-all duration-300 ease-in-out z-40 ${
            showChat 
              ? 'translate-y-0 lg:translate-x-0' 
              : 'translate-y-full lg:translate-x-full lg:hidden pointer-events-none'
          } bottom-0 lg:bottom-auto lg:inset-y-0 w-full lg:w-[40%] h-[70vh] lg:h-auto rounded-t-2xl lg:rounded-none shadow-2xl lg:shadow-none`}
        >
          {/* Mobile drag handle */}
          <div className="lg:hidden flex justify-center pt-2 pb-1">
            <div className="w-10 h-1 bg-gray-600 rounded-full" />
          </div>
          
          {/* Chat Header */}
          <div className="border-b border-gray-700 p-3 sm:p-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold flex items-center gap-2">
                  AI Assistant
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                </h3>
                <p className="text-gray-400 text-xs">{queriesLeft} queries left</p>
              </div>
            </div>
            <button
              onClick={() => setShowChat(false)}
              className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : 'bg-gray-700 text-gray-100 rounded-bl-md'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-700 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-3 sm:p-4 border-t border-gray-700 flex-shrink-0">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                placeholder="Ask a question..."
                disabled={isTyping || queriesLeft <= 0}
                className="flex-1 bg-gray-700 text-white placeholder-gray-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping || queriesLeft <= 0}
                className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-xl transition"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile overlay when chat is open */}
        {showChat && (
          <div 
            className="fixed inset-0 bg-black/50 lg:hidden z-30"
            onClick={() => setShowChat(false)}
          />
        )}
      </div>
    </div>
  );
}
