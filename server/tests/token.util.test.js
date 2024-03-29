const expect = require('expect');
const { ObjectID } = require('mongodb');
const tokenUtil = require('../utils/token.util');

describe('TOKEN UTILS TEST', () => {
    let data = {
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
    it('should successfully generate Json Web Token', () => {
        let token = tokenUtil.generateToken(data);
        expect(token).toBeA('string');
        expect(token.split('.').length)
            .toBeA('number')
            .toBe(3);
    });

    it('should successfully get user object from a token', () => {
        let token = tokenUtil.generateToken(data);
        let user = tokenUtil.getUser(token);
        expect(user).toBeA('object');
        expect(user).toInclude(data.user);
        expect(user._id).toBe(data.user._id);
    });

    it('should successfully get user email from a token', () => {
        let token = tokenUtil.generateToken(data);
        let email = tokenUtil.getUserEmail(token);
        expect(email)
            .toBeA('string')
            .toBe(data.user.email);
    });

    it('should successfully get user loginId from a token', () => {
        let token = tokenUtil.generateToken(data);
        let loginId = tokenUtil.getUserLoginId(token);
        expect(loginId)
            .toBeA('string')
            .toBe(data.user.loginId);
    });

    it('should successfully get user id from a token', () => {
        let token = tokenUtil.generateToken(data);
        let id = tokenUtil.getUserId(token);
        expect(id)
            .toBeA('object')
            .toEqual(data.user._id);
    });

    it('should successfully get user full name from a token', () => {
        let token = tokenUtil.generateToken(data);
        let fullName = tokenUtil.getUserFullName(token);
        expect(fullName)
            .toBeA('string')
            .toBe(`${data.user.firstName} ${data.user.lastName}`);
    });

    it('should successfully get user current community from a token', () => {
        data.user.currentCommunity = new ObjectID();
        let token = tokenUtil.generateToken(data);
        let communityId = tokenUtil.getCurrentCommunityId(token);
        expect(communityId)
            .toEqual(data.user.currentCommunity);
    });

    it('should successfully get user communities array from a token', () => {
        data.user.communities = [];
        let communityId1 = new ObjectID();
        let communityId2 = new ObjectID();
        data.user.communities.push(communityId1, communityId2);
        let token = tokenUtil.generateToken(data);
        let userCommunities = tokenUtil.getUserCommunities(token);
        expect(userCommunities.length).toBeA('number');
        expect(userCommunities.length).toBe(2);
        expect(userCommunities[0]).toEqual(data.user.communities[0]);
        expect(userCommunities[1]).toEqual(data.user.communities[1]);
    });

});