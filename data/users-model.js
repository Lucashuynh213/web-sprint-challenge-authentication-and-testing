// users-model.js
const db = require('../../data/dbConfig'); // Adjust the path if needed

// Function to insert a new user
function add(user) {
  return db('users').insert(user).returning('id', 'username'); // Adjust as per your DB schema
}

// Function to find a user by username
function findByUsername(username) {
  return db('users').where({ username }).first();
}

module.exports = {
  add,
  findByUsername,
};