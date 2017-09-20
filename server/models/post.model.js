const mongoose = require('mongoose');

let postSchema = new mongoose.Schema({
    description: {
        type: String
    },
    images: [],
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    postedDate: {
        type: Date,
        default: Date.now
    },
    status: Number,
    community: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community'
    },
    comments: [
        {
            _id: false,
            comment: String,
            commentDate: Date,
            commentedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
    }],
    likes: [{
        _id: false,
        likedByName: String,
        likedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }        
    }]
});

let Post = mongoose.model('Post', postSchema);

module.exports = {
    Post
}