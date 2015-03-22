angular.module( 'App.friends', [
  'ui.router'
])
.config(function config( $stateProvider, $urlRouterProvider ) {
  $stateProvider.state( 'editFriends', {
    url: '/friends/edit?webid',
    views: {
      "main": {
        controller: 'EditFriendsCtrl',
        templateUrl: 'app/friends/friends.tpl.html'
      }
    },
    data:{ pageTitle: 'Edit friends' }
  });
  $stateProvider.state( 'viewFriends', {
    url: '/friends/view?webid',
    views: {
      "main": {
        controller: 'ViewFriendsCtrl',
        templateUrl: 'app/friends/friends.tpl.html'
      }
    },
    data:{ pageTitle: 'View friends' }
  });
  $stateProvider.state( 'addFriends', {
    url: '/friends/add?webid',
    views: {
      "main": {
        controller: 'AddFriendsCtrl',
        templateUrl: 'app/friends/add.tpl.html'
      }
    },
    data:{ pageTitle: 'Add friends' }
  });
})
.filter('encodeURL', function() {
  return function(url) {
    return encodeURIComponent(url);
  };
})
.controller( 'EditFriendsCtrl', function EditFriendsCtrl( $scope, $state, $location, $upload, $stateParams ) {
  $scope.profile = {};
  $scope.form = {};
  $scope.editor = true;

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
    if (obj.value && obj.statement.why.value.length === 0 && $scope.profile.sources.length > 0) {
      obj.picker = true;
      // $scope.locationPicker = obj;
      // $scope.$parent.overlay = true;
      // $('#location-picker').openModal();
    } else {
      obj.updateObject(true, force);
    }
  };

  $scope.viewFriends = function() {
    var newPath = $location.path("/friends/view");
    if ($stateParams['webid']) {
      newPath.search({'webid': webid});
    }
    newPath.replace();
  };

  if (!$scope.profile.webid) {
    if ($stateParams['webid']) {
      var webid = $stateParams['webid'];
      // check if it's the authenticated user
      if ($scope.$parent.profile && $scope.$parent.profile.webid == webid) {
        $scope.profile = $scope.$parent.profile;
      } else if ($scope.$parent.profiles[webid] && $scope.$parent.profiles[webid].webid == webid) {
        // load previous existing profile
        $scope.profile = $scope.$parent.profiles[webid];
      }
    } else {
      $scope.profile = $scope.$parent.profile;
    }
  }

  $scope.$watch('profile.friends', function(newVal, oldVal) {
    if (newVal !== undefined) {
      newVal.forEach(function(webid) {
        if (webid && webid.value && !$scope.$parent.profiles[webid.value]) {
          $scope.$parent.getProfile(webid.value, false, false);
        }
      });
    }
  });

})

.controller( 'ViewFriendsCtrl', function ViewFriendsCtrl( $scope, $state, $location, $upload, $stateParams ) {
  $scope.form = {};
  $scope.profile = {};
  $scope.editor = false;

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
    $scope.$parent.toLoc = '/friends/view';
    $location.path("/friends/view").search({'webid': webid}).replace();
  };

  $scope.editFriends = function() {
    var newPath = $location.path("/friends/edit");
    if ($stateParams['webid']) {
      newPath.search({'webid': webid});
    }
    newPath.replace();
  };

  // $scope.isKnown = function(webid) {
  //   $scope.profile.friends.forEach(function(uri) {
  //     console.log(webid, uri.value);
  //     console.log("KNOWN ", !$scope.editor, $scope.$parent.authenticated, $scope.$parent.authenticated != uri.value, webid == uri.value);
  //     if (!$scope.editor && $scope.$parent.authenticated && ($scope.$parent.authenticated != uri.value || webid == uri.value)) {
  //       return true;
  //     }
  //   });
  //   return false;
  // }

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
        $scope.viewFriends(webid);
      }
    } else {
      $scope.profile = $scope.$parent.profile;
    }
  }

  $scope.$watch('profile.friends', function(newVal, oldVal) {
    if (newVal !== undefined) {
      newVal.forEach(function(webid) {
        if (webid && webid.value && !$scope.$parent.profiles[webid.value]) {
          $scope.$parent.getProfile(webid.value, false, false);
        }
      });
    }
  });
});
// .directive('addFriend', function () {
//     return {
//         restrict: 'AE',
//         transclude: true,
//         template: '<input id="newfriend" type="tel" ng-model="friend.value" ng-blur="updateObject(friend)" ng-disabled="friend.locked">'+
//                   '<label for="newfriend" ng-class="{active: friend.value.length > 0}">WebID{{friend.locked?"...updating":""}}</label>'+
//                   '<div pick-source obj="friend" ng-if="friend.picker"></div>',
//         link: function($scope, $element, $attrs) {
//           $('#location-picker').openModal();
//           $scope.$parent.overlay = true;

//           $scope.setWhy = function(uri) {
//             $scope.obj.statement['why']['uri'] = $scope.obj.statement['why']['value'] = uri;
//             console.log("Set Why to:"+uri);
//             console.log($scope.obj.statement);
//             if ($scope.obj.statement.predicate.value == FOAF('img').value || $scope.obj.statement.predicate.value == FOAF('depiction').value) {
//               console.log("Supposed to save picture");
//               $scope.$parent.savePicture();
//             } else if ($scope.obj.statement.predicate.value == UI('backgroundImage').value) {
//               console.log("Supposed to save bgpicture");
//               $scope.$parent.saveBackground();
//             } else {
//               console.log("Supposed to update obj");
//               $scope.$parent.updateObject($scope.obj);
//             }
//             $scope.cancel();
//           }
//           $scope.cancel = function() {
//             $scope.$parent.overlay = false;
//             $scope.obj.picker = false;
//             $('#location-picker').closeModal();
//           }
//         }
//     };
// });



