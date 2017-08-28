const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    },
    lastName: {
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
    // email: {
    //     type: String,
    //     required: true,
    //     trim: true,
    //     minlength: 5,
    //     validate: {
    //         validator: (value) => {
    //             return validator.isEmail(value);
    //         },
    //         message: '{VALUE} is not a valid email'
    //     }
    // },
    position: {
        type: String,
        minlength: 1
    },
    status: {
        type: String,
        //required: true,
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
        ref: 'User'
    },
    dtUpdated: {
        type: Date
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
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

UserSchema.methods.toJSON = function () {
    var user = this;
    var userObject = user.toObject();
 
    return _.pick(userObject, ['_id', 'firstName', 'lastName', 'loginId', 
        'position', 'status', 'myInterests', 'myExpertise', 'aboutMe', 
        'comingFrom', 'gender', 'userProfileVirtualPath', 'dtLastLogin', 'loginNo',
        'dtCreated', 'createdBy', 'dtUpdated', 'updatedBy']);
};

UserSchema.methods.generateAuthToken = function () {
    var user = this;
    var token = jwt.sign({
        _id: user._id.toHexString()
    }, process.env.JWT_SECRET).toString();
 
    return new Promise((resolve, reject) => {
        if(token){
            resolve(token);
        }else{
            reject();
        }
    })
};

UserSchema.statics.findByLoginId = function (loginId) {
    var User = this;
    return User.findOne({
        loginId
    });
};

UserSchema.statics.findByCredentials = function (email, password) {
    var User = this;
    return User.findOne({ email }).then((user) => {
        if (!user) {
            return Promise.reject();
        }
 
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                if(res){
                    resolve(user);
                }else{
                    reject();
                }
            });
        }
        );
    });
};

UserSchema.pre('save', function (next) {
    var user = this;
    if (user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            if (salt) {
                bcrypt.hash(user.password, salt, (err, hash) => {
                    if (hash) {
                        user.password = hash;
                        next();
                    }
                })
            }
        });
    } else {
        next();
    }
});

var User = mongoose.model('User', UserSchema);
module.exports = {
    User
}