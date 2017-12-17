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
            tileLayer: "http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
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
                DarkMatter: {
                    name: 'DarkMatter',
                    url: 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
                    type: 'xyz',
                    layerOptions: {
                        minZoom: 3,
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
                        // apikey: ,
                        // mapid: ''
                    }
                },
                OpenStreetMap_HOT: {
                    name: 'OpenStreetMap',
                    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
                    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>',
                    type: 'xyz',
                    layerOptions: {
                        minZoom: 3,
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
    }

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
    }

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
        })
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
    }

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
    }

}]);