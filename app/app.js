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
  $urlRouterProvider.otherwise( 'view' );
  $stateProvider.state( 'home', {
    url: '/',
    views: {
      "main": {
        controller: 'MainCtrl'
      }
    },
    data:{ pageTitle: 'Home' }
  });
})

.run( function run () {
})

.controller( 'MainCtrl', function MainCtrl ( $scope, $location, $http, $timeout, $state ) {
  $scope.appuri = window.location.hostname+window.location.pathname;
  $scope.loginButtonText = 'Login';
  $scope.webid = '';

  $scope.profile = {};
  $scope.profile.authenticated = false;

  $scope.view = function() {
    $('#toggle-sidenav').sideNav('hide');
    $state.go('view', {}, {redirect: true});
  };

  $scope.getProfile = function(uri, authenticated) {
    $scope.profile.webid = uri;

    var RDF = $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
    var FOAF = $rdf.Namespace("http://xmlns.com/foaf/0.1/");
    var g = $rdf.graph();
    var f = $rdf.fetcher(g, TIMEOUT);

    var docURI = (uri.indexOf('#') >= 0)?uri.slice(0, uri.indexOf('#')):uri;
    var webidRes = $rdf.sym(uri);
    $scope.profile.loading = true;
    // fetch user data
    f.nowOrWhenFetched(docURI,undefined,function(ok, body, xhr) {
      if (!ok) {
        console.log('Warning - profile not found.');
        Notifier.warning('Failed to fetch profile. HTTP '+xhr.status);
        $scope.profile.uri = uri;
        $scope.profile.fullname = uri;
        $scope.profile.loading = false;
        $scope.loginButtonText = "Login";
        $scope.$apply();
      } else {
        if (xhr && xhr.getResponseHeader('User') && xhr.getResponseHeader('User') == uri) {
          $scope.profile.authenticated = true;
        } else if (authenticated) {
          $scope.profile.authenticated = true;
        }
        // set time of loading
        $scope.profile.date = Date.now();

        // get info
        var name = g.any(webidRes, FOAF('name'));
        var first = g.any(webidRes, FOAF('givenName'));
        var last = g.any(webidRes, FOAF('familyName'));
        var nick = g.any(webidRes, FOAF('nick'));

        name = (name)?name.value:'';
        first = (first)?first.value:'';
        last = (last)?last.value:'';
        nick = (nick)?nick.value:'';

        $scope.profile.fullname = name;
        $scope.profile.firstname = first;
        $scope.profile.lastname = last;
        $scope.profile.nick = nick;

        // Get pictures
        var img = g.any(webidRes, FOAF('img'));
        var depic = g.any(webidRes, FOAF('depiction'));
        // set avatar picture
        if (img) {
          var picture = img.value;
          $scope.profile.picture = picture;
        } else if (depic) {
          var picture = depic.value;
          $scope.profile.picture = picture;
        }

        // Emails
        var emails = g.statementsMatching(webidRes, FOAF('mbox'), undefined);
        if (emails.length > 0) {
          emails.forEach(function(email){
            if (!$scope.profile.emails) {
              $scope.profile.emails = [];
            }
            email = email['object']['value'];
            if (email.indexOf('mailto:') >= 0) {
              email = email.slice(7, email.length);
            }

            $scope.profile.emails.push({value: email});
          });
        }

        // Blogs
        var blogs = g.statementsMatching(webidRes, FOAF('weblog'), undefined);
        if (blogs.length > 0) {
          blogs.forEach(function(blog){
            if (!$scope.profile.blogs) {
              $scope.profile.blogs = [];
            }
            $scope.profile.blogs.push({value: blog['object']['value']});
          });
        }

        // Homepages
        var homepages = g.statementsMatching(webidRes, FOAF('homepage'), undefined);
        if (homepages.length > 0) {
          homepages.forEach(function(homepage){
            if (!$scope.profile.homepages) {
              $scope.profile.homepages = [];
            }
            $scope.profile.homepages.push({value: homepage['object']['value']});
          });
        }

        // Workpages
        var workpages = g.statementsMatching(webidRes, FOAF('workplaceHomepage'), undefined);
         if (workpages.length > 0) {
          workpages.forEach(function(workpage){
            if (!$scope.profile.workpages) {
              $scope.profile.workpages = [];
            }
            $scope.profile.workpages.push({value: workpage['object']['value']});
          });
        }

        $scope.profile.loading = false;
        $scope.$apply();

        if ($scope.profile.authenticated) {
          $scope.loginButtonText = "Login";
          $scope.saveCredentials();
        }
        $state.go('view', {}, {redirect: true});
      }
    });
  };

  $scope.saveCredentials = function () {
    var app = {};
    var _user = {};
    app.profile = $scope.profile;
    sessionStorage.setItem($scope.appuri, JSON.stringify(app));
    console.log('Authenticated through WebID-TLS!');
    var authUser = ($scope.profile.fullname)?" as "+$scope.profile.fullname:"";
    Notifier.success('Authenticated'+authUser);
    // redirect to view page
    $state.go('view', {}, {redirect: true});
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
        $scope.getProfile(user, true);
        $scope.loginButtonText = 'Done, redirecting...';
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
    $scope.profile = {};
    $scope.profile.authenticated = false;
    $state.go('view', {}, {redirect: true});
  };

  // clear sessionStorage
  $scope.clearLocalCredentials = function () {
    sessionStorage.removeItem($scope.appuri);
  };

  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    if (angular.isDefined(toState.data.pageTitle)) {
      $scope.pageTitle = toState.data.pageTitle;
    }
  });

  // initialize by retrieving user info from sessionStorage
  // retrieve from sessionStorage
  if (sessionStorage.getItem($scope.appuri)) {
    var app = JSON.parse(sessionStorage.getItem($scope.appuri));
    if (app.profile) {
      if (!$scope.profile) {
        $scope.profile = {};
      }
      // don't let session data become stale (24h validity)
      var dateValid = app.profile.date + 1000 * 60 * 60 * 24;
      if (Date.now() < dateValid) {
        $scope.profile = app.profile;
        $scope.loggedIn = true;
      } else {
        sessionStorage.removeItem($scope.appuri);
      }
    } else {
      // clear sessionStorage in case there was a change to the data structure
      sessionStorage.removeItem($scope.appuri);
    }
  }

  var webid = getParam('webid');
  if (webid && webid.length > 0 && !$scope.profile.webid) {
    $scope.webid = webid;
    $scope.getProfile(webid, false);
  }

})
//simple directive to display list of channels
.directive('profileCard',function(){
    return {
      replace : true,
      restrict : 'E',
      templateUrl: 'app/profileCard.tpl.html'
    }; 
})

//simple directive to display list of channels
.directive('spinner',function(){
    return {
      replace : true,
      restrict : 'E',
      templateUrl: 'app/spinner.tpl.html'
    }; 
});
