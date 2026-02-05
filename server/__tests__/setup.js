// Test setup file - runs AFTER test environment is ready
// Increase timeout for database operations
jest.setTimeout(30000);

// Clean up after all tests
afterAll(async () => {
  // Give time for connections to close
  await new Promise(resolve => setTimeout(resolve, 500));
});
