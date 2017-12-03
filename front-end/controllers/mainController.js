coperniCloud.controller('mainController', ['$scope', '$timeout', 'leafletData', '$uibModal', function ($scope, $timeout, leafletData, $uibModal) {

    $scope.searchedItem = "";
    $scope.checked = false;
    $scope.input = {};
    //an example for testing
    $scope.exampleArray = [{
            name: "january",
            startDate: "01.01.2017",
            endDate: "31.01.2017"
        },
        {
            name: "february",
            startDate: "01.02.2017",
            endDate: "28.02.2017"
        },
        {
            name: "march",
            startDate: "01.03.2017",
            endDate: "31.03.2017"
        },
        {
            name: "april",
            startDate: "01.04.2017",
            endDate: "30.04.2017"
        },
        {
            name: "may",
            startDate: "01.05.2017",
            endDate: "31.05.2017"
        },
        {
            name: "june",
            startDate: "01.06.2017",
            endDate: "30.04.2017"
        },
    ];


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
                    // layerOptions: {
                    //     apikey: ,
                    //     mapid: ''
                    // }
                },
                Grayscale: {
                    name: 'Grayscale',
                    url: 'http://korona.geog.uni-heidelberg.de/tiles/roadsg/x={x}&y={y}&z={z}',
                    type: 'xyz'
                },
                OpenStreetMap_DE: {
                    name: 'OSMDE',
                    url: 'http://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png',
                    attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                    type: 'xyz'
                },
                OpenStreetMap_HOT: {
                    name: 'OpenStreetMap HOT',
                    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
                    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>',
                    type: 'xyz'
                }
            }

        }
    });

    // A global reference is set.
    leafletData.getMap('map').then(function (m) {
        $scope.routeMap = m;
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
     * Function that searches for values in the passed object
     */
    $scope.startSearch = function (input) {
        //TODO the other search parameters
        console.log(input);
        $scope.resultsArray = [];
        for (var i = 0; i < $scope.exampleArray.length; i++) {
            if ($scope.exampleArray[i].name.toLowerCase().match(input.name.toLowerCase())) {
                $scope.resultsArray.push($scope.exampleArray[i]);
            }
        }

        if ($scope.resultsArray.length > 0) {
            $scope.showResults($scope.resultsArray);
        } else {
            alert("Nichts gefunden!");
        }
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
            size: 'sm',
            resolve: {
                data: function () {
                    return results;
                }
            }
        });

        //for when the modal is closed
        modalInstance.result.then(function (selectedItem) {
            $scope.selected = selectedItem;
            console.log($scope.selected);
            //here open a window for image editing
        })
    };

    //for the extended search animation 
    $scope.toggleChecked = function () {
        $scope.checked = !$scope.checked;
    }

    /**
     * A pop-up for the results of the paint
     * @param paint
     */
    $scope.showPaint = function (results) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: '../templates/popups/paint.html',
            controller: 'resultsController',
            size: 'sm',
            resolve: {
                data: function () {
                    return results;
                }
            }
        });

        //for when the modal is closed
        modalInstance.result.then(function (selectedItem) {
            $scope.selected = selectedItem;
            console.log($scope.selected);
            //here open a window for image editing
        })
    };

    //for the extended search animation 
    $scope.toggleChecked = function () {
        $scope.checked = !$scope.checked;
    }

}]);