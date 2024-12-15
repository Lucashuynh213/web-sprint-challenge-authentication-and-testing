const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const authRouter = require('./auth/auth-router'); // Correct path to auth-router.js
const jokesRouter = require('./jokes/jokes-router');
const { restricted } = require('./middleware/restricted');
const server = express();

// Middleware setup
server.use(helmet());
server.use(cors());
server.use(express.json());

// Routes setup
server.use('/api/auth', authRouter);  // Correctly using the router
server.use('/api/jokes', restricted, jokesRouter);  // Use restricted middleware for /api/jokes

server.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to the API!' });
});

module.exports = server;