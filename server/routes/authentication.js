var express = require('express');
const validator = require('validator');
const _ = require('lodash');
const { ObjectID } = require('mongodb');
const passport = require('passport');
const googleStrategy = require('passport-google-oauth').OAuth2Strategy;
const fbStrategy = require('passport-facebook').Strategy;
const { google, facebook } = require('../config/auth-config');
var { mongoose } = require('../db/mongoose.js');
const { User } = require('../models/user.model');
const { generateError, RESPONSE_CODES, ERRORS, MESSAGES } = require('../utils/message.util');
const imageUtil = require('../utils/image.util');

var router = express.Router();

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

router.use(passport.initialize());
passport.use(new googleStrategy({
    clientID: google.clientID,
    clientSecret: google.clientSecret,
    callbackURL: google.callbackURL
}, function (accessToken, freshToken, profile, cb) {
    return cb(null, profile);
}));


passport.use(new fbStrategy({
    clientID: facebook.clientID,
    clientSecret: facebook.clientSecret,
    callbackURL: facebook.callbackURL,
    profileFields: facebook.profileFields
}, function (accessToken, freshToken, profile, cb) {
    return cb(null, profile);
}));

/**
 * @api {POST} /api/v2/login Simple Login
 * @apiGroup Authentication
 * @apiVersion 2.0.0
 * @apiName SimpleLogin
 * @apiDescription This API is used for simple login by username and password
 * @apiParam {string} loginId loginId of the user
 * @apiParam {string} password password of the user
 * @apiHeader {string} Content-Type value should be <code>application/json</code>
 * @apiHeaderExample {string} Header-Example:
 * "Content-Type":"application/json"
 * @apiParamExample {json} Request-Sample:
 * {
 *  "loginId": "user@test.com",
 *  "password": "123456"
 * }
 * @apiSuccess (Success-Response-body) {json} user User Object is return in the body
 * @apiSuccess (Success-Response-body) {json} communities Communities Object is return in the body
 * @apiSuccess (Success-Response-header) {string} token is returned in hte respons header
 * @apiSuccessExample {json} Success-Response-Body:
 * {
 *  "user": {
 *      "_id": "59a3699ff3517345c03faddf",
 *      "firstName": "John",
 *      "lastName": "Smith",
 *      "loginId": "john-smith@test.com",
 *      "currentCommunity": "56a3699tt3567845c03fadd6"
 *  },
 *  "communities": [{
 *      "communityName": "Community A",
 *      "communityDescription": "This is Community A",
 *      "status": 1,
 *      "longitude": "-78.016375",
 *      "latitude": "37.8829024"
 *  }, {
 *      "communityName": "Community B",
 *      "communityDescription": "This is Community B",
 *      "status": 1,
 *      "longitude": "-77.016375",
 *      "latitude": "38.8829024"
 *  }]
 * }
 * @apiSuccessExample {string} Success-Response-Header:
 * token: STRING_OF_TOKEN
 * @apiError (401) {json} WRONG_CREDENTIALS credentials were not correct
 * @apiError (404) {json} PAGE_NOT_FOUND check the URL
 * @apiError (500) {json} NETWROK_ISSUE check the network
 * 
 * @apiErrorExample {json} Error-Response-Body:
 * {
 *  "error": {
 *      "code": "SOME_CODE",
 *      "message": "SOME_MESSAGE"
 *  }
 * }
 */
router.post('/login', (req, res) => {
    let { loginId, password } = _.pick(req.body, ["loginId", "password"]);
    if (!validator.isEmpty(loginId) &&
        !validator.isEmpty(password) &&
        !validator.isEmail(loginId)) {
        //loginId or password are empty or loginId is not email
        return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.WRONG_CREDENTIALS);
    } else {
        User.findByCredentials(loginId, password)
            .then((user) => {
                if (user) {
                    return res.send({ user });
                } else {
                    return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.WRONG_CREDENTIALS);
                }
            })
            .catch((err) => {
                return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.WRONG_CREDENTIALS);
            })
    }
});


/**
 * @api {POST} /api/v2/forgot-password Forgot Password
 * @apiGroup Authentication
 * @apiVersion 2.0.0
 * @apiName ForgotPassword
 * @apiDescription This API is used for Forgot Password
 * @apiParam {string} loginId loginId of the user
 * @apiHeader {string} Content-Type value should be <code>application/json</code>
 * @apiHeaderExample {string} Header-Example:
 * "Content-Type":"application/json"
 * @apiParamExample {json} Request-Sample:
 * {
 *  "loginId": "user@test.com"
 * }
 * @apiSuccess (Success-Response-body) {json} message Email was sent to you. Please check your email
 * @apiSuccessExample {json} Success-Response-Body:
 * {
 *  "message": 'Email was sent to you. Please check your email'
 * }
 * @apiError (401) {json} WRONG_EMAIL EMAIL SHOULD BE PROVIDED
 * @apiError (401) {json} NO_ACCOUNT ACCOUNT DOES NOT EXIST
 * @apiError (404) {json} PAGE_NOT_FOUND check the URL
 * @apiError (500) {json} NETWROK_ISSUE check the network
 * 
 * @apiErrorExample {json} Error-Response-Body:
 * {
 *  "error": {
 *      "code": "SOME_CODE",
 *      "message": "SOME_MESSAGE"
 *  }
 * }
 */
