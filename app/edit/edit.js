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

  if (!$scope.profile.picture) {
    $scope.profile.picture = "images/generic_photo.png";
    if ($scope.$parent.profile && $scope.$parent.profile.picture) {
      $scope.profile.picture = $scope.$parent.profile.picture;
    }
  }

  // Adds
  $scope.addPhone = function() {
    if (!$scope.profile.phones) {
      $scope.profile.phones = [];
    }
    $scope.profile.phones.push({value: ''});
  }
  $scope.addEmail = function() {
    if (!$scope.profile.emails) {
      $scope.profile.emails = [];
    }
    $scope.profile.emails.push({value: ''});
  }
  
  $scope.addHomepage = function() {
    if (!$scope.profile.homepages) {
      $scope.profile.homepages = [];
    }
    $scope.profile.homepages.push({value: ''});
  }
  $scope.addWorkpage = function() {
    if (!$scope.profile.workpages) {
      $scope.profile.workpages = [];
    }
    $scope.profile.workpages.push({value: ''});
  }

  // Deletes
  $scope.deletePhone = function(id) {
     $scope.profile.phones.splice(id, 1);
  }
  $scope.deleteEmail = function(id) {
     $scope.profile.emails.splice(id, 1);
  }
  $scope.deleteHomepage = function(id) {
     $scope.profile.homepages.splice(id, 1);
  }
  $scope.deleteWorkpage = function(id) {
     $scope.profile.workpages.splice(id, 1);
  }

  $scope.login = function() {
    $scope.$parent.login();
  }
  $scope.$watchCollection('profile', function () { console.log("change");});
});
