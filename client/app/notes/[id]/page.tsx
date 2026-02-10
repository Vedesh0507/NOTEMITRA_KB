'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Download,
  Eye,
  Heart,
  MessageSquare,
  Calendar,
  User,
  FileText,
  Flag,
  Share2,
  Bookmark,
  BookmarkPlus,
  Send,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react';
import { notesAPI } from '@/lib/api';

interface Note {
  id?: number | string; // Can be number (in-memory) or string (MongoDB _id)
  _id?: string; // MongoDB uses _id
  title: string;
  description: string;
  subject: string;
  semester: string;
  module: string;
  branch: string;
  userName: string;
  userId: number | string; // Can be ObjectId string
  views: number;
  downloads: number;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  fileUrl?: string;
  fileId?: string;
  fileName?: string;
  fileSize?: number;
  cloudinaryId?: string;
  cloudinaryUrl?: string;
}

interface Comment {
  _id: string;
  text: string;
  userName: string;
  userId: string;
  createdAt: string;
}

export default function NoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const noteId = params?.id as string;

  const [note, setNote] = useState<Note | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false); // Prevent rapid clicks
  const [isSaved, setIsSaved] = useState(false);
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    if (noteId) {
      fetchNoteDetails();
      checkIfSaved();
    }
  }, [noteId]);

  const fetchNoteDetails = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Fetching note with ID:', noteId);
      
      // Fetch note details
      const noteResponse = await notesAPI.getNoteById(noteId);
      
      console.log('📦 Received note response:', {
        fullResponse: noteResponse,
        noteData: noteResponse.data,
        note: noteResponse.data.note
      });
      
      const fetchedNote = noteResponse.data.note;
      const userLiked = noteResponse.data.userLiked;
      
      // Ensure note has proper ID fields
      if (fetchedNote) {
        // MongoDB uses _id, but we also want id for consistency
        if (fetchedNote._id && !fetchedNote.id) {
          fetchedNote.id = fetchedNote._id;
        }
        
        console.log('✅ Note set with IDs:', {
          id: fetchedNote.id,
          _id: fetchedNote._id,
          hasId: !!fetchedNote.id,
          has_id: !!fetchedNote._id,
          title: fetchedNote.title,
          fileId: fetchedNote.fileId,
          userLiked
        });
      } else {
        console.error('❌ No note in response');
      }
      
      setNote(fetchedNote);
      setIsLiked(userLiked || false);

      // Fetch real comments from the backend
      try {
        const commentsResponse = await notesAPI.getComments(noteId);
        setComments(commentsResponse.data.comments || []);
      } catch (err) {
        console.error('Failed to fetch comments:', err);
        setComments([]);
      }
    } catch (error) {
      console.error('Failed to fetch note:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfSaved = async () => {
    if (!user) return;
    try {
      const response = await notesAPI.checkIfSaved(noteId);
      setIsSaved(response.data.saved);
    } catch (error) {
      console.error('Failed to check saved status:', error);
    }
  };

  const handleSaveToggle = async () => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    try {
      setSavingNote(true);
      if (isSaved) {
        await notesAPI.unsaveNote(noteId);
        setIsSaved(false);
      } else {
        await notesAPI.saveNote(noteId);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Failed to save/unsave note:', error);
      alert('Failed to save note. Please try again.');
    } finally {
      setSavingNote(false);
    }
  };

  const handleDownload = async () => {
    if (!note) {
      console.error('❌ No note object available for download');
      alert('Error: Note data not loaded. Please refresh the page.');
      return;
    }
    
    try {
      // Debug: Log full note object
      console.log('📥 Starting download for note:', {
        fullNote: note,
        noteId: note._id || note.id,
        note_id: note._id,
        noteId_direct: note.id,
        fileId: note.fileId,
        fileName: note.fileName,
        title: note.title,
        allKeys: Object.keys(note)
      });
      
      // Determine note ID - try multiple fields
      // Priority: _id (MongoDB) > id (in-memory) > noteId param from URL
      let downloadNoteId = note._id || note.id || noteId;
      
      console.log('🔍 Note ID candidates:', {
        from_id: note._id,
        from_id_field: note.id,
        from_url_param: noteId,
        selected: downloadNoteId
      });
      
      if (!downloadNoteId) {
        console.error('❌ No valid note ID found in:', {
          note_id: note._id,
          note_id_field: note.id,
          url_param: noteId,
          note_object: note
        });
        throw new Error('Note ID not found. Cannot identify note. Please refresh the page.');
      }
      
      // Convert to string safely
      const noteIdString = String(downloadNoteId).trim();
      
      if (!noteIdString) {
        throw new Error('Invalid note ID format.');
      }
      
      console.log('✅ Using note ID:', noteIdString);
      
      // Use API base URL which already includes /api
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const downloadUrl = `${apiBase}/notes/${noteIdString}/download`;
      
      console.log('📡 Fetching from:', downloadUrl);
      console.log('📡 Request details:', {
        method: 'GET',
        url: downloadUrl,
        timestamp: new Date().toISOString()
      });
      
      // Fetch with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(downloadUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/pdf, application/json'
        }
      });
      
      clearTimeout(timeoutId);
      
      console.log('📡 Response received:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length'),
        contentDisposition: response.headers.get('content-disposition')
      });
      
      // Check if response is OK
      if (!response.ok) {
        // Try to parse error message
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          console.error('❌ Server error response:', errorData);
          throw new Error(errorData.message || `Server error: ${response.status}`);
        } else {
          const errorText = await response.text();
          console.error('❌ Server error text:', errorText);
          throw new Error(`Download failed with status: ${response.status} - ${response.statusText}`);
        }
      }
      
      // Check if response is JSON (signed URL) or binary (direct download)
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        // Response is JSON with downloadUrl (Cloudinary/signed URL mode)
        const data = await response.json();
        console.log('📄 Received JSON response with download URL:', data);
        
        if (data.downloadUrl) {
          // Determine proper filename with .pdf extension
          let filename = note.fileName || `${note.title}.pdf` || 'download.pdf';
          // Ensure filename has .pdf extension
          if (!filename.toLowerCase().endsWith('.pdf')) {
            filename = filename + '.pdf';
          }
          // Sanitize filename - remove invalid characters
          filename = filename.replace(/[<>:"/\\|?*]/g, '_');
          
          console.log('📁 Using filename:', filename);
          
          // Fetch the actual PDF file from Cloudinary URL
          console.log('📡 Fetching PDF from Cloudinary URL...');
          const pdfResponse = await fetch(data.downloadUrl);
          
          if (!pdfResponse.ok) {
            throw new Error(`Failed to fetch PDF from Cloudinary: ${pdfResponse.status}`);
          }
          
          const blob = await pdfResponse.blob();
          console.log('✅ Fetched PDF blob:', {
            size: blob.size,
            type: blob.type,
            sizeInMB: (blob.size / 1024 / 1024).toFixed(2) + ' MB'
          });
          
          // Create a proper PDF blob with explicit MIME type
          const pdfBlob = new Blob([blob], { type: 'application/pdf' });
          const blobUrl = window.URL.createObjectURL(pdfBlob);
          
          // Create download link with proper filename
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = filename;
          link.style.display = 'none';
          
          // For mobile, we need to append and click
          document.body.appendChild(link);
          console.log('🖱️  Triggering download with filename:', filename);
          link.click();
          
          // Cleanup
          setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
            console.log('🧹 Cleaned up download resources');
          }, 5000);
          
          console.log('✅ Download initiated with proper filename');
          // Track download in database
          try {
            const downloadNoteId = note._id || note.id || noteId;
            await notesAPI.trackDownload(String(downloadNoteId));
            console.log('✅ Download tracked in database');
          } catch (trackError) {
            console.error('Failed to track download:', trackError);
          }
          // Update local download count
          setNote({ ...note, downloads: note.downloads + 1 });
        } else {
          throw new Error('Server returned JSON but no download URL found');
        }
      } else {
        // Response is binary (PDF file - GridFS mode)
        console.log('📄 Receiving binary file data...');
        
        // Get the blob
        const blob = await response.blob();
        
        if (blob.size === 0) {
          throw new Error('Downloaded file is empty (0 bytes)');
        }
        
        console.log('✅ Downloaded blob:', {
          size: blob.size,
          type: blob.type,
          sizeInMB: (blob.size / 1024 / 1024).toFixed(2) + ' MB'
        });
        
        // Extract filename from Content-Disposition header or use default
        let filename = note.fileName || `${note.title}.pdf` || 'download.pdf';
        const disposition = response.headers.get('content-disposition');
        if (disposition) {
          const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1];
          }
        }
        
        console.log('📁 Using filename:', filename);
        
        // Ensure filename has .pdf extension
        if (!filename.toLowerCase().endsWith('.pdf')) {
          filename = filename + '.pdf';
        }
        
        // Create a proper PDF blob with explicit MIME type
        const pdfBlob = new Blob([blob], { type: 'application/pdf' });
        
        // Detect if user is on mobile
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        console.log('📱 Device detection:', { isMobile, userAgent: navigator.userAgent });
        
        if (isMobile) {
          // Mobile: Open PDF in new tab/window for native PDF viewer
          const blobUrl = window.URL.createObjectURL(pdfBlob);
          
          // Try to open in new window first
          const newWindow = window.open(blobUrl, '_blank');
          
          if (!newWindow) {
            // If popup blocked, try direct navigation
            console.log('📱 Popup blocked, trying direct download...');
            
            // Create a download link as fallback
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            
            setTimeout(() => {
              document.body.removeChild(link);
              window.URL.revokeObjectURL(blobUrl);
            }, 5000);
          } else {
            // Cleanup after a delay
            setTimeout(() => {
              window.URL.revokeObjectURL(blobUrl);
            }, 60000); // Keep URL alive for 1 minute for mobile viewers
          }
          
          console.log('✅ PDF opened for mobile viewing');
        } else {
          // Desktop: Use standard download approach
          const blobUrl = window.URL.createObjectURL(pdfBlob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = filename;
          link.style.display = 'none';
          
          document.body.appendChild(link);
          console.log('🖱️  Triggering download...');
          link.click();
          
          setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
            console.log('🧹 Cleaned up download resources');
          }, 1000);
        }
        
        console.log('✅ Download initiated successfully');
        // Track download in database
        try {
          const downloadNoteId = note._id || note.id || noteId;
          await notesAPI.trackDownload(String(downloadNoteId));
          console.log('✅ Download tracked in database');
        } catch (trackError) {
          console.error('Failed to track download:', trackError);
        }
        // Update local download count
        setNote({ ...note, downloads: note.downloads + 1 });
      }
      
    } catch (error) {
      console.error('❌ Download error:', error);
      
      // Detailed error logging
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to download file';
      
      // User-friendly error message
      alert(
        `Download Error: ${errorMessage}\n\n` +
        `Troubleshooting steps:\n` +
        `1. Refresh the page and try again\n` +
        `2. Check your internet connection\n` +
        `3. Clear browser cache and cookies\n` +
        `4. Try a different browser\n` +
        `5. Contact support if the issue persists\n\n` +
        `Technical details: Check browser console for more information`
      );
    }
  };

  const handlePreview = () => {
    if (!note) return;
    
    // Navigate to the in-app preview page
    const noteIdToUse = note._id || note.id || noteId;
    router.push(`/notes/${noteIdToUse}/preview`);
  };

  const handleLike = async () => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    if (!note || isLiking) return; // Prevent rapid clicks

    setIsLiking(true);
    
    // Optimistic UI update for instant feedback
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setNote({
      ...note,
      upvotes: wasLiked ? note.upvotes - 1 : note.upvotes + 1
    });

    try {
      // Call the backend API - always use 'upvote', backend handles toggle
      const response = await notesAPI.voteNote(noteId, 'upvote');
      
      // Update with actual server values
      if (response.data.note) {
        setNote(prev => prev ? {
          ...prev,
          upvotes: response.data.note.upvotes
        } : prev);
        // Check if user has liked based on response
        setIsLiked(response.data.userLiked ?? !wasLiked);
      }
    } catch (error) {
      console.error('Failed to like:', error);
      // Revert optimistic update on error
      setIsLiked(wasLiked);
      setNote(prev => prev ? {
        ...prev,
        upvotes: wasLiked ? prev.upvotes + 1 : prev.upvotes - 1
      } : prev);
    } finally {
      setIsLiking(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);

      // Submit comment to backend
      const response = await notesAPI.addComment(noteId, commentText.trim());
      
      // Add the new comment from server response to the list
      if (response.data.comment) {
        setComments([response.data.comment, ...comments]);
      }
      
      setCommentText('');
    } catch (error) {
      console.error('Failed to submit comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleSaveNote = async () => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }
    
    try {
      setSavingNote(true);
      if (isSaved) {
        await notesAPI.unsaveNote(noteId);
        setIsSaved(false);
      } else {
        await notesAPI.saveNote(noteId);
        setIsSaved(true);
      }
    } catch (error: any) {
      console.error('Failed to save/unsave note:', error);
      // Show specific error for already saved
      if (error.response?.status === 409) {
        setIsSaved(true); // Note is already saved
      }
    } finally {
      setSavingNote(false);
    }
  };

  const handleReport = () => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }
    alert('Report functionality will be implemented');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: note?.title,
        text: note?.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Note not found</h2>
          <p className="text-gray-600 mb-4">The note you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/browse')}>Browse Notes</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-4 sm:py-8">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/browse')}
          className="text-blue-600 hover:text-blue-700 mb-4 sm:mb-6 flex items-center gap-2 text-sm sm:text-base"
        >
          ← Back to Browse
        </button>

        {/* Note Header */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">{note.title}</h1>
              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">{note.description}</p>

              {/* Metadata Badges */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                <span className="bg-blue-100 text-blue-800 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium">
                  {note.subject}
                </span>
                <span className="bg-purple-100 text-purple-800 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium">
                  Semester {note.semester}
                </span>
                <span className="bg-green-100 text-green-800 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium">
                  {note.branch}
                </span>
                {note.module && (
                  <span className="bg-orange-100 text-orange-800 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium">
                    {note.module}
                  </span>
                )}
              </div>

              {/* Author and Date */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>{note.userName}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Download and Preview Buttons */}
            <div className="flex flex-row md:flex-col gap-2 flex-wrap">
              <Button onClick={handlePreview} variant="outline" className="flex items-center gap-2 text-sm">
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Preview PDF</span>
                <span className="sm:hidden">Preview</span>
              </Button>
              <Button onClick={handleDownload} className="flex items-center gap-2 text-sm">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download PDF</span>
                <span className="sm:hidden">Download</span>
              </Button>
              <Button 
                onClick={handleSaveToggle} 
                disabled={savingNote}
                variant={isSaved ? "default" : "outline"}
                className="flex items-center gap-2 text-sm"
              >
                <BookmarkPlus className="w-4 h-4" />
                {savingNote ? 'Saving...' : isSaved ? 'Saved' : 'Save'}
              </Button>
              <div className="text-xs sm:text-sm text-gray-600 text-center w-full md:w-auto">
                {note.fileSize ? `${(note.fileSize / (1024 * 1024)).toFixed(2)} MB` : 'Size unknown'}
              </div>
            </div>
          </div>

          {/* Stats and Actions Row */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-4 pt-4 sm:pt-6 border-t border-gray-200">
            {/* Stats */}
            <div className="flex items-center gap-4 sm:gap-6 text-gray-600 text-sm sm:text-base">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium">{note.views}</span>
                <span className="text-xs sm:text-sm">views</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium">{note.downloads}</span>
                <span className="text-xs sm:text-sm">downloads</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium">{comments.length}</span>
                <span className="text-xs sm:text-sm hidden sm:inline">comments</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              {/* Like Button - Instagram style */}
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 active:scale-95 ${
                  isLiking 
                    ? 'bg-gray-200 cursor-not-allowed opacity-70' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <Heart
                  className={`w-5 h-5 transition-all duration-200 ${
                    isLiked
                      ? 'fill-red-500 text-red-500 scale-110'
                      : 'text-gray-600 hover:text-red-400'
                  }`}
                />
                <span className="font-medium text-gray-900">
                  {note.upvotes}
                </span>
              </button>

              {/* Save */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSaveNote}
                disabled={savingNote}
                className={isSaved ? 'bg-blue-50 border-blue-300 text-blue-600' : ''}
              >
                {savingNote ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isSaved ? (
                  <Bookmark className="w-4 h-4 fill-current" />
                ) : (
                  <BookmarkPlus className="w-4 h-4" />
                )}
              </Button>

              {/* Share */}
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>

              {/* Report */}
              <Button variant="outline" size="sm" onClick={handleReport}>
                <Flag className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
            Comments ({comments.length})
          </h2>

          {/* Add Comment Form */}
          {user ? (
            <form onSubmit={handleSubmitComment} className="mb-4 sm:mb-6">
              <div className="flex gap-2 sm:gap-3">
                <div className="flex-1">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-2">
                <Button type="submit" disabled={submittingComment || !commentText.trim()} className="text-sm sm:text-base">
                  {submittingComment ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Post Comment
                    </>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 text-center">
              <p className="text-gray-600 mb-2 sm:mb-3 text-sm sm:text-base">Sign in to leave a comment</p>
              <Button onClick={() => router.push('/auth/signin')} className="text-sm sm:text-base">Sign In</Button>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-3 sm:space-y-4">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-center py-6 sm:py-8 text-sm sm:text-base">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment._id}
                  className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
                      <span className="font-medium text-gray-900 text-sm sm:text-base">{comment.userName}</span>
                      <span className="text-gray-500 text-xs sm:text-sm">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {user && user.id === comment.userId && (
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                        <button className="text-gray-400 hover:text-blue-600 p-1">
                          <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <button 
                          className="text-gray-400 hover:text-red-600 p-1"
                          onClick={async () => {
                            try {
                              await notesAPI.deleteComment(comment._id);
                              setComments(comments.filter(c => c._id !== comment._id));
                            } catch (err) {
                              console.error('Failed to delete comment:', err);
                              alert('Failed to delete comment');
                            }
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-700 text-sm sm:text-base">{comment.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
