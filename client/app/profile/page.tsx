'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  User,
  Mail,
  GraduationCap,
  Upload,
  Download,
  Eye,
  Heart,
  Bookmark,
  BookmarkX,
  Edit,
  Award,
  FileText,
  Calendar,
  TrendingUp,
  X,
  Loader2,
  Check
} from 'lucide-react';
import { notesAPI, authAPI } from '@/lib/api';

interface UserNote {
  id: number;
  title: string;
  subject: string;
  semester: string;
  branch: string;
  views: number;
  downloads: number;
  upvotes: number;
  createdAt: string;
}

// Branch options
const BRANCHES = [
  'CSE', 'CSE-AIML', 'CSE-DS', 'CSE-CS', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIML', 'AIDS', 'Other'
];

// Section options
const SECTIONS = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, refreshUser, setUser } = useAuth();
  const [uploadedNotes, setUploadedNotes] = useState<UserNote[]>([]);
  const [savedNotes, setSavedNotes] = useState<UserNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'uploaded' | 'saved'>('uploaded');

  // Edit Profile Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    branch: '',
    section: '',
    rollNo: ''
  });
  const [unsavingNoteId, setUnsavingNoteId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }
    refreshUser(); // Refresh user data to get latest stats
    fetchUserData();
  }, [user?.id]); // Re-fetch when user ID changes

  // Initialize edit form when user data loads
  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || '',
        branch: user.branch || '',
        section: user.section || '',
        rollNo: (user as any).rollNo || ''
      });
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch user's uploaded notes
      const response = await notesAPI.getNotes();
      const allNotes = response.data.notes || [];
      
      // Filter notes uploaded by current user - compare as strings
      if (user) {
        const userNotes = allNotes.filter((note: any) => {
          const noteUserId = note.userId?._id || note.userId;
          return noteUserId?.toString() === user.id.toString();
        });
        setUploadedNotes(userNotes);
      }

      // Fetch saved notes
      try {
        const savedResponse = await notesAPI.getSavedNotes();
        setSavedNotes(savedResponse.data.notes || []);
      } catch (err) {
        console.error('Failed to fetch saved notes:', err);
        setSavedNotes([]);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess(false);
    setEditLoading(true);

    try {
      const response = await authAPI.updateProfile({
        name: editForm.name.trim(),
        branch: editForm.branch,
        section: editForm.section,
        rollNo: editForm.rollNo.trim()
      });

      if (response.data.user) {
        // Update local user state
        setUser({
          ...user!,
          name: response.data.user.name,
          branch: response.data.user.branch,
          section: response.data.user.section,
          ...(response.data.user.rollNo && { rollNo: response.data.user.rollNo })
        } as any);
        
        // Update localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          localStorage.setItem('user', JSON.stringify({
            ...parsedUser,
            name: response.data.user.name,
            branch: response.data.user.branch,
            section: response.data.user.section,
            rollNo: response.data.user.rollNo
          }));
        }
      }

      setEditSuccess(true);
      
      // Close modal after short delay
      setTimeout(() => {
        setShowEditModal(false);
        setEditSuccess(false);
        refreshUser(); // Refresh user data
      }, 1500);
    } catch (err: any) {
      setEditError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Redirecting to sign in...</p>
      </div>
    );
  }

  // Get statistics from user object (provided by backend)
  const totalViews = (user as any).totalViews || uploadedNotes.reduce((sum, note) => sum + note.views, 0);
  const totalDownloads = (user as any).totalDownloads || 0;
  const totalUpvotes = (user as any).totalUpvotes || uploadedNotes.reduce((sum, note) => sum + note.upvotes, 0);
  const reputation = (user as any).reputation || 0;
  const notesUploaded = (user as any).uploadsCount || uploadedNotes.length;
  const savedNotesCount = (user as any).savedNotesCount || savedNotes.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4 sm:mb-6">
          {/* Cover Image */}
          <div className="h-24 sm:h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

          {/* Profile Info */}
          <div className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-12 sm:-mt-16 mb-4">
              {/* Avatar and Name */}
              <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4 mb-4 sm:mb-0">
                <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center mx-auto sm:mx-0">
                  <User className="w-10 h-10 sm:w-16 sm:h-16 text-gray-400" />
                </div>
                <div className="text-center sm:text-left sm:pb-2">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{user.name}</h1>
                  <p className="text-gray-600 flex items-center justify-center sm:justify-start gap-2 mt-1 text-sm sm:text-base">
                    <Mail className="w-4 h-4" />
                    <span className="truncate max-w-[200px] sm:max-w-none">{user.email}</span>
                  </p>
                </div>
              </div>

              {/* Edit Profile Button */}
              <div className="flex gap-2 justify-center sm:justify-end">
                <Button variant="outline" size="sm" onClick={() => setShowEditModal(true)}>
                  <Edit className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Edit Profile</span>
                </Button>
                <Button variant="outline" size="sm" onClick={logout}>
                  <span className="sm:hidden">Logout</span>
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>

            {/* User Details */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
              <div className="flex items-center gap-1 sm:gap-2">
                <GraduationCap className="w-4 h-4" />
                <span className="capitalize">{user.role || 'Student'}</span>
              </div>
              {user.branch && (
                <div className="flex items-center gap-1 sm:gap-2">
                  <span>{user.branch}</span>
                </div>
              )}
              {user.section && (
                <div className="flex items-center gap-1 sm:gap-2">
                  <span>Sec: {user.section}</span>
                </div>
              )}
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-2 sm:p-4 text-center">
                <div className="flex justify-center mb-1 sm:mb-2">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div className="text-lg sm:text-2xl font-bold text-blue-900">{notesUploaded}</div>
                <div className="text-[10px] sm:text-sm text-blue-700">Uploaded</div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-2 sm:p-4 text-center">
                <div className="flex justify-center mb-1 sm:mb-2">
                  <Download className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <div className="text-lg sm:text-2xl font-bold text-green-900">{totalDownloads}</div>
                <div className="text-[10px] sm:text-sm text-green-700">Downloads</div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-2 sm:p-4 text-center">
                <div className="flex justify-center mb-1 sm:mb-2">
                  <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
                <div className="text-lg sm:text-2xl font-bold text-purple-900">{totalViews}</div>
                <div className="text-[10px] sm:text-sm text-purple-700">Views</div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-2 sm:p-4 text-center hidden sm:block">
                <div className="flex justify-center mb-1 sm:mb-2">
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                </div>
                <div className="text-lg sm:text-2xl font-bold text-orange-900">{totalUpvotes}</div>
                <div className="text-[10px] sm:text-sm text-orange-700">Likes</div>
              </div>

              <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-2 sm:p-4 text-center hidden sm:block">
                <div className="flex justify-center mb-1 sm:mb-2">
                  <Award className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" />
                </div>
                <div className="text-lg sm:text-2xl font-bold text-pink-900">{reputation}</div>
                <div className="text-[10px] sm:text-sm text-pink-700">Reputation</div>
              </div>
            </div>

            {/* Mobile-only row for Upvotes and Reputation */}
            <div className="grid grid-cols-2 gap-2 mt-2 sm:hidden">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-2 text-center">
                <div className="flex justify-center mb-1">
                  <Heart className="w-5 h-5 text-red-500" />
                </div>
                <div className="text-lg font-bold text-orange-900">{totalUpvotes}</div>
                <div className="text-[10px] text-orange-700">Likes</div>
              </div>
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-2 text-center">
                <div className="flex justify-center mb-1">
                  <Award className="w-5 h-5 text-pink-600" />
                </div>
                <div className="text-lg font-bold text-pink-900">{reputation}</div>
                <div className="text-[10px] text-pink-700">Reputation</div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Sections */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('uploaded')}
                className={`flex-1 py-4 px-6 text-center font-medium transition ${
                  activeTab === 'uploaded'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Upload className="w-5 h-5 inline-block mr-2" />
                Uploaded Notes ({uploadedNotes.length})
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`flex-1 py-4 px-6 text-center font-medium transition ${
                  activeTab === 'saved'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Bookmark className="w-5 h-5 inline-block mr-2" />
                Saved Notes ({savedNotes.length})
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading...</p>
              </div>
            ) : activeTab === 'uploaded' ? (
              uploadedNotes.length === 0 ? (
                <div className="text-center py-12">
                  <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No notes uploaded yet</h3>
                  <p className="text-gray-600 mb-4">Share your knowledge by uploading your first note!</p>
                  <Button onClick={() => router.push('/upload')}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Notes
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {uploadedNotes.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => router.push(`/notes/${note.id}`)}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                    >
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {note.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {note.subject}
                        </span>
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          Sem {note.semester}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {note.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="w-4 h-4" />
                            {note.downloads}
                          </span>
                          <span className="flex items-center gap-1 text-red-500">
                            <Heart className="w-4 h-4" />
                            {note.upvotes}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : savedNotes.length === 0 ? (
              <div className="text-center py-12">
                <Bookmark className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No saved notes yet</h3>
                <p className="text-gray-600 mb-4">Bookmark notes you want to read later!</p>
                <Button onClick={() => router.push('/browse')}>
                  Browse Notes
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedNotes.map((note: any) => (
                  <div
                    key={note._id || note.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition relative group"
                  >
                    {/* Unsave Button */}
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        const noteId = note._id || note.id;
                        setUnsavingNoteId(noteId);
                        try {
                          await notesAPI.unsaveNote(noteId);
                          setSavedNotes(prev => prev.filter((n: any) => (n._id || n.id) !== noteId));
                        } catch (err) {
                          console.error('Failed to unsave:', err);
                        } finally {
                          setUnsavingNoteId(null);
                        }
                      }}
                      disabled={unsavingNoteId === (note._id || note.id)}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 text-gray-500 hover:text-red-500 disabled:opacity-50"
                      title="Unsave note"
                    >
                      {unsavingNoteId === (note._id || note.id) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <BookmarkX className="w-4 h-4" />
                      )}
                    </button>
                    
                    <div 
                      onClick={() => router.push(`/notes/${note._id || note.id}`)}
                      className="cursor-pointer"
                    >
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 pr-8">
                        {note.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {note.subject}
                        </span>
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          Sem {note.semester}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {note.views || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="w-4 h-4" />
                            {note.downloads || 0}
                          </span>
                          <span className="flex items-center gap-1 text-red-500">
                            <Heart className="w-4 h-4" />
                            {note.upvotes || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditError('');
                  setEditSuccess(false);
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {/* Success Message */}
              {editSuccess && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                  <Check className="w-5 h-5" />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              {/* Error Message */}
              {editError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                  {editError}
                </div>
              )}

              {/* Name Field */}
              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="edit-name"
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Branch Field */}
              <div>
                <label htmlFor="edit-branch" className="block text-sm font-medium text-gray-700 mb-1">
                  Branch
                </label>
                <select
                  id="edit-branch"
                  value={editForm.branch}
                  onChange={(e) => setEditForm({ ...editForm, branch: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Branch</option>
                  {BRANCHES.map((branch) => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
              </div>

              {/* Section Field */}
              <div>
                <label htmlFor="edit-section" className="block text-sm font-medium text-gray-700 mb-1">
                  Section
                </label>
                <select
                  id="edit-section"
                  value={editForm.section}
                  onChange={(e) => setEditForm({ ...editForm, section: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Section</option>
                  {SECTIONS.map((section) => (
                    <option key={section} value={section}>{section}</option>
                  ))}
                </select>
              </div>

              {/* Roll No Field */}
              <div>
                <label htmlFor="edit-rollNo" className="block text-sm font-medium text-gray-700 mb-1">
                  Roll Number
                </label>
                <input
                  id="edit-rollNo"
                  type="text"
                  value={editForm.rollNo}
                  onChange={(e) => setEditForm({ ...editForm, rollNo: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 24H71A6132"
                />
              </div>

              {/* Email (Read Only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditError('');
                    setEditSuccess(false);
                    // Reset form to current user values
                    if (user) {
                      setEditForm({
                        name: user.name || '',
                        branch: user.branch || '',
                        section: user.section || '',
                        rollNo: (user as any).rollNo || ''
                      });
                    }
                  }}
                  disabled={editLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={editLoading || editSuccess}
                >
                  {editLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : editSuccess ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Saved!
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
