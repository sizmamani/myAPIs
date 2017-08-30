const mongoose = require('mongoose');

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
    longitude: String,
    latitude: String,
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