const express = require('express');
const validator = require('validator');
const _ = require('lodash');
const { ObjectID } = require('mongodb');
const { mongoose } = require('../db/mongoose.js');
const { Community } = require('../models/community.model');
const { User } = require('../models/user.model');
const { RESPONSE_CODES, ERRORS, MESSAGES } = require('../utils/message.util');
const { authenticate } = require('../middlewares/authenticate');
const router = express.Router();
const tokenUtil = require('../utils/token.util');

/**
 * @api {GET} /communities/mine List the communities user is joined
 * @apiGroup Communities
 * @apiVersion 2.0.0
 * @apiName ListUserCommunities
 * @apiDescription This API returns the list of communities that user has joined
 * @apiHeaderExample {string} Header-Example:
 * "Content-Type":"application/json"
 * "token":"TOKEN_GIVEN_WHEN_LOGIN"
 * @apiSuccess (Success-Response-body) {json} communities Array of Communities Object is return in the body
 * @apiSuccessExample {json} Success-Response-Body:
 * {
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
router.get('/mine', authenticate, async (req, res) => {
    //We should keep the data in the Token so this code could get improved
    let _id = tokenUtil.getUserId(req.token);
    let user = await User.findById(_id);
    res.send({
        communities: user.communities
    });
});

/**
 * @api {GET} /api/v2/communities/:id Get Community by Id
 * @apiGroup Communities
 * @apiVersion 2.0.0
 * @apiName GerCommunityInfo
 * @apiDescription This API is used to get the details of a community base on its ID
 * @apiHeaderExample {string} Header-Example:
 * "Content-Type":"application/json"
 * "token":"TOKEN_GIVEN_WHEN_LOGIN"
 * @apiSuccess (Success-Response-body) {json} community Community Object is returned in the body
 * @apiSuccessExample {json} Success-Response-Body:
 * {
 *  "community": {
 *      "_id": "59a3699ff3517345c03faddf",
 *      "communityName": "The Residence",
 *      "communityDescription": "The Residence is locaed somewhere cool",
 *      "status": 1,
 *      "longitude": "38.8829024",
 *      "latitude": "-77.016375"
 *  }
 * }
 * @apiError (401) {json} INVALID_COMMUNITY_ID INVALID COMMUNITY ID
 * @apiError (401) {json} COMMUNITY_DOES_NOT_EXIST COMMUNITY DOES NOT EXIST
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
router.get('/:id', authenticate, async (req, res) => {
    let id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.INVALID_COMMUNITY_ID);
    }
    try {
        let community = await Community.findById(id);
        if (community) {
            return res.send({ community });
        } else {
            return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.COMMUNITY_DOES_NOT_EXIST);
        }
    } catch (err) {
        return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.COMMUNITY_DOES_NOT_EXIST);
    }
});


/**
 * @api {GET} /communities/:id/join Join Community by Community Id
 * @apiGroup Communities
 * @apiVersion 2.0.0
 * @apiName JoinCommunityById
 * @apiDescription This API is used for the user to join a specific community
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
 * @apiError (401) {json} INVALID_COMMUNITY_ID INVALID COMMUNITY ID
 * @apiError (401) {json} COMMUNITY_DOES_NOT_EXIST COMMUNITY DOES NOT EXIST
 * @apiError (401) {json} COMMUNITY_ALREADY_ADDED COMMUNITY ALREADY ADDED
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
router.get('/:id/join', authenticate, async (req, res) => {
    let id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.INVALID_COMMUNITY_ID);
    }
    try {
        //I also have to update the token
        //In example below, I can get the communities that user already joined from the token
        //Then if the community is going to be one of them, we do not have to go through it again
        //We can send an error of something.
        //Below example however, is working differently
        let community = await Community.findById(id);
        if (community) {
            let user = await User.findByIdAndUpdate(req.user._id, {
                $addToSet: {
                    communities: community
                }
            }, {new: true}).populate({
                path: 'communities',
                populate: {
                    path: 'communities',
                    component: 'Community'
                }
            });
            res.send({
                user,
                communities: user.communities
            })
        } else {
            return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.COMMUNITY_DOES_NOT_EXIST);
        }
    } catch (err) {
        return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.COMMUNITY_DOES_NOT_EXIST);
    }

});

module.exports = router;