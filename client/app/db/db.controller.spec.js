'use strict';

describe('Controller: DbCtrl', function () {

  // load the controller's module
  beforeEach(module('exploretipApp'));

  var DbCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    DbCtrl = $controller('DbCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
