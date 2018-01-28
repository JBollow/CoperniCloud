// configure our routes
angular.module('coperniCloud').config(function ($routeProvider) {
    $routeProvider
     // route for the home page
     .when('/', {
        templateUrl: '../templates/home.html',
        controller: 'mainController'
    })

    .when('/#!/', {
        templateUrl: '../templates/home.html',
        controller: 'mainController'
    });

    // route for the contact page
    // .when('/contact', {
    //     templateUrl: '../templates/contact.html',
    //     controller: 'contactController'
    // });
});