import { Request, Response } from 'express';
import { User, Note, Report } from '../models';

/**
 * Get admin dashboard stats
 * GET /api/admin/stats
 */
export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [totalUsers, totalNotes, suspendedUsers, reportedNotes] = await Promise.all([
      User.countDocuments(),
      Note.countDocuments(),
      User.countDocuments({ isSuspended: true }),
      Report.countDocuments({ status: 'pending' }),
    ]);

    // Aggregate total downloads and views from notes
    const aggregation = await Note.aggregate([
      {
        $group: {
          _id: null,
          totalDownloads: { $sum: '$downloads' },
          totalViews: { $sum: '$views' },
        },
      },
    ]);

    const totals = aggregation[0] || { totalDownloads: 0, totalViews: 0 };

    res.json({
      totalUsers,
      totalNotes,
      totalDownloads: totals.totalDownloads,
      totalViews: totals.totalViews,
      suspendedUsers,
      reportedNotes,
    });
  } catch (error: any) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

/**
 * Get all users
 * GET /api/admin/users
 */
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find()
      .select('-passwordHash -__v')
      .sort({ createdAt: -1 });

    const formattedUsers = users.map((u) => ({
      id: u._id,
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      branch: u.branch,
      section: u.section,
      notesUploaded: u.uploadsCount,
      isAdmin: u.role === 'admin',
      isSuspended: (u as any).isSuspended || false,
      createdAt: u.createdAt,
    }));

    res.json({ users: formattedUsers });
  } catch (error: any) {
    console.error('Admin get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

/**
 * Suspend user
 * PUT /api/admin/users/:id/suspend
 */
export const suspendUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.role === 'admin') {
      res.status(403).json({ error: 'Cannot suspend an admin user' });
      return;
    }

    (user as any).isSuspended = true;
    await user.save();

    res.json({ message: 'User suspended successfully' });
  } catch (error: any) {
    console.error('Suspend user error:', error);
    res.status(500).json({ error: 'Failed to suspend user' });
  }
};

/**
 * Unsuspend user
 * PUT /api/admin/users/:id/unsuspend
 */
export const unsuspendUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    (user as any).isSuspended = false;
    await user.save();

    res.json({ message: 'User unsuspended successfully' });
  } catch (error: any) {
    console.error('Unsuspend user error:', error);
    res.status(500).json({ error: 'Failed to unsuspend user' });
  }
};

/**
 * Delete user and their notes
 * DELETE /api/admin/users/:id
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.role === 'admin') {
      res.status(403).json({ error: 'Cannot delete an admin user' });
      return;
    }

    // Delete user's notes
    await Note.deleteMany({ uploaderId: id });

    // Delete the user
    await User.deleteOne({ _id: id });

    res.json({ message: 'User and their notes deleted successfully' });
  } catch (error: any) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

/**
 * Get all notes for admin
 * GET /api/admin/notes
 */
export const getAllNotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const notes = await Note.find()
      .sort({ uploadDate: -1 })
      .select('-__v');

    const reportedNoteIds = await Report.find({ status: 'pending' }).distinct('noteId');
    const reportedSet = new Set(reportedNoteIds.map((id) => id.toString()));

    const formattedNotes = notes.map((n) => {
      const noteId = (n._id as any).toString();
      return {
        id: n._id,
        _id: n._id,
        title: n.title,
        description: n.description,
        subject: n.subject,
        semester: n.semester,
        module: n.module,
        branch: n.branch,
        userName: n.uploaderName,
        views: n.views,
        downloads: n.downloads,
        upvotes: n.upvotes,
        downvotes: n.downvotes,
        isReported: reportedSet.has(noteId),
        createdAt: n.uploadDate,
      };
    });

    res.json({ notes: formattedNotes });
  } catch (error: any) {
    console.error('Admin get notes error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
};

/**
 * Admin delete note
 * DELETE /api/admin/notes/:id
 */
export const adminDeleteNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const note = await Note.findById(id);
    if (!note) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    // Delete associated reports
    await Report.deleteMany({ noteId: id });

    // Delete the note
    await Note.deleteOne({ _id: id });

    // Update uploader's count
    await User.findByIdAndUpdate(note.uploaderId, { $inc: { uploadsCount: -1 } });

    res.json({ message: 'Note deleted successfully' });
  } catch (error: any) {
    console.error('Admin delete note error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
};

/**
 * Get reported notes
 * GET /api/admin/reports
 */
export const getReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const reports = await Report.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .populate('noteId');

    const formattedReports = reports
      .filter((r) => r.noteId) // filter out reports with deleted notes
      .map((r) => {
        const note = r.noteId as any;
        return {
          id: note._id,
          _id: note._id,
          title: note.title,
          description: note.description,
          subject: note.subject,
          semester: note.semester,
          branch: note.branch,
          userName: note.uploaderName,
          reportReason: r.reason,
          createdAt: note.uploadDate,
        };
      });

    res.json({ reports: formattedReports });
  } catch (error: any) {
    console.error('Admin get reports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

/**
 * Resolve/dismiss a report
 * PUT /api/admin/reports/:id/resolve
 */
export const resolveReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Resolve all pending reports for this note
    await Report.updateMany(
      { noteId: id, status: 'pending' },
      { $set: { status: 'resolved', reviewedBy: req.user?._id } }
    );

    res.json({ message: 'Reports resolved successfully' });
  } catch (error: any) {
    console.error('Resolve report error:', error);
    res.status(500).json({ error: 'Failed to resolve report' });
  }
};
