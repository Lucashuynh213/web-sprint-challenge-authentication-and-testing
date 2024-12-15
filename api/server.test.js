// Write your tests here
const request = require('supertest');
const server = require('./server');
const db = require('../data/dbConfig');  // Make sure this points to the correct dbConfig

// Setup for tests
beforeAll(async () => {
  // Ensure migrations are run for the testing environment
  await db.migrate.latest();
});

beforeEach(async () => {
  // Clean up users table between tests
  await db('users').truncate();
});

afterAll(async () => {
  // Close the database connection after all tests
  await db.destroy();
});

describe('Authentication and Authorization Tests', () => {
  it('should register a new user', async () => {
    const response = await request(server)
      .post('/api/auth/register')
      .send({ username: 'newuser', password: 'password123' });

    expect(response.status).toBe(201);
    expect(response.body.username).toBe('newuser');
  });

  it('should return an error if username or password is missing during registration', async () => {
    const response = await request(server)
      .post('/api/auth/register')
      .send({ username: 'newuser' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('username and password required');
  });

  it('should return an error if username is taken during registration', async () => {
    // First, register a user
    await request(server)
      .post('/api/auth/register')
      .send({ username: 'existinguser', password: 'password123' });

    // Then try to register with the same username
    const response = await request(server)
      .post('/api/auth/register')
      .send({ username: 'existinguser', password: 'password123' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('username taken');
  });

  it('should login and return a token', async () => {
    // Register a user first
    await request(server)
      .post('/api/auth/register')
      .send({ username: 'testuser', password: 'password123' });

    // Login with the user credentials
    const response = await request(server)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'password123' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  it('should return an error if credentials are incorrect', async () => {
    const response = await request(server)
      .post('/api/auth/login')
      .send({ username: 'wronguser', password: 'wrongpassword' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('invalid credentials');
  });

  it('should return an error if no token is provided for /api/jokes', async () => {
    const response = await request(server)
      .get('/api/jokes');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Token required');
  });

  it('should return jokes if token is valid', async () => {
    // Register and login to get a token
    const loginResponse = await request(server)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'password123' });
  
    const token = loginResponse.body.token;
  
    // Use the token to get jokes
    const response = await request(server)
      .get('/api/jokes')
      .set('Authorization', `Bearer ${token}`);  // Make sure the token is being sent correctly
  
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('should return an error if token is invalid', async () => {
    const response = await request(server)
      .get('/api/jokes')
      .set('Authorization', 'Bearer invalid_token');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Token invalid');
  });
});