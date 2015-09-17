'use strict';

angular.module('seekdeerApp')
  .directive('filterWhere', function () {
    return {
      templateUrl: 'components/filter-where/filter-where.html',
      restrict: 'EA',
      link: function (scope, element, attrs) {
      }
    };
  });
