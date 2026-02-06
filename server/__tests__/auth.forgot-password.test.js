/**
 * NoteMitra Forgot Password API Tests
 * Tests for /api/auth/forgot-password endpoint matching TestSprite test cases
 */

const request = require('supertest');
const { app } = require('../server-enhanced');

describe('Forgot Password API', () => {
  // =====================================================
  // BASIC FUNCTIONAL TESTS
  // =====================================================
  describe('Basic Functional Tests', () => {
    
    // Test 1: Valid email request
    describe('POST /api/auth/forgot-password - Valid email request', () => {
      it('should return 200 and success message for valid email address', async () => {
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: 'test@example.com' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message');
        // Security: Should not reveal if account exists
        expect(response.body.message).toMatch(/reset|link|sent|exists/i);
      });

      it('should return appropriate reset password instructions message', async () => {
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: 'test@example.com' });

        expect(response.status).toBe(200);
        expect(response.body.message).toBeDefined();
        expect(typeof response.body.message).toBe('string');
      });

      it('should handle uppercase email correctly (case normalization)', async () => {
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: 'TEST@EXAMPLE.COM' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message');
      });

      it('should handle email with leading/trailing whitespace', async () => {
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: '  test@example.com  ' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message');
      });

      it('should return JSON content type', async () => {
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: 'test@example.com' });

        expect(response.headers['content-type']).toMatch(/application\/json/);
      });
    });

    // Test 2: Invalid email format
    describe('POST /api/auth/forgot-password - Invalid email format', () => {
      it('should handle improperly formatted email gracefully', async () => {
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: 'invalidemail' });

        // Should return 200 for security (no user enumeration) or 400 for validation
        expect([200, 400]).toContain(response.status);
        expect(response.body).toHaveProperty('message');
      });

      it('should handle email without @ symbol', async () => {
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: 'testexample.com' });

        expect([200, 400]).toContain(response.status);
        expect(response.body).toHaveProperty('message');
      });

      it('should handle email without domain', async () => {
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: 'test@' });

        expect([200, 400]).toContain(response.status);
        expect(response.body).toHaveProperty('message');
      });

      it('should handle email without username', async () => {
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: '@example.com' });

        expect([200, 400]).toContain(response.status);
        expect(response.body).toHaveProperty('message');
      });

      it('should handle email with multiple @ symbols', async () => {
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: 'test@@example.com' });

        expect([200, 400]).toContain(response.status);
        expect(response.body).toHaveProperty('message');
      });
    });

    // Test 3: Non-existing email address
    describe('POST /api/auth/forgot-password - Non-existing email address', () => {
      it('should not reveal if email exists in database (security)', async () => {
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: 'nonexistent12345@example.com' });

        // Security: Should return same response as valid email
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message');
        // Should NOT say "user not found" or similar
        expect(response.body.message.toLowerCase()).not.toMatch(/not found|doesn't exist|no account|invalid user/);
      });

      it('should return success response even for unregistered email', async () => {
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: 'definitely.not.registered@fakeemail.com' });

        expect(response.status).toBe(200);
        expect(response.body.message).toMatch(/reset|link|sent|exists/i);
      });

      it('should not enumerate users via different response times', async () => {
        const startExisting = Date.now();
        await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: 'test@example.com' });
        const existingDuration = Date.now() - startExisting;

        const startNonExisting = Date.now();
        await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: 'nonexistent99999@example.com' });
        const nonExistingDuration = Date.now() - startNonExisting;

        // Response times should be reasonably similar (within 500ms)
        // This is a basic check - production should have constant-time comparison
        expect(Math.abs(existingDuration - nonExistingDuration)).toBeLessThan(500);
      });
    });

    // Test 4: Empty email field
    describe('POST /api/auth/forgot-password - Empty email field', () => {
      it('should return 400 when email field is empty string', async () => {
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: '' });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toMatch(/email|required/i);
      });

      it('should return 400 when email field is missing', async () => {
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({});

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/email|required/i);
      });

      it('should return 400 when email is null', async () => {
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: null });

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/email|required/i);
      });

      it('should return 400 when email is undefined', async () => {
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: undefined });

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/email|required/i);
      });

      it('should return 400 when body is completely empty', async () => {
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send();

        expect(response.status).toBe(400);
      });
    });

    // Test 5: Duplicate email request
    describe('POST /api/auth/forgot-password - Duplicate email request', () => {
      it('should handle multiple reset requests for same email', async () => {
        const email = 'test@example.com';

        // First request
        const response1 = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email });

        expect(response1.status).toBe(200);

        // Second request (duplicate)
        const response2 = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email });

        expect(response2.status).toBe(200);
        expect(response2.body).toHaveProperty('message');
      });

      it('should return appropriate message for duplicate request', async () => {
        const email = 'test@example.com';

        await request(app)
          .post('/api/auth/forgot-password')
          .send({ email });

        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email });

        // Should either accept the request or indicate a recent request was made
        expect([200, 429]).toContain(response.status);
        expect(response.body).toHaveProperty('message');
      });

      it('should handle rapid consecutive duplicate requests', async () => {
        const email = 'test@example.com';
        
        const requests = Array(3).fill(null).map(() =>
          request(app)
            .post('/api/auth/forgot-password')
            .send({ email })
        );

        const responses = await Promise.all(requests);

        // All should return valid responses (200 or 429 for rate limiting)
        responses.forEach(response => {
          expect([200, 429]).toContain(response.status);
          expect(response.body).toHaveProperty('message');
        });
      });
    });
  });

  // =====================================================
  // EDGE CASE TESTS
  // =====================================================
  describe('Edge Case Tests', () => {
    
    // Test 1: Email field with special characters
    describe('POST /api/auth/forgot-password - Email with special characters', () => {
      it('should handle email with plus sign (valid email format)', async () => {
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: 'test+tag@example.com' });

        expect([200, 400]).toContain(response.status);
        expect(response.body).toHaveProperty('message');
      });

      it('should handle email with dots in local part', async () => {
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: 'test.user.name@example.com' });

        expect([200, 400]).toContain(response.status);
        expect(response.body).toHaveProperty('message');
      });

      it('should handle email with hyphen in domain', async () => {
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: 'test@my-domain.example.com' });

        expect([200, 400]).toContain(response.status);
        expect(response.body).toHaveProperty('message');
      });

      it('should handle email with underscore in local part', async () => {
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: 'test_user@example.com' });

        expect([200, 400]).toContain(response.status);
        expect(response.body).toHaveProperty('message');
      });

      it('should handle email with numbers', async () => {
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: 'test123@example456.com' });

        expect([200, 400]).toContain(response.status);
        expect(response.body).toHaveProperty('message');
      });

      it('should safely process email with unusual but valid characters', async () => {
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: "test!#$%&'*+-/=?^_`{|}~@example.com" });

        // These are technically valid email characters
        expect([200, 400]).toContain(response.status);
        expect(response.body).toHaveProperty('message');
      });
    });

    // Test 2: SQL injection attempt
    describe('POST /api/auth/forgot-password - SQL injection attempt', () => {
      it("should safely handle SQL injection with OR clause", async () => {
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: "test@example.com' OR '1'='1" });

        // Should not crash or expose data
        expect([200, 400]).toContain(response.status);
        expect(response.body).toHaveProperty('message');
        // Should NOT expose any database error
        expect(response.body.message.toLowerCase()).not.toMatch(/sql|syntax|query|database|error/);
      });

      it("should safely handle SQL injection with DROP TABLE", async () => {
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: "test@example.com'; DROP TABLE users;--" });

        expect([200, 400]).toContain(response.status);
        expect(response.body).toHaveProperty('message');
      });

      it("should safely handle SQL injection with UNION SELECT", async () => {
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: "test@example.com' UNION SELECT * FROM users--" });

        expect([200, 400]).toContain(response.status);
        expect(response.body).toHaveProperty('message');
      });

      it("should safely handle SQL injection with comment syntax", async () => {
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: "admin'--@example.com" });

        expect([200, 400]).toContain(response.status);
        expect(response.body).toHaveProperty('message');
      });

      it("should safely handle SQL injection with semicolon", async () => {
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: "test@example.com; SELECT * FROM users" });

        expect([200, 400]).toContain(response.status);
        expect(response.body).toHaveProperty('message');
      });
    });

    // Test 3: XSS attack simulation
    describe('POST /api/auth/forgot-password - XSS attack simulation', () => {
      it('should sanitize script tags in email input', async () => {
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: '<script>alert("xss")</script>@example.com' });

        expect([200, 400]).toContain(response.status);
        expect(response.body).toHaveProperty('message');
        // Response should not contain unsanitized script
        expect(JSON.stringify(response.body)).not.toMatch(/<script>/i);
      });

      it('should handle event handler injection', async () => {
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: 'test@example.com" onload="alert(1)' });

        expect([200, 400]).toContain(response.status);
        expect(response.body).toHaveProperty('message');
      });

      it('should handle img tag with onerror', async () => {
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: 'test<img src=x onerror=alert(1)>@example.com' });

        expect([200, 400]).toContain(response.status);
        expect(response.body).toHaveProperty('message');
      });

      it('should handle javascript: protocol injection', async () => {
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: 'javascript:alert(1)//test@example.com' });

        expect([200, 400]).toContain(response.status);
        expect(response.body).toHaveProperty('message');
      });

      it('should handle SVG with embedded script', async () => {
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: 'test<svg onload=alert(1)>@example.com' });

        expect([200, 400]).toContain(response.status);
        expect(response.body).toHaveProperty('message');
      });

      it('should handle encoded XSS attempt', async () => {
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: 'test%3Cscript%3Ealert(1)%3C/script%3E@example.com' });

        expect([200, 400]).toContain(response.status);
        expect(response.body).toHaveProperty('message');
      });
    });

    // Test 4: Very long email field
    describe('POST /api/auth/forgot-password - Very long email field', () => {
      it('should handle extremely long email (500+ characters) without crashing', async () => {
        const longEmail = 'a'.repeat(500) + '@example.com';
        
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: longEmail });

        // Should handle gracefully - either process or reject
        expect([200, 400]).toContain(response.status);
        expect(response.body).toHaveProperty('message');
      });

      it('should handle very long email (1000+ characters)', async () => {
        const longEmail = 'a'.repeat(1000) + '@verylongdomain'.repeat(50) + '.com';
        
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: longEmail });

        expect([200, 400]).toContain(response.status);
        expect(response.body).toHaveProperty('message');
      });

      it('should handle email at RFC 5321 max length (254 characters)', async () => {
        // Max email length per RFC 5321 is 254 characters
        const localPart = 'a'.repeat(64); // Max local part is 64 chars
        const domain = 'b'.repeat(185) + '.com'; // Rest for domain
        const maxEmail = `${localPart}@${domain}`;
        
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: maxEmail });

        expect([200, 400]).toContain(response.status);
        expect(response.body).toHaveProperty('message');
      });

      it('should handle moderately long email (200 characters)', async () => {
        const email = 'a'.repeat(180) + '@example.com';
        
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email });

        expect([200, 400]).toContain(response.status);
        expect(response.body).toHaveProperty('message');
      });
    });

    // Test 5: Testing rate limiting
    describe('POST /api/auth/forgot-password - Rate limiting', () => {
      it('should handle multiple rapid requests', async () => {
        const requests = Array(5).fill(null).map(() =>
          request(app)
            .post('/api/auth/forgot-password')
            .send({ email: 'test@example.com' })
        );

        const responses = await Promise.all(requests);

        // Should handle all requests, possibly with rate limiting
        responses.forEach(response => {
          expect([200, 429]).toContain(response.status);
          expect(response.body).toHaveProperty('message');
        });
      });

      it('should handle burst of requests from different emails', async () => {
        const emails = Array(10).fill(null).map((_, i) => 
          `testuser${i}@example.com`
        );
        
        const requests = emails.map(email =>
          request(app)
            .post('/api/auth/forgot-password')
            .send({ email })
        );

        const responses = await Promise.all(requests);

        // All should be handled
        responses.forEach(response => {
          expect([200, 429]).toContain(response.status);
          expect(response.body).toHaveProperty('message');
        });
      });

      it('should respond appropriately under load without server errors', async () => {
        const requests = Array(20).fill(null).map((_, i) =>
          request(app)
            .post('/api/auth/forgot-password')
            .send({ email: `loadtest${i}@example.com` })
        );

        const responses = await Promise.all(requests);

        // Should NOT return 500 errors
        responses.forEach(response => {
          expect(response.status).not.toBe(500);
          expect([200, 400, 429]).toContain(response.status);
        });
      });

      it('should maintain consistent response under sequential requests', async () => {
        for (let i = 0; i < 5; i++) {
          const response = await request(app)
            .post('/api/auth/forgot-password')
            .send({ email: 'test@example.com' });

          // Each request should get a proper response
          expect([200, 429]).toContain(response.status);
          expect(response.body).toHaveProperty('message');
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
        .post('/api/auth/forgot-password')
        .send({ email: 'test@example.com' });

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('should return valid JSON structure', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'test@example.com' });

      expect(typeof response.body).toBe('object');
      expect(response.body).toHaveProperty('message');
    });

    it('should not expose sensitive information in response', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'test@example.com' });

      // Should NOT expose these in response
      expect(response.body).not.toHaveProperty('password');
      expect(response.body).not.toHaveProperty('resetToken');
      expect(response.body).not.toHaveProperty('resetTokenExpiry');
      expect(response.body).not.toHaveProperty('user');
    });

    it('should not expose database details in error response', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: '' });

      expect(response.body.message.toLowerCase()).not.toMatch(/mongodb|mongoose|database|collection/);
    });
  });

  // =====================================================
  // HTTP METHOD TESTS
  // =====================================================
  describe('HTTP Method Tests', () => {
    it('should reject GET request to forgot-password endpoint', async () => {
      const response = await request(app)
        .get('/api/auth/forgot-password');

      expect([404, 405]).toContain(response.status);
    });

    it('should reject PUT request to forgot-password endpoint', async () => {
      const response = await request(app)
        .put('/api/auth/forgot-password')
        .send({ email: 'test@example.com' });

      expect([404, 405]).toContain(response.status);
    });

    it('should reject DELETE request to forgot-password endpoint', async () => {
      const response = await request(app)
        .delete('/api/auth/forgot-password');

      expect([404, 405]).toContain(response.status);
    });

    it('should reject PATCH request to forgot-password endpoint', async () => {
      const response = await request(app)
        .patch('/api/auth/forgot-password')
        .send({ email: 'test@example.com' });

      expect([404, 405]).toContain(response.status);
    });
  });

  // =====================================================
  // SECURITY TESTS
  // =====================================================
  describe('Security Tests', () => {
    it('should not enumerate users via response content', async () => {
      // Test with existing user
      const existingResponse = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'test@example.com' });

      // Test with non-existing user
      const nonExistingResponse = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'definitelynotexisting99999@example.com' });

      // Both should have same status code
      expect(existingResponse.status).toBe(nonExistingResponse.status);
      
      // Both should have similar message structure
      expect(existingResponse.body).toHaveProperty('message');
      expect(nonExistingResponse.body).toHaveProperty('message');
    });

    it('should handle null byte injection', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'test\x00@example.com' });

      expect([200, 400]).toContain(response.status);
      expect(response.body).toHaveProperty('message');
    });

    it('should handle CRLF injection attempt', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'test@example.com\r\nBcc:attacker@evil.com' });

      expect([200, 400]).toContain(response.status);
      expect(response.body).toHaveProperty('message');
    });

    it('should handle template injection attempt', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: '{{constructor.constructor("return this")()}}@example.com' });

      expect([200, 400]).toContain(response.status);
      expect(response.body).toHaveProperty('message');
    });

    it('should not expose stack traces on error', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: '' });

      expect(JSON.stringify(response.body)).not.toMatch(/at .+\.(js|ts):\d+/i);
      expect(JSON.stringify(response.body)).not.toMatch(/stack|trace|Error/);
    });

    it('should handle unicode homograph attack', async () => {
      // Using Cyrillic characters that look like Latin
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'tеst@еxample.com' }); // е is Cyrillic, not Latin e

      expect([200, 400]).toContain(response.status);
      expect(response.body).toHaveProperty('message');
    });
  });

  // =====================================================
  // ERROR HANDLING TESTS
  // =====================================================
  describe('Error Handling Tests', () => {
    it('should handle invalid JSON body gracefully', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .set('Content-Type', 'application/json')
        .send('{"email": "invalid json}');

      expect([400, 500]).toContain(response.status);
    });

    it('should return 400 for non-string email value (number)', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 12345 });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/email|required/i);
    });

    it('should return 400 for array as email value', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: ['test@example.com'] });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/email|required/i);
    });

    it('should return 400 for object as email value', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: { address: 'test@example.com' } });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/email|required/i);
    });

    it('should return 400 for boolean as email value', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: true });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/email|required/i);
    });
  });
});
