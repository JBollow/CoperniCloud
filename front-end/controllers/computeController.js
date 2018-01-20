'use strict';

coperniCloud.controller('computeController', function ($scope, $uibModalInstance) {

    // TODO Variabeln müssen vom mainController hierhin gereicht werden
    $scope.overlayName = "";
    $scope.isProcessing = false; 
    $scope.hasInfo = false;

    var sendData = {
        image: $scope.overlayName,
        operations: [],
    };

    // Close by pressing the Cancel button
    $scope.dismiss = function () {
        $uibModalInstance.dismiss('cancel');
    };

    // Sends arithmetic expressions to backend
    $scope.ok = function () {

        // TODO
        // sendData.operations = 
        $scope.sendComputeBand();
    };

    /**
     * NDVI preset for computebands expression
     */
    $scope.ndvi = function () {
        sendData.operations = ["(", "B08", "-", "B04", ")", "/", "(", "B08", "+", "B04", ")"];
        $scope.sendComputeBand();
    };

    /**
     * NDSI preset for computebands expression
     */
    $scope.ndsi = function () {
        sendData.operations = ["(", "B03", "-", "B11", ")", "/", "(", "B03", "+", "B11", ")"];
        $scope.sendComputeBand();
    };

    /**
     * Sends the computebands expression
     */
    $scope.sendComputeBand = function () {
        console.log(sendData);
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
                $uibModalInstance.dismiss('sendComputeBand');
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