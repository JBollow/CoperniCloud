'use strict';

coperniCloud.controller('computeController', function ($scope, data, $uibModalInstance) {

    var sendData = {
        operations: [],
    };
    $scope.imageType1C = true;

    var folderName = data;

    // Different tile path for 1C and 2A        
    if (folderName.includes("MSIL1C")) {
        $scope.imageType
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
            return [el.operator, el.front, el.band, el.back];
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
     * NDVI preset for computebands expression
     */
    $scope.ndvi = function () {
        sendData.operations = ["(", "B08", "", "-", "", "B04", ")", "/", "(", "B08", "", "+", "", "B04", ")"];
        $uibModalInstance.close(sendData);
        $uibModalInstance.dismiss('ndvi');
    };

    /**
     * NDSI preset for computebands expression
     */
    $scope.ndsi = function () {
        sendData.operations = ["(", "B03", "", "-", "", "B11", ")", "/", "(", "B03", "", "+", "", "B11", ")"];
        $uibModalInstance.close(sendData);
        $uibModalInstance.dismiss('ndsi');
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