import { Router } from 'express';
import {
  getUploadUrl,
  uploadPdfCloudinary,
  uploadMiddleware,
  createNote,
  getNotes,
  getNoteById,
  getDownloadUrl,
  voteNote,
  saveNote,
  unsaveNote,
  checkIfSaved,
  getSavedNotes,
  trackDownload,
  getComments,
  addComment,
  deleteComment,
  reportNote,
  deleteNote
} from '../controllers/noteController';
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import { validateNoteUpload, validateNoteQuery, validateMongoId } from '../middleware/validators';

const router = Router();

// Get presigned upload URL (authenticated)
router.post('/upload-url', authenticate, getUploadUrl);

// Upload PDF to Cloudinary (authenticated)
router.post('/upload-pdf-cloudinary', authenticate, uploadMiddleware, uploadPdfCloudinary);

// Create note (authenticated)
router.post('/', authenticate, validateNoteUpload, createNote);

// Get all notes (with filters)
router.get('/', optionalAuthenticate, validateNoteQuery, getNotes);

// Saved notes list (must be before /:id routes)
router.get('/saved/list', authenticate, getSavedNotes);

// Get single note (optionalAuthenticate to check if user has liked)
router.get('/:id', optionalAuthenticate, validateMongoId, getNoteById);

// Get download URL (GET) - authenticated only
router.get('/:id/download', authenticate, validateMongoId, getDownloadUrl);

// Track download (POST) - authenticated only
router.post('/:id/download', authenticate, validateMongoId, trackDownload);

// Vote on note
router.post('/:id/vote', authenticate, validateMongoId, voteNote);

// Save note
router.post('/:id/save', authenticate, validateMongoId, saveNote);

// Unsave note
router.delete('/:id/save', authenticate, validateMongoId, unsaveNote);

// Check if note is saved
router.get('/:id/saved', optionalAuthenticate, validateMongoId, checkIfSaved);

// Comments
router.get('/:id/comments', validateMongoId, getComments);
router.post('/:id/comments', authenticate, validateMongoId, addComment);

// Report note
router.post('/:id/report', authenticate, validateMongoId, reportNote);

// Delete note
router.delete('/:id', authenticate, validateMongoId, deleteNote);

export default router;
