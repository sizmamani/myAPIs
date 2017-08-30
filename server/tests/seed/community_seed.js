const { ObjectID } = require('mongodb');
const { Community } = require('../../models/community.model');

const communityOneId = new ObjectID();
const communityTwoId = new ObjectID();

const communities = [{
    _id: communityOneId,
    communityName: 'Community A',
    communityDescription: 'This is for Community A',
    status: 1,
    longitude: '38.8829024',
    latitude: '-77.016375'
}, {
    _id: communityTwoId,
    communityName: 'Cummunity B',
    communityDescription: 'This is for Community B',
    status: 1,
    longitude: '37.8829024',
    latitude: '-78.016375'
}];

const populateCommunities = (done) => {
    Community.remove({}).then( () => {
        var communityOne = new Community(communities[0]).save();
        var communityTwo = new Community(communities[1]).save();
        return Promise.all([communityOne, communityTwo]);
    }).then( () => done());
}

module.exports = {
    communities, populateCommunities
}