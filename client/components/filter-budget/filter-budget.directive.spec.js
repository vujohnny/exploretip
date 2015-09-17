'use strict';

describe('Directive: filterBudget', function () {

  // load the directive's module and view
  beforeEach(module('seekdeerApp'));
  beforeEach(module('components/filter-budget/filter-budget.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<filter-budget></filter-budget>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the filterBudget directive');
  }));
});
