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
    var serverUrl = "http://gis-bigdata:12015/";
    var boundsData;

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

            // console.log(boundingbox);
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
            url: 'http://localhost:10002/search',
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
            $scope.bandOptions = ["AOT", "B02", "B03", "B04", "B08", "TCI", "WVP"];
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
            dataType = "R10m/";
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
            size: 'lg'
        });

        //for when the modal is closed
        modalInstance.result.then(function (operationsObject) {
            operationsObject.image = $scope.overlayName;
            console.log(operationsObject);
            $scope.sendComputeBand(operationsObject);
        });
    };

    /**
     * A pop-up for bandColorControllers
     */
    $scope.bandColorController = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: '../templates/popups/bandColorController.html',
            controller: 'bandColorController',
            size: 'lg'
        });

        //for when the modal is closed
        modalInstance.result.then(function (operationsObject) {
            operationsObject.image = $scope.overlayName;
            console.log(operationsObject);
            $scope.sendColorBand(operationsObject);
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
            console.log(boundsData);


            var sendData = {
                tilesServer: tilesServer,
                folderName: $scope.overlayName,
                bandType: $scope.selectedBand,
                opacityValue: $scope.opacityValue,
                bounds00: boundsData[0][0],
                bounds01: boundsData[0][1],
                bounds10: boundsData[1][0],
                bounds11: boundsData[1][1],
            }

            console.log(sendData);

            if ($scope.overlayName.includes("MSIL1C")) {
                sendData.dataType = "";
            }
            if ($scope.overlayName.includes("MSIL2A")) {
                sendData.dataType = "R10m/";
            }

            // TODO
            // Bei UserRequests muss noch etwas her!

            // TODO
            // ngclipboard klappt nicht im swal?
            $.ajax({
                type: "POST",
                url: "http://localhost:10002/save",
                dataType: 'json',
                data: sendData,
                success: function (id) {
                    console.log("Object ID: " + id);
                    swal({
                        titel: 'Success',
                        html: "<p style='font-size: 22px;font-weight: 400;'>Your image was saved to the DB!</P><br><p style='font-size: 18px;font-weight: 400;'>Please take a note of is ID:</p><p style='font-size: 14px;font-weight: 400; color: red;'>(required for loading)</p><br><p style='display: inline;font-size: 20px;font-weight: 1000;' id='saveID'>" + id + "</p><button class='copy' ngclipboard='' data-clipboard-text='" + id + "'><i class='fa fa-clipboard' aria-hidden='true'></i></button>",
                        type: 'info',
                        customClass: 'swalCc',
                        buttonsStyling: false,
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
                        url: "http://localhost:10002/load",
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

                            if (array[0].object.folderName.includes("MSIL1C")) {
                                dataType = "";
                                $scope.bandOptions = ["B01", "B02", "B03", "B04", "B05", "B06", "B07", "B08", "B8A", "B09", "B10", "B11", "B12", "TCI"];
                            }
                            if (array[0].object.folderName.includes("MSIL2A")) {
                                dataType = "R10m/";
                                $scope.bandOptions = ["AOT", "B02", "B03", "B04", "B08", "TCI", "WVP"];
                            }

                            var boundsData = [
                                [array[0].object.bounds00, array[0].object.bounds01],
                                [array[0].object.bounds10, array[0].object.bounds11]
                            ]
                            $scope.baseMap.fitBounds(boundsData, {
                                padding: [150, 150]
                            });

                            // TODO
                            // Bei UserRequests muss noch etwas her!

                            $scope.addTileServer(array[0].object.tilesServer, array[0].object.folderName, dataType, array[0].object.bandType);
                            tilesServer = array[0].object.tilesServer;

                            $scope.overlayName = array[0].object.folderName;
                            $scope.selectedBand = array[0].object.bandType;

                            // TODO klappt nicht richitg, Regler falsch
                            $scope.opacityValue = array[0].object.opacityValue;
                            $scope.tilesLayer.setOpacity(array[0].object.opacityValue / 100);

                            // TODO bei custom anders
                            $scope.hasInfo = false;
                            // $scope.isProcessing = ;
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
    }

    /**
     * Returns the original senitel2 measurement values in a leaflet popup 
     */
    $scope.mouseClick = function () {

        // TODO
        // hier muss an der stelle ein Leafletpopup erscheinen mit den angeforderten daten


        // muss weg ist nur zur demo
        $scope.isProcessing = true;
        $scope.hasInfo = true;
    };

    /**
     * Sends the computebands expression
     */
    $scope.sendComputeBand = function (sendData) {
        $.ajax({
            type: "POST",
            url: "http://localhost:10002/sendComputeBand",
            dataType: 'json',
            data: sendData,
            traditional: true,
            cache: false,
            success: function (object) {
                swal({
                    type: 'success',
                    text: "Calculation of your image is in progress!",
                    showConfirmButton: false,
                    timer: 1500,
                    customClass: 'swalCc',
                    buttonsStyling: false,
                });
                $scope.isProcessing = true;
                $scope.hasInfo = false;

                // TODO
                // something like load

                $scope.hasInfo = true;
                $scope.isProcessing = false;
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                sweetAlert('Oops...', 'Something went wrong!', 'error');
                $scope.hasInfo = true;
                $scope.isProcessing = false;
            },
            timeout: 3000
        });
    };


    /**
     * Sends the colorband operations
     */
    $scope.sendColorBand = function (sendData) {
        $.ajax({
            type: "POST",
            url: "http://localhost:10002/sendColorBand",
            dataType: 'json',
            data: sendData,
            traditional: true,
            cache: false,
            success: function () {
                swal({
                    type: 'success',
                    text: "Calculation of your image is in progress!",
                    showConfirmButton: false,
                    timer: 1500,
                    customClass: 'swalCc',
                    buttonsStyling: false,
                });

                $scope.isProcessing = true;
                $scope.hasInfo = false;

                // TODO
                // something like load

                $scope.hasInfo = true;
                $scope.isProcessing = false;
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                sweetAlert('Oops...', 'Something went wrong!', 'error');
            },
            timeout: 3000
        });
    };
}]);