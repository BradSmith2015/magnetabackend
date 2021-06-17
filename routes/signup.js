// All signup related routes
const express = require('express');
let User = require("../user.model")
const UserSession = require('../UserSession');
const validator = require('validator');

const router = express.Router()

router.route('/api/account/signup').post(function (req, res, next) {
    const { body } = req;
    const {
        password
    } = body;
    let {
        email
    } = body;
    const { user_onBoarded } = body;
    const { user_type } = body;
    const { user_signUpInfo } = body;

    if (!email) {
        return res.send({
            success: false,
            message: 'Email cannot be blank.'


        });
    }
    if (!password) {
        return res.send({
            success: false,
            message: 'Password cannot be blank.'

        });
    }

    email = email.toLowerCase();
    email = email.trim();

    // Steps:
    // 1. Verify email doesn't exist
    // 2. Save
    User.find({
        email: email
    }, (err, previousUsers) => {
        if (err) {
            return res.send({
                success: false,
                message: 'Error: Server error'
            });
        } else if (previousUsers.length > 0) {
            return res.send({
                success: false,
                message: 'Account already exist.'

            });
        }

        // Save the new user
        const newUser = new User();

        newUser.email = email;
        newUser.password = newUser.generateHash(password);
        newUser.user_type = user_type;
        newUser.user_onBoarded = user_onBoarded;
        newUser.user_signUpInfo = user_signUpInfo;
        newUser.save((err, user) => {
            if (err) {
                return res.send({
                    success: false,
                    message: 'Error: Server error'
                });
            }
            const userSession = new UserSession()
            userSession.userId = user._id;
            userSession.save((err, doc) => {
                if (err) {
                    console.log(err);
                    return res.send({
                        success: false,
                        message: 'Error: server error'
                    });
                }

                return res.send({
                    success: true,
                    message: 'Valid sign up and token Created',
                    token: doc._id,
                    userId: user._id,
                    email: user.email,
                    user_onBoarded: false

                });
            });

        });

    });

});


router.route('/api/account/signin').post(function (req, res, next) {
    const { body } = req;
    const {
        password
    } = body;
    let {
        email
    } = body;



    if (!email) {
        return res.send({
            success: false,
            message: 'Email cannot be blank.'

        });
    }
    if (!(validator.isEmail(email))) {
        return res.send({
            success: false,
            message: 'Please use a valid email address'
        });
    }
    if (!password) {
        return res.send({
            success: false,
            message: 'Password cannot be blank.'

        });
    }

    email = email.toLowerCase();
    email = email.trim();

    User.find({
        email: email
    }, (err, users) => {
        if (err) {
            return res.send({
                success: false,
                message: 'Error: server error'
            });
        }
        if (users.length != 1) {
            return res.send({
                success: false,
                message: 'Error Invalid Sign in'
            });
        }

        const user = users[0];
        if (!user.validPassword(password)) {
            return res.send({
                success: false,
                message: 'Error: Invalid Password'
            });
        }

        // Otherwise correct user
        const userSession = new UserSession();
        userSession.userId = user._id;
        const user_onBoarded = user.user_onBoarded;
        const user_signUpInfo = user.user_signUpInfo;

        userSession.save((err, doc) => {
            if (err) {
                console.log(err);
                return res.send({
                    success: false,
                    message: 'Error: server error'
                });
            }

            return res.send({
                success: true,
                message: 'Valid sign in',
                token: doc._id,
                userId: user._id,
                user: user.email,
                user_onBoarded,
                user_signUpInfo
            });
        });
    });
});

router.route('/api/account/verify').get(function (req, res, next) {
    // Get the token
    const { query } = req;
    const { token } = query;
    // ?token=test

    // Verify the token is one of a kind and it's not deleted.

    UserSession.find({
        _id: token,
        isDeleted: false
    }, (err, sessions) => {
        if (err) {
            console.log(err);
            return res.send({
                success: false,
                message: 'Error: Server error'
            });
        }

        if (sessions.length != 1) {
            return res.send({
                success: false,
                message: 'Error: Invalid'
            });
        } else {
            return res.send({
                success: true,
                message: 'Token is valid',
                sessions
            });
        }
    });
});

router.route('/api/account/logout').get(function (req, res, next) {
    // Get the token
    const { query } = req;
    const { token } = query;
    // ?token=test

    // Verify the token is one of a kind and it's not deleted.

    UserSession.findOneAndUpdate({
        _id: token,
        isDeleted: false
    }, {
        $set: {
            isDeleted: true
        }
    }, null, (err, sessions) => {
        if (err) {
            console.log(err);
            return res.send({
                success: false,
                message: 'Error: Server error'
            });
        }

        return res.send({
            success: true,
            message: 'Good'
        });
    });
});

module.exports = router