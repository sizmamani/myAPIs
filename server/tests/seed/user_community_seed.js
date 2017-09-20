const { communities } = require('./community_seed');
const { users } = require('./user_seed');
const { User } = require('../../models/user.model');

const populateUserCommunity = (done) => {
    User.remove({}).then(() => {
        users[1].communities = [];
        users[1].communities.push(communities[0]._id);
        users[1].communities.push(communities[1]._id);
        users[1].currentCommunity = communities[0]._id;
        
        var userOne = new User(users[0]).save();
        var userTwo = new User(users[1]).save();
        return Promise.all([userOne, userTwo]);
    }).then( () => done());
}

module.exports = {
    populateUserCommunity
}
