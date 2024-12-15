require('dotenv').config({path: './env.test'}) // Load test env vars
beforeAll(async () => {
    // Any setup before tests (e.g., clearing the database or setting environment variables)
  });
  
  afterAll(() => {
    // Cleanup after tests (e.g., closing connections or cleaning up state)
  });