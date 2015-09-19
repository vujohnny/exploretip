'use strict';

angular.module('exploretipApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('db', {
        url: '/db',
        templateUrl: 'app/db/db.html',
        controller: 'DbCtrl'
      });
  });
