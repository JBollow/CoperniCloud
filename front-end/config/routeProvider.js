// configure our routes
angular.module('coperniCloud').config(function ($routeProvider) {
    $routeProvider
     // route for the home page
     .when('/', {
        templateUrl: '../pages/home.html',
        controller: 'mainController'
    })

    // route for the about page
    .when('/about', {
        templateUrl: '../pages/about.html',
        controller: 'aboutController'
    })

    // route for the contact page
    .when('/contact', {
        templateUrl: '../pages/contact.html',
        controller: 'contactController'
    });
})