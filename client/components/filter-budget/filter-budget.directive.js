'use strict';

angular.module('seekdeerApp')
  .directive('filterBudget', function () {
    return {
      templateUrl: 'components/filter-budget/filter-budget.html',
      restrict: 'EA',
      link: function (scope, element, attrs) {
      }
    };
  });