router.post('/forgot-password', (req, res) => {
    let { loginId } = _.pick(req.body, ["loginId"]);
    if (!validator.isEmail(loginId)) {
        return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.WRONG_EMAIL_FORMAT);
    } else {
        User.findByLoginId(loginId)
            .then((user) => {
                if (user) {
                    //Send email to the user
                    return res.send(MESSAGES.EMAIL_SENT_TO_USER);
                } else {
                    return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.NO_ACCOUNT);
                }
            })
    }
});


/**
 * @api {POST} /api/v2/signup Sign Up
 * @apiGroup Authentication
 * @apiVersion 2.0.0
 * @apiName SignUp
 * @apiDescription This API is used for Simple Sign Up
 * @apiParam {string} firstName First Name of the user
 * @apiParam {string} lastName Last Name of the user
 * @apiParam {string} loginId loginId of the user
 * @apiParam {string} password password of the user
 * @apiHeader {string} Content-Type value should be <code>application/json</code>
 * @apiHeaderExample {string} Header-Example:
 * "Content-Type":"application/json"
 * @apiParamExample {json} Request-Sample:
 * {
 *  "firstName": "John",
 *  "lastName": "Smith",
 *  "loginId": "john-smith@test.com",
 *  "password": "123456"
 * }
 * @apiSuccess (Success-Response-body) {json} user User Object is return in the body
 * @apiSuccess (Success-Response-body) {json} communities Communities Object is return in the body
 * @apiSuccess (Success-Response-header) {string} token is returned in hte respons header
 * @apiSuccessExample {json} Success-Response-Body:
 * {
 *  "user": {
 *      "_id": "59a3699ff3517345c03faddf",
 *      "firstName": "John",
 *      "lastName": "Smith",
 *      "loginId": "john-smith@test.com",
 *      "currentCommunity": "56a3699tt3567845c03fadd6"
 *  },
 *  "communities": [{
 *      "communityName": "Community A",
 *      "communityDescription": "This is Community A",
 *      "status": 1,
 *      "longitude": "-78.016375",
 *      "latitude": "37.8829024"
 *  }, {
 *      "communityName": "Community B",
 *      "communityDescription": "This is Community B",
 *      "status": 1,
 *      "longitude": "-77.016375",
 *      "latitude": "38.8829024"
 *  }]
 * }
 * @apiSuccessExample {string} Success-Response-Header:
 * token: STRING_OF_TOKEN 
 * @apiError (401) {json} WRONG_EMAIL EMAIL SHOULD BE PROVIDED
 * @apiError (401) {json} EXISTING_EMAIL ACCOUNT ALREADY EXISTS
 * @apiError (401) {json} EMPTY_FIRST_NAME FIRST NAME SHOULD NOT BE EMPTY
 * @apiError (401) {json} EMPTY_LAST_NAME LAST NAME SHOULD NOT BE EMPTY
 * @apiError (401) {json} BAD_PASSWORD PASSWORD SHOULD BE AT LEAST 6 CHARACTERS
 * @apiError (404) {json} PAGE_NOT_FOUND check the URL
 * @apiError (500) {json} NETWROK_ISSUE check the network
 * 
 * @apiErrorExample {json} Error-Response-Body:
 * {
 *  "error": {
 *      "code": "SOME_CODE",
 *      "message": "SOME_MESSAGE"
 *  }
 * }
 */
router.post('/signup', async (req, res) => {
    let body = _.pick(req.body, ['firstName', 'lastName', 'loginId', 'password']);
    if (!validator.isEmpty(body.firstName) && !validator.isEmpty(body.lastName) &&
        !validator.isEmpty(body.loginId) && !validator.isEmpty(body.password) &&
        validator.isEmail(body.loginId) && body.password.length >= 6) {
            try{
                const user = new User(body);
                user.status = 1;
                user.email = body.loginId;
                await user.save();
                const token = await user.generateAuthToken();
                return res.header('token', token).send({ user });
            }
            catch(err){
                return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.ACCOUNT_ALREADY_EXISTS);
            }

    }else{
        if(validator.isEmpty(body.firstName)){
            return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.FIRST_NAME_EMPTY);
        }
        if(validator.isEmpty(body.lastName)){
            return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.LAST_NAME_EMPTY);
        }
        if(validator.isEmpty(body.password) || body.password.length < 6){
            return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.BAD_PASSWORD_FORMAT);
        }
        if(validator.isEmpty(body.loginId) || !validator.isEmail(body.loginId)){
            return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.WRONG_EMAIL_FORMAT);
        }
    }
});


