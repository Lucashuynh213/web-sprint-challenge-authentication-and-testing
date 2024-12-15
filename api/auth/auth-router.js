
// Register route
const express = require('express');
  const bcrypt = require('bcryptjs');
  const jwt = require('jsonwebtoken');
  const db = require('../../data/dbConfig');
  const router = express.Router();
  const Users = require('../../data/users-model')

// Register route
router.post('/register', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'username and password required' });
    }

    const existingUser = await Users.findBy({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'username taken' });
    }

    const hashedPassword = bcrypt.hashSync(password, 8);
    const newUser = await Users.add({ username, password: hashedPassword });

    const token = jwt.sign(
      { id: newUser.id, username: newUser.username },
      process.env.JWT_SECRET || 'shh',
      { expiresIn: '1h' }
    );

    res.status(201).json({
      id: newUser.id, // Include the id
      username: newUser.username,
      token,
    });
  } catch (err) {
    next(err);
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
      return res.status(400).json({ message: 'username and password required' });
  }

  try {
    const user = await db('users').where({ username }).first();
    if (!user) {
      return res.status(400).json({ message: 'invalid credentials' });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'invalid credentials' });
    }
      const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET || 'shh', { expiresIn: '1h' });
      res.status(200).json({ message: 'Welcome back!', token });
  } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ message: 'Error logging in' });
    }
  });

module.exports = router;