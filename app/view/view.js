angular.module( 'App.view', [
  'ui.router',
  // 'placeholders'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'view', {
    url: '/view?mine',
    views: {
      "main": {
        controller: 'ViewCtrl',
        templateUrl: 'app/view/view.tpl.html'
      }
    },
    data:{ pageTitle: 'View profile' }
  });
})

.controller( 'ViewCtrl', function ViewCtrl( $scope, $state, $stateParams ) {
  $scope.$parent.currLoc = $state.current.name;
  if ($stateParams['mine'] && $scope.$parent.profile) {
    $scope.profile = $scope.$parent.profile;
    $scope.$parent.webid = $scope.profile.webid;
  } else if ($scope.$parent.webid && $scope.$parent.profiles[$scope.$parent.webid]) {
    $scope.profile = $scope.$parent.profiles[$scope.$parent.webid];
  } else {
    $scope.profile = {};
  }
});
