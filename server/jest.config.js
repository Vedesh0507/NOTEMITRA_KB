module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000,
  verbose: true,
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'server-enhanced.js',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  // Don't run tests in parallel to avoid port conflicts
  maxWorkers: 1,
  // Environment setup - runs BEFORE test files are loaded
  setupFiles: ['<rootDir>/__tests__/env.js'],
  // Test setup - runs AFTER test environment is ready
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
  // Force exit after tests complete (handles MongoDB connection cleanup)
  forceExit: true,
};
