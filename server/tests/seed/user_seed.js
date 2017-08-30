const { ObjectID } = require('mongodb');
const { User } = require('../../models/user.model');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [{
    _id: userOneId,
    firstName: 'firstName1',
    lastName: 'lastName1',
    loginId: 'user1@user1.com',
    password: 'userOnePassword',
    email: 'user1@user1.com',
    status: 1,
    position: 'Being the first Test User',
    myInterests: ['star wars', 'films'],
    myExpertise: ['musician', 'IT'],
    aboutMe: 'I am Test User One',
    comingFrom: 'Nebu',
    gender: 1,
    dtLastLogin: new Date(),
    loginNo: 0,
    dtCreated: new Date()
}, {
    _id: userTwoId,
    firstName: 'firstName2',
    lastName: 'lastName2',
    loginId: 'user2@user2.com',
    password: 'userTwoPassword',
    email: 'user2@user2.com',
    status: 1,
    position: 'Being the second Test User',
    myInterests: ['star trek', 'running'],
    myExpertise: ['Entertainer', 'Cook'],
    aboutMe: 'I am Test User Two',
    comingFrom: 'Cloud City',
    gender: 2,
    dtLastLogin: new Date(),
    loginNo: 0,
    dtCreated: new Date()
}];

const populateUsers = (done) => {
    User.remove({}).then( () => {
        var userOne = new User(users[0]).save();
        var userTwo = new User(users[1]).save();
        return Promise.all([userOne, userTwo]);
    }).then( () => done());
}

module.exports = {
    users, populateUsers
}