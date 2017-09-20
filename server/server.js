require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');

const homeRoute = require('./routes/index');
const authenticationRoute = require('./routes/authentication');
const usersRoute = require('./routes/users');
const communitiesRoute = require('./routes/communities');
const postsRoute = require('./routes/posts');

const BASE = '/api/v2';

var app = express();

const PORT = process.env.PORT;
app.use(bodyParser.json());
app.use(bodyParser.text());

app.use('/', homeRoute);
app.use(BASE, authenticationRoute);
app.use(`${BASE}/users`, usersRoute);
app.use(`${BASE}/communities`, communitiesRoute);
app.use(`${BASE}/communities`, postsRoute);

app.listen(PORT, () => console.log(`Server started and listening to Port ${PORT}`));

module.exports = { app };