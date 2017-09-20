const mongoose = require('mongoose');
const APP_CONSTANTS = require('../utils/app.constants');

let CommunitySchema = new mongoose.Schema({
    communityName: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    },
    communityDescription: {
        type: String,
        trim: true,
        minlength: 1
    },
    status: {
        type: Number,
        required: true
    },
    location: {
        longitude: String,
        latitude: String
    },
    roles: [{
        role: {
            type: Number,
            default: APP_CONSTANTS.ROLE_RESIDENT
        },
        no_access: []
    }
    ],
    features: {
        type: Array
    },
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post'
        }
    ],
    notices: {
        type: Array
    },
    dtCreated: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dtUpdated: Date,
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});
//url, add1, postalAddress1, postalAddress1, phone1, phone2, fax1, fax2, email1, email2
//templateId, localeId, city

// CommunitySchema.methods.toJSON = function(){
//     let community = this;
//     let communityObject = community.toObject();

//     //Send all properties but
//     return _.omit(communityObject, []);
// }


let Community = mongoose.model('Community', CommunitySchema);

module.exports = {
    Community
}