const jwt = require('jsonwebtoken');
const { ObjectID } = require('mongodb');

const tokenUtil = module.exports = {
    generateToken: (data) => {
        let token = jwt.sign(data, process.env.JWT_SECRET).toString();
        return token;
    },
    getUser: (token) => {
        try{
            let decodedData = jwt.verify(token, process.env.JWT_SECRET);
            return decodedData.user;
        }catch(err){
            throw err;
        }
    },
    getUserId: (token) => {
        try{
            let decodedData = jwt.verify(token, process.env.JWT_SECRET);
            return new ObjectID(decodedData._id);
        }catch(err){
            throw err;
        }
    },
    getUserEmail: (token) => {
        let user = tokenUtil.getUser(token);
        if(user) {
            return user.email;
        }
        return null;
    },
    getUserLoginId: (token) => {
        let user = tokenUtil.getUser(token);
        if(user) {
            return user.loginId;
        }
        return null;
    },
    getUserFullName: (token) => {
        let user = tokenUtil.getUser(token);
        if(user) {
            return `${user.firstName} ${user.lastName}`
        }
        return null;
    }
};