const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../data/dbConfig');
const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'username and password required' });
  }

  try {
    const existingUser = await db('users').where({ username }).first();
    if (existingUser) {
      return res.status(400).json({ message: 'username taken' });
    }

    const hashedPassword = bcrypt.hashSync(password, 8);

    // Insert the new user into the database and return id and username as an array of objects
    const newUser = await db('users')
        .insert({
            username,
            password: hashedPassword
            })
          .returning('*');


        const token = jwt.sign({ username: username }, process.env.JWT_SECRET || 'shh', { expiresIn: '1h' });

    res.status(201).json({ id: newUser[0].id, username: newUser[0].username, token });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ message: 'Error registering user' });
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