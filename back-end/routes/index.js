var express = require('express');
var router = express.Router();
var xml2js = require('xml2js');
var util = require('util');
var parser = new xml2js.Parser();
var unirest = require('unirest');

const pyServerURL = "http://localhost:8088"

// Docker
// const localPath = '';
// Jan-Patrick
// const localPath = 'Y:/OneDrive/Dokumente/Uni/Uni Münster/WS17/Geosoft 2/Projekt/Testdaten';
// Anna
const localPath = 'F:/Dokumente/Uni/WS_2017/Geosoft2/Testdaten';

const testFolder = localPath+'/opt/sentinel2';

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
});

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
                            metadataObjects[i].geometry.southBoundLat = southBoundLat;
                    }
                }
                // console.log(util.inspect(metadataObjects, false, null));
            });
        }
    });

}

function searchInTheBoundingBox(minLat, minLng, maxLat, maxLng, objects) {
    var boundingBoxResults = [];

    for (let i = 0; i < objects.length; i++) {
        if (objects[i].geometry) {
            //comparing to check whether at least one of the points is inside the bounding box
            if (((objects[i].geometry.northBoundLat > minLat && objects[i].geometry.northBoundLat < maxLat) || (objects[i].geometry.southBoundLat > minLat && objects[i].geometry.southBoundLat < maxLat)) && ((objects[i].geometry.westBoundLng > minLng && objects[i].geometry.westBoundLng < maxLng) || (objects[i].geometry.eastBoundLng > minLng && objects[i].geometry.eastBoundLng < maxLng))) {
                boundingBoxResults.push(objects[i]);
                console.log(util.inspect(boundingBoxResults, false, null));
            }
            //for debugging purposes
            // console.log("bounding box: " + maxLat + " " + minLat + " " + maxLng + " " + minLng);
            // console.log("image bounds: " + northBoundLat + " " + southBoundLat + " " + eastBoundLng + " " + westBoundLng);
        }
    }
    return boundingBoxResults;
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
 * Searches in the file name and coordinates
 */
router.get('/search', function (req, res) {
    var results = [];
    var coordinateSearch = false;
    var maxLat, maxLng, minLat, minLng;

    //query to know whether to start the coordinate search later
    if (req.query.maxLat !== '0' && req.query.minLat !== '0' && req.query.maxLng !== '0' && req.query.minLng !== '0') {
        maxLat = req.query.maxLat;
        minLat = req.query.minLat;
        maxLng = req.query.maxLng;
        minLng = req.query.minLng;
        coordinateSearch = true;
    }
    //if there's a name to look for
    if (req.query.name !== '0') {
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
        if (coordinateSearch === true) {
            var fullResults = searchInTheBoundingBox(minLat, minLng, maxLat, maxLng, resultsWithDate);
            res.json(fullResults);
        } else {
            res.json(resultsWithDate);
        }
        //returning the results when done
    } else {
        if (coordinateSearch === true) {
            var fullResults = searchInTheBoundingBox(minLat, minLng, maxLat, maxLng, results);
            res.json(fullResults);
        } else {
            //returning the results with just the name comparison
            res.json(results);
        }
    }
});

/**
 * Objects for band color calculations
 */
router.post('/sendColorBand', function (req, res) {
    // Set our internal DB variable
    var db = req.db;

    // Set our collection
    var collection = db.get('copernicollectioncolorband');

    // Get our object
    var object = req.body;

    // Checks if this userrequest was already rendered
    collection.findOne({
        'object.operations': object.operations,
        'object.image': object.image
    }, function (err, document) {
        if (err) {
            // If something failed in finding any object
            res.send("There was a problem with the database.");
        } else {
            if (document) {
                // If the same object was found in the DB
                res.send(document);
            } else {
                // Submit to the DB if there isn't an object like this already
                collection.insert({
                    object
                }, function (err, doc) {
                    if (err) {
                        // If it failed, return error
                        res.send("There was a problem adding the information to the database.");
                    } else {

                        // Helpobject and array for calculations
                        var helpobject = req.body;
                        var arrofObjects = [];
                        var counter = helpobject.operations.length;
                        for (i = 0; i < counter; i = i + 4) {
                            arrofObjects.push({
                                "band": helpobject.operations[i],
                                "color": helpobject.operations[i + 1],
                                "contrast": helpobject.operations[i + 2],
                                "brightness": helpobject.operations[i + 3]
                            });
                        }

                        var pythonUrl = pyServerURL + "/create_new_image";
                        var sendData = {
                            "id": doc._id,
                            "image": doc.object.image,
                            "operations": arrofObjects
                        };

                        unirest.get(pythonUrl)
                            .headers({
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            })
                            .send(sendData)
                            .timeout(300000)
                            .end(function (response) {
                                if (response.error) {
                                    console.log("bottle server error in der response");
                                    collection.remove(doc);
                                    res.send("There was a problem calculating the image.");
                                } else {
                                    var summaryArray = []

                                    response.raw_body.band.forEach(function (entry, i) {
                                        i++;
                                        mean = entry.mean;
                                        median = entry.median;
                                        max = entry.max;
                                        min = entry.min;
                                        stdDev = entry.stdDev;
                                        summaryArray.push("Band" + i + "<br>Mean: " + mean + "<br>Median: " + median + "<br>Max: " + max + "<br>Min: " + min + "<br>StdDev: " + stdDev + "<br><br>")
                                    });

                                    summaryString = summaryArray.toString();
                                    summaryString = summaryString.replace(/,/g, '');

                                    var summary = summaryString;

                                    // Creates new object to update the DB with the summary
                                    var newObject = doc;
                                    newObject.object.summary = summary;
                                    collection.update(doc._id, newObject);

                                    // Sends back the object
                                    res.send(newObject);
                                }
                            });
                    }
                });
            }
        }
    });
});

/**
 * Objects for band compute calculations
 */
router.post('/sendComputeBand', function (req, res) {
    // Set our internal DB variable
    var db = req.db;

    // Set our collection
    var collection = db.get('copernicollectioncomputeband');

    // Get our object
    var object = req.body;

    // Checks if this userrequest was already rendered
    collection.findOne({
        'object.operations': object.operations,
        'object.image': object.image
    }, function (err, document) {
        if (err) {
            // If something failed in finding any object
            res.send("There was a problem with the database.");
        } else {
            if (document) {
                // If the same object was found in the DB
                res.send(document);
            } else {
                // Submit to the DB if there isn't an object like this already
                collection.insert({
                    object
                }, function (err, doc) {
                    if (err) {
                        // If it failed, return error
                        res.send("There was a problem adding the information to the database.");
                    } else {

                        var pythonUrl = pyServerURL + "/arithmetic_band_combination";
                        var sendData = {
                            "id": doc._id,
                            "image": doc.object.image,
                            "operations": doc.object.operations
                        };

                        unirest.get(pythonUrl)
                            .headers({
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            })
                            .send(sendData)
                            .end(function (response) {
                                if (response.error) {
                                    collection.remove(doc);
                                    res.send("There was a problem calculating the image.");
                                } else {
                                    // Wenn die response ein object ist?
                                    var summary = response.summary;

                                    // Creates new object to update the DB with the summary
                                    var newObject = doc;
                                    newObject.object.summary = summary;
                                    collection.update(doc._id, newObject);

                                    // Sends back the object
                                    res.send(newObject);
                                }
                            });
                    }
                });
            }
        }
    });
});

/**
 * Saving a object to the db
 */
router.post('/save', function (req, res) {

    // Set our internal DB variable
    var db = req.db;

    // Get our object
    var object = req.body;

    // Set our collection
    var collection = db.get('copernicollection');

    // Submit to the DB
    collection.insert({
        object
    }, function (err, doc) {
        if (err) {

            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        } else {

            // Or print object id
            res.send(doc._id);
        }
    });
});

/**
 * Loading a requested object from the db
 */
router.post('/load', function (req, res) {

    // Set our internal DB variable
    var db = req.db;

    // Get our object
    var object = req.body;

    // Set our collection
    var collection = db.get('copernicollection');

    // Query from our DB
    collection.find({
        _id: object.id
    }, function (e, docs) {
        res.json(docs);
    });
});

/**
 * Handles coordinates of clicked location to the backend
 * for use with GDAL
 */
router.post('/set_coordinates', function (req, res) {

    var lat = req.body.lat;
    var lng = req.body.lng;
    var band = req.body.band;
    var image = req.body.fileName;
    var values_at_click = "Server Problem.";
    var popup_content = {};

    var pythonUrl = pyServerURL + "/get_point_info";

    unirest.get(pythonUrl)
        .headers({
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        })
        .send({
            "lat": lat,
            "lng": lng,
            "band": band,
            "image": image
        })
        .end(function (response) {
            if (response.error) {
                values_at_click = "Something went wrong :(";
                popup_content = {
                    message: "You clicked at " + Math.round(lat * 10000) / 10000 + ", " + Math.round(lng * 10000) / 10000 + ". " +
                        "The values at this location are: " + values_at_click
                }
                res.send(popup_content);
            } else {
                values_at_click = response.raw_body.pointInfo.toString();
                popup_content = {
                    message: "You clicked at " + Math.round(lat * 10000) / 10000 + ", " + Math.round(lng * 10000) / 10000 + ". " +
                        "The values at this location are: " + values_at_click
                }
                res.send(popup_content);
            }
        });
});

module.exports = router;