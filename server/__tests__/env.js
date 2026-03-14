// Environment setup file - runs BEFORE test files are loaded
// Set test environment variables

process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/notemitra_test';
process.env.RESEND_API_KEY = process.env.RESEND_API_KEY || 're_test_key_for_testing';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
process.env.GMAIL_USER = process.env.GMAIL_USER || 'test@gmail.com';
process.env.GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || 'test-password';
process.env.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'test-cloud';
process.env.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || 'test-api-key';
process.env.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || 'test-api-secret';
