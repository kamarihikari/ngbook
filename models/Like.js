var db = require('./db');
var mongoose = require('mongoose');

var Like = new mongoose.Schema({
    _post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
     user: String
});

module.exports = mongoose.model('Like', Like);