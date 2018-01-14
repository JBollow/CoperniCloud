'use strict';

coperniCloud.controller('computeController', function ($scope, $uibModalInstance) {

    // Close by pressing the Cancel button
    $scope.dismiss = function () {
        $uibModalInstance.dismiss('cancel');
    };

    // Sends arithmetic expressions to backend
    $scope.ok = function () {

        // TODO
        // Use front_bracket_0,0_band,back_bracket_0,operator_x,front_bracket_x,x_band,back_bracket_x

    };

    // Adding more bands to the expression
    var x = 1;
    $scope.addff = function () {
        if (x < 11) {
            $($(".container1")).append(
                '<span style="display: inline-block;"><select name="operator_' + x + '"><option value="+">+</option><option value="-">-</option><option value="*">&#x00D7;</option><option value="/">&#x00F7;</option></select><select name="front_bracket_' + x + '"><option value="_"> </option><option value="(">(</option><option value="root(">&radic;</option></select><select name="' + x + '_band"><option value="band_1">Band 1</option><option value="band_2">Band 2</option><option value="band_3">Band 3</option><option value="band_4">Band 4</option><option value="band_5">Band 5</option><option value="band_6">Band 6</option><option value="band_7">Band 7</option><option value="band_8">Band 8</option><option value="band_8a">Band 8a</option><option value="band_9">Band 9</option><option value="band_10">Band 10</option><option value="band_11">Band 11</option><option value="band_12">Band 12</option></select><select name="back_bracket_' + x + '"><option value="_"> </option><option value=")">)</option><option value=")^2">)²</option></select><button class="delete" onclick="deleteff(this)"><span style="font-size:16px; font-weight:bold;">-</span></button></span>'
            );
            x++;
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

    // Removing bands from the expression
    // Doesn't work!!!
    $scope.deleteff = function (me) {
        $(me).parent('span').remove();
        x--;
    };

});