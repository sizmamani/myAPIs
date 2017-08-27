const facebook = {
    clientID: '1731757717125450',
    clientSecret: '4010d5643a1f29760e084d1745264373',
    callbackURL: 'http://localhost:3000/api/v2/facebook/callback',
    profileFields: ['email', 'id', 'name', 'gender', 'picture']
};

const google = {
    clientID: '172676423798-i10a04g63vog6ja31dg14n4jtc7rj797.apps.googleusercontent.com',
    clientSecret: 'LMiZ77vlMtfgIBCOygnhUORo',
    callbackURL: 'http://localhost:3000/api/v2/google/callback',
    scope: ['https://www.googleapis.com/auth/plus.profile.emails.read']
};

module.exports = {
    facebook, google
}