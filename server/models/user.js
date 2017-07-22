const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
    //Define the schema of your document
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
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
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    status: {
        type: String,
        required: true,
        minlength: 1
    },
    interests: {
        type: String,
        minlength: 1
    },
    gender: {
        type: String,
        minlength: 1
    },
    image: {
        type: String,
        minlength: 1
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

//Define both Model and Instance methods of this model here


//Define your database event schema here: i.e. pre. before saving the details into the db

var User = mongoose.model('User', UserSchema);
module.exports = {
    User
}