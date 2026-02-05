'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  MessageSquare, 
  X, 
  Send, 
  Loader2,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Menu,
  Bot,
  Sparkles,
  FileText,
  ExternalLink
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
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Use environment variable for Groq API key (set in Vercel dashboard)
const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY || '';

export default function PDFPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const noteId = params?.id as string;
  
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [originalPdfUrl, setOriginalPdfUrl] = useState<string | null>(null);
  
  // AI Chat state
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [queriesLeft, setQueriesLeft] = useState(30);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (noteId) {
      fetchNoteDetails();
    }
  }, [noteId]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Add welcome message when chat opens
  useEffect(() => {
    if (showChat && messages.length === 0 && note) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: `👋 Hi! I'm your AI study assistant. I'm here to help you understand "${note.title}".\n\nAsk me anything about:\n• Concepts explained in this PDF\n• Clarification on specific topics\n• Related examples or explanations\n• General questions about ${note.subject}\n\nJust type your question below!`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [showChat, note]);

  const fetchNoteDetails = async () => {
    try {
      setLoading(true);
      const response = await notesAPI.getNoteById(noteId);
      const fetchedNote = response.data.note;
      
      if (fetchedNote) {
        if (fetchedNote._id && !fetchedNote.id) {
          fetchedNote.id = fetchedNote._id;
        }
        setNote(fetchedNote);
        
        // Set PDF URL - Use Google Docs Viewer for reliable inline display
        let rawPdfUrl = '';
        if (fetchedNote.cloudinaryUrl) {
          rawPdfUrl = fetchedNote.cloudinaryUrl;
        } else if (fetchedNote.fileUrl) {
          rawPdfUrl = fetchedNote.fileUrl;
        } else if (fetchedNote.fileId) {
          const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
          rawPdfUrl = `${apiBase}/notes/view-pdf/${fetchedNote.fileId}`;
        }
        
        if (rawPdfUrl) {
          // Store original URL for downloads
          setOriginalPdfUrl(rawPdfUrl);
          // Use Google Docs Viewer for reliable PDF display
          setPdfUrl(`https://docs.google.com/viewer?url=${encodeURIComponent(rawPdfUrl)}&embedded=true`);
        }
      }
    } catch (error) {
      console.error('Failed to fetch note:', error);
    } finally {
      setLoading(false);
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
      // Build context for Groq
      const systemPrompt = note ? `You are a helpful AI study assistant. The user is viewing a PDF document titled "${note.title}" about ${note.subject}.
Subject: ${note.subject}
Semester: ${note.semester}
${note.module ? `Module: ${note.module}` : ''}
${note.description ? `Description: ${note.description}` : ''}

Help the user understand the content. Explain topics clearly as a helpful tutor would. Keep answers concise but informative. If you don't know something specific about the document content, provide general educational information about the topic.` : 'You are a helpful AI study assistant.';

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage.content }
          ],
          temperature: 0.7,
          max_tokens: 1024,
        })
      });

      const data = await response.json();
      
      let assistantContent = "I'm sorry, I couldn't generate a response. Please try again.";
      
      if (data.choices && data.choices[0]?.message?.content) {
        assistantContent = data.choices[0].message.content;
      } else if (data.error) {
        assistantContent = `Error: ${data.error.message || 'API request failed'}`;
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDownload = () => {
    if (originalPdfUrl) {
      window.open(originalPdfUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (!note || !pdfUrl) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">PDF not available</p>
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
      {/* Top Header Bar */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/notes/${noteId}`)}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="hidden sm:block">
            <h1 className="text-white font-medium truncate max-w-md">{note.title}</h1>
            <p className="text-gray-400 text-sm">{note.subject} • Sem {note.semester}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom Controls - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-1 bg-gray-700 rounded-lg px-2 py-1">
            <button className="p-1 text-gray-300 hover:text-white">
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-gray-300 text-sm px-2">100%</span>
            <button className="p-1 text-gray-300 hover:text-white">
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition"
            title="Download PDF"
          >
            <Download className="w-5 h-5" />
          </button>

          {/* AI Chat Toggle Button */}
          <button
            onClick={() => setShowChat(!showChat)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              showChat 
                ? 'bg-blue-600 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="hidden sm:inline">AI Chat</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* PDF Viewer */}
        <div 
          className={`flex-1 transition-all duration-300 ease-in-out ${
            showChat ? 'lg:w-[65%]' : 'w-full'
          }`}
        >
          {/* Google Docs Viewer iframe - works on all devices */}
          <iframe
            src={pdfUrl}
            className="w-full h-full border-0"
            title={note.title}
            allow="autoplay"
          />
        </div>

        {/* AI Chat Panel - Bottom sheet on mobile, side panel on desktop */}
        <div 
          className={`fixed lg:relative right-0 bg-gray-800 border-l lg:border-l border-t lg:border-t-0 border-gray-700 flex flex-col transform transition-all duration-300 ease-in-out z-40 ${
            showChat 
              ? 'translate-y-0 lg:translate-x-0' 
              : 'translate-y-full lg:translate-x-full lg:hidden'
          } bottom-0 lg:bottom-auto lg:inset-y-0 w-full lg:w-[35%] h-[60vh] lg:h-auto rounded-t-2xl lg:rounded-none shadow-2xl lg:shadow-none`}
          style={{ top: 'auto', maxHeight: 'calc(100vh - 57px)' }}
        >
          {/* Mobile drag handle */}
          <div className="lg:hidden flex justify-center pt-2 pb-1">
            <div className="w-10 h-1 bg-gray-600 rounded-full" />
          </div>
          
          {/* Chat Header */}
          <div className="bg-gray-750 border-b border-gray-700 p-4 pt-2 lg:pt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold flex items-center gap-2">
                  AI Study Assistant
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                </h3>
                <p className="text-gray-400 text-sm">{queriesLeft} queries left</p>
              </div>
            </div>
            <button
              onClick={() => setShowChat(false)}
              className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Disclaimer */}
          <div className="px-4 py-2 bg-yellow-900/20 border-b border-yellow-800/30">
            <p className="text-yellow-500/80 text-xs flex items-start gap-2">
              <span className="mt-0.5">⚠️</span>
              <span>AI answers are based on general knowledge. Specific PDF content analysis requires text extraction.</span>
            </p>
          </div>

          {/* Chat Messages */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : 'bg-gray-700 text-gray-100 rounded-bl-md'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-600">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-300">NoteMitra AI</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                  <p className="text-xs mt-2 opacity-60">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-700 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                    <span className="text-gray-400 text-sm">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-700 bg-gray-800">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question about this topic..."
                disabled={isTyping || queriesLeft <= 0}
                className="flex-1 bg-gray-700 text-white placeholder-gray-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping || queriesLeft <= 0}
                className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            {queriesLeft <= 0 && (
              <p className="text-red-400 text-xs mt-2">You've used all your queries. Refresh to reset.</p>
            )}
          </div>
        </div>

        {/* Mobile Overlay when chat is open */}
        {showChat && (
          <div 
            className="fixed inset-0 bg-black/50 lg:hidden z-30"
            style={{ top: '57px' }}
            onClick={() => setShowChat(false)}
          />
        )}
      </div>
    </div>
  );
}
