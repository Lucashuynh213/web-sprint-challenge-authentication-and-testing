const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const authRouter = require('./auth/auth-router');  // Ensure this path is correct
const jokesRouter = require('./jokes/jokes-router');  // Ensure this path is correct
const { restricted } = require('./middleware/restricted');  // Ensure this path is correct
const server = express();

// Middleware setup
server.use(helmet());
server.use(cors());
server.use(express.json());

// Routes setup
server.use('/api/auth', authRouter);  // Use the correct path to authRouter
server.use('/api/jokes', restricted, jokesRouter);  // Apply restricted middleware to /api/jokes

server.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to the API!' });
});

module.exports = server;