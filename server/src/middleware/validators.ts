import { body, param, query, ValidationChain } from 'express-validator';

export const validateSignup: ValidationChain[] = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be 2-100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['student', 'teacher'])
    .withMessage('Role must be student or teacher'),
  body('section').optional().trim().isLength({ max: 50 }),
  body('branch').optional().trim().isLength({ max: 100 })
];

export const validateLogin: ValidationChain[] = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

export const validateNoteUpload: ValidationChain[] = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be 3-200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('semester').trim().notEmpty().withMessage('Semester is required'),
  body('module').trim().notEmpty().withMessage('Module is required'),
  body('branch').trim().notEmpty().withMessage('Branch is required'),
  body('section').optional().trim().isLength({ max: 50 })
];

export const validateComment: ValidationChain[] = [
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be 1-1000 characters'),
  body('parentCommentId').optional().isMongoId().withMessage('Invalid parent comment ID')
];

export const validateReport: ValidationChain[] = [
  body('reason')
    .notEmpty()
    .withMessage('Reason is required')
    .isIn(['inappropriate', 'duplicate', 'incorrect', 'spam', 'copyright', 'other'])
    .withMessage('Invalid reason'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
];

export const validateNoteQuery: ValidationChain[] = [
  query('subject').optional().trim(),
  query('semester').optional().trim(),
  query('module').optional().trim(),
  query('branch').optional().trim(),
  query('uploaderRole').optional().isIn(['student', 'teacher']),
  query('sortBy')
    .optional()
    .isIn(['uploadDate', 'upvotes', 'downloads', 'views'])
    .withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be >= 1'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be 1-100')
];

export const validateMongoId: ValidationChain[] = [
  param('id').isMongoId().withMessage('Invalid ID format')
];
