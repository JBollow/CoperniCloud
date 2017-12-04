var express = require('express');
var router = express.Router();

//filesearch
const testFolder = 'F://Dokumente/Uni/WS_2017/Geosoft2/Testdaten/opt/sentinel2';
const fs = require('fs');
var fileNames = [];

fs.readdir(testFolder, (err, files) => {
    if (files) {
        files.forEach(file => {
            let noExt = file.replace('.SAFE','');
            fileNames.push(noExt);
            console.log(noExt);
        });
    }
})

function arrayContainsArray (big, small) {
    if (small.length === 0) {
      return false;
    }
    return small.every(function (value) {
      return (big.indexOf(value) >= 0);
    });
  }

router.get('/search', function (req, res) {
    var name = req.query.name;
    var nameSubstrings = name.split(' ');
    var before = req.query.before;
    var after = req.query.after;
    // var split = [];
    // for (let i=0; i<fileNames.length; i++) {
    //     split.push(fileNames[i].split('_'));
    // }
    
    results = [];
    for(var i = 0; i<fileNames.length; i++) {
        var subElementArray = fileNames[i];
        if (arrayContainsArray(subElementArray, nameSubstrings)) {
            results.push(subElementArray);
        }
    }
    res.json(results);
})

module.exports = router;