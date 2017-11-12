coperniCloud.controller('mainController', ['$scope', 'leafletData', function ($scope, leafletData) {

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
                }
            }

        }
    });



    // A global reference is set.
    leafletData.getMap('map').then(function (m) {
        $scope.routeMap = m;
        // $(window).on("resize", function () {
        //     $("#map").height($(window).height());
        //     $scope.routeMap.invalidateSize();
        // }).trigger("resize");

    });

    $scope.callUpdate = function () {
        if (!$scope.search) {
            $scope.search = new UISearch(document.getElementById('sb-search'));
            console.log($scope.search);
        }
    }

}]);