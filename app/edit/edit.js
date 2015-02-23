angular.module( 'App.edit', [
  'ui.router',
  'angularFileUpload'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'editProfile', {
    url: '/edit/profile',
    views: {
      "main": {
        controller: 'EditProfileCtrl',
        templateUrl: 'app/edit/profile.tpl.html'
      }
    },
    data:{ pageTitle: 'Edit profile' }
  });
})

.controller( 'EditProfileCtrl', function AboutCtrl( $scope, $upload ) {
  // blank
  $scope.profile = ($scope.$parent.profile)?$scope.$parent.profile:{};
  if (!$scope.profile.phones) {
    $scope.profile.phones = [{value: ''}];
  }
  if (!$scope.profile.emails) {
    $scope.profile.emails = [{value: ''}];
  }
  if (!$scope.profile.homepages) {
    $scope.profile.homepages = [{value: ''}];
  }
  if (!$scope.profile.workpages) {
    $scope.profile.workpages = [{value: ''}];
  }
  if (!$scope.profile.picture) {
    $scope.profile.picture = "images/generic_photo.png";
    if ($scope.$parent.profile && $scope.$parent.profile.picture) {
      $scope.profile.picture = $scope.$parent.profile.picture;
    }
  }

  $scope.addPhone = function() {
    $scope.profile.phones.push({value: ''});
  }
  $scope.deletePhone = function(id) {
     $scope.profile.phones.splice(id, 1);
  }
  $scope.addEmail = function() {
    $scope.profile.emails.push({value: ''});
  }
  $scope.deleteEmail = function(id) {
     $scope.profile.emails.splice(id, 1);
  }
  $scope.addHomepage = function() {
    $scope.profile.homepages.push({value: ''});
  }
  $scope.deleteHomepage = function(id) {
     $scope.profile.homepages.splice(id, 1);
  }
  $scope.addWorkpage = function() {
    $scope.profile.workpages.push({value: ''});
  }
  $scope.deleteWorkpage = function(id) {
     $scope.profile.workpages.splice(id, 1);
  }

  $scope.login = function() {
    $scope.$parent.login();
  }
  $scope.$watchCollection('profile', function () { console.log("change");});
});