/**
 * @api {GET} /api/v2/login/google Google Login
 * @apiGroup Authentication
 * @apiVersion 2.0.0
 * @apiName GoogleLogin
 * @apiDescription This API is used for Google Login
 * @apiSuccess (Success-Response-body) {json} user User Object is return in the body
 * @apiSuccess (Success-Response-body) {json} communities Communities Object is return in the body
 * @apiSuccess (Success-Response-header) {string} token is returned in hte respons header
 * @apiSuccessExample {json} Success-Response-Body:
 * {
 *  "user": {
 *      "_id": "59a3699ff3517345c03faddf",
 *      "firstName": "John",
 *      "lastName": "Smith",
 *      "loginId": "john-smith@test.com",
 *      "currentCommunity": "56a3699tt3567845c03fadd6"
 *  },
 *  "communities": [{
 *      "communityName": "Community A",
 *      "communityDescription": "This is Community A",
 *      "status": 1,
 *      "longitude": "-78.016375",
 *      "latitude": "37.8829024"
 *  }, {
 *      "communityName": "Community B",
 *      "communityDescription": "This is Community B",
 *      "status": 1,
 *      "longitude": "-77.016375",
 *      "latitude": "38.8829024"
 *  }]
 * }
 * @apiSuccessExample {string} Success-Response-Header:
 * token: STRING_OF_TOKEN 
 * @apiError (401) {json} NO_ACCOUNT user email not found
 * @apiError (404) {json} PAGE_NOT_FOUND check the URL
 * @apiError (500) {json} NETWROK_ISSUE check the network
 * 
 * @apiErrorExample {json} Error-Response-Body:
 * {
 *  "error": {
 *      "code": "SOME_CODE",
 *      "message": "SOME_MESSAGE"
 *  }
 * }
 */
router.get('/login/google', passport.authenticate('google', { scope: google.scope }));

/**
 * @api {GET} /api/v2/signup/google Google Signup
 * @apiGroup Authentication
 * @apiVersion 2.0.0
 * @apiName GoogleSignup
 * @apiDescription This API is used for Google Signup
 * @apiSuccess (Success-Response-body) {json} user User Object is return in the body
 * @apiSuccess (Success-Response-body) {json} communities Communities Object is return in the body
 * @apiSuccess (Success-Response-header) {string} token is returned in hte respons header
 * @apiSuccessExample {json} Success-Response-Body:
 * {
 *  "user": {
 *      "_id": "59a3699ff3517345c03faddf",
 *      "firstName": "John",
 *      "lastName": "Smith",
 *      "loginId": "john-smith@test.com",
 *      "currentCommunity": "56a3699tt3567845c03fadd6"
 *  },
 *  "communities": [{
 *      "communityName": "Community A",
 *      "communityDescription": "This is Community A",
 *      "status": 1,
 *      "longitude": "-78.016375",
 *      "latitude": "37.8829024"
 *  }, {
 *      "communityName": "Community B",
 *      "communityDescription": "This is Community B",
 *      "status": 1,
 *      "longitude": "-77.016375",
 *      "latitude": "38.8829024"
 *  }]
 * }
 * @apiSuccessExample {string} Success-Response-Header:
 * token: STRING_OF_TOKEN 
 * @apiError (404) {json} PAGE_NOT_FOUND check the URL
 * @apiError (500) {json} NETWROK_ISSUE check the network
 * 
 * @apiErrorExample {json} Error-Response-Body:
 * {
 *  "error": {
 *      "code": "SOME_CODE",
 *      "message": "SOME_MESSAGE"
 *  }
 * }
 */
router.get('/signup/google', passport.authenticate('google', { scope: google.scope }));


router.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/oauth-failed'
    }),
    async (req, res) => {
        //If account does not exist then sign up
        if(req.user){
            let email = req.user._json.emails[0].value;
            let imageUrl = req.user._json.image.url + '0';
            if(validator.isEmail(email)){
                let user = await User.findByLoginId(email);
                if(user){
                    return res.send({user});
                }else{
                    let firstName = req.user._json.name.givenName;
                    let lastName = req.user._json.name.familyName;
                    user = new User({
                        firstName,
                        lastName,
                        email,
                        loginId: email,
                        status: 1
                    });
                    imageUtil.saveFileByUrl(imageUrl, `${user._id}.jpg`);
                    await user.save();
                    const token = await user.generateAuthToken();
                    return res.header('token', token).send({user});
                }
            }
        }
    }
);

