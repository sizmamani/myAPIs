/*
 * Everything worked
 * The application did something wrong
 * The API did something wrong
 */


const generateError = (code, message) => {
    return {
        error: {
            code,
            message
        }
    }
};

const RESPONSE_CODES = {
    INTERNAL_SERVER_ERRORr: 500,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404
};

const ERRORS = {
    //1001-1099 for SIGN UP ERROR
    WRONG_EMAIL_FORMAT: generateError(1001, 'EMAIL SHOULD BE PROVIDED'),
    BAD_PASSWORD_FORMAT: generateError(1002, 'PASSWORD SHOULD BE AT LEAST 6 CHARACTERS'),
    FIRST_NAME_EMPTY: generateError(1003, 'FIRST NAME SHOULD NOT BE EMPTY'),
    LAST_NAME_EMPTY: generateError(1004, 'LAST NAME SHOULD NOT BE EMPTY'),
    ACCOUNT_ALREADY_EXISTS: generateError(1005, 'ACCOUNT ALREADY EXISTS'),

    //1101-1199 LOGIN ERRORS
    WRONG_CREDENTIALS: generateError(1101, 'USERNAME OR PASSWORD IS INCORRECT'),
    WRONG_TOKEN: generateError(1102, 'TOKEN WAS WRONG'),
    EXPIRED_TOKEN: generateError(1103, 'TOKEN WAS EXPIRED'),

    //1201-1299 FORGOT PASSWORD ERRORS
    NO_ACCOUNT: generateError(1201, 'ACCOUNT DOES NOT EXIST'),

    //1301-1399 USER ERRORS
    INVALID_USER_ID: generateError(1301, 'INVALID USER ID'),
    USER_DOES_NOT_EXIST: generateError(1302, 'USER DOES NOT EXIST'),

    //2001 NETWORK ERRORS
    PAGE_NOT_FOUND: generateError(2001, 'PAGE NOT FOUND'),
    NETWORK_ISSUE: generateError(2002, 'NETWORK ISSUE'),
    UNKNOW_ERROR: generateError(2003, 'UNKNOWN ERROR'),

    //3001 SESSION ERRORS

    //4001 SECURITY ERRORS
};

const MESSAGES = {
    EMAIL_SENT_TO_USER: {
        message: 'Email was sent to you. Please check your email'
    }
};

module.exports = {
    generateError,
    RESPONSE_CODES,
    ERRORS,
    MESSAGES
};