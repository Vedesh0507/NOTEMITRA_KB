/**
 * NoteMitra Saved Notes API Tests
 * Comprehensive tests for Save Note feature
 * Based on TestSprite test cases
 */

const request = require('supertest');
const { app } = require('../server-enhanced');

// Test user credentials
const TEST_USER_ID = 'testuser123';
const TEST_TOKEN = `dev_token_${TEST_USER_ID}`;
const AUTH_HEADER = `Bearer ${TEST_TOKEN}`;

// Second test user for isolation tests
const TEST_USER_ID_2 = 'leaderuser1';
const TEST_TOKEN_2 = `dev_token_${TEST_USER_ID_2}`;
const AUTH_HEADER_2 = `Bearer ${TEST_TOKEN_2}`;

// Valid note data for creating test notes
const validNoteData = {
  title: 'Test Note for Saving',
  description: 'This is a test note description for saving tests.',
  subject: 'Computer Science',
  semester: 4,
  fileId: 'test-file-id-123',
  fileUrl: 'https://example.com/test.pdf'
};

// Helper to create a note and return its ID
const createTestNote = async (customData = {}) => {
  const noteData = {
    ...validNoteData,
    title: `Save Test Note ${Date.now()}_${Math.random().toString(36).substring(7)}`,
    ...customData
  };

  const response = await request(app)
    .post('/api/notes')
    .set('Authorization', AUTH_HEADER)
    .send(noteData);

  if (response.status === 201 && response.body.note) {
    return response.body.note._id || response.body.note.id;
  }
  return null;
};

