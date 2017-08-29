const express = require('express');
const validator = require('validator');
const _ = require('lodash');
const { ObjectID } = require('mongodb');
const { mongoose } = require('../db/mongoose.js');
const { User } = require('../models/user');
//const { generateError, RESPONSE_CODES, ERRORS, MESSAGES } = require('../utils/messageUtil');
const { authenticate } = require('../middlewares/authenticate');
const router = express.Router();

/**
 * @api {GET} /api/v2/users/me Get LoggedIn User Info
 * @apiGroup Users
 * @apiVersion 2.0.0
 * @apiName GetLoggedInUser
 * @apiDescription This API is used to get the details of the user which is loggedin
 * @apiHeaderExample {string} Header-Example:
 * "Content-Type":"application/json"
 * "token":"TOKEN_GIVEN_WHEN_LOGIN"
 * @apiSuccess (Success-Response-body) {json} user User Object is return in the body
 * @apiSuccess (Success-Response-body) {json} communities Communities Object is return in the body
 * @apiSuccessExample {json} Success-Response-Body:
 * {
 *  "user": {
 *      "_id": "59a3699ff3517345c03faddf",
 *      "firstName": "John",
 *      "lastName": "Smith",
 *      "loginId": "john-smith@test.com"
 *  },
 *  "communities": [{
 *      //USER'S FIRTS COMMUNITY
 *  }, {
 *      //USER'S SECOND COMMUNITY
 *  }]
 * }
 * @apiError (401) {json} WRONG_TOKEN TOKEN WAS WRONG
 * @apiError (401) {json} EXPIRED_TOKEN TOKEN WAS EXPIRED
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
router.get('me', authenticate, (req, res) => {

});

router.get('/:id', authenticate, (req, res) => {

});

module.exports = router;