const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { communities, populateCommunities } = require('./seed/community_seed');
const { users, populateUsers } = require('./seed/user_seed');
const { populatePosts, posts } = require('./seed/posts_seed');
const { RESPONSE_CODES, ERRORS } = require('../utils/message.util');
const { Community } = require('../models/community.model');
const { Post } = require('../models/post.model');
const tokenUtil = require('../utils/token.util');
const _ = require('lodash');
//const { populateUserCommunity } = require('./seed/user_community_seed');

const URL = '/api/v2/communities';

beforeEach(populateCommunities);
beforeEach(populateUsers);
//beforeEach(populateUserCommunity);
beforeEach(populatePosts);


describe('COMMUNITY POSTS TEST', () => {
    describe('GET /communities/:communityId/posts', () => {
        it('should lists all the posts from a specific community', (done) => {
            user = _.omit(users[1], ['password']);
            user.communities = [];
            user.communities.push(communities[0]._id);
            user.communities.push(communities[1]._id);
            user.currentCommunity = communities[0]._id;
            let data = {
                user
            };
            let token = tokenUtil.generateToken(data);
            request(app)
                .get(`${URL}/${communities[0]._id}/posts`)
                .set('token', token)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toExist();
                    expect(res.body.posts).toExist();
                    expect(res.body.posts.length).toBe(2);
                    expect(res.body.posts[0].community).toEqual(communities[0]._id);
                    expect(res.body.posts[0].postedBy).toEqual(users[1]._id);
                    expect(res.body.posts[0].description).toBe(posts[0].description);
                    expect(res.body.posts[0].comments).toExist();
                    expect(res.body.posts[0].comments.length).toBe(2);
                    expect(res.body.posts[0].comments[0].commentedBy).toEqual(users[1]._id);
                    expect(res.body.posts[0].likes).toExist();
                    expect(res.body.posts[0].likes.length).toBe(1);
                    expect(res.body.posts[0].likes[0].likedBy).toEqual(users[1]._id);
                })
                .end(done);
        });
        it('should not list anything if community has posts but user does not belong to this community', (done) => {
            user = _.omit(users[1], ['password']);
            user.communities = [];
            user.communities.push(communities[0]._id);
            user.communities.push(communities[1]._id);
            user.currentCommunity = communities[1]._id;
            let data = {
                user
            };
            let token = tokenUtil.generateToken(data);
            request(app)
                .get(`${URL}/${communities[0]._id}/posts`)
                .set('token', token)
                .expect(RESPONSE_CODES.UNAUTHORIZED)
                .expect((res) => {
                    expect(res.body.error).toExist();
                    expect(res.body.error).toInclude(ERRORS.USER_NOT_JOINED_COMMUNITY.error);
                    expect(res.body.error.code).toBe(ERRORS.USER_NOT_JOINED_COMMUNITY.error.code);
                    expect(res.body.error.message).toBe(ERRORS.USER_NOT_JOINED_COMMUNITY.error.message);
                })
                .end(done);
        });

        it('should not list the posts with status other than 1 (1 means active)', (done) => {
            user = _.omit(users[1], ['password']);
            user.communities = [];
            user.communities.push(communities[0]._id);
            user.communities.push(communities[1]._id);
            user.currentCommunity = communities[0]._id;
            let data = {
                user
            };
            let token = tokenUtil.generateToken(data);
            request(app)
                .get(`${URL}/${communities[0]._id}/posts`)
                .set('token', token)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toExist();
                    expect(res.body.posts).toExist();
                    expect(res.body.posts.length).toBe(2);
                })
                .end(done);
        });
    });



    describe('GET /communities/:communityId/posts/:postId', () => {
        it('should return a specific post by its ID', (done) => {
            user = _.omit(users[1], ['password']);
            user.communities = [];
            user.communities.push(communities[0]._id);
            user.communities.push(communities[1]._id);
            user.currentCommunity = communities[0]._id;
            let data = {
                user
            };
            let token = tokenUtil.generateToken(data);
            request(app)
                .get(`${URL}/${communities[0]._id}/posts/${posts[0]._id}`)
                .set('token', token)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toExist();
                    expect(res.body.post).toExist();
                    expect(res.body.post.description).toBe(posts[0].description);
                    expect(res.body.post.community).toEqual(posts[0].community);
                    expect(res.body.post.status).toBe(1);
                })
                .end(done);
        });
        it('should not return a post if postId is not valid', (done) => {
            user = _.omit(users[1], ['password']);
            user.communities = [];
            user.communities.push(communities[0]._id);
            user.communities.push(communities[1]._id);
            user.currentCommunity = communities[1]._id;
            let data = {
                user
            };
            let token = tokenUtil.generateToken(data);
            request(app)
                .get(`${URL}/${communities[0]._id}/posts/1234`)
                .set('token', token)
                .expect(RESPONSE_CODES.UNAUTHORIZED)
                .expect((res) => {
                    expect(res.body.error).toExist();
                    expect(res.body.error).toInclude(ERRORS.INVALID_POST_ID.error);
                    expect(res.body.error.code).toBe(ERRORS.INVALID_POST_ID.error.code);
                    expect(res.body.error.message).toBe(ERRORS.INVALID_POST_ID.error.message);
                })
                .end(done);
        });
        it('should not return a post if post does not exist', (done) => {
            user = _.omit(users[1], ['password']);
            user.communities = [];
            user.communities.push(communities[0]._id);
            user.communities.push(communities[1]._id);
            user.currentCommunity = communities[0]._id;
            let data = {
                user
            };
            let token = tokenUtil.generateToken(data);
            request(app)
                .get(`${URL}/${communities[0]._id}/posts/${new ObjectID()}`)
                .set('token', token)
                .expect(RESPONSE_CODES.UNAUTHORIZED)
                .expect((res) => {
                    expect(res.body.error).toExist();
                    expect(res.body.error).toInclude(ERRORS.POST_DOES_NOT_EXIST.error);
                    expect(res.body.error.code).toBe(ERRORS.POST_DOES_NOT_EXIST.error.code);
                    expect(res.body.error.message).toBe(ERRORS.POST_DOES_NOT_EXIST.error.message);
                })
                .end(done);
        });
        it('should not return a post of post exists but status is not 1', (done) => {
            user = _.omit(users[1], ['password']);
            user.communities = [];
            user.communities.push(communities[0]._id);
            user.communities.push(communities[1]._id);
            user.currentCommunity = communities[0]._id;
            let data = {
                user
            };
            let token = tokenUtil.generateToken(data);
            request(app)
                .get(`${URL}/${communities[0]._id}/posts/${posts[2]._id}`)
                .set('token', token)
                .expect(RESPONSE_CODES.UNAUTHORIZED)
                .expect((res) => {
                    expect(res.body.error).toExist();
                    expect(res.body.error).toInclude(ERRORS.POST_CANNOT_BE_VIEWED.error);
                    expect(res.body.error.code).toBe(ERRORS.POST_CANNOT_BE_VIEWED.error.code);
                    expect(res.body.error.message).toBe(ERRORS.POST_CANNOT_BE_VIEWED.error.message);
                })
                .end(done);
        });
    });
});