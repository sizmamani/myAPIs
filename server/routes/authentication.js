var express = require('express');
var router = express.Router();
const _ = require('lodash');
var { mongoose } = require('../db/mongoose.js');
const { ObjectID } = require('mongodb');
const passport = require('passport');
const googleStrategy = require('passport-google-oauth').OAuth2Strategy;
const fbStrategy = require('passport-facebook').Strategy;
const { google, facebook } = require('../config/auth-config');

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
 * @apiParam {string} username username of the user
 * @apiParam {string} passport password of the user
 * @apiHeader {string} Content-Type value should be <code>application/json</code>
 * @apiHeaderExample {string} Header-Example:
 * "Content-Type":"application/json"
 * @apiParamExample {json} Request-Sample:
 * {
 *  "username": "user@test.com",
 *  "password": "123456"
 * }
 * @apiSuccess (Success-Response-body) {json} user User Object is return in the body
 * @apiSuccess (Success-Response-body) {json} communities Communities Object is return in the body
 * @apiSuccess (Success-Response-header) {string} token is returned in hte respons header
 * @apiSuccessExample {json} Success-Response-Body:
 * {
 *  "user": {
 *      //LOGGED IN USER DETAILS
 *      },
 *  "communities": [{
 *      //USER'S FIRTS COMMUNITY
 *  }, {
 *      //USER'S SECOND COMMUNITY
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
    let { username, password } = _.pick(req.body, ["username", "password"]);
    res.send('Received');
});


/**
 * @api {POST} /api/v2/forgot-password Forgot Password
 * @apiGroup Authentication
 * @apiVersion 2.0.0
 * @apiName ForgotPassword
 * @apiDescription This API is used for Forgot Password
 * @apiParam {string} username username of the user
 * @apiHeader {string} Content-Type value should be <code>application/json</code>
 * @apiHeaderExample {string} Header-Example:
 * "Content-Type":"application/json"
 * @apiParamExample {json} Request-Sample:
 * {
 *  "username": "user@test.com"
 * }
 * @apiError (401) {json} WRONG_EMAIL username was wrong
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
    let { username } = _.pick(req.body, ["username"]);
    res.send('Received');
});


/**
 * @api {POST} /api/v2/signup Sign Up
 * @apiGroup Authentication
 * @apiVersion 2.0.0
 * @apiName SignUp
 * @apiDescription This API is used for Simple Sign Up
 * @apiParam {string} name name of the user
 * @apiParam {string} username username of the user
 * @apiParam {string} password password of the user
 * @apiHeader {string} Content-Type value should be <code>application/json</code>
 * @apiHeaderExample {string} Header-Example:
 * "Content-Type":"application/json"
 * @apiParamExample {json} Request-Sample:
 * {
 *  "name": "user",
 *  "username": "user@test.com",
 *  "password": "123456"
 * }
 * @apiSuccess (Success-Response-body) {json} user User Object is return in the body
 * @apiSuccess (Success-Response-body) {json} communities Communities Object is return in the body
 * @apiSuccess (Success-Response-header) {string} token is returned in hte respons header
 * @apiSuccessExample {json} Success-Response-Body:
 * {
 *  "user": {
 *      //LOGGED IN USER DETAILS
 *      },
 *  "communities": [{
 *      //USER'S FIRTS COMMUNITY
 *  }, {
 *      //USER'S SECOND COMMUNITY
 *  }]
 * }
 * @apiSuccessExample {string} Success-Response-Header:
 * token: STRING_OF_TOKEN 
 * @apiError (401) {json} WRONG_EMAIL username was wrong
 * @apiError (401) {json} EMPTY_NAME name was empty
 * @apiError (401) {json} BAD_PASSWORD password did not follow the policy
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
router.post('/signup', (req, res) => {
    let { name, username, password } = _.pick(req.body, ["name", "username", "password"]);
    res.send('Received');
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
 *      //LOGGED IN USER DETAILS
 *      },
 *  "communities": [{
 *      //USER'S FIRTS COMMUNITY
 *  }, {
 *      //USER'S SECOND COMMUNITY
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
router.get('/login/google',
    passport.authenticate('google', { scope: google.scope }));

    router.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/failed'
    }),
    (req, res) => {
        res.json(req.user._json);
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
 *      //LOGGED IN USER DETAILS
 *      },
 *  "communities": [{
 *      //USER'S FIRTS COMMUNITY
 *  }, {
 *      //USER'S SECOND COMMUNITY
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


router.get('/facebook/callback',
    passport.authenticate('facebook', {
        failureRedirect: '/failed'
    }),
    (req, res) => {
        res.json(req.user._json);
    }
);

module.exports = router;