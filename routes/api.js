/*jshint esversion: 6 */
var express = require('express');
var router = express.Router();
var middleware = require('./_middleware');
var postController = require('../controllers/postController');
var userController = require('../controllers/userController');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.get('/posts', middleware.loadToken, function (req, res) {
  let index = req.params.s || 0;
  let user = req.user || {};
  postController.getPosts(user, index)
    .then(posts => {
      res.send(posts);
    })
    .catch(err => {
      res.status(err.status || 500);
      res.send(err.message || 'Something went wrong');
    });
});


//POST ROUTES

router.post('/like', middleware.checkToken, function (req, res) {
  postController.toggleLike(req.body.post, req.user)
  .then(function (status) {
    res.send('OK');
  })
  .catch(function (err) {
    res.status(err.status || 500);
    res.send(err.message || 'Something went wrong');
  });
});

router.post('/post', middleware.checkToken, function(req, res) {
  postController.addPost(req.user, req.body.post)
  .then((postId) => {
    res.send(postId);
  })
  .catch((err) => {
    res.status(err.status || 500);
    res.send(err.message || 'Something went wrong');
  });
});

router.delete('/post/:id', middleware.checkToken, function (req, res) {
  postController.deletePost(req.user, req.params.id)
  .then((status) => {
    res.send('OK');
  })
  .catch((err) => {
    res.status(err.status || 500);
    res.send(err.message || 'Something went wrong');
  })
});

router.post('/comment', middleware.checkToken, function (req, res) {
  postController.addComment(req.user, req.body.post)
  .then((status) => {
    res.send('OK');
  })
  .catch((err) => {
    res.status(err.status || 500);
    res.send(err.message || 'Something went wrong');
  });
});

router.post('/register', function (req, res) {
  userController.register(req.body)
    .then(function (token) {
      res.send(token);
    })
    .catch(function (err) {
      res.status(401);
      res.send(err.message || 'Something went wrong');
    });
});

router.post('/login', function (req, res) {
  userController.login(req.body)
    .then(function (token) {
      res.send(token);
    })
    .catch(function (err) {
      res.status(403);
      res.send(err.message || 'Something went wrong while authenticating');
    });
});



//DEV ** MUST REMOVE **
router.get('/insert-post', (req, res) => {
  postController.insertPost()
    .then(status => res.send(status))
    .catch((err) => {
      res.status(500);
      res.send(err.message);
    });
});

module.exports = router;
