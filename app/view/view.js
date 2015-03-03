angular.module( 'App.view', [
  'ui.router',
  // 'placeholders'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'view', {
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

.controller( 'ViewCtrl', function ViewCtrl( $scope, $state, $stateParams ) {
  $scope.profile = $scope.$parent.profile;
  $scope.$parent.currLoc = $state.current.url;
});
