'use strict';

describe('Directive: filterWhere', function () {

  // load the directive's module and view
  beforeEach(module('seekdeerApp'));
  beforeEach(module('components/filter-where/filter-where.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<filter-where></filter-where>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the filterWhere directive');
  }));
});
