import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import multer from 'multer';
import { Note, SavedNote, Vote, User, Comment, Report } from '../models';
import {
  generatePresignedUploadUrl,
  generatePresignedDownloadUrl,
  deleteFileFromS3,
  extractFileKeyFromUrl
} from '../utils/s3';
import { uploadToCloudinary, deleteFromCloudinary, isCloudinaryConfigured } from '../utils/cloudinary';
import { generateNoteSummary } from '../utils/claude';
import { indexNote, updateIndexedNote, deleteIndexedNote } from '../utils/elasticsearch';

// Multer memory storage for Cloudinary uploads
const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

export const uploadMiddleware = uploadMemory.single('pdf');

/**
 * Get presigned URL for upload
 * POST /api/notes/upload-url
 */
export const getUploadUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileName, fileType, fileSize } = req.body;

    if (!fileName || !fileType || !fileSize) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const result = await generatePresignedUploadUrl(fileName, fileType, fileSize);

    res.json(result);
  } catch (error: any) {
    console.error('Upload URL generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate upload URL' });
  }
};

/**
 * Upload PDF to Cloudinary
 * POST /api/notes/upload-pdf-cloudinary
 */
export const uploadPdfCloudinary = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!isCloudinaryConfigured()) {
      res.status(500).json({ error: 'Cloudinary is not configured' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'No PDF file provided' });
      return;
    }

    if (req.file.mimetype !== 'application/pdf') {
      res.status(400).json({ error: 'Only PDF files are allowed' });
      return;
    }

    const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);

    res.json({
      success: true,
      cloudinaryId: result.public_id,
      cloudinaryUrl: result.secure_url,
      fileUrl: result.secure_url,
      fileSize: result.bytes,
      fileName: req.file.originalname,
    });
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload to Cloudinary' });
  }
};

/**
 * Create note (after file uploaded to S3)
 * POST /api/notes
 */
export const createNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const {
      title,
      description,
      subject,
      semester,
      module,
      branch,
      section,
      fileUrl,
      fileSize,
      pages,
      cloudinaryId,
      cloudinaryUrl
    } = req.body;

    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Generate AI summary and tags
    const aiResult = await generateNoteSummary(title, description || '', subject, module);

    // Create note
    const note = await Note.create({
      title,
      description,
      subject,
      semester,
      module,
      branch,
      section,
      uploaderId: req.user._id,
      uploaderName: req.user.name,
      uploaderRole: req.user.role === 'teacher' ? 'teacher' : 'student',
      fileUrl: cloudinaryUrl || fileUrl,
      fileSize,
      pages,
      cloudinaryId,
      cloudinaryUrl,
      aiSummary: aiResult.summary,
      aiTags: aiResult.tags,
      tags: []
    });

    // Update user upload count
    await User.findByIdAndUpdate(req.user._id, { $inc: { uploadsCount: 1 } });

    // Index in ElasticSearch
    await indexNote(note);

    res.status(201).json({
      message: 'Note created successfully',
      note: {
        id: note._id,
        title: note.title,
        description: note.description,
        subject: note.subject,
        semester: note.semester,
        module: note.module,
        branch: note.branch,
        uploaderName: note.uploaderName,
        uploaderRole: note.uploaderRole,
        aiSummary: note.aiSummary,
        aiTags: note.aiTags,
        uploadDate: note.uploadDate
      }
    });
  } catch (error: any) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
};

/**
 * Get all notes with filters
 * GET /api/notes
 */
export const getNotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      subject,
      semester,
      module,
      branch,
      uploaderRole,
      sortBy = 'uploadDate',
      sortOrder = 'desc',
      page = 1,
      limit = 100,
      search
    } = req.query;

    const filter: any = { isApproved: true };

    if (subject) filter.subject = subject;
    if (semester) filter.semester = semester;
    if (module) filter.module = module;
    if (branch) filter.branch = branch;
    if (uploaderRole) filter.uploaderRole = uploaderRole;

    // Text search
    if (search && typeof search === 'string') {
      filter.$text = { $search: search };
    }

    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [notes, total] = await Promise.all([
      Note.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .select('-__v')
        .lean(),
      Note.countDocuments(filter)
    ]);

    res.json({
      notes,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: any) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
};

/**
 * Get single note by ID
 * GET /api/notes/:id
 */
export const getNoteById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const note = await Note.findById(id).lean() as any;

    if (!note) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    // Increment view count
    await Note.findByIdAndUpdate(id, { $inc: { views: 1 } });
    note.views = (note.views || 0) + 1;

    // Check if current user has liked this note
    let userLiked = false;
    if (req.user) {
      const existingVote = await Vote.findOne({
        userId: req.user._id,
        noteId: id,
        voteType: 'upvote'
      });
      userLiked = !!existingVote;
    }

    res.json({ note, userLiked });
  } catch (error: any) {
    console.error('Get note error:', error);
    res.status(500).json({ error: 'Failed to fetch note' });
  }
};

/**
 * Get download URL for note
 * GET /api/notes/:id/download
 */
