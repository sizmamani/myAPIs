const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
    //Define the schema of your document
    firstname: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    },
    lastname: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    },
    loginId: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        validate: {
            validator: (value) => {
                return validator.isEmail(value);
            },
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        validate: {
            validator: (value) => {
                return validator.isEmail(value);
            },
            message: '{VALUE} is not a valid email'
        }
    },
    position: {
        type: String,
        minlength: 1
    },
    status: {
        type: String,
        required: true,
        minlength: 1
    },
    myInterests: {
        type: String,
        minlength: 1
    },
    myExpertise: {
        type: String,
        minlength: 1
    },
    aboutMe: {
        type: String,
        minlength: 1
    },
    comingFrom: {
        type: String,
        minlength: 1
    },
    gender: {
        type: String,
        minlength: 1
    },
    userProfileVirtualPath: {
        type: String,
        minlength: 1
    },
    dtLastLogin: {
        type: Date
    },
    loginNo: {
        type: Number
    },
    dtCreated: {
        type: Date
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    dtUpdated: {
        type: Date
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }
    // tokens: [{
    //     access: {
    //         type: String,
    //         required: true
    //     },
    //     token: {
    //         type: String,
    //         required: true
    //     }
    // }]
});

/**
	private Long languageId;
 */
//Define both Model and Instance methods of this model here


//Define your database event schema here: i.e. pre. before saving the details into the db

var User = mongoose.model('User', UserSchema);
module.exports = {
    User
}