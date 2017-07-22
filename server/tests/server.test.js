const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');

describe('GET /', () => {
    it('should return simple text', (done) => {
        request(app)
            .get('/')
            .expect(200)
            .expect((res) => {
                expect(res.body).toEqual({});
                expect(res.text).toBe('Happy Coding!!!');
            })
            .end(done);
    });
});