export const getDownloadUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const note = await Note.findById(id).lean() as any;

    if (!note) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    // Increment download count
    await Note.findByIdAndUpdate(id, { $inc: { downloads: 1 } });

    // Update uploader reputation
    if (note.uploaderId) {
      await User.findByIdAndUpdate(note.uploaderId, { $inc: { reputation: 1 } });
    } else if (note.userId) {
      await User.findByIdAndUpdate(note.userId, { $inc: { reputation: 1 } });
    }

    // If note has a Cloudinary URL, return it directly
    if (note.cloudinaryUrl) {
      res.json({ downloadUrl: note.cloudinaryUrl });
      return;
    }

    // If note has a fileUrl (could be a direct Cloudinary URL), return it
    if (note.fileUrl) {
      res.json({ downloadUrl: note.fileUrl });
      return;
    }

    // Fallback to S3 presigned URL
    const fileKey = extractFileKeyFromUrl(note.fileUrl);
    const downloadUrl = await generatePresignedDownloadUrl(fileKey);

    res.json({ downloadUrl });
  } catch (error: any) {
    console.error('Download URL error:', error);
    res.status(500).json({ error: 'Failed to generate download URL' });
  }
};

/**
 * Vote on note (upvote/downvote)
 * POST /api/notes/:id/vote
 */
export const voteNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { voteType } = req.body;

    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (!['upvote', 'downvote'].includes(voteType)) {
      res.status(400).json({ error: 'Invalid vote type' });
      return;
    }

    const note = await Note.findById(id);
    if (!note) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    // Check existing vote
    const existingVote = await Vote.findOne({
      userId: req.user._id,
      noteId: id
    });

    let userLiked = false;

    if (existingVote) {
      // Update vote
      if (existingVote.voteType === voteType) {
        // Remove vote (toggle off)
        await Vote.deleteOne({ _id: existingVote._id });
        if (voteType === 'upvote') {
          note.upvotes -= 1;
        } else {
          note.downvotes -= 1;
        }
        userLiked = false;
      } else {
        // Change vote
        existingVote.voteType = voteType as 'upvote' | 'downvote';
        await existingVote.save();
        if (voteType === 'upvote') {
          note.upvotes += 1;
          note.downvotes -= 1;
          userLiked = true;
        } else {
          note.downvotes += 1;
          note.upvotes -= 1;
          userLiked = false;
        }
      }
    } else {
      // New vote
      await Vote.create({
        userId: req.user._id,
        noteId: id,
        voteType
      });
      if (voteType === 'upvote') {
        note.upvotes += 1;
        userLiked = true;
        // Increase uploader reputation
        await User.findByIdAndUpdate(note.uploaderId, { $inc: { reputation: 2 } });
      } else {
        note.downvotes += 1;
        userLiked = false;
      }
    }

    await note.save();

    res.json({
      message: 'Vote recorded',
      note: {
        upvotes: note.upvotes,
        downvotes: note.downvotes
      },
      userLiked,
      upvotes: note.upvotes,
      downvotes: note.downvotes
    });
  } catch (error: any) {
    console.error('Vote error:', error);
    res.status(500).json({ error: 'Failed to record vote' });
  }
};

/**
 * Save note for later
 * POST /api/notes/:id/save
 */
export const saveNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const note = await Note.findById(id);
    if (!note) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    // Check if already saved
    const existing = await SavedNote.findOne({
      userId: req.user._id,
      noteId: id
    });

    if (existing) {
      // Unsave
      await SavedNote.deleteOne({ _id: existing._id });
      res.json({ message: 'Note removed from saved', saved: false });
    } else {
      // Save
      await SavedNote.create({
        userId: req.user._id,
        noteId: id
      });
      res.json({ message: 'Note saved', saved: true });
    }
  } catch (error: any) {
    console.error('Save note error:', error);
    res.status(500).json({ error: 'Failed to save note' });
  }
};

/**
 * Delete note
 * DELETE /api/notes/:id
 */
export const deleteNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const note = await Note.findById(id);
    if (!note) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    // Check permission
    const isOwner = note.uploaderId.toString() === (req.user._id as any).toString();
    const isModerator = ['moderator', 'admin'].includes(req.user.role);

    if (!isOwner && !isModerator) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    // Delete file from storage
    if (note.cloudinaryId) {
      await deleteFromCloudinary(note.cloudinaryId);
    } else {
      const fileKey = extractFileKeyFromUrl(note.fileUrl);
      await deleteFileFromS3(fileKey);
    }

    // Delete from ElasticSearch
    await deleteIndexedNote(id);

    // Delete note
    await Note.deleteOne({ _id: id });

    // Update user upload count
    await User.findByIdAndUpdate(note.uploaderId, { $inc: { uploadsCount: -1 } });

    res.json({ message: 'Note deleted successfully' });
  } catch (error: any) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
};

/**
 * Unsave note
 * DELETE /api/notes/:id/save
 */
