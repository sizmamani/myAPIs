const express = require('express');
const _ = require('lodash');
const validator = require('validator');
const { ObjectID } = require('mongodb');
const { Community } = require('../models/community.model');
// const { User } = require('../models/user.model');
const { Post } = require('../models/post.model');
const { RESPONSE_CODES, ERRORS, MESSAGES } = require('../utils/message.util');
const { authenticate } = require('../middlewares/authenticate');
const router = express.Router();
const tokenUtil = require('../utils/token.util');

/**
 * @api {GET} /api/v2/communities/:communityId/posts List of the posts for a specific community
 * @apiGroup Posts
 * @apiVersion 2.0.0
 * @apiName ListCommunityPosts
 * @apiDescription This API returns the list of posts sent by users in a community
 * @apiHeader {string} Content-Type value should be <code>application/json</code>
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
    if (!ObjectID.isValid(communityId)) {
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
                return res.send({ posts });
            })
        } else {
            return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.USER_NOT_JOINED_COMMUNITY);
        }
    } else {
        //user does has not joined this community at all
        return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.USER_NOT_JOINED_COMMUNITY);
    }
});


/**
 * @api {GET} /api/v2/communities/:communityId/posts/:postId Returns a post by its ID
 * @apiGroup Posts
 * @apiVersion 2.0.0
 * @apiName DisplayPostByID
 * @apiDescription This API returns details of a specific post of posts sent by a user in a community
 * @apiHeader {string} Content-Type value should be <code>application/json</code>
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
    if (!ObjectID.isValid(communityId)) {
        return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.INVALID_COMMUNITY_ID);
    }
    if (!ObjectID.isValid(postId)) {
        return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.INVALID_POST_ID);
    }

    let currentCommunity = tokenUtil.getCurrentCommunityId(req.token);
    let userCommunities = tokenUtil.getUserCommunities(req.token);
    if (userCommunities.indexOf(communityId) > -1) {
        //Means user has joined this community so we need to check if this is his current community
        if (currentCommunity === communityId) {
            Post.findById(postId).then((post) => {
                if (!post) {
                    return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.POST_DOES_NOT_EXIST);
                }
                if (post.status !== 1) {
                    return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.POST_CANNOT_BE_VIEWED);
                }
                return res.send({ post });
            })
        } else {
            return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.NOT_CURRENT_COMMUNITY);
        }
    } else {
        //user does has not joined this community at all
        return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.USER_NOT_JOINED_COMMUNITY);
    }
});


/**
 * @api {GET} /api/v2/communities/:communityId/posts/:postId/comments Returns comments of a post by its ID
 * @apiGroup Posts
 * @apiVersion 2.0.0
 * @apiName DisplayCommentsByPostID
 * @apiDescription This API returns array of comments of a specific post
 * @apiHeader {string} Content-Type value should be <code>application/json</code>
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
    if (!ObjectID.isValid(communityId)) {
        return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.INVALID_COMMUNITY_ID);
    }
    if (!ObjectID.isValid(postId)) {
        return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.INVALID_POST_ID);
    }

    let currentCommunity = tokenUtil.getCurrentCommunityId(req.token);
    let userCommunities = tokenUtil.getUserCommunities(req.token);
    if (userCommunities.indexOf(communityId) > -1) {
        //Means user has joined this community so we need to check if this is his current community
        if (currentCommunity === communityId) {
            Post.findById(postId).then((post) => {
                if (!post) {
                    return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.POST_DOES_NOT_EXIST);
                }
                if (post.status !== 1) {
                    return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.POST_CANNOT_BE_VIEWED);
                }
                return res.send({
                    postId: post._id,
                    comments: post.comments
                });
            })
        } else {
            return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.NOT_CURRENT_COMMUNITY);
        }
    } else {
        //user does has not joined this community at all
        return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.USER_NOT_JOINED_COMMUNITY);
    }
});

/**
 * @api {GET} /api/v2/communities/:communityId/posts/:postId/likes Returns likes of a post by its ID
 * @apiGroup Posts
 * @apiVersion 2.0.0
 * @apiName DisplayLikesByPostID
 * @apiDescription This API returns array of likes of a specific post
 * @apiHeader {string} Content-Type value should be <code>application/json</code>
 * @apiHeaderExample {string} Header-Example:
 * "Content-Type":"application/json"
 * "token":"TOKEN_GIVEN_WHEN_LOGIN"
 * @apiSuccess (Success-Response-body) {json} Post ID and Array of likes of that post
 * @apiSuccessExample {json} Success-Response-Body:
 * {
 *  postId: "59c21ca85408cc5ff2948d95"
 *  "likes": [{
 *              "likedByName": "John Smith",
 *              "likedBy": "59c1a54fb64f1b4a5526c524"
 *          },{
 *              "likedByName": "Mike Doe",
 *              "likedBy": "59c1a54fb64f1b4a5526c525"
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
router.get('/:communityId/posts/:postId/likes', authenticate, (req, res) => {
    let communityId = req.params.communityId;
    let postId = req.params.postId;
    if (!ObjectID.isValid(communityId)) {
        return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.INVALID_COMMUNITY_ID);
    }
    if (!ObjectID.isValid(postId)) {
        return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.INVALID_POST_ID);
    }

    let currentCommunity = tokenUtil.getCurrentCommunityId(req.token);
    let userCommunities = tokenUtil.getUserCommunities(req.token);
    if (userCommunities.indexOf(communityId) > -1) {
        //Means user has joined this community so we need to check if this is his current community
        if (currentCommunity === communityId) {
            Post.findById(postId).then((post) => {
                if (!post) {
                    return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.POST_DOES_NOT_EXIST);
                }
                if (post.status !== 1) {
                    return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.POST_CANNOT_BE_VIEWED);
                }
                return res.send({
                    postId: post._id,
                    likes: post.likes
                });
            })
        } else {
            return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.NOT_CURRENT_COMMUNITY);
        }
    } else {
        //user does has not joined this community at all
        return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.USER_NOT_JOINED_COMMUNITY);
    }
});

/**
 * @api {POST} /api/v2/communities/:communityId/posts/:postId/likes Returns likes of a post by its ID
 * @apiGroup Posts
 * @apiVersion 2.0.0
 * @apiName DisplayLikesByPostID
 * @apiDescription This API returns array of likes of a specific post
 * @apiHeader {string} Content-Type value should be <code>application/json</code>
 * @apiHeaderExample {string} Header-Example:
 * "Content-Type":"application/json"
 * "token":"TOKEN_GIVEN_WHEN_LOGIN"
 * @apiParamExample {json} Request-Sample:
 * {
 *  "post": {
 *      "description": "New Post by User"
 *  }
 * }
 * @apiSuccess (Success-Response-body) {json} Post ID and Array of likes of that post
 * @apiSuccessExample {json} Success-Response-Body:
 * {
 *  postId: "59c21ca85408cc5ff2948d95"
 *  "likes": [{
 *              "likedByName": "John Smith",
 *              "likedBy": "59c1a54fb64f1b4a5526c524"
 *          },{
 *              "likedByName": "Mike Doe",
 *              "likedBy": "59c1a54fb64f1b4a5526c525"
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
router.post('/:communityId/posts', authenticate, async (req, res) => {
    let communityId = req.params.communityId;
    if (!ObjectID.isValid(communityId)) {
        return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.INVALID_COMMUNITY_ID);
    }

    if (validator.isEmpty(req.body.post.description)) {
        return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.POST_DESCRIPTION_IS_REQUIRED);
    }
    let currentCommunity = tokenUtil.getCurrentCommunityId(req.token);
    let userCommunities = tokenUtil.getUserCommunities(req.token);
    if (userCommunities.indexOf(communityId) > -1) {
        //Means user has joined this community so we need to check if this is his current community
        if (currentCommunity === communityId) {
            let userId = tokenUtil.getUserId(req.token);
            let post = new Post();
            post.description = req.body.post.description;
            post.postedBy = userId;
            post.status = 1;
            post.community = currentCommunity;
            try {
                await post.save();
                await Community.findByIdAndUpdate(currentCommunity, {
                    $addToSet: {
                        posts: post._id
                    }
                },
                    { new: true }
                )
                return res.send({ post })
            } catch (err) {
                return res.status(RESPONSE_CODES.UNAUTHORIZED).send(err);
            }
        } else {
            return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.NOT_CURRENT_COMMUNITY);
        }
    } else {
        //user does has not joined this community at all
        return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.USER_NOT_JOINED_COMMUNITY);
    }
});

/**
 * @api {PATCH} /api/v2/communities/:communityId/posts/:postId Updates a post by Id
 * @apiGroup Posts
 * @apiVersion 2.0.0
 * @apiName UpdatePostByPostID
 * @apiDescription This API update user's post by postId
 * @apiHeader {string} Content-Type value should be <code>application/json</code>
 * @apiHeaderExample {string} Header-Example:
 * "Content-Type":"application/json"
 * "token":"TOKEN_GIVEN_WHEN_LOGIN"
 * @apiSuccess (Success-Response-body) {json} Updated Post will be returned
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
 * @apiError (401) {json} POST_OWNER_UPDATE_ONLY ONLY POST OWNER CAN UPDATE THE POST
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
router.patch('/:communityId/posts/:postId', authenticate, async (req, res) => {
    let communityId = req.params.communityId;
    let postId = req.params.postId;
    if (!ObjectID.isValid(communityId)) {
        return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.INVALID_COMMUNITY_ID);
    }
    if (!ObjectID.isValid(postId)) {
        return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.INVALID_POST_ID);
    }

    let currentCommunity = tokenUtil.getCurrentCommunityId(req.token);
    let userCommunities = tokenUtil.getUserCommunities(req.token);
    if (userCommunities.indexOf(communityId) > -1) {
        //Means user has joined this community so we need to check if this is his current community
        let userId = tokenUtil.getUserId(req.token);
        if (currentCommunity === communityId) {
            let post = await Post.findById(postId);
            if (!post) {
                return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.POST_DOES_NOT_EXIST);
            } else {
                if (!post.postedBy.equals(userId)) {
                    return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.POST_OWNER_UPDATE_ONLY);
                } else {
                    Post.findByIdAndUpdate(postId, {
                        $set: {
                            description: req.body.post.description,
                            status: req.body.post.status
                        }
                    }, {
                        new: true
                    }).then((post) => {
                        res.send({
                            post
                        });
                    }).catch((err) => {
                        return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.UNKNOW_ERROR);
                    });
                }
            }
        } else {
            return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.NOT_CURRENT_COMMUNITY);
        }
    } else {
        //user does has not joined this community at all
        return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.USER_NOT_JOINED_COMMUNITY);
    }
});
module.exports = router;