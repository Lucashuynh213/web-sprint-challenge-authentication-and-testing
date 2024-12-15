const db = require('../data/dbConfig');  // Ensure this points to your dbConfig.js

// Find user by username
function findByUsername(username) {
  return db('users')
    .where({ username })
    .first();  // Only return the first match (assuming usernames are unique)
}

// Add a new user to the database
function add(user) {
  return db('users')
    .insert(user)
    .returning('*')  // Return all columns of the newly inserted user
    .then(([newUser]) => newUser);  // Return the newly created user
}

module.exports = {
  findByUsername,
  add,
};