coperniCloud.controller('mainController', ['$scope', '$timeout', 'leafletData', '$uibModal', function ($scope, $timeout, leafletData, $uibModal) {

    $scope.searchedItem = "";
    $scope.checked = false;
    $scope.input = {};
    $scope.requestsCounter = 0; //to avoid sending the request multiple times

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
            let input = {
                name: $scope.searchedItem
            };
            $scope.startSearch(input);
        }
    });

    /**
     * Sending the search form if enter is clicked
     * @param {*}  event
     */
    $scope.triggerEnter = function ($event) {
        if (event.keyCode == 13) { // '13' is the key code for enter
            // $scope.startSearch(input);
            $timeout(function () {
                document.querySelector('#searchButton').click();
            }, 0);
        }
    };

    /**
     * Function that searches for values in the passed object
     */
    $scope.startSearch = function (input) {
        var parsedBefore, parsedAfter, name;
        //Sending zeroes when an imput is empty to make checking in backend easier
        if (input.before !== undefined && input.before !== null) {
            parsedBefore = Date.parse(input.before);
        } else {
            parsedBefore = '0';
        }

        if (input.after !== undefined && input.after !== null) {
            parsedAfter = Date.parse(input.after);
        } else {
            parsedAfter = '0';
        }

        if (input.name !== undefined && input.name !== null) {
            name = input.name.toUpperCase();
        } else {
            name = '0';
        }

        $.ajax({
            url: 'http://localhost:10002/search',
            type: 'get',
            data: {
                name: name,
                before: parsedBefore,
                after: parsedAfter
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
                    text: message,
                    type: 'error',
                    customClass: 'swalCc',
                    buttonsStyling: false,
                });
            }
        });
        $scope.searchedItem = '';
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
        modalInstance.result.then(function (selectedItem) {
            $scope.selected = selectedItem;
            console.log($scope.selected.name);
            //here open a window for image editing
            $scope.addLayer($scope.selected.name);
        });
    };

    $scope.addLayer = function (folderName) {
        if ($scope.tilesLayer) {
            $scope.baseMap.removeLayer($scope.tilesLayer);
        }
        // http://gis-bigdata:12015/tiles/ klappt nur im uni vpn und wenn der server läuft
        $scope.tilesLayer = L.tileLayer('http://gis-bigdata:12015/tiles/' + folderName + '.SAFE/TCI/{z}/{x}/{y}.png', {
            attribution: 'Tiles',
            tms: true,
            minZoom: 3,
            maxZoom: 13
        }).addTo($scope.baseMap);
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
            boundingbox = e.layer._latlngs;
            console.log(boundingbox);
            $scope.findCoord(boundingbox);
        });
    };

    /**
     * Sends coordinates as search parameters
     * @param {*} boundingbox 
     */
    $scope.findCoord = function (boundingbox) {

        if ($scope.requestsCounter === 0) {
            var maxLat = boundingbox[0][1].lat;
            var minLat = boundingbox[0][0].lat;
            var maxLng = boundingbox[0][2].lng;
            var minLng = boundingbox[0][0].lng;
            $.ajax({
                url: 'http://localhost:10002/searchCoordinates',
                type: 'get',
                data: {
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
                        text: message,
                        type: 'error',
                        customClass: 'swalCc',
                        buttonsStyling: false,
                    });
                }
            });
            $scope.requestsCounter++;
        }

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
    };

    function postjson() {

        var namearray = [];
        var name = $("#etappenname").val();
        start = $("#etappenstart").val();
        ende = $("#etappenende").val();
        var datum = $("#etappendatum").val();
        var link = $("#etappenwebsite").val();
        var bild = $("#etappenbilder").val();
    
    
        if (name != "") {
    
            var data = editableLayers.toGeoJSON();
            console.log("editableLayers");
            console.log(editableLayers);
    
            // Add a name to the layer
            data.name = name;
    
            var properties = {
                popupContent: "<p style='font-size: 14px;'><b>" + name + "<b><p style='font-size: 12px;'>" + start + "<p style='font-size: 12px;'>" + ende + "<p style='font-size: 12px;'>" + datum + "<br><br><a href='http://" + link + "'>Website</a></p><img style='max-width:200px;max-height:100%;' src='" + bild + "'>"
            };
    
            // Add properties
            data.properties = properties;
    
            var senddata = JSON.stringify(data);
    
    
            // Post to local mongodb
            $.ajax({
                type: "POST",
                url: "http://localhost:3000/postjson",
                dataType: 'json',
                contentType: 'application/json',
                data: senddata,
                traditional: true,
                cache: false,
                processData: false,
                success: function () {
                    alert("Upload successful!");
                    console.log("Upload successful!");
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    alert("Upload failed!");
                    console.log("Upload failed!")
                },
                timeout: 3000
            });
    
        } else {
            alert("Please type a name!");
            console.log("No name attribute given!")
        }
    };
    
    
    
    /*
     * post information about the objects saved in cache to DB
     */
    $scope.postobject = function () {

        // var namearray = [];
        // var name = $("#name").val();
        
            // Post to local mongodb
            $.ajax({
                type: "POST",
                url: "http://localhost:10002/postobject",
                // welcher Datentyp?
                dataType: 'json',
                contentType: 'application/json',
                data: 'string',
                traditional: true,
                cache: false,
                processData: false,
                success: function () {
                    swal({
                        titel: 'Success',
                        text: "yay!",
                        type: 'info',
                        customClass: 'swalCc',
                        buttonsStyling: false,
                    });
                },
                error: function (message) {
                    swal({
                        titel: 'Error',
                        text: message,
                        type: 'error',
                        customClass: 'swalCc',
                        buttonsStyling: false,
                    });
                }
            });
    };

}]);