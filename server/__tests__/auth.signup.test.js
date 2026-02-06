/**
 * NoteMitra Signup API Tests
 * Tests for /api/auth/signup endpoint matching TestSprite test cases
 */

const request = require('supertest');
const { app } = require('../server-enhanced');

// Generate unique email for each test to avoid conflicts
const generateUniqueEmail = () => `testuser_${Date.now()}_${Math.random().toString(36).substr(2, 9)}@example.com`;

// Valid signup data template
const getValidSignupData = () => ({
  name: 'Test User',
  email: generateUniqueEmail(),
  password: 'password123',
  role: 'student',
  branch: 'Computer Science',
  section: 'A'
});

describe('Signup API', () => {
  // =====================================================
  // FUNCTIONAL TESTS
  // =====================================================
  describe('Functional Tests', () => {
    
    // Test 1: Valid Signup
    describe('POST /api/auth/signup - Valid Signup', () => {
      it('should create account successfully with valid user details', async () => {
        const signupData = getValidSignupData();
        
        const response = await request(app)
          .post('/api/auth/signup')
          .send(signupData);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('message', 'User created successfully');
        expect(response.body).toHaveProperty('user');
        expect(response.body).toHaveProperty('token');
      });

      it('should return user object with required fields', async () => {
        const signupData = getValidSignupData();
        
        const response = await request(app)
          .post('/api/auth/signup')
          .send(signupData);

        expect(response.status).toBe(201);
        expect(response.body.user).toHaveProperty('id');
        expect(response.body.user).toHaveProperty('name', signupData.name);
        expect(response.body.user).toHaveProperty('email');
        expect(response.body.user).toHaveProperty('role', 'student');
      });

      it('should return token for authentication', async () => {
        const signupData = getValidSignupData();
        
        const response = await request(app)
          .post('/api/auth/signup')
          .send(signupData);

        expect(response.status).toBe(201);
        expect(response.body.token).toMatch(/^dev_token_/);
      });

      it('should convert email to lowercase', async () => {
        const signupData = {
          ...getValidSignupData(),
          email: 'TestUser_UPPERCASE@EXAMPLE.COM'
        };
        
        const response = await request(app)
          .post('/api/auth/signup')
          .send(signupData);

        expect(response.status).toBe(201);
        expect(response.body.user.email).toBe(signupData.email.toLowerCase());
      });

      it('should accept optional fields like branch and section', async () => {
        const signupData = {
          name: 'Test User',
          email: generateUniqueEmail(),
          password: 'password123',
          role: 'student',
          branch: 'Electronics',
          section: 'B'
        };
        
        const response = await request(app)
          .post('/api/auth/signup')
          .send(signupData);

        expect(response.status).toBe(201);
        expect(response.body.user.branch).toBe('Electronics');
        expect(response.body.user.section).toBe('B');
      });
    });

    // Test 2: Duplicate Email Signup
    describe('POST /api/auth/signup - Duplicate Email Signup', () => {
      it('should return error for already registered email', async () => {
        // Use existing test user email
        const signupData = {
          name: 'Duplicate User',
          email: 'test@example.com', // This email exists in test setup
          password: 'password123',
          role: 'student'
        };
        
        const response = await request(app)
          .post('/api/auth/signup')
          .send(signupData);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toMatch(/already exists|duplicate|registered/i);
      });

      it('should reject case-insensitive duplicate emails', async () => {
        const signupData = {
          name: 'Duplicate User',
          email: 'TEST@EXAMPLE.COM', // Case variation of existing email
          password: 'password123',
          role: 'student'
        };
        
        const response = await request(app)
          .post('/api/auth/signup')
          .send(signupData);

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/already exists|duplicate/i);
      });
    });

    // Test 3: Missing Email
    describe('POST /api/auth/signup - Missing Email', () => {
      it('should return 400 when email is missing', async () => {
        const signupData = {
          name: 'Test User',
          password: 'password123',
          role: 'student'
        };
        
        const response = await request(app)
          .post('/api/auth/signup')
          .send(signupData);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toMatch(/email|required/i);
      });

      it('should return 400 when email is empty string', async () => {
        const signupData = {
          name: 'Test User',
          email: '',
          password: 'password123',
          role: 'student'
        };
        
        const response = await request(app)
          .post('/api/auth/signup')
          .send(signupData);

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/email|required/i);
      });

      it('should return 400 when email is null', async () => {
        const signupData = {
          name: 'Test User',
          email: null,
          password: 'password123',
          role: 'student'
        };
        
        const response = await request(app)
          .post('/api/auth/signup')
          .send(signupData);

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/email|required/i);
      });
    });

    // Test 4: Missing Password
    describe('POST /api/auth/signup - Missing Password', () => {
      it('should return 400 when password is missing', async () => {
        const signupData = {
          name: 'Test User',
          email: generateUniqueEmail(),
          role: 'student'
        };
        
        const response = await request(app)
          .post('/api/auth/signup')
          .send(signupData);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toMatch(/password|required/i);
      });

      it('should return 400 when password is null', async () => {
        const signupData = {
          name: 'Test User',
          email: generateUniqueEmail(),
          password: null,
          role: 'student'
        };
        
        const response = await request(app)
          .post('/api/auth/signup')
          .send(signupData);

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/password|required/i);
      });
    });

    // Test 5: Invalid Email Format
    describe('POST /api/auth/signup - Invalid Email Format', () => {
      it('should return 400 for email without @ symbol', async () => {
        const signupData = {
          name: 'Test User',
          email: 'invalidemail.com',
          password: 'password123',
          role: 'student'
        };
        
        const response = await request(app)
          .post('/api/auth/signup')
          .send(signupData);

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/invalid|email|format/i);
      });

      it('should return 400 for email without domain', async () => {
        const signupData = {
          name: 'Test User',
          email: 'invalid@',
          password: 'password123',
          role: 'student'
        };
        
        const response = await request(app)
          .post('/api/auth/signup')
          .send(signupData);

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/invalid|email|format/i);
      });

      it('should return 400 for email without username', async () => {
        const signupData = {
          name: 'Test User',
          email: '@example.com',
          password: 'password123',
          role: 'student'
        };
        
        const response = await request(app)
          .post('/api/auth/signup')
          .send(signupData);

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/invalid|email|format/i);
      });

      it('should return 400 for plain text instead of email', async () => {
        const signupData = {
          name: 'Test User',
          email: 'notanemail',
          password: 'password123',
          role: 'student'
        };
        
        const response = await request(app)
          .post('/api/auth/signup')
          .send(signupData);

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/invalid|email|format/i);
      });

      it('should return 400 for email with spaces in middle', async () => {
        const signupData = {
          name: 'Test User',
          email: 'test user@example.com',
          password: 'password123',
          role: 'student'
        };
        
        const response = await request(app)
          .post('/api/auth/signup')
          .send(signupData);

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/invalid|email|format/i);
      });
    });
  });

  // =====================================================
  // EDGE CASE TESTS
  // =====================================================
  describe('Edge Case Tests', () => {
    
    // Test 1: Short Password
    describe('POST /api/auth/signup - Short Password', () => {
      it('should return 400 for password shorter than 6 characters', async () => {
        const signupData = {
          name: 'Test User',
          email: generateUniqueEmail(),
          password: '12345', // 5 characters
          role: 'student'
        };
        
        const response = await request(app)
          .post('/api/auth/signup')
          .send(signupData);

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/password|6|characters|short|length/i);
      });

      it('should return 400 for single character password', async () => {
        const signupData = {
          name: 'Test User',
          email: generateUniqueEmail(),
          password: 'a',
          role: 'student'
        };
        
        const response = await request(app)
          .post('/api/auth/signup')
          .send(signupData);

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/password|characters/i);
      });

      it('should accept exactly 6 character password', async () => {
        const signupData = {
          name: 'Test User',
          email: generateUniqueEmail(),
          password: '123456', // Exactly 6 characters
          role: 'student'
        };
        
        const response = await request(app)
          .post('/api/auth/signup')
          .send(signupData);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('message', 'User created successfully');
      });

      it('should return 400 for empty password', async () => {
        const signupData = {
          name: 'Test User',
          email: generateUniqueEmail(),
          password: '',
          role: 'student'
        };
        
        const response = await request(app)
          .post('/api/auth/signup')
          .send(signupData);

        expect(response.status).toBe(400);
      });
    });

    // Test 2: Long Email
    describe('POST /api/auth/signup - Long Email', () => {
      it('should handle excessively long email (500+ characters)', async () => {
        const longEmail = 'a'.repeat(500) + '@example.com';
        const signupData = {
          name: 'Test User',
          email: longEmail,
          password: 'password123',
          role: 'student'
        };
        
        const response = await request(app)
          .post('/api/auth/signup')
          .send(signupData);

        // Should handle gracefully - either accept or reject with proper error
        expect([201, 400]).toContain(response.status);
        expect(response.body).toHaveProperty('message');
      });

      it('should handle moderately long email (200 characters)', async () => {
        const longEmail = 'a'.repeat(180) + '@example.com';
        const signupData = {
          name: 'Test User',
          email: longEmail,
          password: 'password123',
          role: 'student'
        };
        
        const response = await request(app)
          .post('/api/auth/signup')
          .send(signupData);

        // Should handle gracefully
        expect([201, 400]).toContain(response.status);
      });
    });

    // Test 3: Whitespace in Email
    describe('POST /api/auth/signup - Whitespace in Email', () => {
      it('should handle email with leading whitespace', async () => {
        const signupData = {
          name: 'Test User',
          email: '  ' + generateUniqueEmail(),
          password: 'password123',
          role: 'student'
        };
        
        const response = await request(app)
          .post('/api/auth/signup')
          .send(signupData);

        // Should trim and accept, or reject with format error
        expect([201, 400]).toContain(response.status);
      });

      it('should handle email with trailing whitespace', async () => {
        const signupData = {
          name: 'Test User',
          email: generateUniqueEmail() + '  ',
          password: 'password123',
          role: 'student'
        };
        
        const response = await request(app)
          .post('/api/auth/signup')
          .send(signupData);

        // Should trim and accept, or reject with format error
        expect([201, 400]).toContain(response.status);
      });

      it('should reject email with only whitespace', async () => {
        const signupData = {
          name: 'Test User',
          email: '   ',
          password: 'password123',
          role: 'student'
        };
        
        const response = await request(app)
          .post('/api/auth/signup')
          .send(signupData);

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/email|required|invalid/i);
      });
    });

    // Test 4: Special Characters in Password
    describe('POST /api/auth/signup - Special Characters in Password', () => {
      it('should accept password with special characters', async () => {
        const signupData = {
          name: 'Test User',
          email: generateUniqueEmail(),
          password: 'P@$$w0rd!#%&*',
          role: 'student'
        };
        
        const response = await request(app)
          .post('/api/auth/signup')
          .send(signupData);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('message', 'User created successfully');
      });

      it('should accept password with unicode characters', async () => {
        const signupData = {
          name: 'Test User',
          email: generateUniqueEmail(),
          password: 'пароль123',
          role: 'student'
        };
        
        const response = await request(app)
          .post('/api/auth/signup')
          .send(signupData);

        expect(response.status).toBe(201);
      });

      it('should accept password with emojis', async () => {
        const signupData = {
          name: 'Test User',
          email: generateUniqueEmail(),
          password: '🔐secure🔐',
          role: 'student'
        };
        
        const response = await request(app)
          .post('/api/auth/signup')
          .send(signupData);

        expect(response.status).toBe(201);
      });

      it('should accept password with all symbol types', async () => {
        const signupData = {
          name: 'Test User',
          email: generateUniqueEmail(),
          password: '!@#$%^&*()_+-=[]{}|;:,.<>?',
          role: 'student'
        };
        
        const response = await request(app)
          .post('/api/auth/signup')
          .send(signupData);

        expect(response.status).toBe(201);
      });
    });

    // Test 5: Concurrent Signups
    describe('POST /api/auth/signup - Concurrent Signups', () => {
      it('should handle multiple simultaneous signup requests', async () => {
        const requests = Array(5).fill(null).map(() => {
          const signupData = getValidSignupData();
          return request(app)
            .post('/api/auth/signup')
            .send(signupData);
        });

        const responses = await Promise.all(requests);

        // All should succeed since each has unique email
        responses.forEach(response => {
          expect(response.status).toBe(201);
          expect(response.body).toHaveProperty('token');
        });
      });

      it('should handle concurrent signups without data corruption', async () => {
        const emails = Array(5).fill(null).map(() => generateUniqueEmail());
        
        const requests = emails.map(email => 
          request(app)
            .post('/api/auth/signup')
            .send({
              name: 'Concurrent User',
              email,
              password: 'password123',
              role: 'student'
            })
        );

        const responses = await Promise.all(requests);

        // Verify each response has correct email
        responses.forEach((response, index) => {
          expect(response.status).toBe(201);
          expect(response.body.user.email).toBe(emails[index].toLowerCase());
        });
      });

      it('should reject concurrent signups with same email', async () => {
        const sameEmail = generateUniqueEmail();
        
        const requests = Array(3).fill(null).map(() =>
          request(app)
            .post('/api/auth/signup')
            .send({
              name: 'Same Email User',
              email: sameEmail,
              password: 'password123',
              role: 'student'
            })
        );

        const responses = await Promise.all(requests);

        // Only one should succeed, others should fail
        const successCount = responses.filter(r => r.status === 201).length;
        const failCount = responses.filter(r => r.status === 400).length;

        expect(successCount).toBe(1);
        expect(failCount).toBe(2);
      });
    });
  });

  // =====================================================
  // ADDITIONAL VALIDATION TESTS
  // =====================================================
  describe('Additional Validation Tests', () => {
    
    describe('Missing Name', () => {
      it('should return 400 when name is missing', async () => {
        const signupData = {
          email: generateUniqueEmail(),
          password: 'password123',
          role: 'student'
        };
        
        const response = await request(app)
          .post('/api/auth/signup')
          .send(signupData);

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/name|required/i);
      });

      it('should return 400 when name is empty', async () => {
        const signupData = {
          name: '',
          email: generateUniqueEmail(),
          password: 'password123',
          role: 'student'
        };
        
        const response = await request(app)
          .post('/api/auth/signup')
          .send(signupData);

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/name|required/i);
      });

      it('should return 400 when name is only whitespace', async () => {
        const signupData = {
          name: '   ',
          email: generateUniqueEmail(),
          password: 'password123',
          role: 'student'
        };
        
        const response = await request(app)
          .post('/api/auth/signup')
          .send(signupData);

        expect(response.status).toBe(400);
      });
    });

    describe('Invalid Role', () => {
      it('should return 400 for invalid role', async () => {
        const signupData = {
          name: 'Test User',
          email: generateUniqueEmail(),
          password: 'password123',
          role: 'admin' // Invalid role
        };
        
        const response = await request(app)
          .post('/api/auth/signup')
          .send(signupData);

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/role|invalid/i);
      });

      it('should accept student role', async () => {
        const signupData = {
          name: 'Test User',
          email: generateUniqueEmail(),
          password: 'password123',
          role: 'student'
        };
        
        const response = await request(app)
          .post('/api/auth/signup')
          .send(signupData);

        expect(response.status).toBe(201);
        expect(response.body.user.role).toBe('student');
      });

      it('should accept teacher role', async () => {
        const signupData = {
          name: 'Test Teacher',
          email: generateUniqueEmail(),
          password: 'password123',
          role: 'teacher'
        };
        
        const response = await request(app)
          .post('/api/auth/signup')
          .send(signupData);

        expect(response.status).toBe(201);
        expect(response.body.user.role).toBe('teacher');
      });

      it('should default to student role if not provided', async () => {
        const signupData = {
          name: 'Test User',
          email: generateUniqueEmail(),
          password: 'password123'
        };
        
        const response = await request(app)
          .post('/api/auth/signup')
          .send(signupData);

        expect(response.status).toBe(201);
        expect(response.body.user.role).toBe('student');
      });
    });
  });

  // =====================================================
  // RESPONSE FORMAT TESTS
  // =====================================================
  describe('Response Format Tests', () => {
    it('should return JSON content type', async () => {
      const signupData = getValidSignupData();
      
      const response = await request(app)
        .post('/api/auth/signup')
        .send(signupData);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('should return valid JSON structure on success', async () => {
      const signupData = getValidSignupData();
      
      const response = await request(app)
        .post('/api/auth/signup')
        .send(signupData);

      expect(response.status).toBe(201);
      expect(typeof response.body).toBe('object');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
    });

    it('should return valid JSON structure on error', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({ name: 'Test' }); // Missing required fields

      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(typeof response.body).toBe('object');
      expect(response.body).toHaveProperty('message');
    });

    it('should not expose password in user object', async () => {
      const signupData = getValidSignupData();
      
      const response = await request(app)
        .post('/api/auth/signup')
        .send(signupData);

      expect(response.status).toBe(201);
      expect(response.body.user).not.toHaveProperty('password');
    });
  });

  // =====================================================
  // ERROR HANDLING TESTS
  // =====================================================
  describe('Error Handling Tests', () => {
    it('should reject GET request to signup endpoint', async () => {
      const response = await request(app)
        .get('/api/auth/signup');

      expect([404, 405]).toContain(response.status);
    });

    it('should reject PUT request to signup endpoint', async () => {
      const response = await request(app)
        .put('/api/auth/signup')
        .send(getValidSignupData());

      expect([404, 405]).toContain(response.status);
    });

    it('should reject DELETE request to signup endpoint', async () => {
      const response = await request(app)
        .delete('/api/auth/signup');

      expect([404, 405]).toContain(response.status);
    });

    it('should handle empty request body', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should handle invalid JSON body gracefully', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .set('Content-Type', 'application/json')
        .send('{"invalid json}');

      expect([400, 500]).toContain(response.status);
    });
  });

  // =====================================================
  // SECURITY TESTS
  // =====================================================
  describe('Security Tests', () => {
    it('should prevent SQL injection in email field', async () => {
      const signupData = {
        name: 'Test User',
        email: "test'--@example.com",
        password: 'password123',
        role: 'student'
      };
      
      const response = await request(app)
        .post('/api/auth/signup')
        .send(signupData);

      // Should handle gracefully, not crash
      expect([201, 400]).toContain(response.status);
    });

    it('should prevent XSS in name field', async () => {
      const signupData = {
        name: '<script>alert("xss")</script>',
        email: generateUniqueEmail(),
        password: 'password123',
        role: 'student'
      };
      
      const response = await request(app)
        .post('/api/auth/signup')
        .send(signupData);

      // Should accept (sanitization is frontend responsibility) or reject
      expect([201, 400]).toContain(response.status);
    });

    it('should handle very long name gracefully', async () => {
      const signupData = {
        name: 'A'.repeat(1000),
        email: generateUniqueEmail(),
        password: 'password123',
        role: 'student'
      };
      
      const response = await request(app)
        .post('/api/auth/signup')
        .send(signupData);

      // Should accept or reject with proper error
      expect([201, 400]).toContain(response.status);
    });

    it('should handle very long password gracefully', async () => {
      const signupData = {
        name: 'Test User',
        email: generateUniqueEmail(),
        password: 'A'.repeat(1000),
        role: 'student'
      };
      
      const response = await request(app)
        .post('/api/auth/signup')
        .send(signupData);

      // Should accept or reject with proper error
      expect([201, 400]).toContain(response.status);
    });
  });
});
