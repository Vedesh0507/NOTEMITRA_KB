/**
 * NoteMitra Get Current User API Tests
 * Tests for /api/auth/me endpoint matching TestSprite test cases
 */

const request = require('supertest');
const { app } = require('../server-enhanced');

// Test user tokens (matching test users in server-enhanced.js)
const VALID_TOKEN = 'dev_token_testuser123';
const LEADERBOARD_USER_TOKEN = 'dev_token_leaderuser1';

describe('Get Current User API', () => {
  // =====================================================
  // BASIC FUNCTIONAL TESTS
  // =====================================================
  describe('Basic Functional Tests', () => {
    
    // Test 1: Valid User Details Retrieval
    describe('GET /api/auth/me - Valid User Details Retrieval', () => {
      it('should return 200 and correct user details with valid token', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${VALID_TOKEN}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toHaveProperty('id');
        expect(response.body.user).toHaveProperty('name');
        expect(response.body.user).toHaveProperty('email');
      });

      it('should return user details matching the authenticated user', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${VALID_TOKEN}`);

        expect(response.status).toBe(200);
        expect(response.body.user.id).toBe('testuser123');
        expect(response.body.user.email).toBe('test@example.com');
        expect(response.body.user.name).toBe('Test User');
      });

      it('should return user with all expected profile fields', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${VALID_TOKEN}`);

        expect(response.status).toBe(200);
        const user = response.body.user;
        
        // Check all expected fields exist
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('role');
      });

      it('should work with different valid user tokens', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${LEADERBOARD_USER_TOKEN}`);

        expect(response.status).toBe(200);
        expect(response.body.user.id).toBe('leaderuser1');
      });
    });

    // Test 2: Missing Authentication Token
    describe('GET /api/auth/me - Missing Authentication Token', () => {
      it('should return 401 when Authorization header is missing', async () => {
        const response = await request(app)
          .get('/api/auth/me');

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toMatch(/no authorization|auth|token/i);
      });

      it('should return appropriate error code for missing auth', async () => {
        const response = await request(app)
          .get('/api/auth/me');

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('NO_AUTH_HEADER');
      });

      it('should return 401 when Authorization header is empty', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', '');

        expect(response.status).toBe(401);
      });
    });

    // Test 3: Invalid User Credentials (Invalid Token)
    describe('GET /api/auth/me - Invalid User Credentials', () => {
      it('should return 401 for invalid token format', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', 'Bearer invalid_token_format');

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toMatch(/invalid|token/i);
      });

      it('should return 401 for non-existent user in token', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', 'Bearer dev_token_nonexistentuser12345');

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message');
      });

      it('should return 401 for token without Bearer prefix', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', VALID_TOKEN);

        expect(response.status).toBe(401);
        expect(response.body.message).toMatch(/invalid|format|Bearer/i);
      });

      it('should return 401 for Bearer with no token', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', 'Bearer ');

        expect(response.status).toBe(401);
        expect(response.body.message).toMatch(/no.*token|invalid/i);
      });

      it('should return 401 for Bearer with only whitespace', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', 'Bearer    ');

        expect(response.status).toBe(401);
      });
    });

    // Test 4: Valid Response Structure
    describe('GET /api/auth/me - Valid Response Structure', () => {
      it('should return response with expected keys', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${VALID_TOKEN}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('user');
        
        const user = response.body.user;
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('role');
      });

      it('should return response with correct data types', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${VALID_TOKEN}`);

        expect(response.status).toBe(200);
        const user = response.body.user;
        
        expect(typeof user.id).toBe('string');
        expect(typeof user.name).toBe('string');
        expect(typeof user.email).toBe('string');
        expect(typeof user.role).toBe('string');
      });

      it('should return JSON content type', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${VALID_TOKEN}`);

        expect(response.headers['content-type']).toMatch(/application\/json/);
      });

      it('should return valid JSON structure', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${VALID_TOKEN}`);

        expect(typeof response.body).toBe('object');
        expect(response.body).not.toBeNull();
        expect(response.body.user).toBeDefined();
      });

      it('should not expose sensitive fields like password', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${VALID_TOKEN}`);

        expect(response.status).toBe(200);
        expect(response.body.user).not.toHaveProperty('password');
        expect(response.body.user).not.toHaveProperty('passwordHash');
        expect(response.body.user).not.toHaveProperty('resetToken');
        expect(response.body.user).not.toHaveProperty('resetTokenExpiry');
      });
    });

    // Test 5: Response Time for Valid Request
    describe('GET /api/auth/me - Response Time for Valid Request', () => {
      it('should respond within acceptable timeframe (< 500ms)', async () => {
        const startTime = Date.now();
        
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${VALID_TOKEN}`);

        const responseTime = Date.now() - startTime;

        expect(response.status).toBe(200);
        expect(responseTime).toBeLessThan(500);
      });

      it('should respond consistently under repeated requests', async () => {
        const responseTimes = [];

        for (let i = 0; i < 5; i++) {
          const startTime = Date.now();
          
          const response = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${VALID_TOKEN}`);

          responseTimes.push(Date.now() - startTime);
          expect(response.status).toBe(200);
        }

        // Average should be under 300ms
        const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        expect(avgTime).toBeLessThan(300);
      });

      it('should have low variance in response times', async () => {
        const responseTimes = [];

        for (let i = 0; i < 5; i++) {
          const startTime = Date.now();
          
          await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${VALID_TOKEN}`);

          responseTimes.push(Date.now() - startTime);
        }

        const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        const maxDeviation = Math.max(...responseTimes.map(t => Math.abs(t - avgTime)));
        
        // Max deviation should be under 200ms
        expect(maxDeviation).toBeLessThan(200);
      });
    });
  });

  // =====================================================
  // EDGE CASE TESTS
  // =====================================================
  describe('Edge Case Tests', () => {
    
    // Test 1: Handling Expired Token
    describe('GET /api/auth/me - Handling Expired Token', () => {
      it('should return 401 for expired token', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', 'Bearer dev_token_expired_user123');

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toMatch(/expired|invalid/i);
      });

      it('should return appropriate error code for expired token', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', 'Bearer expired_token_testuser');

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('TOKEN_EXPIRED');
      });

      it('should not return user data for expired token', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', 'Bearer dev_token_expired123');

        expect(response.status).toBe(401);
        expect(response.body).not.toHaveProperty('user');
      });

      it('should handle various expired token formats', async () => {
        const expiredTokens = [
          'Bearer expired_dev_token_user',
          'Bearer token_expired_user123',
          'Bearer my_expired_session_token'
        ];

        for (const token of expiredTokens) {
          const response = await request(app)
            .get('/api/auth/me')
            .set('Authorization', token);

          expect(response.status).toBe(401);
        }
      });
    });

    // Test 2: Malformed Token Structure
    describe('GET /api/auth/me - Malformed Token Structure', () => {
      it('should return 401 for token without proper prefix', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', 'Bearer abc123');

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message');
      });

      it('should return 401 for completely malformed token', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', 'Bearer !!!invalid!!!');

        expect(response.status).toBe(401);
      });

      it('should return 401 for token with special characters', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', 'Bearer <script>alert(1)</script>');

        expect(response.status).toBe(401);
      });

      it('should return 401 for token with SQL injection attempt', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', "Bearer ' OR '1'='1");

        expect(response.status).toBe(401);
        expect(response.body.message.toLowerCase()).not.toMatch(/sql|error|database/);
      });

      it('should return 401 for Base64 encoded malformed token', async () => {
        const malformedBase64 = Buffer.from('{"user":"admin","role":"admin"}').toString('base64');
        
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${malformedBase64}`);

        expect(response.status).toBe(401);
      });

      it('should return 401 for token with encoded special characters', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', 'Bearer dev_token_%00test');

        expect(response.status).toBe(401);
      });

      it('should return 401 for empty dev_token_ prefix', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', 'Bearer dev_token_');

        expect(response.status).toBe(401);
        expect(response.body.message).toMatch(/invalid|user/i);
      });
    });

    // Test 3: Minimal User Data Account
    describe('GET /api/auth/me - Minimal User Data Account', () => {
      it('should handle user with minimal data gracefully', async () => {
        // Using a leaderboard user which may have minimal profile data
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${LEADERBOARD_USER_TOKEN}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('user');
        // Core fields should always be present
        expect(response.body.user).toHaveProperty('id');
        expect(response.body.user).toHaveProperty('name');
        expect(response.body.user).toHaveProperty('email');
      });

      it('should return default values for optional fields', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${VALID_TOKEN}`);

        expect(response.status).toBe(200);
        const user = response.body.user;
        
        // Optional fields should have defaults or be undefined
        if (user.reputation !== undefined) {
          expect(typeof user.reputation).toBe('number');
        }
        if (user.uploadsCount !== undefined) {
          expect(typeof user.uploadsCount).toBe('number');
        }
      });

      it('should not crash on user with missing optional fields', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', 'Bearer dev_token_leaderuser2');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('user');
        expect(response.body.user.id).toBeDefined();
      });
    });

    // Test 4: Very Large Token Size
    describe('GET /api/auth/me - Very Large Token Size', () => {
      it('should handle very large token without crashing', async () => {
        const largeToken = 'dev_token_' + 'a'.repeat(10000);
        
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${largeToken}`);

        // Should return 401 (invalid user) but not crash
        expect([401, 400, 413]).toContain(response.status);
        expect(response.body).toHaveProperty('message');
      });

      it('should handle extremely large token (50KB)', async () => {
        const veryLargeToken = 'dev_token_' + 'x'.repeat(50000);
        
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${veryLargeToken}`);

        // Should not crash server - return an error
        expect([400, 401, 413, 431]).toContain(response.status);
      });

      it('should handle large token with special characters', async () => {
        const largeToken = 'dev_token_' + 'test_user_'.repeat(500);
        
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${largeToken}`);

        expect([401, 400]).toContain(response.status);
        expect(response.body).toHaveProperty('message');
      });

      it('should respond within reasonable time for large token', async () => {
        const largeToken = 'dev_token_' + 'a'.repeat(5000);
        
        const startTime = Date.now();
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${largeToken}`);
        const responseTime = Date.now() - startTime;

        expect([401, 400]).toContain(response.status);
        // Should still respond quickly
        expect(responseTime).toBeLessThan(1000);
      });
    });

    // Test 5: Concurrent Access by Multiple Tokens
    describe('GET /api/auth/me - Concurrent Access by Multiple Tokens', () => {
      it('should handle multiple simultaneous requests without issues', async () => {
        const tokens = [
          VALID_TOKEN,
          LEADERBOARD_USER_TOKEN,
          'dev_token_leaderuser2',
          'dev_token_leaderuser3'
        ];

        const requests = tokens.map(token =>
          request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${token}`)
        );

        const responses = await Promise.all(requests);

        // All should succeed
        responses.forEach(response => {
          expect(response.status).toBe(200);
          expect(response.body).toHaveProperty('user');
        });
      });

      it('should return correct user data for each concurrent request', async () => {
        const tokenUserPairs = [
          { token: VALID_TOKEN, expectedId: 'testuser123' },
          { token: LEADERBOARD_USER_TOKEN, expectedId: 'leaderuser1' },
          { token: 'dev_token_leaderuser2', expectedId: 'leaderuser2' }
        ];

        const requests = tokenUserPairs.map(({ token }) =>
          request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${token}`)
        );

        const responses = await Promise.all(requests);

        // Verify each response matches expected user
        responses.forEach((response, index) => {
          expect(response.status).toBe(200);
          expect(response.body.user.id).toBe(tokenUserPairs[index].expectedId);
        });
      });

      it('should handle mixed valid and invalid tokens concurrently', async () => {
        const requests = [
          request(app).get('/api/auth/me').set('Authorization', `Bearer ${VALID_TOKEN}`),
          request(app).get('/api/auth/me').set('Authorization', 'Bearer invalid_token'),
          request(app).get('/api/auth/me').set('Authorization', `Bearer ${LEADERBOARD_USER_TOKEN}`),
          request(app).get('/api/auth/me').set('Authorization', 'Bearer another_invalid')
        ];

        const responses = await Promise.all(requests);

        // First and third should succeed
        expect(responses[0].status).toBe(200);
        expect(responses[2].status).toBe(200);
        
        // Second and fourth should fail
        expect(responses[1].status).toBe(401);
        expect(responses[3].status).toBe(401);
      });

      it('should not have data collisions under concurrent load', async () => {
        // Make 10 concurrent requests
        const requests = Array(10).fill(null).map((_, i) => {
          const token = i % 2 === 0 ? VALID_TOKEN : LEADERBOARD_USER_TOKEN;
          return request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${token}`);
        });

        const responses = await Promise.all(requests);

        // Verify no data mixing occurred
        responses.forEach((response, i) => {
          expect(response.status).toBe(200);
          const expectedId = i % 2 === 0 ? 'testuser123' : 'leaderuser1';
          expect(response.body.user.id).toBe(expectedId);
        });
      });

      it('should maintain consistent response under burst requests', async () => {
        const burstSize = 20;
        const requests = Array(burstSize).fill(null).map(() =>
          request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${VALID_TOKEN}`)
        );

        const responses = await Promise.all(requests);

        // All should succeed with consistent data
        responses.forEach(response => {
          expect(response.status).toBe(200);
          expect(response.body.user.id).toBe('testuser123');
          expect(response.body.user.email).toBe('test@example.com');
        });
      });
    });
  });

  // =====================================================
  // SECURITY TESTS
  // =====================================================
  describe('Security Tests', () => {
    it('should not expose password in response', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${VALID_TOKEN}`);

      expect(response.status).toBe(200);
      expect(JSON.stringify(response.body)).not.toMatch(/password/i);
    });

    it('should not expose internal tokens in response', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${VALID_TOKEN}`);

      expect(response.status).toBe(200);
      expect(JSON.stringify(response.body)).not.toMatch(/resetToken/i);
      expect(JSON.stringify(response.body)).not.toMatch(/refreshToken/i);
    });

    it('should not expose database internals in error responses', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer dev_token_invalid');

      expect(JSON.stringify(response.body).toLowerCase()).not.toMatch(/mongodb|mongoose|collection/);
    });

    it('should handle XSS attempts in token', async () => {
      const xssToken = 'Bearer dev_token_<script>alert(1)</script>';
      
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', xssToken);

      expect(response.status).toBe(401);
      // Response should not reflect the XSS payload
      expect(response.text).not.toContain('<script>');
    });

    it('should handle path traversal attempts', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer dev_token_../../../etc/passwd');

      expect(response.status).toBe(401);
    });
  });

  // =====================================================
  // HTTP METHOD TESTS
  // =====================================================
  describe('HTTP Method Tests', () => {
    it('should reject POST request to /api/auth/me', async () => {
      const response = await request(app)
        .post('/api/auth/me')
        .set('Authorization', `Bearer ${VALID_TOKEN}`)
        .send({});

      expect([404, 405]).toContain(response.status);
    });

    it('should reject PUT request to /api/auth/me', async () => {
      const response = await request(app)
        .put('/api/auth/me')
        .set('Authorization', `Bearer ${VALID_TOKEN}`)
        .send({});

      expect([404, 405]).toContain(response.status);
    });

    it('should reject DELETE request to /api/auth/me', async () => {
      const response = await request(app)
        .delete('/api/auth/me')
        .set('Authorization', `Bearer ${VALID_TOKEN}`);

      expect([404, 405]).toContain(response.status);
    });

    it('should reject PATCH request to /api/auth/me', async () => {
      const response = await request(app)
        .patch('/api/auth/me')
        .set('Authorization', `Bearer ${VALID_TOKEN}`)
        .send({});

      expect([404, 405]).toContain(response.status);
    });
  });

  // =====================================================
  // ERROR RESPONSE FORMAT TESTS
  // =====================================================
  describe('Error Response Format Tests', () => {
    it('should return proper error structure for 401', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.message).toBe('string');
    });

    it('should return JSON for error responses', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('should not expose stack traces in errors', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token');

      expect(JSON.stringify(response.body)).not.toMatch(/at .+\.(js|ts):\d+/i);
      expect(JSON.stringify(response.body)).not.toMatch(/stack|trace/i);
    });
  });
});
