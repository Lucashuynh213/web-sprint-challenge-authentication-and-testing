const request = require('supertest');
const server = require('./server');
const db = require('../data/dbConfig');
require('dotenv').config({path:'.env.test'}); // Load test env vars

// Setup for tests
beforeAll(async () => {
  // Ensure migrations are run for the testing environment
  await db.migrate.latest();
});

beforeEach(async () => {
  await db('users').truncate();
});

afterAll(async () => {
  // Close the database connection after all tests
  await db.destroy();
});

describe('Authentication and Authorization Tests', () => {
    describe('[POST] /api/auth/register', () => {
        it('[1] adds a new user with a bcrypted password to the users table on success', async () => {
            const response = await request(server)
                .post('/api/auth/register')
                .send({ username: 'newuser', password: 'password123' });
                
              const user = await db('users').where({username: 'newuser'}).first();

              expect(user).toBeDefined()
               expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
              expect(response.body).toHaveProperty('username', 'newuser');
              expect(response.body).toHaveProperty('token');
          });

        it('[2] responds with the new user with a bcrypted password on success', async () => {
            const response = await request(server)
              .post('/api/auth/register')
              .send({ username: 'newuser', password: 'password123' });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('username');
           expect(response.body).toHaveProperty('token');
            });

        it('[3] responds with a proper status code on success', async () => {
            const response = await request(server)
            .post('/api/auth/register')
            .send({ username: 'newuser', password: 'password123' });
            expect(response.status).toBe(201);
        });
        it('[4] responds with an error status code if username exists in users table', async () => {
            await request(server)
              .post('/api/auth/register')
              .send({ username: 'existinguser', password: 'password123' });
      
            const response = await request(server)
              .post('/api/auth/register')
              .send({ username: 'existinguser', password: 'password123' });
      
            expect(response.status).toBe(400);
           });

        it('[5] responds with "username taken" message if username exists in users table', async () => {
          await request(server)
            .post('/api/auth/register')
            .send({ username: 'existinguser', password: 'password123' });

          const response = await request(server)
            .post('/api/auth/register')
            .send({ username: 'existinguser', password: 'password123' });

          expect(response.body.message).toBe('username taken');
        });

        it('[6] responds with an error status code if username or password are not sent', async () => {
            const response = await request(server)
              .post('/api/auth/register')
              .send({ username: 'newuser' });
    
            expect(response.status).toBe(400);
          });
        it('[7] responds with "username and password required" message if either is not sent', async () => {
            const response = await request(server)
              .post('/api/auth/register')
              .send({ username: 'newuser' });

            expect(response.body.message).toBe('username and password required');
          });
  });

  describe('[POST] /api/auth/login', () => {
    it('[8] responds with a proper status code on successful login', async () => {
        await request(server)
          .post('/api/auth/register')
          .send({ username: 'testuser', password: 'password123' });

      const response = await request(server)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'password123' });

        expect(response.status).toBe(200);
    });

    it('[9] responds with a welcome message and a token on successful login', async () => {
          await request(server)
              .post('/api/auth/register')
            .send({ username: 'testuser', password: 'password123' });
    
        const response = await request(server)
            .post('/api/auth/login')
          .send({ username: 'testuser', password: 'password123' });

          expect(response.body).toHaveProperty('message','Welcome back!');
          expect(response.body).toHaveProperty('token');
      });
      it('[10] responds with an error status code if username or password are not sent', async () => {
        const response = await request(server)
              .post('/api/auth/login')
              .send({ username: 'testuser' });
      
        expect(response.status).toBe(400);
      });
    it('[11] responds with "username and password required" message if either is not sent', async () => {
           const response = await request(server)
             .post('/api/auth/login')
             .send({ username: 'testuser' });

           expect(response.body.message).toBe('username and password required');
      });

    it('[12] responds with a proper status code on non-existing username', async () => {
        const response = await request(server)
           .post('/api/auth/login')
           .send({ username: 'wronguser', password: 'wrongpassword' });
  
        expect(response.status).toBe(400);
     });

    it('[13] responds with "invalid credentials" message on non-existing username', async () => {
           const response = await request(server)
           .post('/api/auth/login')
             .send({ username: 'wronguser', password: 'wrongpassword' });
    
         expect(response.body.message).toBe('invalid credentials');
       });
    it('[14] responds with a proper status code on invalid password', async () => {
          await request(server)
             .post('/api/auth/register')
             .send({ username: 'testuser', password: 'password123' });

        const response = await request(server)
            .post('/api/auth/login')
            .send({ username: 'testuser', password: 'invalidPassword' });
       expect(response.status).toBe(400);
    });

     it('[15] responds with "invalid credentials" message on invalid password', async () => {
          await request(server)
              .post('/api/auth/register')
              .send({ username: 'testuser', password: 'password123' });

          const response = await request(server)
               .post('/api/auth/login')
               .send({ username: 'testuser', password: 'invalidPassword' });

        expect(response.body.message).toBe('invalid credentials');
      });
  });

  describe('[GET] /api/jokes', () => {
    it('[16] responds with an error status code on missing token', async () => {
          const response = await request(server)
              .get('/api/jokes')
      
            expect(response.status).toBe(401);
      });

      it('[17] responds with a "token required" message on missing token', async () => {
        const response = await request(server)
            .get('/api/jokes')
            expect(response.status).toBe(401); 
            expect(response.body.message).toEqual(expect.stringMatching(/token required/));
    });

     it('[18] responds with an error status code on invalid token', async () => {
        const response = await request(server)
            .get('/api/jokes')
          .set('Authorization', `Bearer invalid`);
    
       expect(response.status).toBe(401);
     });
      it('[19] responds with a "token invalid" message on invalid token', async () => {
           const response = await request(server)
              .get('/api/jokes')
              .set('Authorization', `Bearer invalid`);
      
          expect(response.body).toHaveProperty('message')
           expect(response.body.message).toEqual(expect.stringMatching(/invalid/i));
      });
     it('[20] responds with the jokes on valid token', async () => {
        await request(server)
             .post('/api/auth/register')
            .send({ username: 'testuser', password: 'password123' });
     
          const loginResponse = await request(server)
             .post('/api/auth/login')
             .send({ username: 'testuser', password: 'password123' });

         const token = loginResponse.body.token;
     
           const response = await request(server)
                .get('/api/jokes')
                .set('Authorization', `Bearer ${token}`);

          expect(response.status).toBe(200);
          expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
      });
    });
});