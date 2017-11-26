'use strict';

angular.module('coperniCloud').directive('uiResults', function () {
    return {
        restrict: 'A', //E = element, A = attribute, C = class, M = comment    
        // require: '^ngModel',
        scope: {
            //@ reads the attribute value, = provides two-way binding, & works with functions
            title: '@',
            searched: '=',
            results: '='
        },
        templateUrl: '../templates/directives/ui-results.html',


        controller: ['$scope', '$timeout', function ($scope, $timeout) {
            console.info("Results loaded");

        }],


        //DOM manipulation
        link: function ($scope, element, attrs) {


        }
    }
});