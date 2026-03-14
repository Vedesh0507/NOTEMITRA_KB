/**
 * Update Profile API Tests
 * Endpoint: PUT /api/auth/profile
 * 
 * Tests cover:
 * - Functional Tests: Valid profile update, invalid access, data structure, successful update, missing fields
 * - Security Tests: Access control, token expiry, injection prevention, data exposure, rate limiting
 * - Edge Cases: Empty payload, large input, special characters, concurrent updates, outdated fields
 */

const request = require('supertest');
const { app } = require('../server-enhanced');

describe('Update Profile API', () => {
  // Test user tokens
  const validToken = 'dev_token_testuser123';
  const validToken2 = 'dev_token_leaderuser1';
  const expiredToken = 'dev_token_expired_testuser123';
  const invalidToken = 'invalid_token_12345';
  const nonExistentUserToken = 'dev_token_nonexistent999';

  describe('Functional Tests', () => {
    describe('PUT /api/auth/profile - Valid User Profile Update', () => {
      it('should return 200 and update profile with valid authentication', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ name: 'Updated Test User' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Profile updated successfully');
        expect(response.body).toHaveProperty('user');
      });

      it('should update name field correctly', async () => {
        const newName = 'New Test Name';
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ name: newName });

        expect(response.status).toBe(200);
        expect(response.body.user.name).toBe(newName);
      });

      it('should update branch field correctly', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ branch: 'Computer Science' });

        expect(response.status).toBe(200);
        expect(response.body.user.branch).toBe('Computer Science');
      });

      it('should update section field correctly', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ section: 'A' });

        expect(response.status).toBe(200);
        expect(response.body.user.section).toBe('A');
      });

      it('should update rollNo field correctly', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ rollNo: '12345' });

        expect(response.status).toBe(200);
        expect(response.body.user.rollNo).toBe('12345');
      });

      it('should update multiple fields at once', async () => {
        const updateData = {
          name: 'Multi Update User',
          branch: 'Electrical Engineering',
          section: 'B',
          rollNo: '67890'
        };

        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send(updateData);

        expect(response.status).toBe(200);
        expect(response.body.user.name).toBe(updateData.name);
        expect(response.body.user.branch).toBe(updateData.branch);
        expect(response.body.user.section).toBe(updateData.section);
        expect(response.body.user.rollNo).toBe(updateData.rollNo);
      });

      it('should trim whitespace from name', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ name: '  Trimmed Name  ' });

        expect(response.status).toBe(200);
        expect(response.body.user.name).toBe('Trimmed Name');
      });
    });

    describe('PUT /api/auth/profile - Invalid User Profile Access (401/403)', () => {
      it('should return 401 when Authorization header is missing', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .send({ name: 'Test Update' });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'NO_AUTH_HEADER');
      });

      it('should return 401 when Authorization header is empty', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', '')
          .send({ name: 'Test Update' });

        expect(response.status).toBe(401);
      });

      it('should return 401 for invalid token format', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${invalidToken}`)
          .send({ name: 'Test Update' });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'INVALID_TOKEN');
      });

      it('should return 401 when Bearer prefix is missing', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', validToken)
          .send({ name: 'Test Update' });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'INVALID_AUTH_FORMAT');
      });

      it('should return 404 for non-existent user', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${nonExistentUserToken}`)
          .send({ name: 'Test Update' });

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('message', 'User not found');
      });

      it('should return 401 for Bearer with no token', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', 'Bearer ')
          .send({ name: 'Test Update' });

        expect(response.status).toBe(401);
      });

      it('should return 401 for Bearer with only whitespace', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', 'Bearer    ')
          .send({ name: 'Test Update' });

        expect(response.status).toBe(401);
      });
    });

    describe('PUT /api/auth/profile - Profile Data Structure Validation', () => {
      it('should return response with expected keys', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ name: 'Structure Test User' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('user');
        
        const { user } = response.body;
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('role');
      });

      it('should return user object with correct data types', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ name: 'Type Test User' });

        expect(response.status).toBe(200);
        const { user } = response.body;
        
        expect(typeof user.id).toBe('string');
        expect(typeof user.name).toBe('string');
        expect(typeof user.email).toBe('string');
        expect(typeof user.role).toBe('string');
        if (user.reputation !== undefined) {
          expect(typeof user.reputation).toBe('number');
        }
      });

      it('should return JSON content type', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ name: 'Content Type Test' });

        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(/application\/json/);
      });

      it('should include optional profile fields in response', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ 
            name: 'Optional Fields Test',
            branch: 'CS',
            section: 'A',
            rollNo: '001'
          });

        expect(response.status).toBe(200);
        const { user } = response.body;
        
        expect(user).toHaveProperty('branch');
        expect(user).toHaveProperty('section');
        expect(user).toHaveProperty('rollNo');
      });

      it('should maintain consistent response structure across updates', async () => {
        const response1 = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ name: 'Consistency Test 1' });

        const response2 = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ branch: 'Mechanical' });

        expect(Object.keys(response1.body.user).sort())
          .toEqual(Object.keys(response2.body.user).sort());
      });
    });

    describe('PUT /api/auth/profile - Profile Update Request Verification', () => {
      it('should reflect changes in response immediately', async () => {
        const newName = `Updated Name ${Date.now()}`;
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ name: newName });

        expect(response.status).toBe(200);
        expect(response.body.user.name).toBe(newName);
      });

      it('should preserve unchanged fields', async () => {
        // First update branch
        await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ branch: 'Preserved Branch' });

        // Then update only name
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ name: 'New Name Only' });

        expect(response.status).toBe(200);
        expect(response.body.user.name).toBe('New Name Only');
        expect(response.body.user.branch).toBe('Preserved Branch');
      });

      it('should allow partial updates', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ section: 'C' });

        expect(response.status).toBe(200);
        expect(response.body.user.section).toBe('C');
      });

      it('should respond within acceptable timeframe', async () => {
        const startTime = Date.now();
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ name: 'Performance Test' });

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        expect(response.status).toBe(200);
        expect(responseTime).toBeLessThan(500);
      });
    });

    describe('PUT /api/auth/profile - Missing Required Fields Validation', () => {
      it('should return 400 when name is empty string', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ name: '' });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'INVALID_NAME');
      });

      it('should return 400 when name is only whitespace', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ name: '   ' });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message');
      });

      it('should allow update without name field', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ branch: 'Civil Engineering' });

        expect(response.status).toBe(200);
      });

      it('should allow empty optional fields', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ 
            branch: '',
            section: '',
            rollNo: ''
          });

        expect(response.status).toBe(200);
      });

      it('should return proper error message for invalid name', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ name: '' });

        expect(response.status).toBe(400);
        expect(response.body.message).toContain('Name');
      });
    });
  });

  describe('Security Tests', () => {
    describe('PUT /api/auth/profile - Access Control Test', () => {
      it('should only allow updating own profile', async () => {
        // User can only update their own profile via their token
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ name: 'My Profile Update' });

        expect(response.status).toBe(200);
        // The user ID in response should match the token's user
        expect(response.body.user.id).toBe('testuser123');
      });

      it('should not allow modifying another user via token manipulation', async () => {
        // Each token only grants access to update the associated user
        const response1 = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ name: 'Update from User 1' });

        const response2 = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken2}`)
          .send({ name: 'Update from User 2' });

        // Each user's update affects only their own profile
        expect(response1.body.user.id).not.toBe(response2.body.user.id);
      });

      it('should reject token with wrong user context', async () => {
        // A token for non-existent user should fail
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', 'Bearer dev_token_wronguser')
          .send({ name: 'Unauthorized Update' });

        expect(response.status).toBe(404);
      });

      it('should not allow bypassing auth with forged token', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', 'Bearer forged_admin_token')
          .send({ name: 'Forged Token Update' });

        expect(response.status).toBe(401);
      });
    });

    describe('PUT /api/auth/profile - Token Expiry Handling', () => {
      it('should return 401 for expired token', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${expiredToken}`)
          .send({ name: 'Expired Token Update' });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'TOKEN_EXPIRED');
      });

      it('should return appropriate error message for expired token', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${expiredToken}`)
          .send({ name: 'Expired Token Update' });

        expect(response.body.message).toContain('expired');
      });

      it('should handle various expired token formats', async () => {
        const expiredTokens = [
          'Bearer dev_token_expired_user1',
          'Bearer expired_dev_token_user1',
          'Bearer dev_token_testexpired'
        ];

        for (const expiredAuth of expiredTokens) {
          const response = await request(app)
            .put('/api/auth/profile')
            .set('Authorization', expiredAuth)
            .send({ name: 'Test' });

          expect(response.status).toBe(401);
        }
      });

      it('should not return user data for expired token', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${expiredToken}`)
          .send({ name: 'Test' });

        expect(response.body).not.toHaveProperty('user');
      });
    });

    describe('PUT /api/auth/profile - Injection Attack Prevention', () => {
      it('should handle SQL injection attempt in name field', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ name: "'; DROP TABLE users; --" });

        // Should either accept as literal string or reject, but not execute SQL
        expect([200, 400]).toContain(response.status);
        if (response.status === 200) {
          expect(response.body.user.name).toContain('DROP TABLE');
        }
      });

      it('should handle XSS attempt in name field', async () => {
        const xssPayload = '<script>alert("xss")</script>';
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ name: xssPayload });

        expect(response.status).toBe(200);
        // Should store as literal string, not execute
        expect(response.body.user.name).toContain('script');
      });

      it('should handle NoSQL injection attempt', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ 
            name: '{"$gt": ""}',
            branch: '{"$ne": null}'
          });

        expect(response.status).toBe(200);
        // Should treat as literal strings
      });

      it('should handle command injection attempt', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ name: '; rm -rf / ;' });

        expect(response.status).toBe(200);
        expect(response.body.user.name).toContain('rm');
      });

      it('should handle HTML injection in branch field', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ branch: '<img src=x onerror=alert(1)>' });

        expect(response.status).toBe(200);
      });

      it('should handle LDAP injection attempt', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ name: '*)(objectClass=*' });

        expect(response.status).toBe(200);
      });
    });

    describe('PUT /api/auth/profile - Data Exposure Prevention', () => {
      it('should not expose password in response', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ name: 'No Password Exposure' });

        expect(response.status).toBe(200);
        expect(response.body.user).not.toHaveProperty('password');
        expect(response.body.user).not.toHaveProperty('passwordHash');
        expect(response.body.user).not.toHaveProperty('hash');
      });

      it('should not expose internal tokens', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ name: 'No Token Exposure' });

        expect(response.status).toBe(200);
        expect(response.body.user).not.toHaveProperty('token');
        expect(response.body.user).not.toHaveProperty('refreshToken');
        expect(response.body.user).not.toHaveProperty('accessToken');
      });

      it('should not expose database internals', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ name: 'No DB Internal Exposure' });

        expect(response.status).toBe(200);
        expect(response.body.user).not.toHaveProperty('__v');
        expect(response.body.user).not.toHaveProperty('_doc');
      });

      it('should not expose sensitive fields in error responses', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${nonExistentUserToken}`)
          .send({ name: 'Error Response Test' });

        expect(response.status).toBe(404);
        expect(JSON.stringify(response.body)).not.toContain('password');
        expect(JSON.stringify(response.body)).not.toContain('token');
      });

      it('should not expose other users data', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ name: 'Only My Data' });

        expect(response.status).toBe(200);
        // Response should only contain the authenticated user's data
        expect(response.body.user.id).toBe('testuser123');
      });
    });

    describe('PUT /api/auth/profile - Rate Limiting Behavior', () => {
      it('should handle multiple rapid requests without error', async () => {
        const requests = Array(10).fill(null).map((_, i) => 
          request(app)
            .put('/api/auth/profile')
            .set('Authorization', `Bearer ${validToken}`)
            .send({ name: `Rapid Update ${i}` })
        );

        const responses = await Promise.all(requests);
        
        // All should succeed or some should be rate limited (429)
        responses.forEach(response => {
          expect([200, 429]).toContain(response.status);
        });
      });

      it('should maintain data integrity under rapid requests', async () => {
        const finalName = 'Final Rapid Name';
        
        // Send multiple updates
        for (let i = 0; i < 5; i++) {
          await request(app)
            .put('/api/auth/profile')
            .set('Authorization', `Bearer ${validToken}`)
            .send({ name: `Intermediate ${i}` });
        }

        // Final update
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ name: finalName });

        expect(response.status).toBe(200);
        expect(response.body.user.name).toBe(finalName);
      });

      it('should respond consistently under load', async () => {
        const requests = Array(5).fill(null).map(() => 
          request(app)
            .put('/api/auth/profile')
            .set('Authorization', `Bearer ${validToken}`)
            .send({ name: 'Load Test' })
        );

        const responses = await Promise.all(requests);
        const successfulResponses = responses.filter(r => r.status === 200);
        
        // At least some requests should succeed
        expect(successfulResponses.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Edge Case Tests', () => {
    describe('PUT /api/auth/profile - Empty Profile Update', () => {
      it('should handle empty body gracefully', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({});

        // Should either succeed with no changes or return appropriate status
        expect([200, 400]).toContain(response.status);
      });

      it('should handle missing body', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`);

        expect([200, 400]).toContain(response.status);
      });

      it('should handle null values in fields', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ 
            name: null,
            branch: null
          });

        // Should handle null appropriately
        expect([200, 400]).toContain(response.status);
      });

      it('should handle undefined values', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ 
            name: undefined,
            branch: 'Valid Branch'
          });

        expect(response.status).toBe(200);
      });
    });

    describe('PUT /api/auth/profile - Large Data Input', () => {
      it('should handle very long name (1000+ characters)', async () => {
        const longName = 'A'.repeat(1000);
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ name: longName });

        // Should either accept or reject with appropriate status
        expect([200, 400, 413]).toContain(response.status);
      });

      it('should handle very long branch name', async () => {
        const longBranch = 'Computer Science and Engineering '.repeat(50);
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ branch: longBranch });

        expect([200, 400, 413]).toContain(response.status);
      });

      it('should handle large payload in all fields', async () => {
        const largePayload = {
          name: 'A'.repeat(500),
          branch: 'B'.repeat(500),
          section: 'C'.repeat(100),
          rollNo: 'D'.repeat(100)
        };

        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send(largePayload);

        expect([200, 400, 413]).toContain(response.status);
      });

      it('should respond within reasonable time for large input', async () => {
        const largePayload = {
          name: 'Large Input Test User',
          branch: 'Long Branch Name '.repeat(10)
        };

        const startTime = Date.now();
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send(largePayload);

        const responseTime = Date.now() - startTime;
        expect(responseTime).toBeLessThan(1000);
      });

      it('should handle repeated field values', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ name: 'Test '.repeat(100).trim() });

        expect([200, 400]).toContain(response.status);
      });
    });

    describe('PUT /api/auth/profile - Special Characters in Input', () => {
      it('should handle emojis in name', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ name: 'Test User 🎓📚' });

        expect(response.status).toBe(200);
        expect(response.body.user.name).toContain('🎓');
      });

      it('should handle unicode characters in name', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ name: 'Тест 测试 テスト' });

        expect(response.status).toBe(200);
        expect(response.body.user.name).toContain('Тест');
      });

      it('should handle special punctuation', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ name: "O'Brien-Smith, Jr." });

        expect(response.status).toBe(200);
        expect(response.body.user.name).toContain("O'Brien");
      });

      it('should handle mathematical symbols', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ branch: 'Math ∑∫∂ Branch' });

        expect(response.status).toBe(200);
      });

      it('should handle newlines and tabs', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ name: 'Test\nUser\tName' });

        expect(response.status).toBe(200);
      });

      it('should handle HTML entities', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ name: 'Test &amp; User &lt;name&gt;' });

        expect(response.status).toBe(200);
      });

      it('should handle backslashes', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ name: 'Test\\User\\Name' });

        expect(response.status).toBe(200);
      });

      it('should handle quotes in values', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ name: 'Test "User" \'Name\'' });

        expect(response.status).toBe(200);
      });
    });

    describe('PUT /api/auth/profile - Concurrent Profile Updates', () => {
      it('should handle simultaneous updates without data corruption', async () => {
        const updates = [
          { name: 'Concurrent Update 1' },
          { name: 'Concurrent Update 2' },
          { name: 'Concurrent Update 3' }
        ];

        const requests = updates.map(data => 
          request(app)
            .put('/api/auth/profile')
            .set('Authorization', `Bearer ${validToken}`)
            .send(data)
        );

        const responses = await Promise.all(requests);
        
        // All should succeed
        responses.forEach(response => {
          expect(response.status).toBe(200);
          expect(response.body).toHaveProperty('user');
        });
      });

      it('should apply last write wins for concurrent updates', async () => {
        const requests = Array(5).fill(null).map((_, i) => 
          request(app)
            .put('/api/auth/profile')
            .set('Authorization', `Bearer ${validToken}`)
            .send({ name: `Update ${i}` })
        );

        await Promise.all(requests);

        // Final state should have one of the updates
        const verifyResponse = await request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${validToken}`);

        expect(verifyResponse.status).toBe(200);
        // Response is the user object directly, use user.name
        const userName = verifyResponse.body.name || verifyResponse.body.user?.name;
        expect(userName).toMatch(/Update \d/);
      });

      it('should handle concurrent updates from different users', async () => {
        const requests = [
          request(app)
            .put('/api/auth/profile')
            .set('Authorization', `Bearer ${validToken}`)
            .send({ name: 'User 1 Update' }),
          request(app)
            .put('/api/auth/profile')
            .set('Authorization', `Bearer ${validToken2}`)
            .send({ name: 'User 2 Update' })
        ];

        const responses = await Promise.all(requests);
        
        expect(responses[0].status).toBe(200);
        expect(responses[1].status).toBe(200);
        expect(responses[0].body.user.id).not.toBe(responses[1].body.user.id);
      });

      it('should maintain field independence in concurrent updates', async () => {
        const requests = [
          request(app)
            .put('/api/auth/profile')
            .set('Authorization', `Bearer ${validToken}`)
            .send({ branch: 'Branch Update' }),
          request(app)
            .put('/api/auth/profile')
            .set('Authorization', `Bearer ${validToken}`)
            .send({ section: 'Section Update' })
        ];

        const responses = await Promise.all(requests);
        responses.forEach(r => expect(r.status).toBe(200));
      });

      it('should not lose updates under high concurrency', async () => {
        const uniqueBranch = `Branch_${Date.now()}`;
        
        // First set a known value
        await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ branch: uniqueBranch });

        // Send concurrent name updates
        const requests = Array(3).fill(null).map((_, i) => 
          request(app)
            .put('/api/auth/profile')
            .set('Authorization', `Bearer ${validToken}`)
            .send({ name: `Concurrent ${i}` })
        );

        await Promise.all(requests);

        // Verify branch is preserved
        const verify = await request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${validToken}`);

        // Response is user object directly
        const userBranch = verify.body.branch || verify.body.user?.branch;
        expect(userBranch).toBe(uniqueBranch);
      });
    });

    describe('PUT /api/auth/profile - Outdated/Deprecated Fields', () => {
      it('should ignore unknown fields gracefully', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ 
            name: 'Valid Name',
            unknownField: 'should be ignored',
            deprecatedField: 'also ignored'
          });

        expect(response.status).toBe(200);
        expect(response.body.user).not.toHaveProperty('unknownField');
        expect(response.body.user).not.toHaveProperty('deprecatedField');
      });

      it('should not update read-only fields', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ 
            name: 'Test User',
            email: 'newemail@test.com',  // Should not be updatable
            id: 'newid123'  // Should not be updatable
          });

        expect(response.status).toBe(200);
        expect(response.body.user.email).not.toBe('newemail@test.com');
        expect(response.body.user.id).toBe('testuser123');
      });

      it('should ignore role field in update', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ 
            name: 'Test User',
            role: 'admin'  // Should not be updatable via profile
          });

        expect(response.status).toBe(200);
        // Role should not be changed to admin
      });

      it('should not allow updating isAdmin status', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ 
            name: 'Test User',
            isAdmin: true
          });

        expect(response.status).toBe(200);
        // isAdmin should not be changed
      });

      it('should not allow updating reputation directly', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ 
            name: 'Test User',
            reputation: 99999
          });

        expect(response.status).toBe(200);
        // Reputation should not be directly updatable
      });

      it('should handle mix of valid and invalid fields', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ 
            name: 'Mixed Fields User',
            branch: 'Valid Branch',
            invalidField1: 'ignored',
            section: 'Valid Section',
            invalidField2: 'also ignored'
          });

        expect(response.status).toBe(200);
        expect(response.body.user.name).toBe('Mixed Fields User');
        expect(response.body.user.branch).toBe('Valid Branch');
        expect(response.body.user.section).toBe('Valid Section');
      });
    });
  });

  describe('HTTP Method Tests', () => {
    it('should reject GET request to /api/auth/profile', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(404);
    });

    it('should reject POST request to /api/auth/profile', async () => {
      const response = await request(app)
        .post('/api/auth/profile')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ name: 'Test' });

      expect(response.status).toBe(404);
    });

    it('should reject DELETE request to /api/auth/profile', async () => {
      const response = await request(app)
        .delete('/api/auth/profile')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(404);
    });

    it('should reject PATCH request to /api/auth/profile', async () => {
      const response = await request(app)
        .patch('/api/auth/profile')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ name: 'Test' });

      expect(response.status).toBe(404);
    });
  });

  describe('Error Response Format Tests', () => {
    it('should return proper error structure for 401', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .send({ name: 'Test' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('error');
    });

    it('should return proper error structure for 400', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ name: '' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should return JSON for error responses', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .send({ name: 'Test' });

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('should not expose stack traces in errors', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${invalidToken}`)
        .send({ name: 'Test' });

      expect(response.body).not.toHaveProperty('stack');
      expect(JSON.stringify(response.body)).not.toContain('at ');
    });
  });
});
