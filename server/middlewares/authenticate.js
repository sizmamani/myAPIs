const tokenUtil = require('../utils/token.util');
const { RESPONSE_CODES, ERRORS } = require('../utils/message.util');

var authenticate = (req, res, next) => {
    //in this function get a token header and then criss check it to be sure it is genuine and if so call next 
    let token = req.header('token');
    if (token){ 
        try{
            let user = tokenUtil.getUser(token);
            req.user = user;
            req.token = token;
            next();
        }catch(err){
            return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.WRONG_TOKEN) ;    
        }
    }
    else { 
        return res.status(RESPONSE_CODES.UNAUTHORIZED).send(ERRORS.WRONG_TOKEN);
    }

};

//Export the authenticate so we can use it in the other files like server.js
module.exports = {
    authenticate
}