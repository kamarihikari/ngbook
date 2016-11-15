var mongoose = require('mongoose');

module.exports = mongoose.model('User', new mongoose.Schema({
    name: String,
    username: String,
    usernameNormalized: String,
    password: String,
    email: String
}));