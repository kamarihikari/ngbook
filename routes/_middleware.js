var jwt = require('jsonwebtoken');
var secret = require('../config.json').secret;

function findToken(req) {
    return req.cookies['x-access-token'] || req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['bearer'] || null;
}

function verifyToken(token, cb) {
    jwt.verify(token, secret, function (err, decoded) {
        if (err) {
            cb(err, null);
        }else {
            cb(null, decoded);
        }
    });
}


module.exports = {
    loadToken: function (req, res, next) {
        var token = findToken(req);

        if (token) {
            verifyToken(token, function (err, decodedToken) {
                if (!err) req.user = decodedToken;
                console.log(decodedToken);
                next();
            });
        }else {
            next();
        }
    },
    checkToken: function (req, res, next) {
        var token = findToken(req);

        if (token) {

            verifyToken(token, function (err, decodedToken) {
                if (err) {
                    return new Error('You must be logged in');
                }else {
                    req.user = decodedToken;
                    next();
                }
            });

        }else {
            return new Error('You must be logged in');
        }
    },
};
