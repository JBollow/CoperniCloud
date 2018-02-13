coperniCloud.controller('mainController', ['$scope', '$timeout', 'leafletData', '$uibModal', '$http', function ($scope, $timeout, leafletData, $uibModal) {

    $scope.searchedItem = "";
    $scope.checked = false;
    $scope.input = {};
    $scope.requestsCounter = 0; //to avoid sending the request multiple times
    $scope.overlayControl = false;
    $scope.overlayName = "";
    $scope.opacityValue = 100;
    $scope.overlayVisible = true;
    $scope.bandOptions = [];
    $scope.isProcessing = false;
    $scope.hasInfo = false;
    $scope.layerInfo = "";

    var dataType = "";
    var tilesServer;
    var bandType = "TCI";
    var boundsData;
    var userRequestName;

    var backendUrl = "http://gis-bigdata:12015/";
    // Tilesserver
    // Uni VPN
    var serverUrl = "http://gis-bigdata:12013/";
    // Local
    // var serverUrl = "http://127.0.0.1:8887/";
    

    //the map
    angular.extend($scope, {
        center: {
            lat: 51.82956,
            lng: 7.276709,
            zoom: 5
        },
        markers: $scope.markers,
        defaults: {
            tileLayer: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
            zoomControlPosition: 'bottomright',
            tileLayerOptions: {
                opacity: 0.9,
                detectRetina: true,
                reuseTiles: true,
            },
            scrollWheelZoom: true
        },
        layers: {
            baselayers: {
                Esri_WorldTopoMap: {
                    name: 'Esri WorldTopoMap',
                    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
                    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
                    type: 'xyz',
                    layerOptions: {
                        minZoom: 3,
                        maxZoom: 13,
                        // apikey: ,
                        // mapid: ''
                    }
                },
                DarkMatter: {
                    name: 'DarkMatter',
                    url: 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
                    type: 'xyz',
                    layerOptions: {
                        minZoom: 3,
                        maxZoom: 13,
                        // apikey: ,
                        // mapid: ''
                    }
                },
                Grayscale: {
                    name: 'Grayscale',
                    url: 'http://korona.geog.uni-heidelberg.de/tiles/roadsg/x={x}&y={y}&z={z}',
                    type: 'xyz',
                    layerOptions: {
                        minZoom: 3,
                        maxZoom: 13,
                        // apikey: ,
                        // mapid: ''
                    }
                },
                OpenStreetMap_DE: {
                    name: 'OSMDE',
                    url: 'http://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png',
                    attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                    type: 'xyz',
                    layerOptions: {
                        minZoom: 3,
                        maxZoom: 13,
                        // apikey: ,
                        // mapid: ''
                    }
                },
                OpenStreetMap_HOT: {
                    name: 'OpenStreetMap Hot',
                    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
                    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>',
                    type: 'xyz',
                    layerOptions: {
                        minZoom: 3,
                        maxZoom: 13,
                        // apikey: ,
                        // mapid: ''
                    }
                }
            },
        },
        events: {
            map: {
                enable: ['click'],
                logic: 'emit'
            }
        }
    });

    // A global reference is set.
    leafletData.getMap('map').then(function (m) {
        $scope.baseMap = m;
        //preventing from going outside the bounds of one world :D
        var southWest = L.latLng(-89.98155760646617, -180),
            northEast = L.latLng(89.99346179538875, 180);
        var bounds = L.latLngBounds(southWest, northEast);
        $scope.baseMap.setMaxBounds(bounds);
        $scope.baseMap.on('drag', function () {
            $scope.baseMap.panInsideBounds(bounds, {
                animate: false
            });
        });
    });

    /**
     * Watches for the global variable 'searchedItem'
     */
    $scope.$watch('searchedItem', function () {
        if ($scope.searchedItem !== "") {
            $scope.input = {
                name: $scope.searchedItem
            };
            $scope.startSearch();
        }
    });

    /**
     * Sending the search form if enter is clicked
     * @param {*} event
     */
    $scope.triggerEnter = function ($event) {
        if (event.keyCode == 13) { // '13' is the key code for enter
            // $scope.startSearch($scope.input);
            $timeout(function () {
                document.querySelector('#searchButton').click();
            }, 0);
        }
    };

    /**
     * Enables drawing a rectangle and starts a search when finished
     */
    $scope.createBoundingBox = function () {
        $scope.requestsCounter = 0;
        var polygonDrawer = new L.Draw.Rectangle($scope.baseMap);
        polygonDrawer.enable();

        $scope.baseMap.on('draw:created', function (e) {
            var type = e.layerType,
                layer = e.layer;
            $scope.boundingbox = e.layer._latlngs;
            $scope.findCoord($scope.boundingbox);
        });
    };

    /**
     * Sends coordinates as search parameters
     * @param {*} boundingbox 
     */
    $scope.findCoord = function (boundingbox) {
        if ($scope.requestsCounter === 0) {
            $scope.startSearch();
            $scope.requestsCounter++;
        }
    };

    /**
     * Function that searches for values in the passed object
     */
    $scope.startSearch = function () {
        var parsedBefore, parsedAfter, name, maxLat, minLat, maxLng, minLng;
        if ($scope.input) {
            //Sending zeroes when an imput is empty to make checking in backend easier
            if ($scope.input.before !== undefined && $scope.input.before !== null) {
                parsedBefore = Date.parse($scope.input.before);
            } else {
                parsedBefore = '0';
            }

            if ($scope.input.after !== undefined && $scope.input.after !== null) {
                parsedAfter = Date.parse($scope.input.after);
            } else {
                parsedAfter = '0';
            }

            if ($scope.input.name !== undefined && $scope.input.name !== null) {
                name = $scope.input.name.toUpperCase();
            } else {
                name = '0';
            }
        }

        if ($scope.boundingbox !== undefined && $scope.boundingbox !== null) {
            maxLat = $scope.boundingbox[0][1].lat;
            minLat = $scope.boundingbox[0][0].lat;
            maxLng = $scope.boundingbox[0][2].lng;
            minLng = $scope.boundingbox[0][0].lng;
        } else {
            maxLat = '0';
            minLat = '0';
            maxLng = '0';
            minLng = '0';
        }

        $.ajax({
            url: backendUrl + "/search",
            type: 'get',
            data: {
                name: name,
                before: parsedBefore,
                after: parsedAfter,
                maxLat: maxLat,
                minLat: minLat,
                maxLng: maxLng,
                minLng: minLng
            },
            success: function (data) {
                if (data.length !== 0) {
                    $scope.showResults(data);
                } else {
                    swal({
                        titel: 'Error',
                        text: "No results!",
                        type: 'error',
                        customClass: 'swalCc',
                        buttonsStyling: false,
                    });
                }

            },
            error: function (message) {
                swal({
                    titel: 'Error',
                    text: message.statusText,
                    type: 'error',
                    customClass: 'swalCc',
                    buttonsStyling: false,
                });
            }
        });
        $scope.searchedItem = '';
        $scope.boundingbox = null;
        $scope.input = {};
    };

    /**
     * A pop-up for the results of the search
     * @param results
     */
    $scope.showResults = function (results) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: '../templates/popups/search-results.html',
            controller: 'resultsController',
            size: 'lg',
            resolve: {
                data: function () {
                    return results;
                }
            }
        });

        //for when the modal is closed
        modalInstance.result.then(function (meta) {
            $scope.selected = meta.result;
            let bounds = meta.bounds;
            console.log($scope.selected.name);
            $scope.overlayName = $scope.selected.name;
            //here open a window for image editing
            $scope.addLayer($scope.selected.name, bounds);
        });
    };

    /**
     * Function to add tile layers to the map
     */
    $scope.addTileServer = function (tilesServer, folderName, dataType, bandType) {
        $scope.tilesLayer = L.tileLayer(serverUrl + tilesServer + '/' + folderName + '.SAFE/' + dataType + bandType + '/{z}/{x}/{y}.png', {
            attribution: 'Tiles',
            tms: true,
            minZoom: 3,
            maxZoom: 13
        }).addTo($scope.baseMap);
        $scope.tilesLayer.setZIndex(100);
    };

    /**
     * Specifies what layer is added to the map
     */
    $scope.addLayer = function (folderName, bounds) {
        $scope.thereIsAnOverlay = false;
        $scope.hasInfo = false;
        $scope.isProcessing = false;

        if ($scope.tilesLayer) {
            $scope.baseMap.removeLayer($scope.tilesLayer);
        }

        // Different tile path for 1C and 2A        
        if (folderName.includes("MSIL1C")) {
            dataType = "";
            $scope.bandOptions = ["B01", "B02", "B03", "B04", "B05", "B06", "B07", "B08", "B8A", "B09", "B10", "B11", "B12", "TCI"];
        }
        if (folderName.includes("MSIL2A")) {
            dataType = "R10m/";

            $scope.bandOptions = ["B01", "B02", "B03", "B04", "B05", "B06", "B07", "B08", "B8A", "B09", "B10", "B11", "B12", "TCI", "AOT", "WVP"];
        }

        tilesServer = "tiles";
        $scope.addTileServer(tilesServer, folderName, dataType, bandType);
        boundsData = bounds;

        $scope.baseMap.fitBounds(bounds, {
            padding: [150, 150]
        });
        $scope.overlayName = folderName;
        $scope.selectedBand = "TCI";
        $scope.thereIsAnOverlay = true;
    };

    /**
     * Changes the band from the currently active sentinel2 image
     */
    $scope.changeBand = function () {
        $scope.thereIsAnOverlay = false;

        if ($scope.tilesLayer) {
            $scope.baseMap.removeLayer($scope.tilesLayer);
        }

        folderName = $scope.overlayName;

        // Different tile path for 1C and 2A        
        if (folderName.includes("MSIL1C")) {
            dataType = "";
        }
        if (folderName.includes("MSIL2A")) {
            if ($scope.selectedBand == "AOT") {
                dataType = "R10m/";                
            }
            if ($scope.selectedBand == "WVP") {
                dataType = "R10m/";                
            }
            if ($scope.selectedBand == "TCI") {
                dataType = "R10m/";                
            }
            if ($scope.selectedBand == "B02") {
                dataType = "R10m/";                
            }
            if ($scope.selectedBand == "B03") {
                dataType = "R10m/";                
            }
            if ($scope.selectedBand == "B04") {
                dataType = "R10m/";                
            }
            if ($scope.selectedBand == "B08") {
                dataType = "R10m/";                
            }
            if ($scope.selectedBand == "B05") {
                dataType = "R20m/";                
            }
            if ($scope.selectedBand == "B06") {
                dataType = "R20m/";                
            }
            if ($scope.selectedBand == "B07") {
                dataType = "R20m/";                
            }
            if ($scope.selectedBand == "B8A") {
                dataType = "R20m/";                
            }
            if ($scope.selectedBand == "B11") {
                dataType = "R20m/";                
            }
            if ($scope.selectedBand == "B12") {
                dataType = "R20m/";                
            }
            if ($scope.selectedBand == "B01") {
                dataType = "R60m/";                
            }
            if ($scope.selectedBand == "B09") {
                dataType = "R60m/";                
            }
            if ($scope.selectedBand == "B10") {
                dataType = "R60m/";                
            }
        }

        $scope.addTileServer(tilesServer, folderName, dataType, $scope.selectedBand);
        $scope.tilesLayer.setOpacity($scope.opacityValue / 100);
        $scope.thereIsAnOverlay = true;
    };

    //for the extended search animation 
    $scope.toggleChecked = function () {
        $scope.checked = !$scope.checked;
    };

    /**
     * A pop-up for help
     */
    $scope.help = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: '../templates/popups/help.html',
            controller: 'helpController',
            size: 'lg'
        });
    };

    /**
     * A pop-up for compute
     */
    $scope.compute = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: '../templates/popups/compute.html',
            controller: 'computeController',
            size: 'lg',
            resolve: {
                data: function () {
                    return $scope.overlayName;
                }
            }
        });

        //for when the modal is closed
        modalInstance.result.then(function (operationsObject) {
            operationsObject.image = $scope.overlayName;
            userRequestName = $scope.overlayName;
            var type = "sendComputeBand";
            $scope.sendCalc(operationsObject, type);
        });
    };

    /**
     * A pop-up for bandColorControllers
     */
    $scope.bandColorController = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: '../templates/popups/bandColor.html',
            controller: 'bandColorController',
            size: 'lg',
            resolve: {
                data: function () {
                    return $scope.overlayName;
                }
            }
        });

        //for when the modal is closed
        modalInstance.result.then(function (operationsObject) {
            operationsObject.image = $scope.overlayName;
            userRequestName = $scope.overlayName;
            var type = "sendColorBand";
            $scope.sendCalc(operationsObject, type);
        });
    };

    /**
     * Changes the opacity from the active tile layer
     */
    $scope.changeOpacity = function () {
        var opacity = $scope.opacityValue / 100;
        $scope.tilesLayer.setOpacity(opacity);
    };

    /**
     * Shows or hides the active tile layer
     */
    $scope.fadeOverlay = function () {
        if ($scope.overlayVisible) {
            var opacity = $scope.opacityValue / 100;
            $scope.tilesLayer.setOpacity(opacity);
        } else {
            $scope.tilesLayer.setOpacity(0);
        }
    };

    /**
     * Saves the current image to the db
     */
    $scope.save = function () {
        if ($scope.overlayName) {
            var sendData = {
                tilesServer: tilesServer,
                folderName: $scope.overlayName,
                bandType: $scope.selectedBand,
                opacityValue: $scope.opacityValue,
                summarystats: $scope.layerInfo,
                bounds00: boundsData[0][0],
                bounds01: boundsData[0][1],
                bounds10: boundsData[1][0],
                bounds11: boundsData[1][1],
            };

            console.log(sendData);
            if (tilesServer != "userrequest") {
                if ($scope.overlayName.includes("MSIL1C")) {
                    sendData.dataType = "";
                }
                if ($scope.overlayName.includes("MSIL2A")) {
                    if ($scope.selectedBand == "AOT") {
                        dataType = "R10m/";                
                    }
                    if ($scope.selectedBand == "WVP") {
                        dataType = "R10m/";                
                    }
                    if ($scope.selectedBand == "TCI") {
                        dataType = "R10m/";                
                    }
                    if ($scope.selectedBand == "B02") {
                        dataType = "R10m/";                
                    }
                    if ($scope.selectedBand == "B03") {
                        dataType = "R10m/";                
                    }
                    if ($scope.selectedBand == "B04") {
                        dataType = "R10m/";                
                    }
                    if ($scope.selectedBand == "B08") {
                        dataType = "R10m/";                
                    }
                    if ($scope.selectedBand == "B05") {
                        dataType = "R20m/";                
                    }
                    if ($scope.selectedBand == "B06") {
                        dataType = "R20m/";                
                    }
                    if ($scope.selectedBand == "B07") {
                        dataType = "R20m/";                
                    }
                    if ($scope.selectedBand == "B8A") {
                        dataType = "R20m/";                
                    }
                    if ($scope.selectedBand == "B11") {
                        dataType = "R20m/";                
                    }
                    if ($scope.selectedBand == "B12") {
                        dataType = "R20m/";                
                    }
                    if ($scope.selectedBand == "B01") {
                        dataType = "R60m/";                
                    }
                    if ($scope.selectedBand == "B09") {
                        dataType = "R60m/";                
                    }
                    if ($scope.selectedBand == "B10") {
                        dataType = "R60m/";                
                    }
                }
            }

            $.ajax({
                type: "POST",
                url: backendUrl + "/save",
                dataType: 'json',
                data: sendData,
                success: function (id) {
                    console.log("Object ID: " + id);
                    swal({
                        type: 'success',
                        html: "<p style='font-size: 22px;font-weight: 400;'>Your image was saved to the DB!</P><br><p style='font-size: 18px;font-weight: 400;'>Please take a note of is ID:</p><p style='font-size: 14px;font-weight: 400; color: red;'>(required for loading)</p><br><p style='display: inline;font-size: 20px;font-weight: 1000;' class='saveID'>" + id + "</p>",
                        customClass: 'swalCc2',
                        showCancelButton: true,
                        cancelButtonText: "Ok",
                        confirmButtonText: "<i class='fa fa-clipboard' aria-hidden='true'></i>",
                        buttonsStyling: false,
                    }).then((result) => {
                        if (result.value) {
                            // a very clever part ;)
                            var copyDiv = document.createElement('h5');
                            copyDiv.contentEditable = true;
                            document.body.appendChild(copyDiv);
                            copyDiv.innerHTML = id;
                            copyDiv.unselectable = "off";
                            copyDiv.focus();
                            document.execCommand('SelectAll');
                            document.execCommand("Copy", false, null);
                            window.getSelection().removeAllRanges();
                            document.body.removeChild(copyDiv);
                        }
                    });
                },
                error: function (message) {
                    swal({
                        titel: 'Error',
                        html: "Something went wrong :( <br>" + message,
                        type: 'error',
                        customClass: 'swalCc',
                        buttonsStyling: false,
                    });
                }
            });
        } else {
            swal({
                titel: 'Error',
                html: "It looks like there is nothing to save.",
                type: 'error',
                customClass: 'swalCc',
                buttonsStyling: false,
            });
        }

    };

    /**
     * Loads a saved image from the db
     */
    $scope.load = function () {
        swal({
            type: 'info',
            html: "<p style='font-size: 22px;font-weight: 400;'>Load a image from the DB</p><br><br><p style='font-size: 18px;font-weight: 400;'><b>ID: </b></p>",
            input: 'text',
            showCancelButton: true,
            closeOnConfirm: false,
            customClass: 'swalCc',
            buttonsStyling: false,
        }).then(function (input) {
            if (input.value == undefined) {} else {
                if (input.value == "") {
                    swal({
                        titel: 'Error',
                        html: "You need to enter an ID.",
                        type: 'info',
                        customClass: 'swalCc',
                        buttonsStyling: false,
                    });
                } else {
                    var sendId = {
                        id: input.value
                    };
                    $.ajax({
                        type: "POST",
                        url: backendUrl + "/load",
                        dataType: 'json',
                        data: sendId,
                        success: function (array) {
                            swal({
                                type: 'success',
                                text: "Here is your image.",
                                showConfirmButton: false,
                                timer: 1500,
                                customClass: 'swalCc',
                                buttonsStyling: false,
                            });
                            $scope.thereIsAnOverlay = false;
                            $scope.hasInfo = false;
                            $scope.isProcessing = false;
                            $scope.selectedBand = array[0].object.bandType;

                            if ($scope.tilesLayer) {
                                $scope.baseMap.removeLayer($scope.tilesLayer);
                            }

                            if (array[0].object.tilesServer != "userrequest") {
                                if (array[0].object.folderName.includes("MSIL1C")) {
                                    dataType = "";
                                    $scope.bandOptions = ["B01", "B02", "B03", "B04", "B05", "B06", "B07", "B08", "B8A", "B09", "B10", "B11", "B12", "TCI"];
                                }
                                if (array[0].object.folderName.includes("MSIL2A")) {                                    
                                    $scope.bandOptions = ["B01", "B02", "B03", "B04", "B05", "B06", "B07", "B08", "B8A", "B09", "B10", "B11", "B12", "TCI", "AOT", "WVP"];
                                    if ($scope.selectedBand == "AOT") {
                                        dataType = "R10m/";                
                                    }
                                    if ($scope.selectedBand == "WVP") {
                                        dataType = "R10m/";                
                                    }
                                    if ($scope.selectedBand == "TCI") {
                                        dataType = "R10m/";                
                                    }
                                    if ($scope.selectedBand == "B02") {
                                        dataType = "R10m/";                
                                    }
                                    if ($scope.selectedBand == "B03") {
                                        dataType = "R10m/";                
                                    }
                                    if ($scope.selectedBand == "B04") {
                                        dataType = "R10m/";                
                                    }
                                    if ($scope.selectedBand == "B08") {
                                        dataType = "R10m/";                
                                    }
                                    if ($scope.selectedBand == "B05") {
                                        dataType = "R20m/";                
                                    }
                                    if ($scope.selectedBand == "B06") {
                                        dataType = "R20m/";                
                                    }
                                    if ($scope.selectedBand == "B07") {
                                        dataType = "R20m/";                
                                    }
                                    if ($scope.selectedBand == "B8A") {
                                        dataType = "R20m/";                
                                    }
                                    if ($scope.selectedBand == "B11") {
                                        dataType = "R20m/";                
                                    }
                                    if ($scope.selectedBand == "B12") {
                                        dataType = "R20m/";                
                                    }
                                    if ($scope.selectedBand == "B01") {
                                        dataType = "R60m/";                
                                    }
                                    if ($scope.selectedBand == "B09") {
                                        dataType = "R60m/";                
                                    }
                                    if ($scope.selectedBand == "B10") {
                                        dataType = "R60m/";                
                                    }
                                }
                            }

                            boundsData = [
                                [array[0].object.bounds00, array[0].object.bounds01],
                                [array[0].object.bounds10, array[0].object.bounds11]
                            ];

                            $scope.baseMap.fitBounds(boundsData, {
                                padding: [150, 150]
                            });

                            $scope.addTileServer(array[0].object.tilesServer, array[0].object.folderName, dataType, array[0].object.bandType);
                            tilesServer = array[0].object.tilesServer;

                            $scope.overlayName = array[0].object.folderName;
                            $scope.selectedBand = array[0].object.bandType;

                            $('#opacitiyValueId').val(array[0].object.opacityValue);
                            $scope.opacityValue = array[0].object.opacityValue;
                            $scope.tilesLayer.setOpacity(array[0].object.opacityValue / 100);

                            if (array[0].object.tilesServer == "userrequest") {
                                $scope.layerInfo = array[0].object.summarystats;
                                $scope.hasInfo = true;
                            } else {
                                $scope.hasInfo = false;
                            }
                            $scope.thereIsAnOverlay = true;
                        },
                        error: function (message) {
                            swal({
                                titel: 'Error',
                                html: "Something went wrong :(",
                                type: 'error',
                                customClass: 'swalCc',
                                buttonsStyling: false,
                            });
                        }
                    });
                }
            }
        }).done();
    };

    /**
     * Returns the original senitel2 measurement values in a leaflet popup 
     */
    $scope.mouseClick = function () {
        if (tilesServer != "tiles") {
            swal({
                html: "Only for the original sentinel imagery :/",
                type: 'info',
                customClass: 'swalCc',
                buttonsStyling: false,
            });
        } else {
            $scope.baseMap.once('click', function (e) {
                console.log(boundsData);
                console.log(e.latlng);
                //has to be where the image is!
                if (e.latlng.lat < boundsData[0][0] && e.latlng.lat > boundsData[1][0] && e.latlng.lng < boundsData[0][1] && e.latlng.lng > boundsData[1][1]) {
                    var coordToSend = {
                        lat: e.latlng.lat,
                        lng: e.latlng.lng,
                        fileName: $scope.overlayName,
                        band: $scope.selectedBand
                    };

                    $.ajax({
                        type: "POST",
                        url: backendUrl + "set_coordinates",
                        dataType: 'json',
                        data: coordToSend,
                        success: function (data) {
                            var popup = L.popup.angular({
                                    template: `
                                <div>                                
                                    <div><p style="font-size: 16px;line-height: 20px;">{{$content.message}}</p></div>
                                </div>
                            `,
                                }).setLatLng(e.latlng).setContent({
                                    'lat': e.latlng.lat,
                                    'lng': e.latlng.lng,
                                    'message': data.message
                                })
                                .openOn($scope.baseMap);
                        },
                        error: function (message) {
                            swal({
                                titel: 'Error',
                                html: "Something went wrong :( <br>",
                                type: 'error',
                                customClass: 'swalCc',
                                buttonsStyling: false,
                            });
                        }
                    });
                } else {
                    swal({
                        html: "Please click on the image :) <br>",
                        type: 'info',
                        customClass: 'swalCc',
                        buttonsStyling: false,
                    });
                }
            });
        }
    };

    /**
     * Sends the calculations to the backend
     */
    $scope.sendCalc = function (sendData, type) {
        swal({
            type: 'success',
            text: "Calculation of your image is in progress!",
            showConfirmButton: false,
            timer: 1500,
            customClass: 'swalCc',
            buttonsStyling: false,
        });

        console.log(sendData);

        $scope.isProcessing = true;
        $scope.hasInfo = false;

        $.ajax({
            type: "POST",
            url: backendUrl + "/" + type,
            dataType: 'json',
            data: sendData,
            traditional: true,
            cache: false,
            success: function (object) {
                swal({
                    type: 'success',
                    text: "Calculation done!",
                    showConfirmButton: false,
                    timer: 1000,
                    customClass: 'swalCc',
                    buttonsStyling: false,
                });
                if ($scope.tilesLayer) {
                    $scope.baseMap.removeLayer($scope.tilesLayer);
                }

                $scope.bandOptions = [];
                tilesServer = "userrequest";
                folderName = $scope.overlayName;
                dataType = "";

                $scope.selectedBand = object._id;
                $scope.layerInfo = object.object.summary;

                $scope.baseMap.fitBounds(boundsData, {
                    padding: [150, 150]
                });

                $scope.addTileServer(tilesServer, folderName, dataType, $scope.selectedBand);

                $scope.opacityValue = 100;
                $scope.tilesLayer.setOpacity(1);

                $scope.hasInfo = true;
                $scope.$apply(function(){$scope.isProcessing = false;});
                $scope.thereIsAnOverlay = true;
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {                
                sweetAlert('Oops...', XMLHttpRequest.responseText, 'error');
                $scope.hasInfo = false;
                $scope.thereIsAnOverlay = true;
                $scope.$apply(function(){$scope.isProcessing = false;});
            },
            timeout: 300000
        });
    };
}]);
