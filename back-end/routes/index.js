var express = require('express');
var router = express.Router();

//filesearch
const testFolder = 'F://Dokumente/Uni/WS_2017/Geosoft2/Testdaten/opt/sentinel2';
const fs = require('fs');
var fileNames = [];

fs.readdir(testFolder, (err, files) => {
    if (files) {
        files.forEach(file => {
            fileNames.push(file);
            console.log(file);
        });
    }
})

router.get('/search', function () {
    console.log("Hallo");
})

module.exports = router;