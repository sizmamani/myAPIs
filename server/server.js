require('./config/config');
 
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
var {mongoose} = require('./db/mongoose.js');
const {ObjectID} = require('mongodb');

const homeRoute = require('./routes/index');
const authenticationRoute = require('./routes/authentication');
 
var app = express();
const port = process.env.PORT;
 
app.use(bodyParser.json());
app.use(bodyParser.text());
  
app.use('/', homeRoute);
app.use('/api/v2/', authenticationRoute);

app.listen(port, () => console.log(`Server started and listening to Port ${port}`));
 
 
module.exports = {app};