/**
 * @api {GET} /api/v2/login/facebook Facebook Login
 * @apiGroup Authentication
 * @apiVersion 2.0.0
 * @apiName FacebookLogin
 * @apiDescription This API is used for Facebook Login
 * @apiSuccess (Success-Response-body) {json} user User Object is return in the body
 * @apiSuccess (Success-Response-body) {json} communities Communities Object is return in the body
 * @apiSuccess (Success-Response-header) {string} token is returned in hte respons header
 * @apiSuccessExample {json} Success-Response-Body:
 * {
 *  "user": {
 *      "_id": "59a3699ff3517345c03faddf",
 *      "firstName": "John",
 *      "lastName": "Smith",
 *      "loginId": "john-smith@test.com",
 *      "currentCommunity": "56a3699tt3567845c03fadd6"
 *  },
 *  "communities": [{
 *      "communityName": "Community A",
 *      "communityDescription": "This is Community A",
 *      "status": 1,
 *      "longitude": "-78.016375",
 *      "latitude": "37.8829024"
 *  }, {
 *      "communityName": "Community B",
 *      "communityDescription": "This is Community B",
 *      "status": 1,
 *      "longitude": "-77.016375",
 *      "latitude": "38.8829024"
 *  }]
 * }
 * @apiSuccessExample {string} Success-Response-Header:
 * token: STRING_OF_TOKEN 
 * @apiError (401) {json} NO_ACCOUNT user email not found
 * @apiError (404) {json} PAGE_NOT_FOUND check the URL
 * @apiError (500) {json} NETWROK_ISSUE check the network
 * 
 * @apiErrorExample {json} Error-Response-Body:
 * {
 *  "error": {
 *      "code": "SOME_CODE",
 *      "message": "SOME_MESSAGE"
 *  }
 * }
 */
router.get('/login/facebook', passport.authenticate('facebook'));

/**
 * @api {GET} /api/v2/signup/facebook Facebook Signup
 * @apiGroup Authentication
 * @apiVersion 2.0.0
 * @apiName FacebookSignup
 * @apiDescription This API is used for Facebook Signup
 * @apiSuccess (Success-Response-body) {json} user User Object is return in the body
 * @apiSuccess (Success-Response-body) {json} communities Communities Object is return in the body
 * @apiSuccess (Success-Response-header) {string} token is returned in hte respons header
 * @apiSuccessExample {json} Success-Response-Body:
 * {
 *  "user": {
 *      "_id": "59a3699ff3517345c03faddf",
 *      "firstName": "John",
 *      "lastName": "Smith",
 *      "loginId": "john-smith@test.com",
 *      "currentCommunity": "56a3699tt3567845c03fadd6"
 *  },
 *  "communities": [{
 *      "communityName": "Community A",
 *      "communityDescription": "This is Community A",
 *      "status": 1,
 *      "longitude": "-78.016375",
 *      "latitude": "37.8829024"
 *  }, {
 *      "communityName": "Community B",
 *      "communityDescription": "This is Community B",
 *      "status": 1,
 *      "longitude": "-77.016375",
 *      "latitude": "38.8829024"
 *  }]
 * }
 * @apiSuccessExample {string} Success-Response-Header:
 * token: STRING_OF_TOKEN 
 * @apiError (404) {json} PAGE_NOT_FOUND check the URL
 * @apiError (500) {json} NETWROK_ISSUE check the network
 * 
 * @apiErrorExample {json} Error-Response-Body:
 * {
 *  "error": {
 *      "code": "SOME_CODE",
 *      "message": "SOME_MESSAGE"
 *  }
 * }
 */
router.get('/signup/facebook', passport.authenticate('facebook'));

router.get('/facebook/callback',
    passport.authenticate('facebook', {
        failureRedirect: '/failed'
    }),
    async (req, res) => {
        //If account does not exist then sign up
        if(req.user){
            let email = req.user._json.email;
            let imageUrl = req.user._json.picture.data.url;
            if(validator.isEmail(email)){
                let user = await User.findByLoginId(email);
                if(user){
                    return res.send({user});
                }else{
                    let firstName = req.user._json.first_name;
                    let lastName = req.user._json.last_name;
                    let gender = req.user._json.gender === 'female' ? 1 : 2;
                    user = new User({
                        firstName,
                        lastName,
                        email,
                        loginId: email,
                        gender,
                        status: 1
                    });
                    imageUtil.saveFileByUrl(imageUrl, `${user._id}.jpg`);
                    await user.save();
                    const token = await user.generateAuthToken();
                    return res.header('token', token).send({user});
                }
            }
        }
    }
);

module.exports = router;