export const unsaveNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    await SavedNote.deleteOne({ userId: req.user._id, noteId: id });
    res.json({ message: 'Note unsaved', saved: false });
  } catch (error: any) {
    console.error('Unsave note error:', error);
    res.status(500).json({ error: 'Failed to unsave note' });
  }
};

/**
 * Check if note is saved
 * GET /api/notes/:id/saved
 */
export const checkIfSaved = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      res.json({ saved: false });
      return;
    }

    const savedNote = await SavedNote.findOne({ userId: req.user._id, noteId: id });
    res.json({ saved: !!savedNote });
  } catch (error: any) {
    console.error('Check saved error:', error);
    res.json({ saved: false });
  }
};

/**
 * Get saved notes list
 * GET /api/notes/saved/list
 */
export const getSavedNotes = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const savedNotes = await SavedNote.find({ userId: req.user._id })
      .populate('noteId')
      .sort({ savedAt: -1 })
      .lean();

    const notesList = savedNotes
      .map((sn: any) => ({
        ...sn.noteId,
        savedAt: sn.savedAt
      }))
      .filter((n: any) => n._id !== undefined);

    res.json({ notes: notesList, count: notesList.length });
  } catch (error: any) {
    console.error('Get saved notes error:', error);
    res.status(500).json({ error: 'Failed to fetch saved notes' });
  }
};

/**
 * Track download
 * POST /api/notes/:id/download
 */
export const trackDownload = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const note = await Note.findById(id);
    if (!note) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    note.downloads += 1;
    await note.save();

    res.json({ message: 'Download tracked', downloads: note.downloads });
  } catch (error: any) {
    console.error('Track download error:', error);
    res.status(500).json({ error: 'Failed to track download' });
  }
};

/**
 * Get comments for a note
 * GET /api/notes/:id/comments
 */
export const getComments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const comments = await Comment.find({ noteId: id, isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .lean();

    // Map fields for client compatibility - handle both 'message' and 'text' field names
    const mappedComments = comments.map((c: any) => ({
      _id: c._id,
      noteId: c.noteId,
      userId: c.userId,
      userName: c.userName,
      text: c.text || c.message,
      createdAt: c.createdAt,
    }));

    res.json({ comments: mappedComments });
  } catch (error: any) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

/**
 * Add comment to a note
 * POST /api/notes/:id/comments
 */
export const addComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (!text || !text.trim()) {
      res.status(400).json({ error: 'Comment text is required' });
      return;
    }

    const comment = await Comment.create({
      noteId: id,
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      message: text.trim(),
    });

    res.status(201).json({
      comment: {
        _id: comment._id,
        noteId: comment.noteId,
        userId: comment.userId,
        userName: comment.userName,
        text: comment.message,
        createdAt: comment.createdAt,
      }
    });
  } catch (error: any) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

/**
 * Delete comment
 * DELETE /api/comments/:id
 */
export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    const isOwner = comment.userId.toString() === (req.user._id as any).toString();
    const isModOrAdmin = ['moderator', 'admin'].includes(req.user.role);

    if (!isOwner && !isModOrAdmin) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    comment.isDeleted = true;
    await comment.save();

    res.json({ message: 'Comment deleted' });
  } catch (error: any) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};

/**
 * Report a note
 * POST /api/notes/:id/report
 */
export const reportNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (!reason) {
      res.status(400).json({ error: 'Reason is required' });
      return;
    }

    const existing = await Report.findOne({ noteId: id, reporterId: req.user._id });
    if (existing) {
      res.status(409).json({ error: 'You have already reported this note' });
      return;
    }

    await Report.create({
      noteId: id,
      reporterId: req.user._id,
      reporterName: req.user.name,
      reason,
    });

    res.status(201).json({ message: 'Note reported successfully' });
  } catch (error: any) {
    console.error('Report note error:', error);
    res.status(500).json({ error: 'Failed to report note' });
  }
};

/**
 * Get leaderboard
 * GET /api/leaderboard
 */
export const getLeaderboard = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Aggregate download stats from Notes collection grouped by uploader
    // Use $lookup to reliably resolve user names from the User collection
    const stats = await Note.aggregate([
      {
        $group: {
          _id: '$uploaderId',
          uploaderName: { $first: '$uploaderName' },
          totalDownloads: { $sum: '$downloads' },
          notesUploaded: { $sum: 1 },
          firstUploadDate: { $min: '$createdAt' },
        }
      },
      { $sort: { totalDownloads: -1 } },
      { $limit: 50 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      }
    ]);

    const leaderboard = stats.map((stat: any) => {
      const notesUploaded = stat.notesUploaded || 0;
      const totalDownloads = stat.totalDownloads || 0;
      // Prefer the name from the User collection, fall back to the denormalized uploaderName
      const userName = stat.userInfo?.[0]?.name || stat.uploaderName || 'Unknown User';
      return {
        name: userName,
        totalDownloads,
        notesUploaded,
        avgDownloads: notesUploaded > 0
          ? Math.round((totalDownloads / notesUploaded) * 100) / 100
          : 0,
        joinDate: stat.firstUploadDate || new Date(),
      };
    });

    res.json({ leaderboard });
  } catch (error: any) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};
