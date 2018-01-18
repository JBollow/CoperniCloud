var express = require('express');
var gdal = require("gdal");
var router = express.Router();
var xml2js = require('xml2js');
var util = require('util');
var parser = new xml2js.Parser();

// const testFolder = '';
// Jan-Patrick
const testFolder = 'Y:/OneDrive/Dokumente/Uni/Uni Münster/WS17/Geosoft 2/Projekt/Testdaten/opt/sentinel2';
// Anna
// const testFolder = 'F:/Dokumente/Uni/WS_2017/Geosoft2/Testdaten/opt/sentinel2';

//filesearch
const fs = require('fs');
var fileNames = [];
var metaData = [];
var metadataObjects = [];

/**
 * Gets the names of the files in the folder and saves to the global variable
 */
fs.readdir(testFolder, (err, files) => {
    if (files) {
        files.forEach(file => {
            let noExt = file.replace('.SAFE', '');
            let nameStrings = noExt.split('_');
            let date = nameStrings[2].substring(0, 8);
            let formattedDate = date.slice(0, 4) + "-" + date.slice(4, 6) + "-" + date.slice(6, 8);
            let parsedDate = Date.parse(formattedDate);
            metadataObjects.push({
                name: noExt,
                date: parsedDate
            });
            readMetaData(file);
            // console.log(nameObjects);
            // console.log(util.inspect(nameObjects, false, null));
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
                var metadata = result['gmd:MD_Metadata'];
                // test["name"] = folderName.replace('.SAFE', '');
                // metaData.push(test);
                // console.log(util.inspect(metaData, false, null));
                var name = folderName.replace('.SAFE', '');
                var coord = metadata['gmd:identificationInfo'][0]['gmd:MD_DataIdentification'][0]['gmd:extent'][0]['gmd:EX_Extent'][0]['gmd:geographicElement'][0]['gmd:EX_GeographicBoundingBox'][0];
                //saving the image coordinates
                var eastBoundLng = Number(coord['gmd:eastBoundLongitude'][0]['gco:Decimal']); //-89.9675241650983
                var westBoundLng = Number(coord['gmd:westBoundLongitude'][0]['gco:Decimal']); //-91.0560740062828
                var northBoundLat = Number(coord['gmd:northBoundLatitude'][0]['gco:Decimal']); //23.498246176850945
                var southBoundLat = Number(coord['gmd:southBoundLatitude'][0]['gco:Decimal']); //22.49054569679087
                for (let i = 0; i < metadataObjects.length; i++) {
                    if (metadataObjects[i].name === name) {
                        metadataObjects[i].geometry = {};
                        metadataObjects[i].geometry.eastBoundLng = eastBoundLng,
                            metadataObjects[i].geometry.westBoundLng = westBoundLng,
                            metadataObjects[i].geometry.northBoundLat = northBoundLat,
                            metadataObjects[i].geometry.southBoundLat = southBoundLat
                    }
                }
                console.log(util.inspect(metadataObjects, false, null));
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
    for (let i = 0; i < metadataObjects.length; i++) {
        if (metadataObjects[i].geometry) {
            //comparing to check whether at least one of the points is inside the bounding box
            if (((metadataObjects[i].geometry.northBoundLat > minLat && metadataObjects[i].geometry.northBoundLat < maxLat) || (metadataObjects[i].geometry.southBoundLat > minLat && metadataObjects[i].geometry.southBoundLat < maxLat)) && ((metadataObjects[i].geometry.westBoundLng > minLng && metadataObjects[i].geometry.westBoundLng < maxLng) || (metadataObjects[i].geometry.eastBoundLng > minLng && metadataObjects[i].geometry.eastBoundLng < maxLng))) {
                results.push(metadataObjects[i]);
                console.log(util.inspect(results, false, null));
            }
            //for debugging purposes
            // console.log("bounding box: " + maxLat + " " + minLat + " " + maxLng + " " + minLng);
            // console.log("image bounds: " + northBoundLat + " " + southBoundLat + " " + eastBoundLng + " " + westBoundLng);
        }

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
    if (req.query.name !== 0) {
        var name = req.query.name.toUpperCase();
        var nameSubstrings = name.replace("_", " ").split(' ');
        for (var i = 0; i < metadataObjects.length; i++) {
            var subElementArray = metadataObjects[i].name;
            if (arrayContainsArray(subElementArray, nameSubstrings)) {
                results.push(metadataObjects[i]);
            }
        }
    } else {
        results = metadataObjects;
    }

    //if there's one of the dates to compare with
    //there must be a more elegant way to compare them all...
    if (req.query.before !== '0' || req.query.after !== '0') {
        console.log(req.query.after);
        //an empty array for the results
        var resultsWithDate = [];
        //if there's a before date
        if (req.query.before !== '0') {
            var before = req.query.before;
            //if there's an after date as well 
            if (req.query.after !== '0') {
                var after = req.query.after;
                //comparing all the data strings in the name with the passed before and after date
                for (let i = 0; i < results.length; i++) {
                    if (results[i].date <= before && results[i].date >= after) {
                        resultsWithDate.push(results[i]);
                    }
                }
            } else {
                //if there's only the before date.
                for (let i = 0; i < results.length; i++) {
                    if (results[i].date <= before) {
                        resultsWithDate.push(results[i]);
                    }
                }
            }
        } else if (req.query.after !== '0') {
            //if there's only the after date
            var after = req.query.after;
            for (let i = 0; i < results.length; i++) {
                if (results[i].date >= after) {
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

/**
 * Handles coordinates of clicked location to the backend
 * for use with GDAL
 */
router.post('/set_coordinates', function (req, res) {

    var lat = req.query.lat;
    var lng = req.query.lng;

    // GDAL usage to get valuea t clicked location as in:
    // https://github.com/naturalatlas/node-gdal/issues/192
    var satellite_image = gdal.open(filename);  // filename is supposed to point to image variable
    var band = satellite_image.bands.get(1);
    var coordinateTransform = new gdal.CoordinateTransformation(gdal.SpatialReference.fromEPSG(4326), satellite_image);
    var pt = coordinateTransform.transformPoint(lng, lat);
    var values_at_click = (band.pixels.get(pt.x, pt.y));

    var popup_content = "You clicked at " + lat + ", " + lng + ". " +
                        "The values at this location are: " + values_at_click;

    res(popup_content);
});

module.exports = router;