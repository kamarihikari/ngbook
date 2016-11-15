/*jshint esversion: 6 */
var ObjectId = require('mongoose').Schema.Types.ObjectId;
var Post = require('../models/Post');
var Like = require('../models/Like');
var Comment = require('../models/Comment');
var Like = require('../models/Like');


module.exports = {
    getPosts(user, index) {
        return new Promise((resolve, reject) => {
            Post.find({})
                .populate('comments')
                .populate({
                    path: 'liked',
                    match: { user: { $eq: user.username } },
                    select: 'user -_id'
                })
                .sort({ date: -1 })
                .limit(10)
                .exec((err, posts) => {
                    if (!err) {
                        resolve(posts);
                    } else {
                        reject(err.message || 'something went wrong');
                    }
                });
        });
    },
    addPost: function (user, post) {
        return new Promise((resolve, reject) => {
            Post.create({ owner: user.username, content: post.content }, (err, p) => {
                if (err || !p) {
                    reject(new Error('Failed to create post'));
                } else {
                    resolve(p._id);
                }
            });
        });
    },
    addComment: function (user, post) {
        return new Promise((resolve, reject) => {
            Post.findOne({ _id: post.id }, (err, p) => {
                if (err || !p) {
                    reject(new Error('Error adding comment'));
                } else {
                    console.log(user, post);
                    Comment.create({ _post: post.id, user: user.username, content: post.comment }, (err, comment) => {
                        if (err) {
                            reject(new Error('Error adding comment'));
                        } else {
                            p.comments.push(comment._id);
                            p.save((err) => {
                                if (err) {
                                    reject(new Error('Error updating post with comment'));
                                } else {
                                    resolve();
                                }
                            });
                        }
                    });
                }
            });
        });
    },
    deletePost: function (user, postId) {
        return new Promise((resolve, reject) => {
            Post.findOne({ _id: postId }, (err, post) => {
                if (err || !post) {
                    reject(new Error('Could not delete post'));
                }else {
                    if (post.owner !== user.username) {
                        return reject(new Error('You must be logged in as the post creator'));
                    }
                    Comment.remove({_post: postId}, (err) => {
                        Like.remove({_post: postId}, (err) => {
                            post.remove((err) => {
                                if (!err) {
                                    resolve();
                                }else {
                                    reject(new Error('Could not delete post'));
                                }
                            });
                        });
                    });
                    
                    
                }
            });
        });
    },
    toggleLike: function (post, user) {
        return new Promise((resolve, reject) => {
            Like.findOne({ _post: post._id, user: user.username }, (err, like) => {
                if (!err) {
                    if (like) {
                        Post.findOne({ _id: post._id }, (err, p) => {
                            p.likes--;
                            p.save();
                            like.remove();
                            resolve();
                        });
                    } else {
                        Post.findOne({ _id: post._id }, (err, p) => {
                            p.likes++;

                            Like.create({ _post: post._id, user: user.username }, (err, like) => {
                                p.liked.push(like._id);
                                p.save();
                                resolve();
                            });
                        });
                    }
                } else {
                    reject(err);
                }
            });
        });
    },
    insertPost() {
        return new Promise((resolve, reject) => {
            Post.create({}, (err, post) => {
                if (!err) {
                    Comment.create({ _post: post._id, content: 'Testing Comment.', user: 'Jamar Vales' }, (err, comment) => {
                        if (!err) {
                            console.log('Created test comment: ', comment);
                            post.comments.push(comment._id);
                            Like.create({ _post: post._id, user: 'NettoNavi' }, (err, like) => {
                                if (!err) {
                                    console.log('Created Like', like);
                                }
                                post.liked.push(like._id);
                                post.likes++;
                                post.save((err) => {
                                    if (err) console.error(err);

                                    console.log('Post updated with comment');
                                });
                            });


                        } else {
                            console.error('Error creating comment: ', err);
                        }
                    });
                    resolve(post);
                } else {
                    reject(err.message || 'something went wrong');
                }
            });
        });
    }
};