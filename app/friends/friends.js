angular.module( 'App.friends', [
  'ui.router'
])
.config(function config( $stateProvider ) {
  $stateProvider.state( 'friends', {
    url: '/friends?webid',
    views: {
      "main": {
        controller: 'FriendsCtrl',
        templateUrl: 'app/friends/friends.tpl.html'
      }
    },
    data:{ pageTitle: 'Friends' }
  });
})

.controller( 'FriendsCtrl', function FriendsCtrl( $scope, $state, $location, $upload, $stateParams ) {
  $scope.form = {};
  $scope.profile = {};

  $scope.Befriend = function() {
    if (!$scope.profile.friends) {
      $scope.profile.friends = [];
    }
    var newFriend = new $scope.$parent.ProfileElement(
      $rdf.st(
        $rdf.sym($scope.profile.webid),
        FOAF('knows'),
        $rdf.sym(''),
        $rdf.sym('')
      )
    );
    $scope.profile.friends.push(newFriend);
  };


  $scope.Unfriend = function(id) {
    $scope.profile.friends[id].value = '';
    $scope.updateObject($scope.profile.friends[id]);
    $scope.profile.friends.splice(id, 1);
  };

  $scope.updateObject = function (obj, force) {
    // update object and also patch graph
    if (obj.value && obj.statement.why.value.length == 0 && $scope.profile.sources.length > 0) {
      obj.picker = true;
      // $scope.locationPicker = obj;
      // $scope.$parent.overlay = true;
      // $('#location-picker').openModal();
    } else {
      obj.updateObject(true, force);
    }
  };

  $scope.viewFriends = function(webid) {
    if (!$scope.$parent.profiles) {
      $scope.$parent.profiles = [];
    }
    var webid = (webid)?webid:$scope.form.webid;
    if (!$scope.$parent.profiles[webid]) {
      console.log("No profile exists for "+webid);
      $scope.$parent.profiles[webid] = {};
      $scope.$parent.getProfile(webid, false, false);
    }
    $scope.profile = $scope.$parent.profiles[webid];
    $scope.$parent.toWebID = $scope.profile.webid;
    $scope.$parent.toLoc = '/friends';
    $location.path("/friends").search({'webid': webid}).replace();
  }

  if (!$scope.profile.webid) {
    if ($stateParams['webid']) {
      var webid = $scope.form.webid = $stateParams['webid'];
      // check if it's the authenticated user
      if ($scope.$parent.profile && $scope.$parent.profile.webid == webid) {
        $scope.profile = $scope.$parent.profile;
      } else if ($scope.$parent.profiles[webid] && $scope.$parent.profiles[webid].webid == webid) {
        // load previous existing profile
        $scope.profile = $scope.$parent.profiles[webid];
      } else {
        $scope.editProfile(webid);
      }
    } else {
      $scope.profile = $scope.$parent.profile;
    }
  }
});