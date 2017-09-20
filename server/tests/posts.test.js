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
        it('should not return a post if post exists but status is not 1', (done) => {
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

    
    describe('GET /communities/:communityId/posts/:postId/comments', () => {
        it('should return list of comments of a specific post', (done) => {
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
                .get(`${URL}/${communities[0]._id}/posts/${posts[0]._id}/comments`)
                .set('token', token)
                .expect(200)
                .expect((res) => {
                    expect(res.body.postId).toEqual(posts[0]._id);
                    expect(res.body.comments).toExist();
                    expect(res.body.comments.length).toBeGreaterThan(1);
                })
                .end(done);
        });

        it('should reject if the user is not part of that community', (done) => {
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
            .get(`${URL}/${communities[1]._id}/posts/${posts[0]._id}/comments`)
            .set('token', token)
            .expect(RESPONSE_CODES.UNAUTHORIZED)
            .expect((res) => {
                expect(res.body.error).toExist();
                expect(res.body.error).toInclude(ERRORS.NOT_CURRENT_COMMUNITY.error);
                expect(res.body.error.code).toBe(ERRORS.NOT_CURRENT_COMMUNITY.error.code);
                expect(res.body.error.message).toBe(ERRORS.NOT_CURRENT_COMMUNITY.error.message);
            })
            .end(done);
        });

        it('should reject if the postId is not valid', (done) => {
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
            .get(`${URL}/${communities[0]._id}/posts/123456/comments`)
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

        it('should reject if the post does not exists', (done) => {
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
            .get(`${URL}/${communities[0]._id}/posts/${new ObjectID()}/comments`)
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

        it('should reject if the post is not viewable', (done) => {
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
            .get(`${URL}/${communities[0]._id}/posts/${posts[2]._id}/comments`)
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

    describe('GET /communities/:communityId/posts/:postId/likes', () => {
        it('should return list of likes of a specific post', (done) => {
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
                .get(`${URL}/${communities[0]._id}/posts/${posts[0]._id}/likes`)
                .set('token', token)
                .expect(200)
                .expect((res) => {
                    expect(res.body.postId).toEqual(posts[0]._id);
                    expect(res.body.likes).toExist();
                    expect(res.body.likes.length).toBeGreaterThan(0);
                })
                .end(done);
        });

        it('should reject if the user is not part of that community', (done) => {
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
            .get(`${URL}/${communities[1]._id}/posts/${posts[0]._id}/likes`)
            .set('token', token)
            .expect(RESPONSE_CODES.UNAUTHORIZED)
            .expect((res) => {
                expect(res.body.error).toExist();
                expect(res.body.error).toInclude(ERRORS.NOT_CURRENT_COMMUNITY.error);
                expect(res.body.error.code).toBe(ERRORS.NOT_CURRENT_COMMUNITY.error.code);
                expect(res.body.error.message).toBe(ERRORS.NOT_CURRENT_COMMUNITY.error.message);
            })
            .end(done);
        });

        it('should reject if the postId is not valid', (done) => {
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
            .get(`${URL}/${communities[0]._id}/posts/123456/likes`)
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

        it('should reject if the post does not exists', (done) => {
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
            .get(`${URL}/${communities[0]._id}/posts/${new ObjectID()}/likes`)
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

        it('should reject if the post is not viewable', (done) => {
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
            .get(`${URL}/${communities[0]._id}/posts/${posts[2]._id}/likes`)
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


    describe('POST /communities/:communityId/posts', () => {
        it('should send a post to the user community', (done) => {
            user = _.omit(users[1], ['password']);
            user.communities = [];
            user.communities.push(communities[0]._id);
            user.communities.push(communities[1]._id);
            user.currentCommunity = communities[0]._id;
            let data = {
                user
            };
            let token = tokenUtil.generateToken(data);

            let post = {
                description: `Post sent by ${users[1].firstName} ${users[1].lastName}`
            }
            let _id = null;
            request(app)
                .post(`${URL}/${communities[0]._id}/posts`)
                .set('token', token)
                .send({
                    post
                })
                .expect(200)
                .expect((res) => {
                    _id = res.body.post._id;
                    expect(res.body.post).toExist();
                    expect(res.body.post._id).toExist();
                    expect(res.body.post.description).toBe(post.description);
                    expect(res.body.post.status).toBe(1);
                    expect(res.body.post.postedBy).toEqual(users[1]._id);
                })
                .end((err) => {
                    if(err){
                        return done(err);
                    }
                    Post.findById(_id)
                        .then((post) => {
                            expect(post).toExist();
                            expect(post.description).toBe(post.description);
                            Community.findById(communities[0]._id)
                                .then((community) => {
                                    expect(community).toExist();
                                    expect(community.posts).toExist();
                                    expect(community.posts).toInclude(_id);
                                });
                            done();
                    }).catch((err) => {
                        return done(err);
                    });
                });
        });

        it('should not post if description is empty', (done) => {
            user = _.omit(users[1], ['password']);
            user.communities = [];
            user.communities.push(communities[0]._id);
            user.communities.push(communities[1]._id);
            user.currentCommunity = communities[0]._id;
            let data = {
                user
            };
            let token = tokenUtil.generateToken(data);

            let post = {
                description: ''
            }
            request(app)
            .post(`${URL}/${communities[0]._id}/posts`)
            .set('token', token)
            .send({
                post
            })
            .expect(RESPONSE_CODES.UNAUTHORIZED)
            .expect((res) => {
                expect(res.body.error).toExist();
                expect(res.body.error).toInclude(ERRORS.POST_DESCRIPTION_IS_REQUIRED.error);
                expect(res.body.error.code).toBe(ERRORS.POST_DESCRIPTION_IS_REQUIRED.error.code);
                expect(res.body.error.message).toBe(ERRORS.POST_DESCRIPTION_IS_REQUIRED.error.message);
            })
            .end(done);
        });

        it('should not post if current community is different', (done) => {
            user = _.omit(users[1], ['password']);
            user.communities = [];
            user.communities.push(communities[0]._id);
            user.communities.push(communities[1]._id);
            user.currentCommunity = communities[0]._id;
            let data = {
                user
            };
            let token = tokenUtil.generateToken(data);

            let post = {
                description: 'Some Description'
            }
            request(app)
            .post(`${URL}/${communities[1]._id}/posts`)
            .set('token', token)
            .send({
                post
            })
            .expect(RESPONSE_CODES.UNAUTHORIZED)
            .expect((res) => {
                expect(res.body.error).toExist();
                expect(res.body.error).toInclude(ERRORS.NOT_CURRENT_COMMUNITY.error);
                expect(res.body.error.code).toBe(ERRORS.NOT_CURRENT_COMMUNITY.error.code);
                expect(res.body.error.message).toBe(ERRORS.NOT_CURRENT_COMMUNITY.error.message);
            })
            .end(done);
        });

        it('should not post if user is not member of the community', (done) => {
            user = _.omit(users[1], ['password']);
            user.communities = [];
            user.communities.push(communities[0]._id);
            user.currentCommunity = communities[0]._id;
            let data = {
                user
            };
            let token = tokenUtil.generateToken(data);

            let post = {
                description: 'Some Description'
            }
            request(app)
            .post(`${URL}/${communities[1]._id}/posts`)
            .set('token', token)
            .send({
                post
            })
            .expect(RESPONSE_CODES.UNAUTHORIZED)
            .expect((res) => {
                expect(res.body.error).toExist();
                expect(res.body.error).toInclude(ERRORS.USER_NOT_JOINED_COMMUNITY.error);
                expect(res.body.error.code).toBe(ERRORS.USER_NOT_JOINED_COMMUNITY.error.code);
                expect(res.body.error.message).toBe(ERRORS.USER_NOT_JOINED_COMMUNITY.error.message);
            })
            .end(done);
        });
    });


    describe('PATCH /:communityId/posts/:postId', () => {
        it('should update a post by post id', (done) => {
            user = _.omit(users[1], ['password']);
            user.communities = [];
            user.communities.push(communities[0]._id);
            user.communities.push(communities[1]._id);
            user.currentCommunity = communities[0]._id;
            let data = {
                user
            };
            let token = tokenUtil.generateToken(data);

            let post = {
                description: 'New Description',
                status: 2
            };
            request(app)
            .patch(`${URL}/${communities[0]._id}/posts/${posts[0]._id}`)
            .set('token', token)
            .send({
                post
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.post).toExist();
                expect(res.body.post._id).toEqual(posts[0]._id);
                expect(res.body.post.status).toBe(post.status);
                expect(res.body.post.description).toBe(post.description);
            })
            .end((err) => {
                if(err){
                    return done(err);
                }
                Post.findById(posts[0]._id)
                    .then((post) => {
                        expect(post).toExist();
                        expect(post._id).toEqual(posts[0]._id);
                        expect(post.status).toBe(post.status);
                        expect(post.description).toBe(post.description);
                        done();
                    }).catch((err) => {
                        return done(err);
                    });
            })
        });
        it('should not update if post does not exist', (done) => {
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
            .patch(`${URL}/${communities[0]._id}/posts/${new ObjectID()}`)
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
        it('should not update if postId is invalid', (done) => {
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
            .patch(`${URL}/${communities[0]._id}/posts/123456`)
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
        it('should not update if communityId is invalid', (done) => {
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
            .patch(`${URL}/123456/posts/${new ObjectID()}`)
            .set('token', token)
            .expect(RESPONSE_CODES.UNAUTHORIZED)
            .expect((res) => {
                expect(res.body.error).toExist();
                expect(res.body.error).toInclude(ERRORS.INVALID_COMMUNITY_ID.error);
                expect(res.body.error.code).toBe(ERRORS.INVALID_COMMUNITY_ID.error.code);
                expect(res.body.error.message).toBe(ERRORS.INVALID_COMMUNITY_ID.error.message);
            })
            .end(done);
        });
        
        it('should not update a post if that does not belong to the user', (done) => {
            user = _.omit(users[0], ['password']);
            user.communities = [];
            user.communities.push(communities[0]._id);
            user.communities.push(communities[1]._id);
            user.currentCommunity = communities[0]._id;
            let data = {
                user
            };
            let token = tokenUtil.generateToken(data);

            let post = {
                description: 'New Description',
                status: 2
            };
            request(app)
            .patch(`${URL}/${communities[0]._id}/posts/${posts[0]._id}`)
            .set('token', token)
            .send({
                post
            })
            .expect(RESPONSE_CODES.UNAUTHORIZED)
            .expect((res) => {
                expect(res.body.error).toExist();
                expect(res.body.error).toInclude(ERRORS.POST_OWNER_UPDATE_ONLY.error);
                expect(res.body.error.code).toBe(ERRORS.POST_OWNER_UPDATE_ONLY.error.code);
                expect(res.body.error.message).toBe(ERRORS.POST_OWNER_UPDATE_ONLY.error.message);
            })
            .end(done);
        });

        it('should not update if current community is different', (done) => {
            user = _.omit(users[1], ['password']);
            user.communities = [];
            user.communities.push(communities[0]._id);
            user.communities.push(communities[1]._id);
            user.currentCommunity = communities[0]._id;
            let data = {
                user
            };
            let token = tokenUtil.generateToken(data);

            let post = {
                description: 'New Description',
                status: 2
            };
            request(app)
            .patch(`${URL}/${communities[1]._id}/posts/${posts[0]._id}`)
            .set('token', token)
            .send({
                post
            })
            .expect(RESPONSE_CODES.UNAUTHORIZED)
            .expect((res) => {
                expect(res.body.error).toExist();
                expect(res.body.error).toInclude(ERRORS.NOT_CURRENT_COMMUNITY.error);
                expect(res.body.error.code).toBe(ERRORS.NOT_CURRENT_COMMUNITY.error.code);
                expect(res.body.error.message).toBe(ERRORS.NOT_CURRENT_COMMUNITY.error.message);
            })
            .end(done);
        });

        it('should not update post if user is not member of the community', (done) => {
            user = _.omit(users[1], ['password']);
            user.communities = [];
            user.communities.push(communities[0]._id);
            user.currentCommunity = communities[0]._id;
            let data = {
                user
            };
            let token = tokenUtil.generateToken(data);

            let post = {
                description: 'New Description',
                status: 2
            };
            request(app)
            .patch(`${URL}/${communities[1]._id}/posts/${posts[0]._id}`)
            .set('token', token)
            .send({
                post
            })
            .expect(RESPONSE_CODES.UNAUTHORIZED)
            .expect((res) => {
                expect(res.body.error).toExist();
                expect(res.body.error).toInclude(ERRORS.USER_NOT_JOINED_COMMUNITY.error);
                expect(res.body.error.code).toBe(ERRORS.USER_NOT_JOINED_COMMUNITY.error.code);
                expect(res.body.error.message).toBe(ERRORS.USER_NOT_JOINED_COMMUNITY.error.message);
            })
            .end(done);
        });
    })
});
//./node_modules/mocha/bin/mocha server/tests/posts.test.js