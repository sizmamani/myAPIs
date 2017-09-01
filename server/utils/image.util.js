const fs = require('fs');
//const request = require('request');
const httpHttps = require('http-https');
let Stream = require('stream').Transform;
const path = require('path');
const IMAGE_LOCAITON = '../resources/profile.images/'

module.exports = {
    // saveFileByURL: (url, fileName, callback) => {
    //     request.head(url, (err, res, body) => {
    //         console.log('content-type:', res.headers['content-type']);
    //         console.log('content-length:', res.headers['content-length']);
    //         request(url).pipe(fs.createWriteStream(fileName)).on('close', callback);
    //     });
    // },
    saveFileByUrl: (url, fileName) => {
        httpHttps.request(url, (response) => {
            var data = new Stream();
            response.on('data', function (chunk) {
                data.push(chunk);
            });
            response.on('end', function () {
                fs.writeFileSync(path.join(__dirname, IMAGE_LOCAITON, fileName), data.read());
            });
        }).end();
    }
}