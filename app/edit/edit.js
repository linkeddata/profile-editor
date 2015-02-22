var profile = {};
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
  profile = $scope.profile;
  $scope.profile.phones = [{value: ''}];
  $scope.profile.emails = [{value: ''}];
  $scope.profile.homepages = [{value: ''}];
  $scope.profile.workpages = [{value: ''}];
  if (!$scope.profile.picture) {
    $scope.profile.picture = "images/generic_photo.png";
    if ($scope.$parent.userProfile && $scope.$parent.userProfile.picture) {
      $scope.profile.picture = $scope.$parent.userProfile.picture;
    }
  }
  if (!$scope.profile.fullname && $scope.$parent.userProfile && $scope.$parent.userProfile.fullname) {
    $scope.profile.fullname = $scope.$parent.userProfile.fullname;
  }
  if (!$scope.profile.firstname && $scope.$parent.userProfile && $scope.$parent.userProfile.firstname) {
    $scope.profile.firstname = $scope.$parent.userProfile.firstname;
  }
  if (!$scope.profile.lastname && $scope.$parent.userProfile && $scope.$parent.userProfile.lastname) {
    $scope.profile.lastname = $scope.$parent.userProfile.lastname;
  }

  console.log($scope.profile);
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


  $scope.$watchCollection('profile', function () { console.log("change");});
});
