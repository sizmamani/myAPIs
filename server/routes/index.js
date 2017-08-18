var express = require('express');
var router = express.Router();
var { mongoose } = require('../db/mongoose.js');
const { ObjectID } = require('mongodb');

router.get('/', (req, res) => {
    res.send('Happy Coding!!!');
});
module.exports = router;