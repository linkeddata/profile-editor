angular.module( 'App.view', [
  'ui.router',
  // 'placeholders'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'view', {
    url: '/view/{webid:.*}',
    views: {
      "main": {
        controller: 'ViewCtrl',
        templateUrl: 'app/view/view.tpl.html'
      }
    },
    data:{ pageTitle: 'View profile' }
  }).state( 'view_root', {
    url: '/view',
    views: {
      "main": {
        controller: 'ViewCtrl',
        templateUrl: 'app/view/view.tpl.html'
      }
    },
    data:{ pageTitle: 'View profile' }
  });
})

.controller( 'ViewCtrl', function AboutCtrl( $scope, $state, $stateParams ) {
  $scope.state = $state.current;
  // Display list for current path
  if ($stateParams.webid && $stateParams.webid.length > 0) {
    $scope.userProfile = {};
    $scope.userProfile.webid = $stateParams.webid;
  } else {
    $scope.userProfile = $scope.$parent.userProfile;
  }


});
