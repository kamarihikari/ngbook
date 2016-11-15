var User = require('../models/User');
var token = require('../modules/token');
var crypt = require('bcrypt-nodejs');

module.exports = {
    register(userData) {
        return new Promise((resolve, reject) => {
            let user = userData;
            let newUser;

            if (!user || !user.username || !user.password) {
                reject(new Error('Insufficient Input'));
            } else {
                User.findOne({ usernameNormalized: user.username.toLowerCase() }, (err, fUser) => {
                    if (err) {
                        reject(new Error('Something went wrong while creating user'));
                    }
                    if (fUser) {
                        reject(new Error('User Exists'));
                    } else {

                        newUser = new User({
                            username: user.username,
                            usernameNormalized: user.username.toLowerCase(),
                            password: _hashPassword(user.password)
                        });

                        newUser.save(function (err) {
                            if (err) {
                                reject(new Error('There was a problem creating user'));
                            } else {
                                return resolve(token.sign({
                                    id: newUser._id,
                                    username: user.username,
                                    exp: ((new Date()).getTime() + (1000 * 60 * 60 * 24 * 7))
                                }));
                            }
                        });
                    }
                });

            }
        });
    },
    login(userData) {
        return new Promise((resolve, reject) => {
            let user = userData;

            User.findOne({ usernameNormalized: user.username.toLowerCase() }, (err, fUser) => {
                if (err) {
                    reject(new Error('Something went wrong while creating user'));
                }

                if (!fUser) {
                    reject(new Error('Authentication Failed'));
                } else {
                    if (!_passwordMatch(user.password, fUser.password)) {
                        reject(new Error('Authentication Failed'));
                    } else {
                        resolve(token.sign({
                            username: fUser.username,
                            email: fUser.email,
                            iat: (new Date()).getTime(),
                            exp: ((new Date()).getTime() + (1000 * 60 * 60 * 24 * 7))
                        }));
                    }
                }
            });

        });
    }
};


function _hashPassword(password) {
    return crypt.hashSync(password);
}

function _passwordMatch(password, hashedPassword) {
    return (crypt.compareSync(password, hashedPassword));
}