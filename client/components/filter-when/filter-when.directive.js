'use strict';

angular.module('seekdeerApp')
  .directive('filterWhen', function () {
    return {
      templateUrl: 'components/filter-when/filter-when.html',
      restrict: 'EA',
      link: function (scope, element, attrs) {
      }
    };
  });
