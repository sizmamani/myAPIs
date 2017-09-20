const { communities } = require('./community_seed');
const { users } = require('./user_seed');
const { User } = require('../../models/user.model');
const { Community } = require('../../models/community.model');
const { ObjectID } = require('mongodb');
const { Post } = require('../../models/post.model');

const postOneId = new ObjectID();
const postTwoId = new ObjectID();
const postThreeId = new ObjectID();

const posts = [
    {
        _id: postOneId,
        description: 'First post done by one neighbour about something',
        images: ['Image One', 'Image Two', 'Image Three'],
        postedBy: users[1]._id,
        status: 1,
        community: communities[0]._id,
        comments: [{
            comment: 'First Comment, It is an interesting first post',
            commentDate: new Date(),
            commentedBy: users[1]._id
        }, {
            comment: 'Second Comment, It is an interesting first post',
            commentDate: new Date(),
            commentedBy: users[1]._id
        }],
        likes: [{
            likedByName: 'John Smith',
            likedBy: users[1]._id
        }    
        ]
    },
    {
        _id: postTwoId,
        description: 'Second post done by someone',
        images: [],
        postedBy: users[1]._id,
        status: 1,
        community: communities[0]._id,
        comments: [{
            comment: 'First Comment, It is an interesting second post',
            commentDate: new Date(),
            commentedBy: users[1]._id
        }, {
            comment: 'Second Comment, It is an interesting first post',
            commentDate: new Date(),
            commentedBy: users[1]._id
        }],
        likes: [{
            likedByName: 'John Smith',
            likedBy: users[1]._id
        }    
        ]
    },
    {
        _id: postThreeId,
        description: 'Third post done by someone',
        images: [],
        postedBy: users[1]._id,
        status: 2,
        community: communities[0]._id,
        comments: [{
            comment: 'First Comment, It is an interesting third post',
            commentDate: new Date(),
            commentedBy: users[1]._id
        }, {
            comment: 'Second Comment, It is an interesting third post',
            commentDate: new Date(),
            commentedBy: users[1]._id
        }],
        likes: [{
            likedByName: 'John Smith',
            likedBy: users[1]._id
        }    
        ]
    }
];

//First add the post IDs to the a community document
const addPostsToCommunity = () => {
    let postIds = [postOneId, postTwoId, postThreeId];
    return Community.findByIdAndUpdate(communities[0]._id, {
        $pushAll: {
            posts: postIds
        }
    }, {
        new: true
    });
};

const addPosts = () => {
    let postOne = new Post(posts[0]).save();
    let postTwo = new Post(posts[1]).save();
    let postThree = new Post(posts[2]).save();

    Post.remove({}).then( () => {
        return Promise.all([postOne, postTwo, postThree]);
    })
};

const addCommunityToUser = () => {
    let communityArray = [];
    communityArray.push(communities[0]._id);
    communityArray.push(communities[1]._id);
    users[1].currentCommunity = communityArray[0]._id;
    return User.findByIdAndUpdate(users[1]._id, {
        $set: {
            currentCommunity: communityArray[0]
        },
        $pushAll: {
            communities: communityArray
        }
    }, {
            new: true
        });
};


const populatePosts = (done) => {
    addPostsToCommunity().then( () => {
        return addCommunityToUser();
    }).then(() => {
       return addPosts();
    }).then(() => done());
}

module.exports = {
    populatePosts, posts
}
