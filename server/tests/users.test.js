const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { users, populateUsers } = require('./seed/user_seed');
const { generateError, RESPONSE_CODES, ERRORS, MESSAGES } = require('../utils/message.util');
const { User } = require('../models/user.model');
const tokenUtil = require('../utils/token.util');
const _ = require('lodash');

const URL = '/api/v2/users';

beforeEach(populateUsers);

describe('USERS TEST', () => {
    user = _.omit(users[0], ['password']);
    let data = {
        _id: users[0]._id,
        user
    };
    let token = tokenUtil.generateToken(data);
    describe('GET /users/me', () => {
        it('should return the user info which is logged in with its token', (done) => {
            request(app)
                .get(`${URL}/me`)
                .set('token', token)
                .expect(200)
                .expect((res) => {
                    expect(res.body.user).toExist();
                    expect(res.body.user._id).toEqual(user._id);
                    expect(res.body.user.firstName).toBe(user.firstName);
                    expect(res.body.user.loginId).toBe(user.loginId);
                })
                .end(done);
        });
        it('should reject user with wrong token', (done) => {
            request(app)
                .get(`${URL}/me`)
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
    describe('GET /users/:id', () => {
        it('should return user with a given id', (done) => {
            request(app)
                .get(`${URL}/${users[0]._id.toHexString()}`)
                .set('token', token)
                .expect(200)
                .expect((res) => {
                    expect(res.body.user).toExist();
                    expect(res.body.user._id).toEqual(users[0]._id);
                    expect(res.body.user.firstName).toBe(user.firstName);
                    expect(res.body.user.loginId).toBe(user.loginId);
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
                expect(res.body.error).toInclude(ERRORS.USER_DOES_NOT_EXIST.error);
                expect(res.body.error.code).toBe(ERRORS.USER_DOES_NOT_EXIST.error.code);
                expect(res.body.error.message).toBe(ERRORS.USER_DOES_NOT_EXIST.error.message);
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

    })
});