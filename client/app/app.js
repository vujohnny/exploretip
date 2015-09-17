'use strict';

angular.module('seekdeerApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'btford.socket-io',
  'ui.router',
  'ui.bootstrap',
  'uiGmapgoogle-maps'
])
  .config(function($stateProvider, $urlRouterProvider, $locationProvider, uiGmapGoogleMapApiProvider) {
    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);
    
	uiGmapGoogleMapApiProvider.configure({
		key: 'AIzaSyCjuDL15bvE4jtO6vS7o2KX0Sco8I0G2UE',
		//v: '3.20', //defaults to latest 3.X anyhow
		libraries: 'places'
	});
    
  });
