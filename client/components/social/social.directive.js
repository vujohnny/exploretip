'use strict';

angular.module('seekdeerApp')
  .directive('social', function () {
    return {
      templateUrl: 'components/social/social.html',
      restrict: 'EA',
      link: function (scope, element, attrs) {
      }
    };
  });
