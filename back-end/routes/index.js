var express = require('express');
var router = express.Router();
var xml2js = require('xml2js');
var util = require('util');
var parser = new xml2js.Parser();

// Jan-Patrick
// 'Y:/OneDrive/Dokumente/Uni/Uni Münster/WS17/Geosoft 2/Projekt/Testdaten/opt/sentinel2'
// Anna
// 'F:/Dokumente/Uni/WS_2017/Geosoft2/Testdaten/opt/sentinel2'

//filesearch
const testFolder = 'F:/Dokumente/Uni/WS_2017/Geosoft2/Testdaten/opt/sentinel2';
const fs = require('fs');
var fileNames = [];
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

/**
 * Creates an array of objects with metadata of each image
 * @param {*} folderName name of the folder the xml is located in
 */
function readMetaData(folderName) {
    var fileName = testFolder + "/" + folderName + "/INSPIRE.xml";
    fs.readFile(fileName, "utf-8", function (error, text) {
        if (error) {
            // console.log(error);
        } else {
            parser.parseString(text, function (err, result) {
                var test = result['gmd:MD_Metadata'];
                test["name"] = folderName.replace('.SAFE', '');;
                metaData.push(test);
                // console.log(util.inspect(metaData, false, null));
            });
        }
    });
}

/**
 * Searches in the metadata for the coordinates
 */
router.get('/searchCoordinates', function (req, res) {
    var results = [];
    //saving the request parameters
    var maxLat = req.query.maxLat;
    var minLat = req.query.minLat;
    var maxLng = req.query.maxLng;
    var minLng = req.query.minLng;
    for(let i = 0; i < metaData.length; i++) {
        //the part with the image bounds
        var coord = metaData[i]['gmd:identificationInfo'][0]['gmd:MD_DataIdentification'][0]['gmd:extent'][0]['gmd:EX_Extent'][0]['gmd:geographicElement'][0]['gmd:EX_GeographicBoundingBox'][0];
        //saving the image coordinates
        var eastBoundLng = Number(coord['gmd:eastBoundLongitude'][0]['gco:Decimal']); //-89.9675241650983
        var westBoundLng = Number(coord['gmd:westBoundLongitude'][0]['gco:Decimal']); //-91.0560740062828
        var northBoundLat = Number(coord['gmd:northBoundLatitude'][0]['gco:Decimal']); //23.498246176850945
        var southBoundLat = Number(coord['gmd:southBoundLatitude'][0]['gco:Decimal']); //22.49054569679087

        //comparing to check whether at least one of the points is inside the bounding box
        if( ((northBoundLat>minLat&&northBoundLat<maxLat)||(southBoundLat>minLat&&southBoundLat<maxLat)) && ((westBoundLng>minLng&&westBoundLng<maxLng)||(eastBoundLng>minLng&&eastBoundLng<maxLng)) ) {
            results.push(metaData[i].name);
        }
        //for debugging purposes
        console.log("bounding box: " + maxLat + " " + minLat + " " +maxLng + " " + minLng);
        console.log("image bounds: " +  northBoundLat + " " + southBoundLat + " " + eastBoundLng + " " + westBoundLng);
    }
    res.json(results);
})

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
        var name = req.query.name.toUpperCase();;
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