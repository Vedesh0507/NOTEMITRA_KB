/**
 * NoteMitra Login API Tests
 * Tests for /api/auth/login endpoint matching TestSprite test cases
 */

const request = require('supertest');
const { app } = require('../server-enhanced');

// Valid test user credentials (from test setup)
const VALID_USER = {
  email: 'test@example.com',
  password: 'hashedpassword'
};

// Suspended user credentials
const SUSPENDED_USER = {
  email: 'suspended@example.com',
  password: 'hashedpassword'
};

// User with special characters in password
const SPECIAL_CHAR_USER = {
  email: 'special@example.com',
  password: 'P@$$w0rd!#%&*'
};

describe('Login API', () => {
  // =====================================================
  // BASIC FUNCTIONAL TESTS
  // =====================================================
  describe('Basic Functional Tests', () => {
    
    // Test 1: Successful Login with Valid Credentials
    describe('POST /api/auth/login - Successful Login with Valid Credentials', () => {
      it('should return 200 and token when valid email and password are provided', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send(VALID_USER);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Login successful');
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
      });

      it('should return user object with required fields', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send(VALID_USER);

        expect(response.status).toBe(200);
        expect(response.body.user).toHaveProperty('id');
        expect(response.body.user).toHaveProperty('name');
        expect(response.body.user).toHaveProperty('email');
        expect(response.body.user).toHaveProperty('role');
      });

      it('should return token that starts with dev_token_', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send(VALID_USER);

        expect(response.status).toBe(200);
        expect(response.body.token).toMatch(/^dev_token_/);
      });

      it('should handle case-insensitive email', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'TEST@EXAMPLE.COM',
            password: VALID_USER.password
          });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Login successful');
      });
    });

    // Test 2: Login with Invalid Email
    describe('POST /api/auth/login - Login with Invalid Email', () => {
      it('should return 401 for non-existent email', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'nonexistent@example.com',
            password: 'anypassword'
          });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message');
      });

      it('should return appropriate error message for invalid email', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'wrong@email.com',
            password: VALID_USER.password
          });

        expect(response.status).toBe(401);
        expect(response.body.message).toMatch(/invalid|credentials|not found/i);
      });
    });

    // Test 3: Login with Invalid Password
    describe('POST /api/auth/login - Login with Invalid Password', () => {
      it('should return 401 for incorrect password', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: VALID_USER.email,
            password: 'wrongpassword'
          });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message');
      });

      it('should return error message for password mismatch', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: VALID_USER.email,
            password: 'incorrectpassword123'
          });

        expect(response.status).toBe(401);
        expect(response.body.message).toMatch(/invalid|credentials|password/i);
      });
    });

    // Test 4: Login with Empty Fields
    describe('POST /api/auth/login - Login with Empty Fields', () => {
      it('should return 400 when email is empty', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: '',
            password: VALID_USER.password
          });

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/email|required|empty/i);
      });

      it('should return 400 when password is empty', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: VALID_USER.email,
            password: ''
          });

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/password|required|empty/i);
      });

      it('should return 400 when both fields are empty', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: '',
            password: ''
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message');
      });

      it('should return 400 when email is missing', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            password: VALID_USER.password
          });

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/email|required/i);
      });

      it('should return 400 when password is missing', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: VALID_USER.email
          });

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/password|required/i);
      });

      it('should return 400 when body is empty', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({});

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message');
      });
    });

    // Test 5: Login with Email in Incorrect Format
    describe('POST /api/auth/login - Login with Email in Incorrect Format', () => {
      it('should return 400 for email without @ symbol', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'invalidemail.com',
            password: VALID_USER.password
          });

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/invalid|email|format/i);
      });

      it('should return 400 for email without domain', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'invalid@',
            password: VALID_USER.password
          });

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/invalid|email|format/i);
      });

      it('should return 400 for email without username', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: '@example.com',
            password: VALID_USER.password
          });

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/invalid|email|format/i);
      });

      it('should return 400 for email with spaces', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test @example.com',
            password: VALID_USER.password
          });

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/invalid|email|format/i);
      });

      it('should return 400 for plain text instead of email', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'notanemail',
            password: VALID_USER.password
          });

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/invalid|email|format/i);
      });
    });
  });

  // =====================================================
  // EDGE CASE TESTS
  // =====================================================
  describe('Edge Case Tests', () => {
    
    // Test 1: Login with Extremely Long Email
    describe('POST /api/auth/login - Login with Extremely Long Email', () => {
      it('should handle extremely long email (500+ characters)', async () => {
        const longEmail = 'a'.repeat(500) + '@example.com';
        
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: longEmail,
            password: VALID_USER.password
          });

        // Should return error (400 or 401)
        expect([400, 401]).toContain(response.status);
        expect(response.body).toHaveProperty('message');
      });

      it('should handle moderately long email (100 characters)', async () => {
        const longEmail = 'a'.repeat(80) + '@example.com';
        
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: longEmail,
            password: VALID_USER.password
          });

        // Should return 401 (user not found) since it's a valid format but non-existent
        expect(response.status).toBe(401);
      });
    });

    // Test 2: Login with SQL Injection Attempt
    describe('POST /api/auth/login - Login with SQL Injection Attempt', () => {
      it('should prevent SQL injection in email field', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: "admin'--",
            password: VALID_USER.password
          });

        // Should return 400 (invalid format) or 401 (not found), not 200
        expect([400, 401]).toContain(response.status);
        expect(response.body.message).not.toMatch(/sql|error|syntax/i);
      });

      it('should prevent SQL injection with OR clause', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: "test@example.com' OR '1'='1",
            password: VALID_USER.password
          });

        expect([400, 401]).toContain(response.status);
      });

      it('should prevent SQL injection in password field', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: VALID_USER.email,
            password: "' OR '1'='1"
          });

        // Should return 401 (wrong password), not success
        expect(response.status).toBe(401);
      });

      it('should prevent UNION-based SQL injection', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: "test@example.com' UNION SELECT * FROM users--",
            password: VALID_USER.password
          });

        expect([400, 401]).toContain(response.status);
      });

      it('should prevent DROP TABLE injection attempt', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: "test@example.com'; DROP TABLE users;--",
            password: VALID_USER.password
          });

        expect([400, 401]).toContain(response.status);
      });
    });

    // Test 3: Login with Special Characters in Credentials
    describe('POST /api/auth/login - Login with Special Characters in Credentials', () => {
      it('should handle special characters in password', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send(SPECIAL_CHAR_USER);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Login successful');
      });

      it('should handle unicode characters in email local part', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'tëst@example.com',
            password: VALID_USER.password
          });

        // Should handle gracefully (400 or 401)
        expect([400, 401]).toContain(response.status);
      });

      it('should handle HTML tags in email', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: '<script>alert("xss")</script>@example.com',
            password: VALID_USER.password
          });

        expect([400, 401]).toContain(response.status);
      });

      it('should handle special characters in password without breaking', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: VALID_USER.email,
            password: '!@#$%^&*()_+-=[]{}|;:,.<>?'
          });

        // Should return 401 (wrong password), not crash
        expect(response.status).toBe(401);
      });

      it('should handle emoji in email', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test😀@example.com',
            password: VALID_USER.password
          });

        expect([400, 401]).toContain(response.status);
      });
    });

    // Test 4: Login Attempt with Account Locked Status
    describe('POST /api/auth/login - Login Attempt with Account Locked Status', () => {
      it('should return 403 for suspended account', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send(SUSPENDED_USER);

        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toMatch(/suspend|lock|contact/i);
      });

      it('should not return token for suspended account', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send(SUSPENDED_USER);

        expect(response.status).toBe(403);
        expect(response.body).not.toHaveProperty('token');
      });
    });

    // Test 5: Concurrent Login Attempts
    describe('POST /api/auth/login - Concurrent Login Attempts', () => {
      it('should handle multiple simultaneous login requests', async () => {
        const requests = Array(10).fill(null).map(() =>
          request(app)
            .post('/api/auth/login')
            .send(VALID_USER)
        );

        const responses = await Promise.all(requests);

        // All should succeed
        responses.forEach(response => {
          expect(response.status).toBe(200);
          expect(response.body).toHaveProperty('token');
        });
      });

      it('should handle concurrent logins without session conflicts', async () => {
        const requests = Array(5).fill(null).map(() =>
          request(app)
            .post('/api/auth/login')
            .send(VALID_USER)
        );

        const responses = await Promise.all(requests);

        // Verify each response is valid
        responses.forEach(response => {
          expect(response.status).toBe(200);
          expect(response.body.user.email).toBe(VALID_USER.email);
        });
      });

      it('should handle mixed valid and invalid concurrent requests', async () => {
        const validRequest = request(app)
          .post('/api/auth/login')
          .send(VALID_USER);
        
        const invalidRequest = request(app)
          .post('/api/auth/login')
          .send({ email: 'wrong@email.com', password: 'wrong' });

        const [validResponse, invalidResponse] = await Promise.all([
          validRequest,
          invalidRequest
        ]);

        expect(validResponse.status).toBe(200);
        expect(invalidResponse.status).toBe(401);
      });
    });
  });

  // =====================================================
  // RESPONSE FORMAT TESTS
  // =====================================================
  describe('Response Format Tests', () => {
    it('should return JSON content type', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send(VALID_USER);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('should return valid JSON structure on success', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send(VALID_USER);

      expect(response.status).toBe(200);
      expect(typeof response.body).toBe('object');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
    });

    it('should return valid JSON structure on error', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'wrong@email.com', password: 'wrong' });

      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(typeof response.body).toBe('object');
      expect(response.body).toHaveProperty('message');
    });

    it('should not expose sensitive information in user object', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send(VALID_USER);

      expect(response.status).toBe(200);
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.user).not.toHaveProperty('_id');
    });
  });

  // =====================================================
  // ERROR HANDLING TESTS
  // =====================================================
  describe('Error Handling Tests', () => {
    it('should reject GET request to login endpoint', async () => {
      const response = await request(app)
        .get('/api/auth/login');

      expect([404, 405]).toContain(response.status);
    });

    it('should reject PUT request to login endpoint', async () => {
      const response = await request(app)
        .put('/api/auth/login')
        .send(VALID_USER);

      expect([404, 405]).toContain(response.status);
    });

    it('should reject DELETE request to login endpoint', async () => {
      const response = await request(app)
        .delete('/api/auth/login');

      expect([404, 405]).toContain(response.status);
    });

    it('should handle invalid JSON body gracefully', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{"invalid json}');

      expect([400, 500]).toContain(response.status);
    });

    it('should handle non-JSON content type', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'text/plain')
        .send('email=test@example.com&password=test');

      expect([400, 415]).toContain(response.status);
    });
  });

  // =====================================================
  // ADDITIONAL SECURITY TESTS
  // =====================================================
  describe('Security Tests', () => {
    it('should not reveal if email exists in error message for wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: VALID_USER.email,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      // Message should be generic, not revealing that email exists
      expect(response.body.message).toMatch(/invalid|credentials/i);
    });

    it('should rate limit or handle rapid repeated login attempts', async () => {
      // Send 20 rapid requests
      const requests = Array(20).fill(null).map(() =>
        request(app)
          .post('/api/auth/login')
          .send(VALID_USER)
      );

      const responses = await Promise.all(requests);

      // All should either succeed or be rate limited (429)
      responses.forEach(response => {
        expect([200, 429]).toContain(response.status);
      });
    });

    it('should handle email with leading/trailing whitespace', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: '  test@example.com  ',
          password: VALID_USER.password
        });

      // Email validation rejects spaces - this is valid security behavior
      // Either 400 (invalid format due to spaces) or 200 if trimmed
      expect([200, 400]).toContain(response.status);
    });
  });
});
