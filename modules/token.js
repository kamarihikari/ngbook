var jwt = require('jsonwebtoken');
var secret = require('../config.json').secret;

module.exports = {
    sign(data) {
        return jwt.sign(data, secret);
    },
    verify(token, cb) {
        jwt.verify(token, secret, function (err, decoded) {
            if (err) {
                if (typeof cb === 'function') cb(err, null);
            } else if (decoded.exp < ((new Date()).getTime())) {
                if (typeof cb === 'function') cb(new Error('Token Expired'), null);
            } else {
                if (typeof cb === 'function') cb(null, decoded);
            }
        });
    }
};