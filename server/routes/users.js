const express = require('express');
const validator = require('validator');
const _ = require('lodash');
const { ObjectID } = require('mongodb');
const { mongoose } = require('../db/mongoose.js');
const { User } = require('../models/user');
const { RESPONSE_CODES, ERRORS, MESSAGES } = require('../utils/message.util');
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
router.get('/me', authenticate, (req, res) => {
    let user = req.user;
    res.send({user});
});

/**
 * @api {GET} /api/v2/users/:id Get User Information By Id
 * @apiGroup Users
 * @apiVersion 2.0.0
 * @apiName GetUserInfoById
 * @apiDescription This API is used to get User object by their id
 * @apiHeaderExample {string} Header-Example:
 * "Content-Type":"application/json"
 * "token":"TOKEN_GIVEN_WHEN_LOGIN"
 * @apiSuccess (Success-Response-body) {json} user User Object is return in the body
 * @apiSuccessExample {json} Success-Response-Body:
 * {
 *  "user": {
 *      "_id": "59a3699ff3517345c03faddf",
 *      "firstName": "John",
 *      "lastName": "Smith",
 *      "loginId": "john-smith@test.com",
 *      "email": "john-smith@test.com",
 *  }
 * }
 * @apiError (401) {json} WRONG_TOKEN TOKEN WAS WRONG
 * @apiError (401) {json} EXPIRED_TOKEN TOKEN WAS EXPIRED
 * @apiError (401) {json} WRONG_TOKEN INVALID USER ID
 * @apiError (401) {json} WRONG_TOKEN USER DOES NOT EXIST
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
router.get('/:id', authenticate, async (req, res) => {
    let id = req.params.id;
    if(!ObjectID.isValid(id)){
        return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.INVALID_USER_ID);
    }
    let user = await User.findById({
        _id: id
    });
    if(user){
        return res.send({user});
    }else{
        return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.USER_DOES_NOT_EXIST);
    }
});

module.exports = router;