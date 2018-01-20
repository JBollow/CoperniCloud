'use strict';

coperniCloud.controller('bandColorController', function ($scope, $uibModalInstance) {

    var sendData = {
        operations: [],
    };

    // Close by pressing the Cancel button
    $scope.dismiss = function () {
        $uibModalInstance.dismiss('cancel');
    };

    // Sends arithmetic expressions to backend
    $scope.ok = function () {
        var newArray = $scope.terms.map(function (el) {
            return [el.band, el.color, el.contrastValue, el.brightnessValue];
        });
        for (var i = 0; i < newArray.length; i++) {
            sendData.operations.push(newArray[i][0]);
            sendData.operations.push(newArray[i][1]);
            sendData.operations.push(newArray[i][2]);
            sendData.operations.push(newArray[i][3]);
        }

        $uibModalInstance.close(sendData);
        $uibModalInstance.dismiss('ok');
    };

    /**
     * TRUE COLOR preset for colorband operations
     */
    $scope.trueColor = function () {
        sendData.operations = ["B01", "blue", "255", "255", "B03", "green", "255", "255", "B04", "red",
            "255", "255"
        ];
        $uibModalInstance.close(sendData);
        $uibModalInstance.dismiss('trueColor');
    };

    /**
     * False color preset for colorband operations
     */
    $scope.falseColor = function () {
        sendData.operations = ["B03", "blue", "255", "255", "B04", "green", "255", "255", "B08", "red", "255", "255"];
        $uibModalInstance.close(sendData);
        $uibModalInstance.dismiss('falseColor');
    };

    /**
     * Short-wave infrared preset for colorband operations
     */
    $scope.shortWaveInfrared = function () {
        sendData.operations = ["B04", "blue", "255", "255", "B08", "green", "255", "255", "B12", "red", "255", "255"];
        $uibModalInstance.close(sendData);
        $uibModalInstance.dismiss('shortWaveInfrared');
    };

    /**
     * Near infrared preset for colorband operations
     */
    $scope.nearInfrared = function () {
        sendData.operations = ["B04", "blue", "255", "255", "B08", "green", "255", "255", "B11", "red", "255", "255"];
        $uibModalInstance.close(sendData);
        $uibModalInstance.dismiss('nearInfrared');
    };

    // TODO
    // Adding more bands to the expression
    $scope.terms = [{
        band: '',
        color: '',
        contrastValue: 255,
        brightnessValue: 255
    }];

    $scope.addcf = function () {
        if ($scope.terms.length < 11) {
            $scope.terms.push({
                band: '',
                color: '',
                contrastValue: 255,
                brightnessValue: 255
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