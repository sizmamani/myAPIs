require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');

const homeRoute = require('./routes/index');
const authenticationRoute = require('./routes/authentication');
const usersRoute = require('./routes/users');

var app = express();

const port = process.env.PORT;
app.use(bodyParser.json());
app.use(bodyParser.text());

app.use('/', homeRoute);
app.use('/api/v2/', authenticationRoute);
app.use('/api/v2/', usersRoute);

app.listen(port, () => console.log(`Server started and listening to Port ${port}`));

module.exports = { app };