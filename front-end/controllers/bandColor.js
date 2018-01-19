'use strict';

coperniCloud.controller('bandColor', function ($scope, $uibModalInstance) {

    $scope.contrastValue = 255;
    $scope.brightnessValue = 255;

    var sendData = {
        image: "",
        operations: [],
        contrast: "",
        brightness: "",
    };

    // Close by pressing the Cancel button
    $scope.dismiss = function () {
        $uibModalInstance.dismiss('cancel');
    };

    // Sends arithmetic expressions to backend
    $scope.ok = function () {

        // TODO
        // sendData.operations = 
        sendData.contrast = $scope.contrastValue.toString();
        sendData.brightness = $scope.brightnessValue.toString();
        $scope.sendColorBand();
    };

    /**
     * TRUE COLOR preset for colorband operations
     */
    $scope.trueColor = function () {
        sendData.operations = ["B01", "blue", "B03", "green", "B04", "red"];
        sendData.contrast = $scope.contrastValue.toString();
        sendData.brightness = $scope.brightnessValue.toString();
        $scope.sendColorBand();
    };

    /**
     * False color preset for colorband operations
     */
    $scope.falseColor = function () {
        sendData.operations = ["B03", "blue", "B04", "green", "B08", "red"];
        sendData.contrast = $scope.contrastValue.toString();
        sendData.brightness = $scope.brightnessValue.toString();
        $scope.sendColorBand();
    };

    /**
     * Short-wave infrared preset for colorband operations
     */
    $scope.shortWaveInfrared = function () {
        sendData.operations = ["B04", "blue", "B08", "green", "B12", "red"];
        sendData.contrast = $scope.contrastValue.toString();
        sendData.brightness = $scope.brightnessValue.toString();
        $scope.sendColorBand();
    };

    /**
     * Near infrared preset for colorband operations
     */
    $scope.nearInfrared = function () {
        sendData.operations = ["B04", "blue", "B08", "green", "B11", "red"];
        sendData.contrast = $scope.contrastValue.toString();
        sendData.brightness = $scope.brightnessValue.toString();
        $scope.sendColorBand();
    };

    /**
     * Sends the colorband operations
     */
    $scope.sendColorBand = function () {    
        $.ajax({
            type: "POST",
            url: "http://localhost:10002/sendColorBand",
            dataType: 'json',
            data: sendData,
            traditional: true,
            cache: false,
            success: function () {                
                swal({                   
                    type: 'success',
                    text: "Calculation of your image is in progress!",
                    showConfirmButton: false,
                    timer: 1500,
                    customClass: 'swalCc',
                    buttonsStyling: false,
                });
                $uibModalInstance.dismiss("sendColorBand");               
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
    $scope.addcf = function () {
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
    $scope.deletecf = function (index) {
        if (index === 0) {
            $scope.terms[index + 1].operator = "";
        }
        $scope.terms.splice(index, 1);
    };
});