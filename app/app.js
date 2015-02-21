// Globals
var PROXY = "https://data.fm/proxy?uri={uri}";
var AUTH_PROXY = "https://rww.io/auth-proxy?uri=";
var TIMEOUT = 90000;
var DEBUG = true;

$rdf.Fetcher.crossSiteProxyTemplate=PROXY;

// Angular
angular.module( 'App', [
  'App.about',
  'App.login',
  'App.view',
  'App.edit',
  'ui.router'
])

.config( function AppConfig ( $stateProvider, $urlRouterProvider ) {
  $stateProvider.state( 'home', {
    url: '/',
    views: {
      "main": {
        controller: 'MainCtrl',
        templateUrl: 'app/home.tpl.html'
      }
    },
    data:{ pageTitle: 'Home' }
  });
})

.factory("global", function(){
  return { o: {} }
})

.run( function run () {
})

.controller( 'MainCtrl', function MainCtrl ( $scope, $location, $timeout, global ) {
  $scope.appuri = window.location.hostname+window.location.pathname;
  $scope.loggedIn = false;
  $scope.userProfile = {};
  //$scope.userProfile.Picture = 'assets/generic_photo.png';
  // $scope.userProfile.Picture = 'https://deiu.rww.io/profile/avatar.jpg';
  // $scope.userProfile.Name = 'Andrei Vlad Sambra';

  // Logout WebID (only works in Firefox and IE)
  $scope.logout = function () {
    if (document.all == null) {
      if (window.crypto) {
          try{
              window.crypto.logout(); //firefox ok -- no need to follow the link
          } catch (err) {//Safari, Opera, Chrome -- try with tis session breaking
          }
      }
    } else { // MSIE 6+
      document.execCommand('ClearAuthenticationCache');
    }

    // clear sessionStorage
    $scope.clearLocalCredentials();
    $scope.userProfile = {};
    $scope.loggedIn = false;
    $location.path('/');
  };

  // clear sessionStorage
  $scope.clearLocalCredentials = function () {
    sessionStorage.removeItem($scope.appuri);
  };

  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    if ( angular.isDefined( toState.data.pageTitle ) ) {
      $scope.pageTitle = toState.data.pageTitle;
    }
  });

  // initialize by retrieving user info from sessionStorage
  // retrieve from sessionStorage
  if (sessionStorage.getItem($scope.appuri)) {
    var app = JSON.parse(sessionStorage.getItem($scope.appuri));
    if (app.userProfile) {
      if (!$scope.userProfile) {
        $scope.userProfile = {};
      }
      $scope.userProfile = app.userProfile;
      $scope.loggedIn = true;
    } else {
      // clear sessionStorage in case there was a change to the data structure
      sessionStorage.removeItem($scope.appuri);
    }
  }
})
//simple directive to display list of channels
.directive('profileCard',function(){
    return {
    replace : true,
    restrict : 'E',
    templateUrl: 'app/profileCard.html'
    }; 
});
