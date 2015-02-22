angular.module( 'App.edit', [
  'ui.router',
  'angularFileUpload'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'edit', {
    url: '/edit',
    views: {
      "main": {
        controller: 'EditCtrl',
        templateUrl: 'app/edit/edit.tpl.html'
      }
    },
    data:{ pageTitle: 'Edit profile' }
  });
})

.controller( 'EditCtrl', function AboutCtrl( $scope, $upload ) {
  // blank
  $scope.profile = {};
  if (!$scope.profile.picture) {
    $scope.profile.picture = "images/generic_photo.png";
    if ($scope.$parent.userProfile && $scope.$parent.userProfile.picture) {
      $scope.profile.picture = $scope.$parent.userProfile.picture;
    }
  }
  console.log($scope.profile);

});
