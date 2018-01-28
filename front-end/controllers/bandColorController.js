'use strict';

coperniCloud.controller('bandColorController', function ($scope, data, $uibModalInstance) {

    var sendData = {
        operations: [],
    };

    $scope.imageType1C = true;

    var folderName = data;

    // Different tile path for 1C and 2A        
    if (folderName.includes("MSIL1C")) {
        $scope.bandOptions = ["B01", "B02", "B03", "B04", "B05", "B06", "B07", "B08", "B8A", "B09", "B10", "B11", "B12"];
    }
    if (folderName.includes("MSIL2A")) {
        $scope.imageType1C = false;
        $scope.bandOptions = ["B02", "B03", "B04", "B08"];
    }

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
        sendData.operations = ["B01", "blue", "128", "128", "B03", "green", "128", "128", "B04", "red",
            "128", "128"
        ];
        $uibModalInstance.close(sendData);
        $uibModalInstance.dismiss('trueColor');
    };

    /**
     * False color preset for colorband operations
     */
    $scope.falseColor = function () {
        sendData.operations = ["B03", "blue", "128", "128", "B04", "green", "128", "128", "B08", "red", "128", "128"];
        $uibModalInstance.close(sendData);
        $uibModalInstance.dismiss('falseColor');
    };

    /**
     * Short-wave infrared preset for colorband operations
     */
    $scope.shortWaveInfrared = function () {
        sendData.operations = ["B04", "blue", "128", "128", "B08", "green", "128", "128", "B12", "red", "128", "128"];
        $uibModalInstance.close(sendData);
        $uibModalInstance.dismiss('shortWaveInfrared');
    };

    /**
     * Near infrared preset for colorband operations
     */
    $scope.nearInfrared = function () {
        sendData.operations = ["B04", "blue", "128", "128", "B08", "green", "128", "128", "B11", "red", "128", "128"];
        $uibModalInstance.close(sendData);
        $uibModalInstance.dismiss('nearInfrared');
    };

    // Adding more bands to the expression
    $scope.terms = [{
        band: 'B08',
        color: 'blue',
        contrastValue: 128,
        brightnessValue: 128
    }];

    $scope.addcf = function () {
        if ($scope.terms.length < 11) {
            $scope.terms.push({
         band: 'B08',
        color: 'blue',
                contrastValue: 128,
                brightnessValue: 128
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