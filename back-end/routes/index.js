var express = require('express');
var router = express.Router();
var xml2js = require('xml2js');
var util = require('util');
var parser = new xml2js.Parser();

// Jan-Patrick
// 'Y:/OneDrive/Dokumente/Uni/Uni Münster/WS17/Geosoft 2/Projekt/Testdaten/opt/sentinel2'

//filesearch
const testFolder = 'Y:/OneDrive/Dokumente/Uni/Uni Münster/WS17/Geosoft 2/Projekt/Testdaten/opt/sentinel2';
const fs = require('fs');
var fileNames = [];
var testfile = 'Y:/OneDrive/Dokumente/Uni/Uni Münster/WS17/Geosoft 2/Projekt/Testdaten/opt/sentinel2/S2B_MSIL1C_20171010T163309_N0205_R083_T15QYF_20171010T164025.SAFE/INSPIRE.xml';
var metaData = [];
/**
 * Gets the names of the files in the folder and saves to the global variable
 */
fs.readdir(testFolder, (err, files) => {
    if (files) {
        files.forEach(file => {
            let noExt = file.replace('.SAFE', '');
            fileNames.push(noExt);
            readMetaData(file);
            console.log(noExt);
        });
    }
})

function readMetaData(folderName) {
    var fileName = testFolder + "/" + folderName + "/INSPIRE.xml";
    fs.readFile(fileName , "utf-8", function (error, text) {
        if (error) {
            console.log(error);
        } else {
            parser.parseString(text, function (err, result) {
                 var test = result['gmd:MD_Metadata'];
                // console.log(util.inspect(test, false, null));
                metaData.push(test);
                console.log(util.inspect(metaData, false, null)); 
            });
        }
    });
}




/**
 * Helping function to search through the file name
 * @param {*} big the name of the file
 * @param {*} small array with the strings from the user input
 */
function arrayContainsArray(big, small) {
    if (small.length === 0) {
        return false;
    }
    return small.every(function (value) {
        return (big.indexOf(value) >= 0);
    });
}

/**
 * Searches in the file name
 */
router.get('/search', function (req, res) {
    var results = [];
    //if there's a name to look for
    if (req.query.name !== undefined) {
        var name = req.query.name;
        var nameSubstrings = name.split(' ');
        for (var i = 0; i < fileNames.length; i++) {
            var subElementArray = fileNames[i];
            if (arrayContainsArray(subElementArray, nameSubstrings)) {
                results.push(subElementArray);
            }
        }
    } else {
        results = fileNames;
    }

    //if there's one of the dates to compare with
    //there must be a more elegant way to compare them all...
    if (req.query.before !== '0' || req.query.after !== '0') {
        console.log(req.query.after);
        //splitting the name to compare just the date
        var split = [];
        for (let i = 0; i < results.length; i++) {
            split.push(results[i].split('_'));
        }
        //an empty array for the results
        var resultsWithDate = [];
        //if there's a before date
        if (req.query.before !== '0') {
            var before = req.query.before;
            //if there's an after date as well 
            if (req.query.after !== '0') {
                var after = req.query.after;
                //comparing all the data strings in the name with the passed before and after date
                for (let i = 0; i < split.length; i++) {
                    let date = split[i][2].substring(0, 8);
                    let formattedDate = date.slice(0, 4) + "-" + date.slice(4, 6) + "-" + date.slice(6, 8);
                    let parsedDate = Date.parse(formattedDate);
                    console.log("parsedBeforeandAfter" + parsedDate);
                    if (parsedDate <= before && parsedDate >= after) {
                        resultsWithDate.push(results[i]);
                    }
                }
            } else {
                //if there's only the before date.
                for (let i = 0; i < split.length; i++) {
                    let date = split[i][2].substring(0, 8);
                    let formattedDate = date.slice(0, 4) + "-" + date.slice(4, 6) + "-" + date.slice(6, 8);
                    let parsedDate = Date.parse(formattedDate);
                    console.log("parsedBefore" + parsedDate);
                    if (parsedDate <= before) {
                        resultsWithDate.push(results[i]);
                    }
                }
            }
        } else if (req.query.after !== '0') {
            //if there's only the after date
            var after = req.query.after;
            for (let i = 0; i < split.length; i++) {
                let date = split[i][2].substring(0, 8);
                let formattedDate = date.slice(0, 4) + "-" + date.slice(4, 6) + "-" + date.slice(6, 8);
                let parsedDate = Date.parse(formattedDate);
                console.log("parsedAfter" + parsedDate);
                if (parsedDate >= after) {
                    resultsWithDate.push(results[i]);
                }
            }
        }
        //returning the results when done
        res.json(resultsWithDate);
    } else {
        //returning the results with just the name comparison
        res.json(results);
    }
})

module.exports = router;