const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { users, populateUsers } = require('./seed/user_seed');
const { generateError, RESPONSE_CODES, ERRORS, MESSAGES } = require('../utils/message.util');
const { User } = require('../models/user.model');

const URL = '/api/v2';

beforeEach(populateUsers);

describe('AUTHENTICATION TESTS', () => {
    describe('POST /forgot-password', () => {
        it('should send an email to the user if the account already exists', (done) => {
            request(app)
                .post(`${URL}/forgot-password`)
                .send({
                    loginId: users[0].loginId
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body).toExist();
                    expect(res.body.message).toExist();
                    expect(res.body).toInclude(MESSAGES.EMAIL_SENT_TO_USER);
                })
                .end(done);
        });
        it('should reject user request if account does not exist', (done) => {
            request(app)
                .post(`${URL}/forgot-password`)
                .send({
                    loginId: 'someuser@user.com'
                })
                .expect(RESPONSE_CODES.UNAUTHORIZED)
                .expect((res) => {
                    expect(res.body).toExist();
                    expect(res.body.error).toExist();
                    expect(res.body.error.code).toBe(ERRORS.NO_ACCOUNT.error.code);
                    expect(res.body.error.message).toBe(ERRORS.NO_ACCOUNT.error.message);
                })
                .end(done);
        });

        it('should reject user request if loginId is not an email or empty', (done) => {
            request(app)
                .post(`${URL}/forgot-password`)
                .send({
                    loginId: 'something'
                })
                .expect(RESPONSE_CODES.UNAUTHORIZED)
                .expect((res) => {
                    expect(res.body).toExist();
                    expect(res.body.error).toExist();
                    expect(res.body.error.code).toBe(ERRORS.WRONG_EMAIL_FORMAT.error.code);
                    expect(res.body.error.message).toBe(ERRORS.WRONG_EMAIL_FORMAT.error.message);
                })
                .end(done);
        });
    });

    describe('POST /login', () => {
        it('should successfully login the existing user', (done) => {
            request(app)
                .post(`${URL}/login`)
                .send({
                    loginId: users[0].loginId,
                    password: users[0].password
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body.user).toExist();
                    expect(res.body.user.loginId).toBe(users[0].loginId);
                    expect(res.body.user._id).toBe(users[0]._id.toHexString());
                })
                .end(done);
            
        });
        it('should not login the user with wrong credentials', (done) => {
            request(app)
                .post(`${URL}/login`)
                .send({
                    loginId: 'sometest@something.com',
                    password: '123456'
                })
                .expect(RESPONSE_CODES.UNAUTHORIZED)
                .expect((res) => {
                    expect(res.body.error).toExist();
                    expect(res.body.error).toInclude(ERRORS.WRONG_CREDENTIALS.error);
                    expect(res.body.error.code).toBe(ERRORS.WRONG_CREDENTIALS.error.code);
                    expect(res.body.error.message).toBe(ERRORS.WRONG_CREDENTIALS.error.message);
                })
                .end(done);
        });
    });

    describe('POST /signup', () => {
        it('should signup a user successfully', (done) => {
            let requiredInfo = {
                firstName: 'Sherlock',
                lastName: 'Holmes',
                loginId: 'sherlock@221B.baker.str',
                password: '123456'
            }
            request(app)
                .post(`${URL}/signup`)
                .send(requiredInfo)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toExist();
                    expect(res.headers['token']).toExist();
                    expect(res.body.user).toExist();
                    expect(res.body.user._id).toExist();
                    expect(res.body.user.password).toNotExist();
                    expect(res.body.user.firstName).toBe(requiredInfo.firstName);
                    expect(res.body.user.lastName).toBe(requiredInfo.lastName);
                    expect(res.body.user.loginId).toBe(requiredInfo.loginId);
                    expect(res.body.user.status).toBeA('number');
                    expect(res.body.user.status).toBe(1);
                })
                .end( (err) => {
                    if(err){
                        return done(err);
                    }
                    User.findOne({
                        loginId: requiredInfo.loginId
                    }).then( (user) => {
                        expect(user).toExist();
                        expect(user.loginId).toBe(requiredInfo.loginId);
                        expect(user.firstName).toBe(requiredInfo.firstName);
                        done();
                    }).catch((err) => {
                        return done(err);
                    })
                })
        });
        it('should give error if loginId already exists', (done) => {
            request(app)
                .post(`${URL}/signup`)
                .send({
                    firstName: users[0].firstName,
                    lastName: users[0].lastName,
                    loginId: users[0].loginId,
                    password: users[0].password
                })
                .expect(RESPONSE_CODES.UNAUTHORIZED)
                .expect((res) => {
                    expect(res.body.error).toExist();
                    expect(res.body.error).toInclude(ERRORS.ACCOUNT_ALREADY_EXISTS.error);
                    expect(res.body.error.code).toBe(ERRORS.ACCOUNT_ALREADY_EXISTS.error.code);
                    expect(res.body.error.message).toBe(ERRORS.ACCOUNT_ALREADY_EXISTS.error.message);
                })
                .end(done);
        });
        it('should give errors if loginId is not email', (done) => {
            let requiredInfo = {
                firstName: 'Sherlock',
                lastName: 'Holmes',
                loginId: 'sherlock',
                password: '123456'
            }
            request(app)
                .post(`${URL}/signup`)
                .send(requiredInfo)
                .expect(RESPONSE_CODES.UNAUTHORIZED)
                .expect((res) => {
                    expect(res.body.error).toExist();
                    expect(res.body.error).toInclude(ERRORS.WRONG_EMAIL_FORMAT.error);
                    expect(res.body.error.code).toBe(ERRORS.WRONG_EMAIL_FORMAT.error.code);
                    expect(res.body.error.message).toBe(ERRORS.WRONG_EMAIL_FORMAT.error.message);
                })
                .end(done);
        });
        it('should give errors if first name is empty', (done) => {
            let requiredInfo = {
                firstName: '',
                lastName: 'Holmes',
                loginId: 'sherlock@221B.baker.str',
                password: '123456'
            }
            request(app)
                .post(`${URL}/signup`)
                .send(requiredInfo)
                .expect(RESPONSE_CODES.UNAUTHORIZED)
                .expect((res) => {
                    expect(res.body.error).toExist();
                    expect(res.body.error).toInclude(ERRORS.FIRST_NAME_EMPTY.error);
                    expect(res.body.error.code).toBe(ERRORS.FIRST_NAME_EMPTY.error.code);
                    expect(res.body.error.message).toBe(ERRORS.FIRST_NAME_EMPTY.error.message);
                })
                .end(done);
        });
        it('should give errors if last name is empty', (done) => {
            let requiredInfo = {
                firstName: 'Sherlock',
                lastName: '',
                loginId: 'sherlock@221B.baker.str',
                password: '123456'
            }
            request(app)
                .post(`${URL}/signup`)
                .send(requiredInfo)
                .expect(RESPONSE_CODES.UNAUTHORIZED)
                .expect((res) => {
                    expect(res.body.error).toExist();
                    expect(res.body.error).toInclude(ERRORS.LAST_NAME_EMPTY.error);
                    expect(res.body.error.code).toBe(ERRORS.LAST_NAME_EMPTY.error.code);
                    expect(res.body.error.message).toBe(ERRORS.LAST_NAME_EMPTY.error.message);
                })
                .end(done);
        });
        it('should give errors if password is empty', (done) => {
            let requiredInfo = {
                firstName: 'Sherlock',
                lastName: 'Homles',
                loginId: 'sherlock@221B.baker.str',
                password: ''
            }
            request(app)
                .post(`${URL}/signup`)
                .send(requiredInfo)
                .expect(RESPONSE_CODES.UNAUTHORIZED)
                .expect((res) => {
                    expect(res.body.error).toExist();
                    expect(res.body.error).toInclude(ERRORS.BAD_PASSWORD_FORMAT.error);
                    expect(res.body.error.code).toBe(ERRORS.BAD_PASSWORD_FORMAT.error.code);
                    expect(res.body.error.message).toBe(ERRORS.BAD_PASSWORD_FORMAT.error.message);
                })
                .end(done);
        });
        it('should give errors if password is less than 6 characters', (done) => {
            let requiredInfo = {
                firstName: 'Sherlock',
                lastName: 'Homles',
                loginId: 'sherlock@221B.baker.str',
                password: '123'
            }
            request(app)
                .post(`${URL}/signup`)
                .send(requiredInfo)
                .expect(RESPONSE_CODES.UNAUTHORIZED)
                .expect((res) => {
                    expect(res.body.error).toExist();
                    expect(res.body.error).toInclude(ERRORS.BAD_PASSWORD_FORMAT.error);
                    expect(res.body.error.code).toBe(ERRORS.BAD_PASSWORD_FORMAT.error.code);
                    expect(res.body.error.message).toBe(ERRORS.BAD_PASSWORD_FORMAT.error.message);
                })
                .end(done);
        });
    });
    //how to do test scripts for signup and login with facebook and google
});