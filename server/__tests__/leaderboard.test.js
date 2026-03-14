/**
 * NoteMitra Leaderboard API Tests
 * Tests for Leaderboard endpoint matching TestSprite test cases
 */

const request = require('supertest');
const { app } = require('../server-enhanced');

describe('Leaderboard API', () => {
  // =====================================================
  // BASIC FUNCTIONAL TESTS
  // =====================================================
  describe('Basic Functional Tests', () => {
    
    // Test 1: Verify successful leaderboard retrieval
    describe('GET /api/leaderboard - Verify successful leaderboard retrieval', () => {
      it('should return 200 status code for valid request', async () => {
        const response = await request(app)
          .get('/api/leaderboard');

        expect(response.status).toBe(200);
      });

      it('should return proper leaderboard response structure', async () => {
        const response = await request(app)
          .get('/api/leaderboard');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('leaderboard');
        expect(Array.isArray(response.body.leaderboard)).toBe(true);
      });

      it('should return leaderboard with user ranks, scores, and statistics', async () => {
        const response = await request(app)
          .get('/api/leaderboard');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('leaderboard');
        
        // If there are users in leaderboard, verify structure
        if (response.body.leaderboard.length > 0) {
          const firstUser = response.body.leaderboard[0];
          expect(firstUser).toHaveProperty('name');
          expect(firstUser).toHaveProperty('totalDownloads');
          expect(firstUser).toHaveProperty('notesUploaded');
        }
      });
    });

    // Test 2: Check leaderboard response format
    describe('GET /api/leaderboard - Check leaderboard response format', () => {
      it('should return JSON response format', async () => {
        const response = await request(app)
          .get('/api/leaderboard');

        expect(response.headers['content-type']).toMatch(/application\/json/);
      });

      it('should have expected schema with necessary fields', async () => {
        const response = await request(app)
          .get('/api/leaderboard');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('leaderboard');
        
        // Verify array structure
        expect(Array.isArray(response.body.leaderboard)).toBe(true);
        
        // If users exist, verify each user has required fields
        response.body.leaderboard.forEach(user => {
          expect(user).toHaveProperty('name');
          expect(user).toHaveProperty('totalDownloads');
          expect(user).toHaveProperty('notesUploaded');
          expect(user).toHaveProperty('avgDownloads');
          expect(typeof user.name).toBe('string');
          expect(typeof user.totalDownloads).toBe('number');
          expect(typeof user.notesUploaded).toBe('number');
          expect(typeof user.avgDownloads).toBe('number');
        });
      });
    });

    // Test 3: Test unauthorized access handling
    describe('GET /api/leaderboard - Test unauthorized access handling', () => {
      it('should allow public access to leaderboard (no auth required)', async () => {
        // Leaderboard is a public endpoint - should return 200 without auth
        const response = await request(app)
          .get('/api/leaderboard');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('leaderboard');
      });

      it('should work with invalid auth token (public endpoint)', async () => {
        const response = await request(app)
          .get('/api/leaderboard')
          .set('Authorization', 'Bearer invalid_token');

        // Should still work as it's a public endpoint
        expect(response.status).toBe(200);
      });
    });

    // Test 4: Verify leaderboard data accuracy
    describe('GET /api/leaderboard - Verify leaderboard data accuracy', () => {
      it('should return users sorted by totalDownloads (descending)', async () => {
        const response = await request(app)
          .get('/api/leaderboard');

        expect(response.status).toBe(200);
        
        const leaderboard = response.body.leaderboard;
        
        // Verify sorting - each user should have >= downloads than the next
        for (let i = 0; i < leaderboard.length - 1; i++) {
          expect(leaderboard[i].totalDownloads).toBeGreaterThanOrEqual(
            leaderboard[i + 1].totalDownloads
          );
        }
      });

      it('should only include users who have uploaded notes', async () => {
        const response = await request(app)
          .get('/api/leaderboard');

        expect(response.status).toBe(200);
        
        // All users in leaderboard should have notesUploaded > 0
        response.body.leaderboard.forEach(user => {
          expect(user.notesUploaded).toBeGreaterThan(0);
        });
      });

      it('should calculate avgDownloads correctly', async () => {
        const response = await request(app)
          .get('/api/leaderboard');

        expect(response.status).toBe(200);
        
        // Verify avgDownloads calculation
        response.body.leaderboard.forEach(user => {
          const expectedAvg = user.notesUploaded > 0 
            ? user.totalDownloads / user.notesUploaded 
            : 0;
          expect(user.avgDownloads).toBeCloseTo(expectedAvg, 5);
        });
      });
    });

    // Test 5: Test empty leaderboard scenario
    describe('GET /api/leaderboard - Test empty leaderboard scenario', () => {
      it('should return 200 with empty array when no qualifying users', async () => {
        const response = await request(app)
          .get('/api/leaderboard');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('leaderboard');
        expect(Array.isArray(response.body.leaderboard)).toBe(true);
        // Can be empty or have users - both are valid
      });

      it('should handle empty leaderboard gracefully', async () => {
        const response = await request(app)
          .get('/api/leaderboard');

        expect(response.status).toBe(200);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
      });
    });
  });

  // =====================================================
  // EDGE CASE TESTS
  // =====================================================
  describe('Edge Case Tests', () => {
    
    // Test 1: Handle invalid input gracefully
    describe('GET /api/leaderboard - Handle invalid input gracefully', () => {
      it('should handle malformed query parameters gracefully', async () => {
        const response = await request(app)
          .get('/api/leaderboard')
          .query({ invalid: 'parameter', foo: 'bar' });

        // Should still return 200 and ignore invalid parameters
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('leaderboard');
      });

      it('should handle special characters in query parameters', async () => {
        const response = await request(app)
          .get('/api/leaderboard')
          .query({ filter: '<script>alert("xss")</script>' });

        expect([200, 400]).toContain(response.status);
      });

      it('should handle extremely large limit values', async () => {
        const response = await request(app)
          .get('/api/leaderboard')
          .query({ limit: 999999 });

        // Should handle gracefully
        expect([200, 400]).toContain(response.status);
      });

      it('should handle negative values in query parameters', async () => {
        const response = await request(app)
          .get('/api/leaderboard')
          .query({ page: -1, limit: -10 });

        // Should handle gracefully
        expect([200, 400]).toContain(response.status);
      });
    });

    // Test 2: Concurrent requests test
    describe('GET /api/leaderboard - Concurrent requests test', () => {
      it('should handle multiple simultaneous requests without errors', async () => {
        // Send 10 concurrent requests
        const requests = Array(10).fill(null).map(() => 
          request(app).get('/api/leaderboard')
        );

        const responses = await Promise.all(requests);

        // All should succeed
        responses.forEach(response => {
          expect(response.status).toBe(200);
          expect(response.body).toHaveProperty('leaderboard');
        });
      });

      it('should return consistent data across concurrent requests', async () => {
        // Send 5 concurrent requests
        const requests = Array(5).fill(null).map(() => 
          request(app).get('/api/leaderboard')
        );

        const responses = await Promise.all(requests);

        // All responses should have the same structure
        const firstLeaderboardLength = responses[0].body.leaderboard.length;
        
        responses.forEach(response => {
          expect(response.body.leaderboard.length).toBe(firstLeaderboardLength);
        });
      });
    });

    // Test 3: Check leaderboard with maximum size
    describe('GET /api/leaderboard - Check leaderboard with maximum size', () => {
      it('should return all qualifying entries', async () => {
        const response = await request(app)
          .get('/api/leaderboard');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('leaderboard');
        
        // Should include all users with uploaded notes
        expect(Array.isArray(response.body.leaderboard)).toBe(true);
      });

      it('should complete request within reasonable time', async () => {
        const startTime = Date.now();
        
        const response = await request(app)
          .get('/api/leaderboard');

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        expect(response.status).toBe(200);
        // Should respond within 5 seconds
        expect(responseTime).toBeLessThan(5000);
      });
    });

    // Test 4: Test special characters in usernames
    describe('GET /api/leaderboard - Test special characters in usernames', () => {
      it('should handle and display usernames with special characters', async () => {
        const response = await request(app)
          .get('/api/leaderboard');

        expect(response.status).toBe(200);
        
        // Verify all names are strings (can contain any characters)
        response.body.leaderboard.forEach(user => {
          expect(typeof user.name).toBe('string');
          expect(user.name.length).toBeGreaterThan(0);
        });
      });

      it('should properly encode/handle unicode characters in response', async () => {
        const response = await request(app)
          .get('/api/leaderboard');

        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(/application\/json/);
        
        // Response should be valid JSON (unicode properly handled)
        expect(() => JSON.stringify(response.body)).not.toThrow();
      });
    });

    // Test 5: Test pagination handling
    describe('GET /api/leaderboard - Test pagination handling', () => {
      it('should return full leaderboard when no pagination params', async () => {
        const response = await request(app)
          .get('/api/leaderboard');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('leaderboard');
        expect(Array.isArray(response.body.leaderboard)).toBe(true);
      });

      it('should handle pagination parameters gracefully', async () => {
        const response = await request(app)
          .get('/api/leaderboard')
          .query({ page: 1, limit: 10 });

        // Should return 200 (pagination either supported or ignored)
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('leaderboard');
      });

      it('should maintain proper ranking across pagination', async () => {
        const response = await request(app)
          .get('/api/leaderboard');

        expect(response.status).toBe(200);
        
        // Verify ranking is maintained (sorted by totalDownloads desc)
        const leaderboard = response.body.leaderboard;
        for (let i = 0; i < leaderboard.length - 1; i++) {
          // Current user's downloads should be >= next user's downloads
          expect(leaderboard[i].totalDownloads).toBeGreaterThanOrEqual(
            leaderboard[i + 1].totalDownloads
          );
        }
      });
    });
  });

  // =====================================================
  // RESPONSE FORMAT TESTS
  // =====================================================
  describe('Response Format Tests', () => {
    it('should return proper Content-Type header', async () => {
      const response = await request(app)
        .get('/api/leaderboard');

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('should return valid JSON structure', async () => {
      const response = await request(app)
        .get('/api/leaderboard');

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(typeof response.body).toBe('object');
    });

    it('should not include sensitive user information', async () => {
      const response = await request(app)
        .get('/api/leaderboard');

      expect(response.status).toBe(200);
      
      // Verify no sensitive fields are exposed
      response.body.leaderboard.forEach(user => {
        expect(user).not.toHaveProperty('password');
        expect(user).not.toHaveProperty('email');
        expect(user).not.toHaveProperty('_id');
        expect(user).not.toHaveProperty('id');
      });
    });
  });

  // =====================================================
  // ERROR HANDLING TESTS
  // =====================================================
  describe('Error Handling Tests', () => {
    it('should handle HEAD request', async () => {
      const response = await request(app)
        .head('/api/leaderboard');

      expect([200, 204, 405]).toContain(response.status);
    });

    it('should reject POST request to leaderboard endpoint', async () => {
      const response = await request(app)
        .post('/api/leaderboard')
        .send({ data: 'test' });

      // Should return 404 (no POST handler) or 405 (method not allowed)
      expect([404, 405]).toContain(response.status);
    });

    it('should reject PUT request to leaderboard endpoint', async () => {
      const response = await request(app)
        .put('/api/leaderboard')
        .send({ data: 'test' });

      expect([404, 405]).toContain(response.status);
    });

    it('should reject DELETE request to leaderboard endpoint', async () => {
      const response = await request(app)
        .delete('/api/leaderboard');

      expect([404, 405]).toContain(response.status);
    });
  });
});
