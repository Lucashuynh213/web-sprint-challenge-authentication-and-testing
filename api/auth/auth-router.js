const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../data/dbConfig');
const router = express.Router();
const Users = require('../../data/users-model');

// Registration endpoint
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ message: "username and password required" });
  }

  // Check if username is valid (e.g., not too short or long)
  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({ message: "Username must be between 3 and 20 characters" });
  }

  try {
    const existingUser = await db('users').where({ username }).first();
    if (existingUser) {
      console.log('User already exists');  // Debugging
      return res.status(400).json({ message: "username taken" });
    }

    // Hash password
    const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 8;  // Default rounds if not set
    const hashedPassword = await bcrypt.hash(password, rounds);
    const [id] = await db('users').insert({ username, password: hashedPassword });

    // Respond with user data
    res.status(201).json({ id, username });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ message: "Error registering user", error: err.message });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  try {
    const user = await db('users').where({ username }).first();
    if (!user) {
      return res.status(400).json({ message: "invalid credentials" });
    }

    // Compare password with stored hash
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: "invalid credentials" });
    }

    // Generate JWT token with 1-hour expiration (can be configurable)
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION || '1h' });

    res.status(200).json({ token });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({ message: "Error logging in", error: err.message });
  }
});

module.exports = router;