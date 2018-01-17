'use strict';

coperniCloud.controller('resultsController', function ($scope, data, $uibModalInstance, leafletData) {
    $scope.results = data;

    angular.extend($scope, {
        center: {
            lat: 51,
            lng: 7,
            zoom: 3
        },
        defaults: {
            tileLayer: 'http://korona.geog.uni-heidelberg.de/tiles/roadsg/x={x}&y={y}&z={z}',
            zoomControlPosition: 'bottomright',
            tileLayerOptions: {
                opacity: 0.9,
                detectRetina: true,
                reuseTiles: true,
                minZoom: 3,
            },
            scrollWheelZoom: true
        },
    });

    // A global reference is set.
    leafletData.getMap('smallMap').then(function (m) {
        $scope.smallMap = m;
        //preventing from going outside the bounds of one world :D
        var southWest = L.latLng(-89.98155760646617, -180),
            northEast = L.latLng(89.99346179538875, 180);
        var bounds = L.latLngBounds(southWest, northEast);
        $scope.smallMap.setMaxBounds(bounds);
        $scope.smallMap.on('drag', function () {
            $scope.smallMap.panInsideBounds(bounds, {
                animate: false
            });
        });
    });

    /**
     * Updates bounds of the image
     * @param {*} dataset image metadata
     */
    $scope.drawRectangle = function (dataset) {
        if ( $scope.rectangle) {
            //removing a rectangle if there is one
            $scope.smallMap.removeLayer($scope.rectangle);
            $scope.bounds = [];
        }
        if (dataset.geometry) {
            // define rectangle geographical bounds if exist
            $scope.bounds = [
                [dataset.geometry.northBoundLat, dataset.geometry.eastBoundLng],
                [dataset.geometry.southBoundLat, dataset.geometry.westBoundLng]
            ];
            // create an orange rectangle
            $scope.rectangle = L.rectangle($scope.bounds, {
                color: "#008dc5",
                weight: 1
            }).addTo($scope.smallMap);
            // zoom the map to the rectangle bounds, but not too close
            $scope.smallMap.fitBounds($scope.bounds, {padding: [150, 150]});
        } else {
            //zooming out otherwise
            $scope.smallMap.setView([51, 7], 3);
        }
    };

    //when it's closed by clicking outside the modal
    $scope.$on('modal.closing', function (event, data) {
        if (data == 'backdrop click') {
            event.preventDefault();
            $scope.ok();
        }
    });

    //..by pressing the ok button
    $scope.ok = function (result) {
        let allMeta = {result: result, bounds: $scope.bounds}
        $uibModalInstance.close(allMeta);
    };

    //..by pressing the Cancel button
    $scope.dismiss = function () {
        $uibModalInstance.dismiss('cancel');
    };
});