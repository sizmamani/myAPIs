const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const tokenUtil = require('../utils/token.util');

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
        unique: true,
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
        minlength: 6
    },
    email: {
        type: String,
        required: true,
        unique: true,
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
        type: Number,
        required: true
    },
    myInterests: [],
    myExpertise: [],
    aboutMe: {
        type: String,
        minlength: 1
    },
    comingFrom: {
        type: String,
        minlength: 1
    },
    gender: Number,
    // userProfileVirtualPath: {
    //     type: String,
    //     minlength: 1
    // },
    dtLastLogin: Date,
    loginNo: {
        type: Number,
        default: 1
    },
    //Role and communities should be settled
    //We might have 3 communities and 3 different roles in each community
    //So I have to find a way to figue out my role in each community
    roles: {
        type: Array
        //default: [APP_CONSTANTS.ROLE_RESIDENT]
    },
    communities: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Community'
        }
    ],
    currentCommunity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community'
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
    
    //Send all properties but the password
    return _.omit(userObject, ['password']);
};

UserSchema.methods.generateAuthToken = function () {
    let user = this;
    var userObject = user.toObject();
    user = _.omit(userObject, ['__v', 
        'dtCreated',
        'dtLastLogin', 
        'roles', 
        'loginNo', 
        'myExpertise', 
        'myInterests', 
        'loginId', 
        'password']);
    let dataInToken = {
        user
    };

    //let token = jwt.sign(dataInToken, process.env.JWT_SECRET).toString();
    let token = tokenUtil.generateToken(dataInToken);
    
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

UserSchema.statics.findByCredentials = function (loginId, password) {
    var User = this;
    return User.findOne({ loginId }).then((user) => {
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