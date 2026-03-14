import { Router } from 'express';
import { authenticate, isAdmin } from '../middleware/auth';
import {
  getStats,
  getUsers,
  suspendUser,
  unsuspendUser,
  deleteUser,
  getAllNotes,
  adminDeleteNote,
  getReports,
  resolveReport,
} from '../controllers/adminController';

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, isAdmin);

// Dashboard stats
router.get('/stats', getStats);

// User management
router.get('/users', getUsers);
router.put('/users/:id/suspend', suspendUser);
router.put('/users/:id/unsuspend', unsuspendUser);
router.delete('/users/:id', deleteUser);

// Notes management
router.get('/notes', getAllNotes);
router.delete('/notes/:id', adminDeleteNote);

// Reports management
router.get('/reports', getReports);
router.put('/reports/:id/resolve', resolveReport);

export default router;
