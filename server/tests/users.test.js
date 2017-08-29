const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { users, populateUsers } = require('./seed/user_seed');
const { generateError, RESPONSE_CODES, ERRORS, MESSAGES } = require('../utils/message.util');
const { User } = require('../models/user');
const tokenUtil = require('../utils/token.util');

const URL = '/api/v2/users';

beforeEach(populateUsers);

describe('Users Tests', () => {
    describe('GET /users/me', () => {
        it('should return the user info which is logged in with its token', (done) => {
            let data = {
                _id: '59a5c3874fb26705969c6f47',
                user:
                {
                    _id: '59a5c3874fb26705969c6f47',
                    firstName: 'Sherlock',
                    lastName: 'Holmes',
                    loginId: 'sherlock@221B.baker.str',
                    email: 'sherlock@221B.baker.str',
                    status: 1,
                    myInterests: [],
                    myExpertise: []
                }
            };
            let token = tokenUtil.generateToken(data);
            request(app)
                .get(`${URL}/me`)
                .set('token', token)
                .expect(200)
                .expect((res) => {
                    expect(res.body.user).toExist();
                    expect(res.body.user).toInclude(data.user);
                })
                .end(done);
        });
        it('should reject user with wrong token', (done) => {
            request(app)
                .get(`${URL}/me`)
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
});