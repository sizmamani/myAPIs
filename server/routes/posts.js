const express = require('express');
const _ = require('lodash');
const { ObjectID } = require('mongodb');
// const { Community } = require('../models/community.model');
// const { User } = require('../models/user.model');
const { Post } = require('../models/post.model');
const { RESPONSE_CODES, ERRORS, MESSAGES } = require('../utils/message.util');
const { authenticate } = require('../middlewares/authenticate');
const router = express.Router();
const tokenUtil = require('../utils/token.util');

/**
 * @api {GET} /:communityId/posts List of the posts for a specific community
 * @apiGroup Posts
 * @apiVersion 2.0.0
 * @apiName ListCommunityPosts
 * @apiDescription This API returns the list of posts sent by users in a community
 * @apiHeaderExample {string} Header-Example:
 * "Content-Type":"application/json"
 * "token":"TOKEN_GIVEN_WHEN_LOGIN"
 * @apiSuccess (Success-Response-body) {json} Array of Posts Object is return in the body
 * @apiSuccessExample {json} Success-Response-Body:
 * {
 *  "posts": [{
 *      "description": "First post done by one neighbour about something",
 *      "images": ["imageOne", "imageTwo", "imageThree"],
 *      "postedBy": "59c1a54fb64f1b4a5526c524"
 *      "status": 1,
 *      "community": "59c1a54fb64f1b4a5526c521",
 *      "comments": [{
 *          "comment": "First Comment, It is an interesting first post",
 *          "commentDate": "2017-09-19T23:16:31.497Z",
 *          "commentedBy": "59c1a54fb64f1b4a5526c525"
 *      }, {
 *          "comment": "Second Comment, It is an interesting Second post",
 *          "commentDate": "2017-09-19T23:16:31.497Z",
 *          "commentedBy": "59c1a54fb64f1b4a5526c524"
 *      }],
 *      "likes":["59c1a54fb64f1b4a5526c524", "59c1a54fb64f1b4a5526c525"]
 *  }, {
 *      "description": "Second post done by one neighbour about something",
 *      "images": ["imageOne", "imageTwo", "imageThree"],
 *      "postedBy": "59c1a54fb64f1b4a5526c525"
 *      "status": 1,
 *      "community": "59c1a54fb64f1b4a5526c521",
 *      "comments": [{
 *          "comment": "First Comment, It is an interesting first post",
 *          "commentDate": "2017-09-19T23:16:31.497Z",
 *          "commentedBy": "59c1a54fb64f1b4a5526c524"
 *      }, {
 *          "comment": "Second Comment, It is an interesting Second post",
 *          "commentDate": "2017-09-19T23:16:31.497Z",
 *          "commentedBy": "59c1a54fb64f1b4a5526c524"
 *      }],
 *      "likes":[{
 *          "likedByName": "John Smith",
 *          "likedBy": "59c1a54fb64f1b4a5526c524"
 *      },{
 *          "likedByName": "Mike Doe",
 *          "likedBy": "59c1a54fb64f1b4a5526c525"
 *      }]
 *  }]
 * }
 * @apiError (401) {json} INVALID_COMMUNITY_ID INVALID COMMUNITY ID
 * @apiError (401) {json} USER_NOT_JOINED_COMMUNITY USER IS NOT MEMBER OF THE COMMUNITY
 * @apiError (401) {json} NOT_CURRENT_COMMUNITY USER SHOULD SWITCH TO ANOTHER COMMUNITY TO VIEW THE POSTS
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
router.get('/:communityId/posts', authenticate, (req, res) => {
    let communityId = req.params.communityId;
    if(!ObjectID.isValid(communityId)){
        return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.INVALID_COMMUNITY_ID);
    }
    let currentCommunity = tokenUtil.getCurrentCommunityId(req.token);
    let userCommunities = tokenUtil.getUserCommunities(req.token);
    if (userCommunities.indexOf(communityId) > -1) {
        //Means user has joined this community so we need to check if this is his current community
        if (currentCommunity === communityId) {
            Post.find({
                community: communityId,
                status: 1
            }).then((posts) => {
                return res.send({posts});
            })
        }else{
            return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.USER_NOT_JOINED_COMMUNITY);    
        }
    }else{
        //user does has not joined this community at all
        return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.USER_NOT_JOINED_COMMUNITY);
    }
});


/**
 * @api {GET} /:communityId/posts/:postId Returns a post by its ID
 * @apiGroup Posts
 * @apiVersion 2.0.0
 * @apiName DisplayPostByID
 * @apiDescription This API returns details of a specific post of posts sent by a user in a community
 * @apiHeaderExample {string} Header-Example:
 * "Content-Type":"application/json"
 * "token":"TOKEN_GIVEN_WHEN_LOGIN"
 * @apiSuccess (Success-Response-body) {json} Post Object is return in the body
 * @apiSuccessExample {json} Success-Response-Body:
 * {
 *  "post": {
 *      "description": "First post done by one neighbour about something",
 *      "images": ["imageOne", "imageTwo", "imageThree"],
 *      "postedBy": "59c1a54fb64f1b4a5526c524"
 *      "status": 1,
 *      "community": "59c1a54fb64f1b4a5526c521",
 *      "comments": [{
 *          "comment": "First Comment, It is an interesting first post",
 *          "commentDate": "2017-09-19T23:16:31.497Z",
 *          "commentedBy": "59c1a54fb64f1b4a5526c525"
 *      }, {
 *          "comment": "Second Comment, It is an interesting Second post",
 *          "commentDate": "2017-09-19T23:16:31.497Z",
 *          "commentedBy": "59c1a54fb64f1b4a5526c524"
 *      }],
 *      "likes":["59c1a54fb64f1b4a5526c524", "59c1a54fb64f1b4a5526c525"]
 *  }
 * }
 * @apiError (401) {json} INVALID_COMMUNITY_ID INVALID COMMUNITY ID
 * @apiError (401) {json} INVALID_POST_ID INVALID POST ID
 * @apiError (401) {json} USER_NOT_JOINED_COMMUNITY USER IS NOT MEMBER OF THE COMMUNITY
 * @apiError (401) {json} POST_DOES_NOT_EXIST POST DOES NOT EXIST
 * @apiError (401) {json} POST_CANNOT_BE_VIEWED POST CANNOT BE VIEWED
 * @apiError (401) {json} NOT_CURRENT_COMMUNITY USER SHOULD SWITCH TO ANOTHER COMMUNITY TO VIEW THE POSTS
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
router.get('/:communityId/posts/:postId', authenticate, (req, res) => {
    let communityId = req.params.communityId;
    let postId = req.params.postId;
    if(!ObjectID.isValid(communityId)){
        return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.INVALID_COMMUNITY_ID);
    }
    if(!ObjectID.isValid(postId)){
        return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.INVALID_POST_ID);
    }

    let currentCommunity = tokenUtil.getCurrentCommunityId(req.token);
    let userCommunities = tokenUtil.getUserCommunities(req.token);
    if (userCommunities.indexOf(communityId) > -1) {
        //Means user has joined this community so we need to check if this is his current community
        if (currentCommunity === communityId) {
            Post.findById(postId).then((post) => {
                if(!post){
                    return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.POST_DOES_NOT_EXIST);
                }
                if(post.status !== 1){
                    return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.POST_CANNOT_BE_VIEWED);    
                }
                return res.send({post});
            })
        }else{
            return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.NOT_CURRENT_COMMUNITY);    
        }
    }else{
        //user does has not joined this community at all
        return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.USER_NOT_JOINED_COMMUNITY);
    }
});


/**
 * @api {GET} /:communityId/posts/:postId/comments Returns comments of a post by its ID
 * @apiGroup Posts
 * @apiVersion 2.0.0
 * @apiName DisplayCommentsByPostID
 * @apiDescription This API returns array of comments of a specific post
 * @apiHeaderExample {string} Header-Example:
 * "Content-Type":"application/json"
 * "token":"TOKEN_GIVEN_WHEN_LOGIN"
 * @apiSuccess (Success-Response-body) {json} Post ID and Array of comments of that post
 * @apiSuccessExample {json} Success-Response-Body:
 * {
 *  postId: "59c21ca85408cc5ff2948d95"
 *  "comments": [{
 *              "comment": "Second Comment, It is an interesting first post",
 *              "commentDate": "2017-09-19T23:16:31.497Z",
 *              "commentedBy": "59c1a54fb64f1b4a5526c524"
 *          },{
 *              "comment": "Second Comment, It is an interesting first post",
 *              "commentDate": "2017-09-19T23:16:31.497Z",
 *              "commentedBy": "59c1a54fb64f1b4a5526c524"
 *          }
 *  ]
 * }
 * @apiError (401) {json} INVALID_COMMUNITY_ID INVALID COMMUNITY ID
 * @apiError (401) {json} INVALID_POST_ID INVALID POST ID
 * @apiError (401) {json} USER_NOT_JOINED_COMMUNITY USER IS NOT MEMBER OF THE COMMUNITY
 * @apiError (401) {json} POST_DOES_NOT_EXIST POST DOES NOT EXIST
 * @apiError (401) {json} POST_CANNOT_BE_VIEWED POST CANNOT BE VIEWED
 * @apiError (401) {json} NOT_CURRENT_COMMUNITY USER SHOULD SWITCH TO ANOTHER COMMUNITY TO VIEW THE POSTS
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
router.get('/:communityId/posts/:postId/comments', authenticate, (req, res) => {
    let communityId = req.params.communityId;
    let postId = req.params.postId;
    if(!ObjectID.isValid(communityId)){
        return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.INVALID_COMMUNITY_ID);
    }
    if(!ObjectID.isValid(postId)){
        return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.INVALID_POST_ID);
    }

    let currentCommunity = tokenUtil.getCurrentCommunityId(req.token);
    let userCommunities = tokenUtil.getUserCommunities(req.token);
    if (userCommunities.indexOf(communityId) > -1) {
        //Means user has joined this community so we need to check if this is his current community
        if (currentCommunity === communityId) {
            Post.findById(postId).then((post) => {
                if(!post){
                    return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.POST_DOES_NOT_EXIST);
                }
                if(post.status !== 1){
                    return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.POST_CANNOT_BE_VIEWED);    
                }
                return res.send({
                    postId: post._id,
                    comments: post.comments
                });
            })
        }else{
            return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.NOT_CURRENT_COMMUNITY);    
        }
    }else{
        //user does has not joined this community at all
        return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.USER_NOT_JOINED_COMMUNITY);
    }
});

router.get('/:communityId/posts/:postId/likes', authenticate, (req, res) => {
    res.send('Hello POSTS');
});

module.exports = router;