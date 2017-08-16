require('./config/config');
 
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
var {mongoose} = require('./db/mongoose.js');
const {ObjectID} = require('mongodb');
 
var app = express();
const port = process.env.PORT;
 
app.use(bodyParser.json());
app.use(bodyParser.text());
  
app.get('/', (req, res) => {
    res.send('Happy Coding!!!');
});

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
app.post('/api/v2/login', (req, res) => {
    let {username, password} = _.pick(req.body, ["username", "password"]);
    
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
app.post('/api/v2/forgot-password', (req, res) => {
    let {username} = _.pick(req.body, ["username"]);
    res.send('Received');
});
 
app.listen(port, () => console.log(`Server started and listening to Port ${port}`));
 
 
module.exports = {app};