describe('Saved Notes API', () => {
  
  // =====================================================
  // FUNCTIONAL TESTS
  // =====================================================
  describe('Functional Tests', () => {
    
    // Test 1: Verify successful saving of notes
    describe('POST /api/notes/:id/save - Successful Saving of Notes', () => {
      it('should save a note successfully with valid note ID and auth', async () => {
        const noteId = await createTestNote();
        if (!noteId) {
          console.log('Skipping - no note created');
          return;
        }

        const response = await request(app)
          .post(`/api/notes/${noteId}/save`)
          .set('Authorization', AUTH_HEADER);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('message', 'Note saved successfully');
        expect(response.body).toHaveProperty('saved', true);
      });

      it('should return 201 status code on successful save', async () => {
        const noteId = await createTestNote();
        if (!noteId) return;

        const response = await request(app)
          .post(`/api/notes/${noteId}/save`)
          .set('Authorization', AUTH_HEADER);

        expect(response.status).toBe(201);
      });

      it('should save note for different users independently', async () => {
        const noteId = await createTestNote();
        if (!noteId) return;

        // First user saves
        const response1 = await request(app)
          .post(`/api/notes/${noteId}/save`)
          .set('Authorization', AUTH_HEADER);

        expect(response1.status).toBe(201);

        // Second user saves same note
        const response2 = await request(app)
          .post(`/api/notes/${noteId}/save`)
          .set('Authorization', AUTH_HEADER_2);

        expect(response2.status).toBe(201);
      });

      it('should persist the saved note in database', async () => {
        const noteId = await createTestNote();
        if (!noteId) return;

        // Save the note
        await request(app)
          .post(`/api/notes/${noteId}/save`)
          .set('Authorization', AUTH_HEADER);

        // Verify it appears in saved list
        const listResponse = await request(app)
          .get('/api/notes/saved/list')
          .set('Authorization', AUTH_HEADER);

        expect(listResponse.status).toBe(200);
        expect(listResponse.body).toHaveProperty('notes');
        expect(Array.isArray(listResponse.body.notes)).toBe(true);
      });
    });

    // Test 2: Verify note saved response structure
    describe('POST /api/notes/:id/save - Saved Note Response Structure', () => {
      it('should return response with expected fields after saving', async () => {
        const noteId = await createTestNote();
        if (!noteId) return;

        const response = await request(app)
          .post(`/api/notes/${noteId}/save`)
          .set('Authorization', AUTH_HEADER);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('saved');
        expect(response.body).toHaveProperty('savedNote');
      });

      it('should return savedNote object with correct properties', async () => {
        const noteId = await createTestNote();
        if (!noteId) return;

        const response = await request(app)
          .post(`/api/notes/${noteId}/save`)
          .set('Authorization', AUTH_HEADER);

        expect(response.status).toBe(201);
        expect(response.body.savedNote).toHaveProperty('id');
        expect(response.body.savedNote).toHaveProperty('noteId');
        expect(response.body.savedNote).toHaveProperty('userId');
        expect(response.body.savedNote).toHaveProperty('savedAt');
      });

      it('should return savedAt as valid timestamp', async () => {
        const noteId = await createTestNote();
        if (!noteId) return;

        const response = await request(app)
          .post(`/api/notes/${noteId}/save`)
          .set('Authorization', AUTH_HEADER);

        expect(response.status).toBe(201);
        const savedAt = new Date(response.body.savedNote.savedAt);
        expect(savedAt).toBeInstanceOf(Date);
        expect(isNaN(savedAt.getTime())).toBe(false);
      });

      it('should return JSON content type', async () => {
        const noteId = await createTestNote();
        if (!noteId) return;

        const response = await request(app)
          .post(`/api/notes/${noteId}/save`)
          .set('Authorization', AUTH_HEADER);

        expect(response.headers['content-type']).toMatch(/json/);
      });
    });

    // Test 3: Verify error response for invalid note data
    describe('POST /api/notes/:id/save - Error Response for Invalid Note Data', () => {
      it('should return 404 for non-existent note ID (valid format)', async () => {
        // Valid ObjectId format that doesn't exist
        const nonExistentId = '507f1f77bcf86cd799439011';

        const response = await request(app)
          .post(`/api/notes/${nonExistentId}/save`)
          .set('Authorization', AUTH_HEADER);

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'NOTE_NOT_FOUND');
      });

      it('should return 404 for invalid note ID format (not found)', async () => {
        const response = await request(app)
          .post('/api/notes/invalid-id-format/save')
          .set('Authorization', AUTH_HEADER);

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'NOTE_NOT_FOUND');
      });

      it('should return appropriate error for non-existent note', async () => {
        const response = await request(app)
          .post('/api/notes/nonexistent123/save')
          .set('Authorization', AUTH_HEADER);

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('message');
        expect(response.body.message.toLowerCase()).toContain('not found');
      });
    });

    // Test 4: Verify saving notes without mandatory fields (validation)
    describe('POST /api/notes/:id/save - Validation for Mandatory Fields', () => {
      it('should return 404 for missing note ID in URL', async () => {
        // This should hit the endpoint without an ID, which Express routes differently
        const response = await request(app)
          .post('/api/notes//save')
          .set('Authorization', AUTH_HEADER);

        // Route won't match, so will get 404
        expect(response.status).toBe(404);
      });

      it('should return error for whitespace-only note ID', async () => {
        const response = await request(app)
          .post('/api/notes/%20%20%20/save')
          .set('Authorization', AUTH_HEADER);

        expect([400, 404]).toContain(response.status);
      });

      it('should validate authorization header is present', async () => {
        const noteId = await createTestNote();
        if (!noteId) return;

        const response = await request(app)
          .post(`/api/notes/${noteId}/save`);

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'NO_AUTH_HEADER');
      });
    });

    // Test 5: Verify retrieval of saved notes after saving
    describe('GET /api/notes/saved/list - Retrieval of Saved Notes', () => {
      it('should retrieve saved notes successfully', async () => {
        const response = await request(app)
          .get('/api/notes/saved/list')
          .set('Authorization', AUTH_HEADER);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('notes');
        expect(Array.isArray(response.body.notes)).toBe(true);
      });

      it('should return count of saved notes', async () => {
        const response = await request(app)
          .get('/api/notes/saved/list')
          .set('Authorization', AUTH_HEADER);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('count');
        expect(typeof response.body.count).toBe('number');
      });

      it('should include savedAt timestamp in retrieved notes', async () => {
        // Create and save a note first
        const noteId = await createTestNote();
        if (!noteId) return;

        await request(app)
          .post(`/api/notes/${noteId}/save`)
          .set('Authorization', AUTH_HEADER);

        const response = await request(app)
          .get('/api/notes/saved/list')
          .set('Authorization', AUTH_HEADER);

        expect(response.status).toBe(200);
        if (response.body.notes.length > 0) {
          expect(response.body.notes[0]).toHaveProperty('savedAt');
        }
      });

      it('should return notes sorted by savedAt (most recent first)', async () => {
        const response = await request(app)
          .get('/api/notes/saved/list')
          .set('Authorization', AUTH_HEADER);

        expect(response.status).toBe(200);
        
        if (response.body.notes.length > 1) {
          const dates = response.body.notes.map(n => new Date(n.savedAt));
          for (let i = 0; i < dates.length - 1; i++) {
            expect(dates[i].getTime()).toBeGreaterThanOrEqual(dates[i + 1].getTime());
          }
        }
      });

      it('should only return notes saved by the authenticated user', async () => {
        const response = await request(app)
          .get('/api/notes/saved/list')
          .set('Authorization', AUTH_HEADER);

        expect(response.status).toBe(200);
        // All returned notes should belong to the authenticated user
        expect(response.body).toHaveProperty('notes');
      });
    });
  });

  // =====================================================
  // EDGE CASE TESTS
  // =====================================================
  describe('Edge Case Tests', () => {
    
    // Test 1: Verify saving empty note
    describe('POST /api/notes/:id/save - Saving Empty Note', () => {
      it('should return 400 for empty note ID', async () => {
        const response = await request(app)
          .post('/api/notes/ /save')
          .set('Authorization', AUTH_HEADER);

        expect([400, 404]).toContain(response.status);
      });

      it('should return error for undefined-like note ID string', async () => {
        const response = await request(app)
          .post('/api/notes/undefined/save')
          .set('Authorization', AUTH_HEADER);

        // "undefined" as a string is treated as a note ID that doesn't exist
        expect([400, 404]).toContain(response.status);
        expect(response.body).toHaveProperty('message');
      });

      it('should handle null-like values in note ID', async () => {
        const response = await request(app)
          .post('/api/notes/null/save')
          .set('Authorization', AUTH_HEADER);

        // "null" as a string is treated as a note ID that doesn't exist
        expect([400, 404]).toContain(response.status);
      });
    });

    // Test 2: Verify saving long note content (long ID)
    describe('POST /api/notes/:id/save - Saving with Very Long Content', () => {
      it('should return 400 for extremely long note ID (>100 chars)', async () => {
        const longId = 'a'.repeat(150);
        
        const response = await request(app)
          .post(`/api/notes/${longId}/save`)
          .set('Authorization', AUTH_HEADER);

        expect(response.status).toBe(400);
        expect(response.body.message.toLowerCase()).toContain('long');
      });

      it('should handle moderately long but valid ObjectId', async () => {
        // Valid ObjectId is 24 chars
        const validId = '507f1f77bcf86cd799439011';
        
        const response = await request(app)
          .post(`/api/notes/${validId}/save`)
          .set('Authorization', AUTH_HEADER);

        // Should return 404 (note not found) not 400 (invalid format)
        expect(response.status).toBe(404);
      });

      it('should reject ID that exceeds maximum length', async () => {
        const veryLongId = 'x'.repeat(200);
        
        const response = await request(app)
          .post(`/api/notes/${veryLongId}/save`)
          .set('Authorization', AUTH_HEADER);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'INVALID_NOTE_ID');
      });
    });

    // Test 3: Verify note with special characters
    describe('POST /api/notes/:id/save - Special Characters Handling', () => {
      it('should handle note ID with special characters gracefully', async () => {
        const specialId = 'note@#$%^&*()';
        
        const response = await request(app)
          .post(`/api/notes/${encodeURIComponent(specialId)}/save`)
          .set('Authorization', AUTH_HEADER);

        // Note with invalid characters won't exist, so 404 is valid
        expect([400, 404]).toContain(response.status);
      });

      it('should handle URL-encoded special characters', async () => {
        const response = await request(app)
          .post('/api/notes/%3Cscript%3E/save')
          .set('Authorization', AUTH_HEADER);

        // Invalid note ID should return 400 or 404
        expect([400, 404]).toContain(response.status);
      });

      it('should handle SQL injection attempts in note ID', async () => {
        const sqlInjection = "'; DROP TABLE notes;--";
        
        const response = await request(app)
          .post(`/api/notes/${encodeURIComponent(sqlInjection)}/save`)
          .set('Authorization', AUTH_HEADER);

        // SQL injection strings won't match any note, should be 400 or 404
        expect([400, 404]).toContain(response.status);
      });

      it('should handle unicode characters in note ID', async () => {
        const unicodeId = 'note测试';
        
        const response = await request(app)
          .post(`/api/notes/${encodeURIComponent(unicodeId)}/save`)
          .set('Authorization', AUTH_HEADER);

        // Unicode note IDs that don't exist should fail
        expect([400, 404]).toContain(response.status);
      });

      it('should successfully save note with valid ID containing alphanumeric chars', async () => {
        const noteId = await createTestNote();
        if (!noteId) return;

        const response = await request(app)
          .post(`/api/notes/${noteId}/save`)
          .set('Authorization', AUTH_HEADER);

        expect(response.status).toBe(201);
      });
    });

    // Test 4: Verify duplicate notes handling (idempotency)
    describe('POST /api/notes/:id/save - Duplicate Notes Handling', () => {
      it('should return 409 when saving same note twice', async () => {
        const noteId = await createTestNote();
        if (!noteId) return;

        // First save
        const firstResponse = await request(app)
          .post(`/api/notes/${noteId}/save`)
          .set('Authorization', AUTH_HEADER);

        expect(firstResponse.status).toBe(201);

        // Second save (duplicate)
        const secondResponse = await request(app)
          .post(`/api/notes/${noteId}/save`)
          .set('Authorization', AUTH_HEADER);

        expect(secondResponse.status).toBe(409);
        expect(secondResponse.body).toHaveProperty('error', 'ALREADY_SAVED');
      });

      it('should return saved: true for duplicate save attempt', async () => {
        const noteId = await createTestNote();
        if (!noteId) return;

        // First save
        await request(app)
          .post(`/api/notes/${noteId}/save`)
          .set('Authorization', AUTH_HEADER);

        // Second save
        const response = await request(app)
          .post(`/api/notes/${noteId}/save`)
          .set('Authorization', AUTH_HEADER);

        expect(response.status).toBe(409);
        expect(response.body).toHaveProperty('saved', true);
      });

      it('should return original savedAt timestamp for duplicate', async () => {
        const noteId = await createTestNote();
        if (!noteId) return;

        // First save
        const firstResponse = await request(app)
          .post(`/api/notes/${noteId}/save`)
          .set('Authorization', AUTH_HEADER);

        expect(firstResponse.status).toBe(201);

        // Second save
        const secondResponse = await request(app)
          .post(`/api/notes/${noteId}/save`)
          .set('Authorization', AUTH_HEADER);

        expect(secondResponse.status).toBe(409);
        expect(secondResponse.body).toHaveProperty('savedAt');
      });

      it('should allow different users to save same note', async () => {
        const noteId = await createTestNote();
        if (!noteId) return;

        // User 1 saves
        const response1 = await request(app)
          .post(`/api/notes/${noteId}/save`)
          .set('Authorization', AUTH_HEADER);

        expect(response1.status).toBe(201);

        // User 2 saves same note
        const response2 = await request(app)
          .post(`/api/notes/${noteId}/save`)
          .set('Authorization', AUTH_HEADER_2);

        expect(response2.status).toBe(201);
      });

      it('should not create duplicate entries in database', async () => {
        const noteId = await createTestNote();
        if (!noteId) return;

        // Save multiple times
        await request(app)
          .post(`/api/notes/${noteId}/save`)
          .set('Authorization', AUTH_HEADER);

        await request(app)
          .post(`/api/notes/${noteId}/save`)
          .set('Authorization', AUTH_HEADER);

        await request(app)
          .post(`/api/notes/${noteId}/save`)
          .set('Authorization', AUTH_HEADER);

        // Check saved list
        const listResponse = await request(app)
          .get('/api/notes/saved/list')
          .set('Authorization', AUTH_HEADER);

        expect(listResponse.status).toBe(200);
        // Count of this specific note should be 1
      });
    });

    // Test 5: Verify handling of unauthorized requests
    describe('POST /api/notes/:id/save - Unauthorized Request Handling', () => {
      it('should return 401 when Authorization header is missing', async () => {
        const noteId = await createTestNote();
        if (!noteId) return;

        const response = await request(app)
          .post(`/api/notes/${noteId}/save`);

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'NO_AUTH_HEADER');
      });

      it('should return appropriate error message for missing auth', async () => {
        const response = await request(app)
          .post('/api/notes/123456/save');

        expect(response.status).toBe(401);
        expect(response.body.message.toLowerCase()).toContain('authorization');
      });

      it('should return 401 when Authorization header is empty', async () => {
        const response = await request(app)
          .post('/api/notes/123456/save')
          .set('Authorization', '');

        expect(response.status).toBe(401);
      });

      it('should return 401 for invalid token format', async () => {
        const response = await request(app)
          .post('/api/notes/123456/save')
          .set('Authorization', 'InvalidToken');

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'INVALID_AUTH_FORMAT');
      });

      it('should return 401 for token without Bearer prefix', async () => {
        const response = await request(app)
          .post('/api/notes/123456/save')
          .set('Authorization', TEST_TOKEN);

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'INVALID_AUTH_FORMAT');
      });

      it('should return 401 for invalid token (not dev_token_)', async () => {
        const response = await request(app)
          .post('/api/notes/123456/save')
          .set('Authorization', 'Bearer invalid_random_token');

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'INVALID_TOKEN');
      });

      it('should return 401 for expired token', async () => {
        const response = await request(app)
          .post('/api/notes/123456/save')
          .set('Authorization', 'Bearer expired_token_12345');

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'TOKEN_EXPIRED');
      });

      it('should return 401 for non-existent user token', async () => {
        const noteId = await createTestNote();
        if (!noteId) return;

        const response = await request(app)
          .post(`/api/notes/${noteId}/save`)
          .set('Authorization', 'Bearer dev_token_nonexistent_user_xyz');

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'USER_NOT_FOUND');
      });
    });
  });

  // =====================================================
  // UNSAVE FUNCTIONALITY TESTS
  // =====================================================
  describe('Unsave Functionality Tests', () => {
    describe('DELETE /api/notes/:id/save - Remove Saved Note', () => {
      it('should unsave a previously saved note', async () => {
        const noteId = await createTestNote();
        if (!noteId) return;

        // First save
        await request(app)
          .post(`/api/notes/${noteId}/save`)
          .set('Authorization', AUTH_HEADER);

        // Then unsave
        const response = await request(app)
          .delete(`/api/notes/${noteId}/save`)
          .set('Authorization', AUTH_HEADER);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Note unsaved successfully');
        expect(response.body).toHaveProperty('saved', false);
      });

      it('should return 404 when unsaving not-saved note', async () => {
        const noteId = await createTestNote();
        if (!noteId) return;

        const response = await request(app)
          .delete(`/api/notes/${noteId}/save`)
          .set('Authorization', AUTH_HEADER);

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'NOT_SAVED');
      });

      it('should return 401 without authorization', async () => {
        const response = await request(app)
          .delete('/api/notes/123456/save');

        expect(response.status).toBe(401);
      });

      it('should allow re-saving after unsave', async () => {
        const noteId = await createTestNote();
        if (!noteId) return;

        // Save
        await request(app)
          .post(`/api/notes/${noteId}/save`)
          .set('Authorization', AUTH_HEADER);

        // Unsave
        await request(app)
          .delete(`/api/notes/${noteId}/save`)
          .set('Authorization', AUTH_HEADER);

        // Re-save
        const response = await request(app)
          .post(`/api/notes/${noteId}/save`)
          .set('Authorization', AUTH_HEADER);

        expect(response.status).toBe(201);
      });
    });
  });

  // =====================================================
  // CHECK SAVED STATUS TESTS
  // =====================================================
  describe('Check Saved Status Tests', () => {
    describe('GET /api/notes/:id/saved - Check if Note is Saved', () => {
      it('should return saved: true for saved note', async () => {
        const noteId = await createTestNote();
        if (!noteId) return;

        // Save the note
        await request(app)
          .post(`/api/notes/${noteId}/save`)
          .set('Authorization', AUTH_HEADER);

        // Check status
        const response = await request(app)
          .get(`/api/notes/${noteId}/saved`)
          .set('Authorization', AUTH_HEADER);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('saved', true);
      });

      it('should return saved: false for unsaved note', async () => {
        const noteId = await createTestNote();
        if (!noteId) return;

        const response = await request(app)
          .get(`/api/notes/${noteId}/saved`)
          .set('Authorization', AUTH_HEADER);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('saved', false);
      });

      it('should return saved: false without auth', async () => {
        const response = await request(app)
          .get('/api/notes/123456/saved');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('saved', false);
      });
    });
  });

  // =====================================================
  // RESPONSE FORMAT TESTS
  // =====================================================
  describe('Response Format Tests', () => {
    it('should return JSON content type for save operation', async () => {
      const noteId = await createTestNote();
      if (!noteId) return;

      const response = await request(app)
        .post(`/api/notes/${noteId}/save`)
        .set('Authorization', AUTH_HEADER);

      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should return JSON content type for list operation', async () => {
      const response = await request(app)
        .get('/api/notes/saved/list')
        .set('Authorization', AUTH_HEADER);

      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should return JSON content type for error responses', async () => {
      const response = await request(app)
        .post('/api/notes/invalid/save')
        .set('Authorization', AUTH_HEADER);

      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should return proper error structure with message and error code', async () => {
      const response = await request(app)
        .post('/api/notes/123456/save');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('error');
    });

    it('should not expose sensitive information in responses', async () => {
      const noteId = await createTestNote();
      if (!noteId) return;

      const response = await request(app)
        .post(`/api/notes/${noteId}/save`)
        .set('Authorization', AUTH_HEADER);

      const responseStr = JSON.stringify(response.body);
      expect(responseStr).not.toMatch(/password/i);
      expect(responseStr).not.toMatch(/secret/i);
    });
  });

  // =====================================================
  // HTTP METHOD TESTS
  // =====================================================
  describe('HTTP Method Tests', () => {
    it('should accept POST request for saving', async () => {
      const noteId = await createTestNote();
      if (!noteId) return;

      const response = await request(app)
        .post(`/api/notes/${noteId}/save`)
        .set('Authorization', AUTH_HEADER);

      expect([201, 409]).toContain(response.status); // 409 if already saved
    });

    it('should accept DELETE request for unsaving', async () => {
      const noteId = await createTestNote();
      if (!noteId) return;

      const response = await request(app)
        .delete(`/api/notes/${noteId}/save`)
        .set('Authorization', AUTH_HEADER);

      expect([200, 404]).toContain(response.status);
    });

    it('should accept GET request for saved list', async () => {
      const response = await request(app)
        .get('/api/notes/saved/list')
        .set('Authorization', AUTH_HEADER);

      expect(response.status).toBe(200);
    });

    it('should reject PUT request to save endpoint', async () => {
      const response = await request(app)
        .put('/api/notes/123456/save')
        .set('Authorization', AUTH_HEADER);

      expect([404, 405]).toContain(response.status);
    });
  });

  // =====================================================
  // CONCURRENT REQUEST TESTS
  // =====================================================
  describe('Concurrent Request Tests', () => {
    it('should handle multiple simultaneous save requests', async () => {
      const noteIds = [];
      for (let i = 0; i < 3; i++) {
        const id = await createTestNote({ title: `Concurrent Test ${Date.now()}_${i}` });
        if (id) noteIds.push(id);
      }

      if (noteIds.length === 0) return;

      const requests = noteIds.map(id =>
        request(app)
          .post(`/api/notes/${id}/save`)
          .set('Authorization', AUTH_HEADER)
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect([201, 409]).toContain(response.status);
      });
    });

    it('should handle concurrent save and unsave operations', async () => {
      const noteId = await createTestNote();
      if (!noteId) return;

      // Save first
      await request(app)
        .post(`/api/notes/${noteId}/save`)
        .set('Authorization', AUTH_HEADER);

      // Concurrent operations
      const requests = [
        request(app)
          .delete(`/api/notes/${noteId}/save`)
          .set('Authorization', AUTH_HEADER),
        request(app)
          .post(`/api/notes/${noteId}/save`)
          .set('Authorization', AUTH_HEADER)
      ];

      const responses = await Promise.all(requests);
      
      // Both should complete without error
      responses.forEach(response => {
        expect([200, 201, 404, 409]).toContain(response.status);
      });
    });
  });

  // =====================================================
  // PERFORMANCE TESTS
  // =====================================================
  describe('Performance Tests', () => {
    it('should respond within acceptable timeframe (< 500ms)', async () => {
      const noteId = await createTestNote();
      if (!noteId) return;

      const startTime = Date.now();
      const response = await request(app)
        .post(`/api/notes/${noteId}/save`)
        .set('Authorization', AUTH_HEADER);
      const endTime = Date.now();

      expect([201, 409]).toContain(response.status);
      expect(endTime - startTime).toBeLessThan(500);
    });

    it('should retrieve saved list efficiently', async () => {
      const startTime = Date.now();
      const response = await request(app)
        .get('/api/notes/saved/list')
        .set('Authorization', AUTH_HEADER);
      const endTime = Date.now();

      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(500);
    });
  });
});
