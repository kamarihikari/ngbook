var db = require('./db');
var mongoose = require('mongoose');

var Comment = new mongoose.Schema({
    _post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    user: String,
    content: String,
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', Comment);