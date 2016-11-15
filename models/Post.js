var db = require('./db');
var mongoose = require('mongoose');

var Post = new mongoose.Schema({
    owner: String,
    content: String,
    date: { type: Date, default: Date.now },
    likes: { type: Number, default: 0 },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    liked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Like' }],    
});

module.exports = mongoose.model('Post', Post);