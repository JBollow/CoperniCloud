'use strict';

coperniCloud.controller('computeController', function ($scope, $uibModalInstance) {

    // Close by pressing the Cancel button
    $scope.dismiss = function () {
        $uibModalInstance.dismiss('cancel');
    };

    // Sends arithmetic expressions to backend
    $scope.ok = function () {
        console.log($scope.terms);

        // TODO
        // Use front_bracket_0,0_band,back_bracket_0,operator_x,front_bracket_x,x_band,back_bracket_x

    };
    
    /**
     * NDVI preset for computebands expression
     */
    $scope.ndvi = function () {

    };

    /**
     * NDSI preset for computebands expression
     */
    $scope.ndsi = function () {

    };

    /**
     * Sends the computebands expression
     */
    $scope.sendComputeBands = function () {

    };

    // Adding more bands to the expression
    $scope.terms = [{
        operator: '',
        front: '',
        band: '',
        back: ''
    }];
    $scope.addff = function () {
        if ($scope.terms.length < 11) {
            $scope.terms.push({
                operator: '+',
                front: '',
                band: '',
                back: ''
            });
        } else {
            swal({
                titel: 'Error',
                text: "You can not add more bands!",
                type: 'error',
                customClass: 'swalCc',
                buttonsStyling: false,
            });
        }
    };

    /**
     * Removing bands from the expression
     * @param {*} index 
     */
    $scope.deleteff = function (index) {
        if (index === 0) {
            $scope.terms[index + 1].operator = "";
        }
        $scope.terms.splice(index, 1);
    };
});