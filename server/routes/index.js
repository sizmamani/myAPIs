var express = require('express');
var router = express.Router();


router.get('/', (req, res) => {
    res.send('Happy Coding!!!');
});
module.exports = router;