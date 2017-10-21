coperniCloud.controller('mainController', ['$scope', 'leafletData', function ($scope, leafletData) {


    // create a message to display in our view
    $scope.message = 'A map, I guess';

    angular.extend($scope, {
        center: {
            lat: 51.82956,
            lng: 7.276709,
            zoom: 5
        },
        markers: $scope.markers,
        layers: {
            baselayers: {
                xyz: {
                    name: 'OpenStreetMap',
                    url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                    type: 'xyz'
                }
            }

        }
    });

    // A global reference is set.
    leafletData.getMap('map').then(function (m) {
        routeMap = m;
    });
}]);