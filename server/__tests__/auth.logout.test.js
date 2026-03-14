/**
 * Logout API Tests
 * Endpoint: POST /api/auth/logout
 * 
 * Tests cover:
 * - Functional Tests: Successful logout, invalid token, missing token, correct response codes, consistency
 * - Edge Cases: Malformed tokens, already logged out, simultaneous requests, inactive account, expired session
 */

const request = require('supertest');
const { app } = require('../server-enhanced');

describe('Logout API', () => {
  // Test user tokens
  const validToken = 'dev_token_testuser123';
  const validToken2 = 'dev_token_leaderuser1';
  const expiredToken = 'dev_token_expired_testuser123';
  const suspendedUserToken = 'dev_token_suspendeduser';
  const invalidToken = 'invalid_token_12345';
  const nonExistentUserToken = 'dev_token_nonexistent999';

  describe('Functional Tests', () => {
    describe('POST /api/auth/logout - Successful Logout', () => {
      it('should return 200 and success message when logging out with valid token', async () => {
        const response = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Logged out successfully');
        expect(response.body).toHaveProperty('success', true);
      });

      it('should return success for different valid user tokens', async () => {
        const response = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${validToken2}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Logged out successfully');
      });

      it('should not contain any errors in successful logout response', async () => {
        const response = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body).not.toHaveProperty('error');
      });

      it('should return JSON content type on successful logout', async () => {
        const response = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${validToken}`);

        expect(response.headers['content-type']).toMatch(/application\/json/);
      });
    });

    describe('POST /api/auth/logout - Invalid Token Logout', () => {
      it('should return 401 for invalid token format', async () => {
        const response = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${invalidToken}`);

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'INVALID_TOKEN');
      });

      it('should return appropriate error message for invalid token', async () => {
        const response = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${invalidToken}`);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('Invalid');
      });

      it('should return 401 for non-existent user token', async () => {
        const response = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${nonExistentUserToken}`);

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'USER_NOT_FOUND');
      });

      it('should return 401 for token without Bearer prefix', async () => {
        const response = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', validToken);

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'INVALID_AUTH_FORMAT');
      });

      it('should return 401 for random string as token', async () => {
        const response = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', 'Bearer randomstring12345');

        expect(response.status).toBe(401);
      });
    });

    describe('POST /api/auth/logout - Missing Token Logout (401)', () => {
      it('should return 401 when Authorization header is missing', async () => {
        const response = await request(app)
          .post('/api/auth/logout');

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'NO_AUTH_HEADER');
      });

      it('should return correct error message indicating authorization is required', async () => {
        const response = await request(app)
          .post('/api/auth/logout');

        expect(response.body).toHaveProperty('message');
        expect(response.body.message.toLowerCase()).toContain('authorization');
      });

      it('should return 401 when Authorization header is empty', async () => {
        const response = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', '');

        expect(response.status).toBe(401);
      });

      it('should return 401 for Bearer with no token', async () => {
        const response = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', 'Bearer ');

        expect(response.status).toBe(401);
        // Empty string after Bearer is treated as invalid auth format
        expect(['MISSING_TOKEN', 'INVALID_AUTH_FORMAT']).toContain(response.body.error);
      });

      it('should return 401 for Bearer with only whitespace', async () => {
        const response = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', 'Bearer    ');

        expect(response.status).toBe(401);
      });
    });

    describe('POST /api/auth/logout - Correct Response Code on Logout', () => {
      it('should return exactly 200 status code for successful logout', async () => {
        const response = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${validToken}`);

        expect(response.status).toBe(200);
      });

      it('should return 401 (not 403 or 500) for missing auth', async () => {
        const response = await request(app)
          .post('/api/auth/logout');

        expect(response.status).toBe(401);
        expect(response.status).not.toBe(403);
        expect(response.status).not.toBe(500);
      });

      it('should return 401 for invalid tokens consistently', async () => {
        const invalidTokens = [
          'bad_token',
          'Bearer ',
          'xyz123',
          'notavalidtoken'
        ];

        for (const token of invalidTokens) {
          const response = await request(app)
            .post('/api/auth/logout')
            .set('Authorization', `Bearer ${token}`);

          expect(response.status).toBe(401);
        }
      });

      it('should ensure consistent API behavior with proper status codes', async () => {
        // Valid logout = 200
        const validResponse = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${validToken}`);
        expect(validResponse.status).toBe(200);

        // Invalid token = 401
        const invalidResponse = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${invalidToken}`);
        expect(invalidResponse.status).toBe(401);

        // Missing token = 401
        const missingResponse = await request(app)
          .post('/api/auth/logout');
        expect(missingResponse.status).toBe(401);
      });
    });

    describe('POST /api/auth/logout - Logout Consistency', () => {
      it('should produce consistent responses on multiple logout attempts', async () => {
        const responses = [];
        
        for (let i = 0; i < 5; i++) {
          const response = await request(app)
            .post('/api/auth/logout')
            .set('Authorization', `Bearer ${validToken}`);
          responses.push(response);
        }

        // All responses should have same status
        responses.forEach(response => {
          expect(response.status).toBe(200);
          expect(response.body.message).toBe('Logged out successfully');
        });
      });

      it('should not generate errors after first successful logout', async () => {
        // First logout
        const firstResponse = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${validToken}`);
        expect(firstResponse.status).toBe(200);

        // Second logout (same token)
        const secondResponse = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${validToken}`);
        expect(secondResponse.status).toBe(200);

        // Third logout (same token)
        const thirdResponse = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${validToken}`);
        expect(thirdResponse.status).toBe(200);
      });

      it('should maintain consistent response structure across requests', async () => {
        const response1 = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${validToken}`);

        const response2 = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${validToken2}`);

        expect(Object.keys(response1.body).sort())
          .toEqual(Object.keys(response2.body).sort());
      });

      it('should respond within acceptable timeframe consistently', async () => {
        const times = [];
        
        for (let i = 0; i < 3; i++) {
          const startTime = Date.now();
          await request(app)
            .post('/api/auth/logout')
            .set('Authorization', `Bearer ${validToken}`);
          times.push(Date.now() - startTime);
        }

        // All responses should be under 500ms
        times.forEach(time => {
          expect(time).toBeLessThan(500);
        });
      });
    });
  });

  describe('Edge Cases', () => {
    describe('POST /api/auth/logout - Logout with Malformed Token', () => {
      it('should handle malformed token format gracefully', async () => {
        const response = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', 'Bearer malformed_token_!@#$%');

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message');
      });

      it('should handle token with special characters', async () => {
        const response = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', 'Bearer token<script>alert(1)</script>');

        expect(response.status).toBe(401);
      });

      it('should handle extremely long malformed token', async () => {
        const longToken = 'A'.repeat(10000);
        const response = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${longToken}`);

        expect(response.status).toBe(401);
      });

      it('should handle token with URL-encoded special characters', async () => {
        const response = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', 'Bearer %E2%80%99token%00test');

        expect(response.status).toBe(401);
      });

      it('should handle Base64-like malformed token', async () => {
        const base64Token = Buffer.from('{"userId":"admin"}').toString('base64');
        const response = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${base64Token}`);

        expect(response.status).toBe(401);
      });

      it('should handle JSON injection in token', async () => {
        const response = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', 'Bearer {"admin":true}');

        expect(response.status).toBe(401);
      });

      it('should handle SQL injection attempt in token', async () => {
        const response = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', "Bearer '; DROP TABLE users; --");

        expect(response.status).toBe(401);
      });
    });

    describe('POST /api/auth/logout - User Already Logged Out', () => {
      it('should handle logout gracefully when user is already logged out', async () => {
        // First logout
        const firstLogout = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${validToken}`);
        expect(firstLogout.status).toBe(200);

        // Second logout (already logged out)
        const secondLogout = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${validToken}`);
        
        // Should still return 200 (idempotent) or appropriate message
        expect([200, 401]).toContain(secondLogout.status);
      });

      it('should return suitable message for re-logout attempts', async () => {
        await request(app)
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${validToken}`);

        const response = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${validToken}`);

        expect(response.body).toHaveProperty('message');
      });

      it('should handle multiple sequential logouts without crashing', async () => {
        for (let i = 0; i < 10; i++) {
          const response = await request(app)
            .post('/api/auth/logout')
            .set('Authorization', `Bearer ${validToken}`);
          
          // Should not throw server error
          expect(response.status).not.toBe(500);
        }
      });

      it('should maintain data integrity after multiple logout attempts', async () => {
        // Multiple logouts
        await request(app)
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${validToken}`);
        await request(app)
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${validToken}`);

        // User should still be able to access protected resources with valid token
        // (since our tokens don't actually get invalidated in this simple implementation)
        const meResponse = await request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${validToken}`);

        // Should still work for this stateless implementation
        expect(meResponse.status).toBe(200);
      });
    });

    describe('POST /api/auth/logout - Simultaneous Logout Requests', () => {
      it('should handle multiple simultaneous logout requests without errors', async () => {
        const requests = Array(5).fill(null).map(() =>
          request(app)
            .post('/api/auth/logout')
            .set('Authorization', `Bearer ${validToken}`)
        );

        const responses = await Promise.all(requests);

        // All should succeed or fail gracefully (no 500s)
        responses.forEach(response => {
          expect(response.status).not.toBe(500);
          expect([200, 401]).toContain(response.status);
        });
      });

      it('should maintain request integrity under concurrent load', async () => {
        const requests = Array(10).fill(null).map(() =>
          request(app)
            .post('/api/auth/logout')
            .set('Authorization', `Bearer ${validToken}`)
        );

        const responses = await Promise.all(requests);
        
        // At least some should succeed
        const successCount = responses.filter(r => r.status === 200).length;
        expect(successCount).toBeGreaterThan(0);
      });

      it('should handle simultaneous logouts from different users', async () => {
        const requests = [
          request(app)
            .post('/api/auth/logout')
            .set('Authorization', `Bearer ${validToken}`),
          request(app)
            .post('/api/auth/logout')
            .set('Authorization', `Bearer ${validToken2}`)
        ];

        const responses = await Promise.all(requests);

        // Both should succeed
        expect(responses[0].status).toBe(200);
        expect(responses[1].status).toBe(200);
      });

      it('should handle mixed valid and invalid concurrent logout requests', async () => {
        const requests = [
          request(app)
            .post('/api/auth/logout')
            .set('Authorization', `Bearer ${validToken}`),
          request(app)
            .post('/api/auth/logout')
            .set('Authorization', `Bearer ${invalidToken}`),
          request(app)
            .post('/api/auth/logout')
            .set('Authorization', `Bearer ${validToken2}`)
        ];

        const responses = await Promise.all(requests);

        expect(responses[0].status).toBe(200); // Valid
        expect(responses[1].status).toBe(401); // Invalid
        expect(responses[2].status).toBe(200); // Valid
      });

      it('should not cause data corruption under burst of requests', async () => {
        const requests = Array(20).fill(null).map((_, i) =>
          request(app)
            .post('/api/auth/logout')
            .set('Authorization', `Bearer ${i % 2 === 0 ? validToken : validToken2}`)
        );

        const responses = await Promise.all(requests);

        // All should have valid JSON responses
        responses.forEach(response => {
          expect(response.body).toBeDefined();
          expect(typeof response.body.message).toBe('string');
        });
      });
    });

    describe('POST /api/auth/logout - Logout with Inactive Account', () => {
      it('should return 403 for inactive/suspended account', async () => {
        const response = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${suspendedUserToken}`);

        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty('error', 'ACCOUNT_INACTIVE');
      });

      it('should return appropriate error message for inactive account', async () => {
        const response = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${suspendedUserToken}`);

        expect(response.body.message).toContain('inactive');
      });

      it('should not allow logout action for suspended users', async () => {
        const response = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${suspendedUserToken}`);

        expect(response.status).toBe(403);
        expect(response.body.success).not.toBe(true);
      });
    });

    describe('POST /api/auth/logout - Logout with Expired Session Token', () => {
      it('should return 401 for expired session token', async () => {
        const response = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${expiredToken}`);

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'SESSION_EXPIRED');
      });

      it('should return correct error message indicating session has expired', async () => {
        const response = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${expiredToken}`);

        expect(response.body.message.toLowerCase()).toContain('expired');
      });

      it('should handle various expired token formats', async () => {
        const expiredTokens = [
          'Bearer dev_token_expired_user1',
          'Bearer expired_dev_token_user1',
          'Bearer dev_token_testexpired',
          'Bearer dev_token_session_expired'
        ];

        for (const expiredAuth of expiredTokens) {
          const response = await request(app)
            .post('/api/auth/logout')
            .set('Authorization', expiredAuth);

          expect(response.status).toBe(401);
        }
      });

      it('should not perform logout for expired sessions', async () => {
        const response = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${expiredToken}`);

        expect(response.body.success).not.toBe(true);
      });
    });
  });

  describe('Security Tests', () => {
    it('should not expose sensitive information in error responses', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(JSON.stringify(response.body)).not.toContain('password');
      expect(JSON.stringify(response.body)).not.toContain('secret');
      expect(response.body).not.toHaveProperty('stack');
    });

    it('should not expose user data in logout response', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.body).not.toHaveProperty('user');
      expect(response.body).not.toHaveProperty('email');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should handle XSS attempts in Authorization header', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer <script>alert("xss")</script>');

      expect(response.status).toBe(401);
      expect(response.body.message).not.toContain('<script>');
    });

    it('should handle path traversal attempts', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer ../../../etc/passwd');

      expect(response.status).toBe(401);
    });

    it('should not leak internal errors', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer null');

      expect(response.status).not.toBe(500);
      expect(response.body).not.toHaveProperty('stack');
    });
  });

  describe('HTTP Method Tests', () => {
    it('should reject GET request to /api/auth/logout', async () => {
      const response = await request(app)
        .get('/api/auth/logout')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(404);
    });

    it('should reject PUT request to /api/auth/logout', async () => {
      const response = await request(app)
        .put('/api/auth/logout')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(404);
    });

    it('should reject DELETE request to /api/auth/logout', async () => {
      const response = await request(app)
        .delete('/api/auth/logout')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(404);
    });

    it('should reject PATCH request to /api/auth/logout', async () => {
      const response = await request(app)
        .patch('/api/auth/logout')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('Response Format Tests', () => {
    it('should return proper success structure', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('success', true);
    });

    it('should return proper error structure for 401', async () => {
      const response = await request(app)
        .post('/api/auth/logout');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('error');
    });

    it('should return JSON for all responses', async () => {
      const validResponse = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${validToken}`);

      const invalidResponse = await request(app)
        .post('/api/auth/logout');

      expect(validResponse.headers['content-type']).toMatch(/application\/json/);
      expect(invalidResponse.headers['content-type']).toMatch(/application\/json/);
    });

    it('should not expose stack traces in errors', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(response.body).not.toHaveProperty('stack');
      expect(JSON.stringify(response.body)).not.toContain('at ');
    });
  });
});
