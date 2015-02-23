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

  $scope.addPhone = function(phone) {
    $scope.profile.phones.push({value: phone});
  }
  $scope.deletePhone = function(id) {
     $scope.profile.phones.splice(id, 1);
  }
  $scope.addEmail = function(email) {
    $scope.profile.emails.push({value: email});
  }
  $scope.deleteEmail = function(id) {
     $scope.profile.emails.splice(id, 1);
  }
  $scope.addHomepage = function(page) {
    $scope.profile.homepages.push({value: page});
  }
  $scope.deleteHomepage = function(id) {
     $scope.profile.homepages.splice(id, 1);
  }
  $scope.addWorkpage = function(page) {
    $scope.profile.workpages.push({value: page});
  }
  $scope.deleteWorkpage = function(id) {
     $scope.profile.workpages.splice(id, 1);
  }

  $scope.login = function() {
    $scope.$parent.login();
  }
  $scope.$watchCollection('profile', function () { console.log("change");});
});
