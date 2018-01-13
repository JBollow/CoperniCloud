'use strict';

coperniCloud.controller('helpController', function ($scope, $uibModalInstance) {

    // Close by pressing the Cancel button
    $scope.dismiss = function () {
        $uibModalInstance.dismiss('cancel');
    };

});