angular.module( 'App.login', [
  'ui.router'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'login', {
    url: '/login',
    views: {
      "main": {
        controller: 'LoginCtrl',
        templateUrl: 'app/login/login.tpl.html'
      }
    },
    data:{ pageTitle: 'Login' }
  });
})

.controller( 'LoginCtrl', function AboutCtrl( $scope, $http, $location, $state, global ) {
  $scope.loginButtonText = 'Login';
  
  $scope.getProfile = function(uri) {
    var userProfile = {};
    userProfile.webid = uri;

    var RDF = $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
    var FOAF = $rdf.Namespace("http://xmlns.com/foaf/0.1/");
    var g = $rdf.graph();
    var f = $rdf.fetcher(g, TIMEOUT);

    var docURI = (uri.indexOf('#') >= 0)?uri.slice(0, uri.indexOf('#')):uri;
    var webidRes = $rdf.sym(uri);
    userProfile.loading = true;

    // fetch user data
    f.nowOrWhenFetched(docURI,undefined,function(ok, body, xhr) {
      if (!ok) {
        userProfile.uri = uri;
        userProfile.name = uri;
        console.log('Warning - profile not found.');
        userProfile.loading = false;
        Notifier.warning('Failed to fetch profile. HTTP '+xhr.status);
        $scope.loginButtonText = 'Login';
        $scope.$apply();
      } else {
        var classType = (g.any(webidRes, RDF('type')).value == FOAF('Group').value)?'agentClass':'agent';
        // get some basic info
        var name = g.any(webidRes, FOAF('name'));
        // Clean up name
        name = (name)?name.value:'';
        var pic = g.any(webidRes, FOAF('img'));
        var depic = g.any(webidRes, FOAF('depiction'));
        // set avatar picture
        if (pic) {
          pic = pic.value;
        } else {
          if (depic) {
            pic = depic.value;
          } else {
            pic = 'images/generic_photo.png';
          }
        }
        userProfile.classtype = classType;
        userProfile.fullname = name;
        userProfile.picture = pic;
        userProfile.loading = false;
        $scope.$parent.userProfile = userProfile;
        $scope.saveCredentials();
        // return to main page
        $state.go('view', {}, {reload: true});
      }
    });
  };

  $scope.login = function() {
    $scope.loginButtonText = 'Loggin in...';
    $http({
      method: 'HEAD',
      url: "https://rww.io/",
      withCredentials: true
    }).success(function(data, status, headers) {
      // add dir to local list
      var user = headers('User');
      if (user && user.length > 0 && user.slice(0,4) == 'http') {
        $scope.getProfile(user);
      } else {
        Notifier.warning('WebID-TLS authentication failed.');
        console.log('WebID-TLS authentication failed.');
      }
    }).error(function(data, status, headers) {
      Notifier.error('Could not connect to auth server: HTTP '+status);
      console.log('Could not connect to auth server: HTTP '+status);
      $scope.loginButtonText = 'Login done';
      $scope.$appy();
    });
  };

  $scope.saveCredentials = function () {
    var app = {};
    var _user = {};
    app.userProfile = $scope.$parent.userProfile;
    sessionStorage.setItem($scope.$parent.appuri, JSON.stringify(app));
    $scope.$parent.loggedIn = true;
    console.log('Authenticated through WebID-TLS!');
    var authUser = ($scope.$parent.userProfile.fullname)?" as "+$scope.$parent.userProfile.fullname:"";
    Notifier.success('Authenticated'+authUser);
    $scope.loginButtonText = 'Login done';
  };

});
