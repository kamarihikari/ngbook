(function (global) {

    if (typeof angular === 'undefined') {
        throw new Error('Angular 1x is required');
    }

    if (typeof Materialize === 'undefined') {
        throw new Error('MaterializeCSS is required');
    }

    var app = global.app = {
        service: {},
        controller: {},
        emit: null,
        notify: function (message) {
            Materialize.toast(message, 4000);
        },
        headers: null,
        user: {},
        token: {}
    };

    var url = '';

    function resErr(res) {
        if (res.data) {
            app.notify(res.data);
        }
    }

    var init = angular.module('NGbook', []).config(function ($interpolateProvider) {
        $interpolateProvider.startSymbol('{[{');
        $interpolateProvider.endSymbol('}]}');
    });


    //Authentication Service
    init.service('AuthenticationService', ['$http', function ($http) {
        app.service.AuthenticationService = {
            login: function (username, password) {
                $http.post(url + '/api/login', { username: username, password: password })
                    .then(function (res) {
                        localStorage.setItem('token', res.data);
                        window.location.reload();
                    })
                    .catch(function (res) {
                        resErr(res);
                    });
            },
            register: function (username, password) {
                $http.post(url + '/api/register', { username: username, password: password })
                    .then(function (res) {
                        localStorage.setItem('token', res.data);
                        window.location.reload();
                    })
                    .catch(function (res) {
                        resErr(res);
                    });
            },
        };
        return app.service.AuthenticationService;
    }]);

    init.controller('authController', ['AuthenticationService', '$scope', function (AuthenticationService, $scope) {
        var props = this.props = app.controller.auth = {
            username: null,
            password: null,
        };

        $scope.login = function () {
            if (!props.username || !props.password) {
                return app.notify('Please check your input');
            } else {
                AuthenticationService.login(props.username, props.password);
            }
        };
        $scope.register = function () {
            if (!props.username || !props.password) {
                return app.notify('Please check your input');
            } else {
                AuthenticationService.register(props.username, props.password);
            }
        };

        $scope.$on('auth', function () {
            props.username = null;
            props.password = null;
        });
    }]);

    //Core Service and Controller
    init.service('CoreService', ['$rootScope', '$http', function ($rootScope, $http) {


        var token = localStorage.getItem('token');

        var _loadUser = function (token) {
            app.user = (token) ? JSON.parse(atob(token.split('.')[1])) : {};

            if (app.user.exp > (new Date().getTime())) {
                app.user.active = true;
                app.emit('load-user', app.user);
            } else {
                app.user.active = false;
            }
        };

        app.emit = function (event, listener) {
            $rootScope.$broadcast(event, listener);
        };

        app.headers = function () {
            if (token) {
                return { bearer: token };
            } else {
                return {};
            }
        };

        _loadUser(token);
        app.token = token;

        app.service.CoreService = {
            loadUser: _loadUser
        };
        return app.service.CoreService;
    }]);

    init.controller('coreController', ['CoreService', 'AuthenticationService', '$scope', function (CoreService, AuthenticationService, $scope) {
        var props = this.props = app.controller.core = {
            user: app.user,
            loaded: false
        };

        $scope.load = function () {
            props.loaded = true;
        };

        $scope.logout = function () {
            app.user = props.user = {};
            localStorage.removeItem('token');
            app.emit('logout');
        };

        $scope.$on('load-user', function (event, data) {
            props.user = data;
        });
    }]);


    //Post Service and Controller
    init.service('PostService', ['$http', function ($http) {
        app.service.PostService = {
            loadPosts: function (index) {
                $http.get(url + '/api/posts?s=' + index, {
                    headers: app.headers()
                })
                    .then(function (res) {
                        for (var i = 0; i < res.data.length; i++) {
                            app.emit('load-posts', res.data[i]);
                        }
                    })
                    .catch(function (res) {
                        resErr(res);
                    });
            },
            toggleLike: function (post, index) {
                $http.post(url + '/api/like', {
                    post: post
                }, {
                        headers: app.headers()
                    })
                    .then(function (res) {
                        app.emit('toggle-like', index);
                    })
                    .catch(function (res) {
                        resErr(res);
                    });
            },
            addPost: function (post) {
                $http.post(url + '/api/post', {
                    post: post
                }, {
                        headers: app.headers()
                    })
                    .then(function (res) {
                        app.emit('add-post', { id: res.data });
                    })
                    .catch(function (res) {
                        resErr(res);
                    });
            },
            addComment: function (index, post) {
                $http.post(url + '/api/comment', {
                    post: post
                }, {
                        headers: app.headers()
                    })
                    .then(function (res) {
                        app.emit('add-comment', { post: index, content: post.content });
                    })
                    .catch(function (res) {
                        resErr(res);
                    });
            },
            deletePost: function (id) {
                $http.delete(url + '/api/post/'+id, {
                        headers: app.headers()
                    })
                    .then(function (res) {
                        app.emit('deleted-post', id);
                    })
                    .catch(function (res) {
                        resErr(res);
                    });
            },
        };
        return app.service.PostService;
    }]);

    init.controller('postController', ['PostService', '$scope', function (PostService, $scope) {
        var props = this.props = app.controller.post = {
            currentPost: null,
            postIndex: 0,
            commentIndex: null,
            posts: []
        };

        $scope.ownPost = function (index) {
            return (props.posts[index].owner === app.user.username);
        };

        $scope.deletePost = function (index) {
            if (confirm('Delete Post?')) {
                PostService.deletePost(props.posts[index]._id);
            }
        };

        $scope.addPost = function () {
            PostService.addPost({
                content: props.currentPost
            });
        };

        $scope.loadPosts = function () {
            PostService.loadPosts(props.postIndex);
            props.postIndex++;
        };

        $scope.toggleLike = function (index) {
            var post = props.posts[index];
            PostService.toggleLike(post, index);

        };

        $scope.loadLike = function (index) {
            if (!props.posts[index].isNew && props.posts[index].liked.length) {
                props.posts[index].isLiked = true;
            }
        };

        $scope.setCommentIndex = function (index) {
            props.commentIndex = index;
        };

        $scope.addComment = function () {
            PostService.addComment(props.commentIndex, {
                id: props.posts[props.commentIndex]._id,
                comment: props.posts[props.commentIndex].currentComment
            });
        };

        $scope.handlePressEvent = function (event) {
            if (event.code === 'Enter') {
                $scope.addComment();
            }
        };



        $scope.$on('load-posts', function (event, data) {
            props.posts.push(data);
        });
        $scope.$on('toggle-like', function (event, data) {
            var post = props.posts[data];
            if (post.isLiked) {
                post.isLiked = false;
                post.likes--;
            } else {
                post['isLiked'] = true;
                post.likes++;
            }
        });
        $scope.$on('add-post', function (event, data) {
            props.posts.splice(0, 0, {
                isNew: true,
                _id: data.id,
                date: (new Date()).getTime(),
                content: props.currentPost,
                owner: app.user.username,
                likes: 0,
                comments: []
            });
            props.currentPost = null;
        });
        $scope.$on('add-comment', function (event, data) {
            props.posts[props.commentIndex].comments.push({
                user: app.user.username,
                content: props.posts[props.commentIndex].currentComment,
            });
            props.posts[props.commentIndex].currentComment = null;
        });
        $scope.$on('deleted-post', function (event, data) {
            props.posts.splice(data, 1);
        });
        $scope.$on('logout', function () {
            window.location.reload();
        });

    }]);


})(this);