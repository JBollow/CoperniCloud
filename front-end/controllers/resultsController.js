'use strict';

coperniCloud.controller('resultsController', function ($scope, data, $uibModalInstance) {
    $scope.results = data;

    //when it's closed by clicking outside the modal
    $scope.$on('modal.closing', function (event, data) {
        if (data == 'backdrop click') {
            event.preventDefault();
            $scope.ok();
        }
    });

    //..by pressing the ok button
    $scope.ok = function (result) {
        $uibModalInstance.close(result);
    };

    //..by pressing the Cancel button
    $scope.dismiss = function () {
        $uibModalInstance.dismiss('cancel');
    };
});