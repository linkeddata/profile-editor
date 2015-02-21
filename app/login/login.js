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

  $scope.getProfile = function(uri, login) {
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
        $scope.$parent.userGraph = g;
        if (login) {
          $scope.saveCredentials();
        }
        // index or update the authenticated WebID on webizen.org
        $http.get('https://api.webizen.org/v1/search', {
          params: {
            q: uri
          }
        });
        // return to main page
        $state.go('view', {}, {reload: true});
      }
    });
  };

  $scope.login = function() {
    $http({
    method: 'HEAD',
    url: "https://rww.io/",
    withCredentials: true
    }).success(function(data, status, headers) {
      // add dir to local list
      var user = headers('User');
      if (user && user.length > 0 && user.slice(0,4) == 'http') {
        $scope.getProfile(user, true);
      } else {
        Notifier.warning('WebID-TLS authentication failed.');
        console.log('WebID-TLS authentication failed.');
      }
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
  };

});
