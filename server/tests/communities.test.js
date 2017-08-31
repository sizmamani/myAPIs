const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { communities, populateCommunities } = require('./seed/community_seed');
const { users, populateUsers } = require('./seed/user_seed');
const { populateUserCommunity } = require('./seed/user_community_seed');
const { RESPONSE_CODES, ERRORS } = require('../utils/message.util');
const { Community } = require('../models/community.model');
const tokenUtil = require('../utils/token.util');
const _ = require('lodash');

const URL = '/api/v2/communities';

beforeEach(populateCommunities);
beforeEach(populateUsers);
beforeEach(populateUserCommunity);

describe('COMMUNITIES TEST', () => {
    describe('GET /communities/:id', () => {
        let token = tokenUtil.generateToken('SomeToken');
        it('should return community with a given id', (done) => {
            request(app)
                .get(`${URL}/${communities[0]._id.toHexString()}`)
                .set('token', token)
                .expect(200)
                .expect((res) => {
                    expect(res.body.community).toExist();
                    expect(res.body.community._id).toEqual(communities[0]._id);
                    expect(res.body.community.communityName).toBe(communities[0].communityName);
                })
                .end(done);
        });
        it('should return error with a valid id but not record', (done) => {
            request(app)
                .get(`${URL}/${new ObjectID()}`)
                .set('token', token)
                .expect(RESPONSE_CODES.UNAUTHORIZED)
                .expect((res) => {
                    expect(res.body.error).toExist();
                    expect(res.body.error).toInclude(ERRORS.COMMUNITY_DOES_NOT_EXIST.error);
                    expect(res.body.error.code).toBe(ERRORS.COMMUNITY_DOES_NOT_EXIST.error.code);
                    expect(res.body.error.message).toBe(ERRORS.COMMUNITY_DOES_NOT_EXIST.error.message);
                })
                .end(done);
        });
        it('should reject wrong id', (done) => {
            request(app)
                .get(`${URL}/1234`)
                .set('token', token)
                .expect(RESPONSE_CODES.UNAUTHORIZED)
                .end(done);
        });

    });
    describe('GET /communities/:id/join', () => {
        user = _.omit(users[0], ['password']);
        let data = {
            _id: users[0]._id,
            user
        };
        let token = tokenUtil.generateToken(data);
        it('should make the user join the community by community id', (done) => {
            request(app)
                .get(`${URL}/${communities[0]._id.toHexString()}/join`)
                .set('token', token)
                .expect(200)
                .expect((res) => {
                    expect(res.body.user).toExist();
                    expect(res.body.communities).toExist();
                    expect(res.body.communities[0]._id).toEqual(communities[0]._id);
                })
                .end(done);
        });
        it('should add community to the user which already have a community', (done) => {
            request(app)
                .get(`${URL}/${communities[0]._id.toHexString()}/join`)
                .set('token', token)
                .expect(200)
                .expect((res) => {
                    expect(res.body.user).toExist();
                    expect(res.body.communities).toExist();
                    expect(res.body.communities[0]._id).toEqual(communities[0]._id);
                })
                .end((err) => {
                    if (err) {
                        return done(err);
                    }
                    request(app)
                        .get(`${URL}/${communities[1]._id.toHexString()}/join`)
                        .set('token', token)
                        .expect(200)
                        .expect((res) => {
                            expect(res.body.user).toExist();
                            expect(res.body.communities).toExist();
                            expect(res.body.communities.length).toBe(2);
                        })
                        .end(done);
                });
        });

        it('should not add a community which is already added', (done) => {
            request(app)
                .get(`${URL}/${communities[0]._id.toHexString()}/join`)
                .set('token', token)
                .expect(200)
                .expect((res) => {
                    expect(res.body.user).toExist();
                    expect(res.body.communities).toExist();
                    expect(res.body.communities[0]._id).toEqual(communities[0]._id);
                })
                .end((err) => {
                    if (err) {
                        return done(err);
                    }
                    request(app)
                        .get(`${URL}/${communities[0]._id.toHexString()}/join`)
                        .set('token', token)
                        .expect(200)
                        .expect((res) => {
                            expect(res.body.user).toExist();
                            expect(res.body.communities).toExist();
                            expect(res.body.communities.length).toBe(1);
                            expect(res.body.communities[0]._id).toEqual(communities[0]._id);
                        })
                        .end(done);
                })
        });

        it('should reject request to join a community if the community does not exist', (done) => {
            request(app)
                .get(`${URL}/${new ObjectID().toHexString()}/join`)
                .set('token', token)
                .expect(RESPONSE_CODES.UNAUTHORIZED)
                .expect((res) => {
                    expect(res.body.error).toExist();
                    expect(res.body.error).toInclude(ERRORS.COMMUNITY_DOES_NOT_EXIST.error);
                    expect(res.body.error.code).toBe(ERRORS.COMMUNITY_DOES_NOT_EXIST.error.code);
                    expect(res.body.error.message).toBe(ERRORS.COMMUNITY_DOES_NOT_EXIST.error.message);
                })
                .end(done);
        });

        it('should reject request to join a community if community id is not valid', (done) => {
            request(app)
                .get(`${URL}/1234/join`)
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

        it('should reject request to join a community if token is invalid', (done) => {
            request(app)
                .get(`${URL}/${communities[0]._id.toHexString()}/join`)
                .set('token', token + 'A')
                .expect(RESPONSE_CODES.UNAUTHORIZED)
                .expect((res) => {
                    expect(res.body.error).toExist();
                    expect(res.body.error).toInclude(ERRORS.WRONG_TOKEN.error);
                    expect(res.body.error.code).toBe(ERRORS.WRONG_TOKEN.error.code);
                    expect(res.body.error.message).toBe(ERRORS.WRONG_TOKEN.error.message);
                })
                .end(done);
        });
    });
    describe('GET /communities/mine', () => {
        user = _.omit(users[0], ['password']);
        let data = {
            _id: users[0]._id,
            user
        };
        let token = tokenUtil.generateToken(data);
        it('should return empty communities array because user has none', (done) => {
            request(app)
                .get(`${URL}/mine`)
                .set('token', token)
                .expect(200)
                .expect((res) => {
                    expect(res.body.communities).toExist();
                    expect(res.body.communities.length).toBe(0);
                })
                .end(done);
        });
        it('should return communities array for the user', (done) => {
            user = _.omit(users[1], ['password']);
            let data = {
                _id: users[1]._id,
                user
            };
            let token = tokenUtil.generateToken(data);
            request(app)
                .get(`${URL}/mine`)
                .set('token', token)
                .expect(200)
                .expect((res) => {
                    expect(res.body.communities).toExist();
                    expect(res.body.communities.length).toBe(2);
                })
                .end(done);
        });
    });
});