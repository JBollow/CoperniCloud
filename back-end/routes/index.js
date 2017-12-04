var express = require('express');
var router = express.Router();

//filesearch
const testFolder = '../../Testdaten/opt/sentinel2';
const fs = require('fs');
var fileNames = [];

fs.readdir(testFolder, (err, files) => {
    files.forEach(file => {
        fileNames.push(file);
        console.log(file);
    });
})

router.get('/search', function() {
    console.log("Hallo");
})

module.exports = router;