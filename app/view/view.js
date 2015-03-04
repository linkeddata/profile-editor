angular.module( 'App.view', [
  'ui.router',
  // 'placeholders'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'view', {
    url: '/view?webid',
    views: {
      "main": {
        controller: 'ViewCtrl',
        templateUrl: 'app/view/view.tpl.html'
      }
    },
    data:{ pageTitle: 'View profile' }
  });
})

.controller( 'ViewCtrl', function ViewCtrl( $scope, $location, $state, $stateParams ) {
  $scope.$parent.currLoc = $state.current.name;
  
  $scope.form = {};

  $scope.viewProfile = function(webid) {
    if (!$scope.$parent.profiles) {
      $scope.$parent.profiles = [];
    }
    var webid = (webid)?webid:$scope.form.webid;
    if (!$scope.$parent.profiles[webid]) {
      $scope.$parent.profiles[webid] = {};
      $scope.$parent.getProfile(webid, false);
    }
    $scope.profile = $scope.$parent.profiles[webid];
    $location.path("/view").search({'webid': webid}).replace();
    $scope.form = {};
  }

  if ($stateParams['webid']) {
    var webid = $stateParams['webid'];
    // check if it's the authenticated user
    if ($scope.$parent.profile && $scope.$parent.profile.webid == webid) {
      $scope.profile = $scope.$parent.profile;
    } else if ($scope.$parent.profiles[webid] && $scope.$parent.profiles[webid].webid == webid) {
      // load previous profile if it exists
      $scope.profile = $scope.$parent.profiles[webid];
    } else {
      $scope.viewProfile(webid);
    }
  }
});
