'use strict';

angular.module('exploretipApp')
  .directive('filterBudget', function () {
    return {
      templateUrl: 'components/filter-budget/filter-budget.html',
      restrict: 'EA',
      link: function (scope, element, attrs) {
      }
    };
  });
