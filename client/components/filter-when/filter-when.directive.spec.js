'use strict';

describe('Directive: filterWhen', function () {

  // load the directive's module and view
  beforeEach(module('seekdeerApp'));
  beforeEach(module('components/filter-when/filter-when.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<filter-when></filter-when>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the filterWhen directive');
  }));
});
