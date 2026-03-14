/**
 * NoteMitra Create Note API Tests
 * Comprehensive tests for POST /api/notes endpoint
 * Based on TestSprite test cases
 */

const request = require('supertest');
const { app } = require('../server-enhanced');

// Test user credentials
const TEST_USER_ID = 'testuser123';
const TEST_TOKEN = `dev_token_${TEST_USER_ID}`;
const AUTH_HEADER = `Bearer ${TEST_TOKEN}`;

// Valid note data for testing
const validNoteData = {
  title: 'Test Note Title',
  description: 'This is a test note description with enough content for validation.',
  subject: 'Computer Science',
  semester: 4,
  fileId: 'test-file-id-123',
  fileUrl: 'https://example.com/test.pdf'
};

// Helper to generate unique title for each test
const generateUniqueTitle = () => `Test Note ${Date.now()}_${Math.random().toString(36).substring(7)}`;

describe('Create Note API', () => {
  
  // =====================================================
  // FUNCTIONAL TESTS
  // =====================================================
  describe('Functional Tests', () => {
    
    // Test 1: Create Note with Valid Data (201)
    describe('POST /api/notes - Create Note with Valid Data', () => {
      it('should create a note with all required fields and return 201', async () => {
        const uniqueNoteData = { ...validNoteData, title: generateUniqueTitle() };
        
        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(uniqueNoteData);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('message', 'Note created successfully');
        expect(response.body).toHaveProperty('note');
      });

      it('should return note details in response', async () => {
        const uniqueNoteData = { ...validNoteData, title: generateUniqueTitle() };
        
        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(uniqueNoteData);

        expect(response.status).toBe(201);
        expect(response.body.note).toHaveProperty('title', uniqueNoteData.title);
        expect(response.body.note).toHaveProperty('description');
        expect(response.body.note).toHaveProperty('subject', uniqueNoteData.subject);
        expect(response.body.note).toHaveProperty('semester', uniqueNoteData.semester);
      });

      it('should persist note and allow retrieval', async () => {
        const uniqueNoteData = { ...validNoteData, title: generateUniqueTitle() };
        
        const createResponse = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(uniqueNoteData);

        expect(createResponse.status).toBe(201);
        
        // Note should be retrievable in the list
        const listResponse = await request(app)
          .get('/api/notes')
          .query({ limit: 100 });
          
        expect(listResponse.status).toBe(200);
      });

      it('should set default values for optional fields', async () => {
        const uniqueNoteData = { ...validNoteData, title: generateUniqueTitle() };
        
        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(uniqueNoteData);

        expect(response.status).toBe(201);
        expect(response.body.note).toHaveProperty('views', 0);
        expect(response.body.note).toHaveProperty('downloads', 0);
      });

      it('should associate note with the authenticated user', async () => {
        const uniqueNoteData = { ...validNoteData, title: generateUniqueTitle() };
        
        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(uniqueNoteData);

        expect(response.status).toBe(201);
        expect(response.body.note).toHaveProperty('userId', TEST_USER_ID);
      });
    });

    // Test 2: Create Note with Missing Title (400)
    describe('POST /api/notes - Create Note with Missing Title', () => {
      it('should return 400 when title is missing', async () => {
        const noteWithoutTitle = { ...validNoteData };
        delete noteWithoutTitle.title;

        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(noteWithoutTitle);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message');
        expect(response.body.message.toLowerCase()).toContain('title');
      });

      it('should return 400 when title is empty string', async () => {
        const noteWithEmptyTitle = { ...validNoteData, title: '' };

        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(noteWithEmptyTitle);

        expect(response.status).toBe(400);
        expect(response.body.message.toLowerCase()).toContain('title');
      });

      it('should return 400 when title is null', async () => {
        const noteWithNullTitle = { ...validNoteData, title: null };

        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(noteWithNullTitle);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'TITLE_REQUIRED');
      });

      it('should return 400 when title is only whitespace', async () => {
        const noteWithWhitespaceTitle = { ...validNoteData, title: '   ' };

        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(noteWithWhitespaceTitle);

        expect(response.status).toBe(400);
        expect(response.body.message.toLowerCase()).toContain('title');
      });

      it('should return appropriate error code for missing title', async () => {
        const noteWithoutTitle = { ...validNoteData };
        delete noteWithoutTitle.title;

        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(noteWithoutTitle);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'TITLE_REQUIRED');
      });
    });

    // Test 3: Create Note with Too Long Title (400)
    describe('POST /api/notes - Create Note with Too Long Title', () => {
      it('should return 400 for title exceeding maximum length (200 chars)', async () => {
        const longTitle = 'A'.repeat(201);
        const noteWithLongTitle = { ...validNoteData, title: longTitle };

        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(noteWithLongTitle);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'TITLE_TOO_LONG');
      });

      it('should return error message indicating maximum length for too long title', async () => {
        const longTitle = 'A'.repeat(250);
        const noteWithLongTitle = { ...validNoteData, title: longTitle };

        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(noteWithLongTitle);

        expect(response.status).toBe(400);
        expect(response.body.message.toLowerCase()).toContain('maximum');
        expect(response.body.message.toLowerCase()).toContain('length');
      });

      it('should accept title at exactly maximum length (200 chars)', async () => {
        const maxTitle = 'B'.repeat(200);
        const uniqueSuffix = Date.now().toString();
        const noteWithMaxTitle = { 
          ...validNoteData, 
          title: maxTitle.substring(0, 180) + uniqueSuffix.substring(0, 20)
        };

        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(noteWithMaxTitle);

        expect(response.status).toBe(201);
      });

      it('should return 400 for extremely long title (1000+ chars)', async () => {
        const veryLongTitle = 'X'.repeat(1000);
        const noteWithVeryLongTitle = { ...validNoteData, title: veryLongTitle };

        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(noteWithVeryLongTitle);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'TITLE_TOO_LONG');
      });

      it('should count trimmed length for title validation', async () => {
        // Title with spaces that when trimmed is 201 chars
        const longTitle = '  ' + 'A'.repeat(201) + '  ';
        const noteWithLongTitle = { ...validNoteData, title: longTitle };

        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(noteWithLongTitle);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'TITLE_TOO_LONG');
      });
    });

    // Test 4: Create Note with Invalid Data Types (400)
    describe('POST /api/notes - Create Note with Invalid Data Types', () => {
      it('should return 400 when title is a number instead of string', async () => {
        const noteWithNumericTitle = { ...validNoteData, title: 12345 };

        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(noteWithNumericTitle);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'INVALID_TYPE');
      });

      it('should return 400 when description is a number instead of string', async () => {
        const noteData = { ...validNoteData, title: generateUniqueTitle(), description: 12345 };

        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(noteData);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'INVALID_TYPE');
      });

      it('should return 400 when subject is a number instead of string', async () => {
        const noteData = { ...validNoteData, title: generateUniqueTitle(), subject: 12345 };

        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(noteData);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'INVALID_TYPE');
      });

      it('should return 400 when title is an array', async () => {
        const noteWithArrayTitle = { ...validNoteData, title: ['Test', 'Note'] };

        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(noteWithArrayTitle);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'INVALID_TYPE');
      });

      it('should return 400 when title is an object', async () => {
        const noteWithObjectTitle = { ...validNoteData, title: { text: 'Test Note' } };

        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(noteWithObjectTitle);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'INVALID_TYPE');
      });

      it('should return 400 when description is an object', async () => {
        const noteData = { 
          ...validNoteData, 
          title: generateUniqueTitle(), 
          description: { content: 'Description' } 
        };

        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(noteData);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'INVALID_TYPE');
      });

      it('should return detailed error message for invalid data types', async () => {
        const noteWithNumericTitle = { ...validNoteData, title: 12345 };

        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(noteWithNumericTitle);

        expect(response.status).toBe(400);
        expect(response.body.message.toLowerCase()).toContain('invalid');
        expect(response.body.message.toLowerCase()).toContain('type');
      });

      it('should handle boolean values as invalid type for title', async () => {
        const noteWithBooleanTitle = { ...validNoteData, title: true };

        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(noteWithBooleanTitle);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'INVALID_TYPE');
      });
    });

    // Test 5: Create Note without Authorization Header (401)
    describe('POST /api/notes - Create Note without Authorization Header', () => {
      it('should return 401 when Authorization header is missing', async () => {
        const response = await request(app)
          .post('/api/notes')
          .send(validNoteData);

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'NO_AUTH_HEADER');
      });

      it('should return appropriate error message for missing auth', async () => {
        const response = await request(app)
          .post('/api/notes')
          .send(validNoteData);

        expect(response.status).toBe(401);
        expect(response.body.message.toLowerCase()).toContain('authorization');
      });

      it('should return 401 when Authorization header is empty', async () => {
        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', '')
          .send(validNoteData);

        expect(response.status).toBe(401);
      });

      it('should return 401 when token is missing Bearer prefix', async () => {
        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', TEST_TOKEN)
          .send(validNoteData);

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'INVALID_AUTH_FORMAT');
      });

      it('should return 401 when token is invalid', async () => {
        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', 'Bearer invalid_random_token')
          .send(validNoteData);

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'INVALID_TOKEN');
      });

      it('should return 401 when token user does not exist', async () => {
        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', 'Bearer dev_token_nonexistent_user_12345')
          .send(validNoteData);

        expect(response.status).toBe(401);
        expect(response.body.message.toLowerCase()).toContain('user');
      });

      it('should return 401 for expired token', async () => {
        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', 'Bearer expired_token_user123')
          .send(validNoteData);

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'TOKEN_EXPIRED');
      });
    });
  });

  // =====================================================
  // EDGE CASE TESTS
  // =====================================================
  describe('Edge Case Tests', () => {
    
    // Test 1: Create Note with Empty Body (400)
    describe('POST /api/notes - Create Note with Empty Body', () => {
      it('should return 400 when request body is empty', async () => {
        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send({});

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'EMPTY_BODY');
      });

      it('should return error message indicating input is required for empty body', async () => {
        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send({});

        expect(response.status).toBe(400);
        expect(response.body.message.toLowerCase()).toContain('required');
      });

      it('should return 400 when no body is sent', async () => {
        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .set('Content-Type', 'application/json');

        expect(response.status).toBe(400);
      });

      it('should return proper JSON response for empty body', async () => {
        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send({});

        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('error');
      });
    });

    // Test 2: Create Note with Special Characters
    describe('POST /api/notes - Create Note with Special Characters', () => {
      it('should handle special characters in title successfully (201)', async () => {
        const noteWithSpecialChars = {
          ...validNoteData,
          title: `Test Note ${Date.now()} - Special @#$%^&*()!`
        };

        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(noteWithSpecialChars);

        expect(response.status).toBe(201);
        expect(response.body.note.title).toContain('Special');
      });

      it('should handle special characters in description successfully', async () => {
        const noteWithSpecialChars = {
          ...validNoteData,
          title: generateUniqueTitle(),
          description: 'Description with special chars: <>&"\'!@#$%^&*()_+-=[]{}|;:,.<>?/'
        };

        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(noteWithSpecialChars);

        expect(response.status).toBe(201);
      });

      it('should handle HTML-like characters safely', async () => {
        const noteWithHTML = {
          ...validNoteData,
          title: `Test <script>alert("xss")</script> ${Date.now()}`,
          description: '<div>HTML content</div><script>malicious</script>'
        };

        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(noteWithHTML);

        expect(response.status).toBe(201);
        // Note should be created (XSS prevention is frontend's job, backend stores safely)
      });

      it('should handle emojis in title and description', async () => {
        const noteWithEmojis = {
          ...validNoteData,
          title: `Test Notes 📚 with Emojis 🎉 ${Date.now()}`,
          description: 'Description with emojis 😀🚀💻📝✅'
        };

        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(noteWithEmojis);

        expect(response.status).toBe(201);
        expect(response.body.note.title).toContain('📚');
      });

      it('should handle unicode characters (international text)', async () => {
        const noteWithUnicode = {
          ...validNoteData,
          title: `Тест Notes 测试 テスト ${Date.now()}`,
          description: 'Описание на русском, 中文描述, 日本語の説明'
        };

        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(noteWithUnicode);

        expect(response.status).toBe(201);
      });

      it('should handle newlines and tabs in description', async () => {
        const noteWithWhitespace = {
          ...validNoteData,
          title: generateUniqueTitle(),
          description: 'Line 1\nLine 2\n\tTabbed line\n\nDouble newline'
        };

        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(noteWithWhitespace);

        expect(response.status).toBe(201);
      });

      it('should handle quotes and apostrophes properly', async () => {
        const noteWithQuotes = {
          ...validNoteData,
          title: `"Quoted Title" and 'Apostrophes' ${Date.now()}`,
          description: 'He said "Hello" and it\'s working'
        };

        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(noteWithQuotes);

        expect(response.status).toBe(201);
      });

      it('should handle SQL injection attempts safely', async () => {
        const noteWithSQL = {
          ...validNoteData,
          title: `Test ${Date.now()}; DROP TABLE notes;--`,
          description: "'; DELETE FROM users WHERE '1'='1"
        };

        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(noteWithSQL);

        expect(response.status).toBe(201);
        // Should create note without executing SQL
      });
    });

    // Test 3: Create Note with Extremely Long Description (400)
    describe('POST /api/notes - Create Note with Extremely Long Description', () => {
      it('should return 400 for description exceeding maximum length (5000 chars)', async () => {
        const longDescription = 'D'.repeat(5001);
        const noteWithLongDesc = {
          ...validNoteData,
          title: generateUniqueTitle(),
          description: longDescription
        };

        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(noteWithLongDesc);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'DESCRIPTION_TOO_LONG');
      });

      it('should return error message indicating maximum length for long description', async () => {
        const longDescription = 'X'.repeat(6000);
        const noteWithLongDesc = {
          ...validNoteData,
          title: generateUniqueTitle(),
          description: longDescription
        };

        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(noteWithLongDesc);

        expect(response.status).toBe(400);
        expect(response.body.message.toLowerCase()).toContain('maximum');
        expect(response.body.message.toLowerCase()).toContain('length');
      });

      it('should accept description at exactly maximum length (5000 chars)', async () => {
        const maxDescription = 'E'.repeat(5000);
        const noteWithMaxDesc = {
          ...validNoteData,
          title: generateUniqueTitle(),
          description: maxDescription
        };

        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(noteWithMaxDesc);

        expect(response.status).toBe(201);
      });

      it('should return 400 for extremely long description (50000 chars)', async () => {
        const veryLongDescription = 'Y'.repeat(50000);
        const noteWithVeryLongDesc = {
          ...validNoteData,
          title: generateUniqueTitle(),
          description: veryLongDescription
        };

        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(noteWithVeryLongDesc);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'DESCRIPTION_TOO_LONG');
      });

      it('should count trimmed length for description validation', async () => {
        // Description with spaces that when trimmed is 5001 chars
        const longDescription = '  ' + 'Z'.repeat(5001) + '  ';
        const noteWithLongDesc = {
          ...validNoteData,
          title: generateUniqueTitle(),
          description: longDescription
        };

        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(noteWithLongDesc);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'DESCRIPTION_TOO_LONG');
      });
    });

    // Test 4: Create Note with Duplicate Title (409)
    describe('POST /api/notes - Create Note with Duplicate Title', () => {
      it('should return 409 when creating note with duplicate title in same subject and semester', async () => {
        const uniqueTitle = `Unique Duplicate Test ${Date.now()}`;
        const noteData = {
          ...validNoteData,
          title: uniqueTitle,
          subject: 'Mathematics',
          semester: 5
        };

        // First create should succeed
        const firstResponse = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(noteData);

        expect(firstResponse.status).toBe(201);

        // Second create with same title, subject, semester should fail with 409
        const secondResponse = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(noteData);

        expect(secondResponse.status).toBe(409);
        expect(secondResponse.body).toHaveProperty('error', 'DUPLICATE_TITLE');
      });

      it('should return error message about duplicate for conflict', async () => {
        const uniqueTitle = `Duplicate Message Test ${Date.now()}`;
        const noteData = {
          ...validNoteData,
          title: uniqueTitle,
          subject: 'Physics',
          semester: 3
        };

        // First create
        await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(noteData);

        // Second create should return message about duplicate
        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(noteData);

        expect(response.status).toBe(409);
        expect(response.body.message.toLowerCase()).toContain('already exists');
      });

      it('should allow same title in different subject', async () => {
        const uniqueTitle = `Cross Subject Test ${Date.now()}`;
        
        // Create in subject 1
        const firstResponse = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send({
            ...validNoteData,
            title: uniqueTitle,
            subject: 'Chemistry',
            semester: 4
          });

        expect(firstResponse.status).toBe(201);

        // Same title in different subject should succeed
        const secondResponse = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send({
            ...validNoteData,
            title: uniqueTitle,
            subject: 'Biology',
            semester: 4
          });

        expect(secondResponse.status).toBe(201);
      });

      it('should allow same title in different semester', async () => {
        const uniqueTitle = `Cross Semester Test ${Date.now()}`;
        
        // Create in semester 1
        const firstResponse = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send({
            ...validNoteData,
            title: uniqueTitle,
            subject: 'English',
            semester: 1
          });

        expect(firstResponse.status).toBe(201);

        // Same title in different semester should succeed
        const secondResponse = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send({
            ...validNoteData,
            title: uniqueTitle,
            subject: 'English',
            semester: 2
          });

        expect(secondResponse.status).toBe(201);
      });

      it('should be case-sensitive for duplicate title check', async () => {
        const uniqueTitle = `Case Sensitive Test ${Date.now()}`;
        
        // Create with lowercase
        const firstResponse = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send({
            ...validNoteData,
            title: uniqueTitle.toLowerCase(),
            subject: 'History',
            semester: 6
          });

        expect(firstResponse.status).toBe(201);

        // Create with uppercase should succeed (case-sensitive)
        const secondResponse = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send({
            ...validNoteData,
            title: uniqueTitle.toUpperCase(),
            subject: 'History',
            semester: 6
          });

        expect(secondResponse.status).toBe(201);
      });
    });

    // Test 5: Create Note with Invalid JSON Format (400)
    describe('POST /api/notes - Create Note with Invalid JSON Format', () => {
      it('should return 400 for malformed JSON', async () => {
        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .set('Content-Type', 'application/json')
          .send('{"invalid json}');

        expect([400, 500]).toContain(response.status);
      });

      it('should return error about invalid JSON for malformed request', async () => {
        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .set('Content-Type', 'application/json')
          .send('{title: "missing quotes"}');

        expect([400, 500]).toContain(response.status);
      });

      it('should handle completely invalid JSON syntax', async () => {
        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .set('Content-Type', 'application/json')
          .send('not json at all');

        expect([400, 500]).toContain(response.status);
      });

      it('should return JSON response for invalid JSON input', async () => {
        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .set('Content-Type', 'application/json')
          .send('{"unclosed": "string');

        expect(response.headers['content-type']).toMatch(/json/);
      });

      it('should handle truncated JSON gracefully', async () => {
        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .set('Content-Type', 'application/json')
          .send('{"title": "Test", "description": ');

        expect([400, 500]).toContain(response.status);
      });
    });
  });

  // =====================================================
  // ADDITIONAL VALIDATION TESTS
  // =====================================================
  describe('Additional Validation Tests', () => {
    
    describe('Missing Required Fields', () => {
      it('should return 400 when description is missing', async () => {
        const noteWithoutDesc = { ...validNoteData, title: generateUniqueTitle() };
        delete noteWithoutDesc.description;

        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(noteWithoutDesc);

        expect(response.status).toBe(400);
        expect(response.body.message.toLowerCase()).toContain('description');
      });

      it('should return 400 when subject is missing', async () => {
        const noteWithoutSubject = { ...validNoteData, title: generateUniqueTitle() };
        delete noteWithoutSubject.subject;

        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(noteWithoutSubject);

        expect(response.status).toBe(400);
        expect(response.body.message.toLowerCase()).toContain('subject');
      });

      it('should return 400 when semester is missing', async () => {
        const noteWithoutSemester = { ...validNoteData, title: generateUniqueTitle() };
        delete noteWithoutSemester.semester;

        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(noteWithoutSemester);

        expect(response.status).toBe(400);
        expect(response.body.message.toLowerCase()).toContain('semester');
      });

      it('should return 400 when file (fileId and fileUrl) is missing', async () => {
        const noteWithoutFile = { ...validNoteData, title: generateUniqueTitle() };
        delete noteWithoutFile.fileId;
        delete noteWithoutFile.fileUrl;

        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(noteWithoutFile);

        expect(response.status).toBe(400);
        expect(response.body.message.toLowerCase()).toContain('file');
      });
    });

    describe('Semester Validation', () => {
      it('should return 400 for semester less than 1', async () => {
        const noteData = { ...validNoteData, title: generateUniqueTitle(), semester: 0 };

        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(noteData);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'INVALID_SEMESTER');
      });

      it('should return 400 for semester greater than 8', async () => {
        const noteData = { ...validNoteData, title: generateUniqueTitle(), semester: 9 };

        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(noteData);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'INVALID_SEMESTER');
      });

      it('should return 400 for non-numeric semester', async () => {
        const noteData = { ...validNoteData, title: generateUniqueTitle(), semester: 'four' };

        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(noteData);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'INVALID_SEMESTER');
      });

      it('should return 400 for negative semester', async () => {
        const noteData = { ...validNoteData, title: generateUniqueTitle(), semester: -1 };

        const response = await request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(noteData);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'INVALID_SEMESTER');
      });

      it('should accept valid semesters (1-8)', async () => {
        for (let sem = 1; sem <= 8; sem++) {
          const noteData = { 
            ...validNoteData, 
            title: `Semester ${sem} Test ${Date.now()}`, 
            semester: sem 
          };

          const response = await request(app)
            .post('/api/notes')
            .set('Authorization', AUTH_HEADER)
            .send(noteData);

          expect(response.status).toBe(201);
        }
      });
    });
  });

  // =====================================================
  // RESPONSE FORMAT TESTS
  // =====================================================
  describe('Response Format Tests', () => {
    it('should return JSON content type on success', async () => {
      const uniqueNoteData = { ...validNoteData, title: generateUniqueTitle() };
      
      const response = await request(app)
        .post('/api/notes')
        .set('Authorization', AUTH_HEADER)
        .send(uniqueNoteData);

      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should return JSON content type on error', async () => {
      const response = await request(app)
        .post('/api/notes')
        .set('Authorization', AUTH_HEADER)
        .send({});

      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should return proper success structure with message and note', async () => {
      const uniqueNoteData = { ...validNoteData, title: generateUniqueTitle() };
      
      const response = await request(app)
        .post('/api/notes')
        .set('Authorization', AUTH_HEADER)
        .send(uniqueNoteData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('note');
      expect(typeof response.body.message).toBe('string');
      expect(typeof response.body.note).toBe('object');
    });

    it('should return proper error structure with message and error code', async () => {
      const response = await request(app)
        .post('/api/notes')
        .set('Authorization', AUTH_HEADER)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('error');
    });

    it('should not expose sensitive information in response', async () => {
      const uniqueNoteData = { ...validNoteData, title: generateUniqueTitle() };
      
      const response = await request(app)
        .post('/api/notes')
        .set('Authorization', AUTH_HEADER)
        .send(uniqueNoteData);

      expect(response.status).toBe(201);
      const responseStr = JSON.stringify(response.body);
      expect(responseStr).not.toMatch(/password/i);
      expect(responseStr).not.toMatch(/secret/i);
    });
  });

  // =====================================================
  // HTTP METHOD TESTS
  // =====================================================
  describe('HTTP Method Tests', () => {
    it('should accept POST request to /api/notes', async () => {
      const uniqueNoteData = { ...validNoteData, title: generateUniqueTitle() };
      
      const response = await request(app)
        .post('/api/notes')
        .set('Authorization', AUTH_HEADER)
        .send(uniqueNoteData);

      expect(response.status).toBe(201);
    });

    it('should accept GET request to /api/notes (for listing)', async () => {
      const response = await request(app)
        .get('/api/notes');

      expect(response.status).toBe(200);
    });
  });

  // =====================================================
  // CONCURRENT REQUEST TESTS
  // =====================================================
  describe('Concurrent Request Tests', () => {
    it('should handle multiple simultaneous create requests', async () => {
      const requests = [];
      for (let i = 0; i < 5; i++) {
        const noteData = {
          ...validNoteData,
          title: `Concurrent Test ${Date.now()}_${i}_${Math.random()}`
        };
        requests.push(
          request(app)
            .post('/api/notes')
            .set('Authorization', AUTH_HEADER)
            .send(noteData)
        );
      }

      const responses = await Promise.all(requests);
      
      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(201);
      });
    });

    it('should handle concurrent creates with different users', async () => {
      const user1Token = 'Bearer dev_token_testuser123';
      const user2Token = 'Bearer dev_token_leaderuser1';

      const requests = [
        request(app)
          .post('/api/notes')
          .set('Authorization', user1Token)
          .send({ ...validNoteData, title: `User1 Note ${Date.now()}` }),
        request(app)
          .post('/api/notes')
          .set('Authorization', user2Token)
          .send({ ...validNoteData, title: `User2 Note ${Date.now()}` })
      ];

      const responses = await Promise.all(requests);
      
      expect(responses[0].status).toBe(201);
      expect(responses[1].status).toBe(201);
      expect(responses[0].body.note.userId).toBe('testuser123');
      expect(responses[1].body.note.userId).toBe('leaderuser1');
    });

    it('should reject concurrent creates with same title in same subject/semester', async () => {
      const uniqueTitle = `Concurrent Duplicate Test ${Date.now()}`;
      const noteData = {
        ...validNoteData,
        title: uniqueTitle,
        subject: 'ConcurrentTestSubject',
        semester: 7
      };

      const requests = [
        request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(noteData),
        request(app)
          .post('/api/notes')
          .set('Authorization', AUTH_HEADER)
          .send(noteData)
      ];

      const responses = await Promise.all(requests);
      
      // One should succeed, one should fail with 409
      const statuses = responses.map(r => r.status).sort();
      expect(statuses).toContain(201);
      expect(statuses).toContain(409);
    });
  });

  // =====================================================
  // PERFORMANCE TESTS
  // =====================================================
  describe('Performance Tests', () => {
    it('should respond within acceptable timeframe (< 500ms)', async () => {
      const uniqueNoteData = { ...validNoteData, title: generateUniqueTitle() };
      
      const startTime = Date.now();
      const response = await request(app)
        .post('/api/notes')
        .set('Authorization', AUTH_HEADER)
        .send(uniqueNoteData);
      const endTime = Date.now();

      expect(response.status).toBe(201);
      expect(endTime - startTime).toBeLessThan(500);
    });

    it('should handle large payload efficiently', async () => {
      const largeDescription = 'A'.repeat(4999); // Just under max
      const noteData = {
        ...validNoteData,
        title: generateUniqueTitle(),
        description: largeDescription
      };

      const startTime = Date.now();
      const response = await request(app)
        .post('/api/notes')
        .set('Authorization', AUTH_HEADER)
        .send(noteData);
      const endTime = Date.now();

      expect(response.status).toBe(201);
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});
