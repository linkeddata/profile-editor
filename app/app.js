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
  //$urlRouterProvider.otherwise( 'view' );
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
  $scope.profile.loading = false;
  $scope.authenticated = false;

  // Prepare sparql statements and send PATCH request
  $scope.patchStatement = function(oldS, newS) {
    var query = '';
    var graphURI = '';
    if (oldS) {
      var query = "DELETE DATA { " + oldS.toNT() + " } ;\n";
      if (oldS.why && oldS.why.value.length > 0) {
        graphURI = oldS.why.value;
      } else {
        graphURI = oldS.subject.uri;
      }
    }
    if (newS) {
      query += "INSERT DATA { " + newS.toNT() + " }";
      if (!oldS && newS && newS.why.value.length > 0) {
        graphURI = newS.why.value;
      } else {
        graphURI = oldS.subject.uri;
      }
    }
    // send PATCH request
    if (graphURI && graphURI.length > 0) {
      $http({
        method: 'PATCH',
        url: graphURI,
        headers: {
          'Content-Type': 'application/sparql-update'
        },
        withCredentials: true,
        data: query
      }).success(function(data, status, headers) {
        $scope.saveCredentials();
        Notifier.success('Profile updated!');
        console.log('Profile updates!');
      }).error(function(data, status, headers) {
        Notifier.error('Could not update profile: HTTP '+status);
        console.log('Could not update profile: HTTP '+status);
        console.log(data);
      });
    }
  };


  var ProfileElement = function(s) {
    this.statement = angular.copy(s)
    this.value = s['object']['value'];
  };

  ProfileElement.prototype.updateObject = function(newVal, update) {
    if (newVal) {
      this.value = newVal;
      var oldTriple = angular.copy(this.statement);
      if (this.statement['object']['termType'] == 'literal') {
        this.statement['object']['value'] = newVal;
      } else if (this.statement['object']['termType'] == 'symbol') {
        this.statement['object']['uri'] = newVal;
        this.statement['object']['value'] = newVal;
      }
      if (update) {
        $scope.patchStatement(oldTriple, this.statement);
      }
    }
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
    if (authenticated) {
      $scope.authenticated = true;
    }
    // fetch user data
    f.nowOrWhenFetched(docURI,undefined,function(ok, body, xhr) {
      if (!ok) {
        console.log('Warning - profile not found.');
        Notifier.error('Failed to fetch profile. HTTP '+xhr.status);
        $scope.profile.fullname = uri;
        $scope.profile.loading = false;
        $scope.loginButtonText = "Login";
        $scope.$apply();
      } else {
        if (xhr && xhr.getResponseHeader('User') && xhr.getResponseHeader('User') == uri) {
          $scope.profile.owner = true;
        } else if (authenticated) {
          $scope.profile.owner = true;
        }
        // set time of loading
        $scope.profile.date = Date.now();

        // get info
        $scope.profile.fullname = new ProfileElement(g.statementsMatching(webidRes, FOAF('name'), undefined)[0]);
        $scope.profile.firstname = new ProfileElement(g.statementsMatching(webidRes, FOAF('givenName'), undefined)[0]);
        $scope.profile.lastname = new ProfileElement(g.statementsMatching(webidRes, FOAF('familyName'), undefined)[0]);
        $scope.profile.nick = new ProfileElement(g.statementsMatching(webidRes, FOAF('nick'), undefined)[0]);

        // Get pictures
        var img = g.statementsMatching(webidRes, FOAF('img'), undefined);
        
        // check if profile uses depic instead
        if (img.length == 0) {
          var depic = g.statementsMatching(webidRes, FOAF('depiction'), undefined);  
          if (depic.length > 0) {
            $scope.profile.picture = {
              statement: $.extend(true, {}, depic[0]),
              value: depic[0]['object']['value']
            };
          }
        } else {
          $scope.profile.picture = {
              statement: $.extend(true, {}, img[0]),
              value: img[0]['object']['value']
            };
        }

        // Emails
        var emails = g.statementsMatching(webidRes, FOAF('mbox'), undefined);
        if (emails.length > 0) {
          emails.forEach(function(email){
            if (!$scope.profile.emails) {
              $scope.profile.emails = [];
            }
            val = email['object']['value'];
            if (val.indexOf('mailto:') >= 0) {
              val = val.slice(7, val.length);
            }

            $scope.profile.emails.push({
              statement: $.extend(true, {}, email),
              value: val
            });
          });
        }

        // Blogs
        var blogs = g.statementsMatching(webidRes, FOAF('weblog'), undefined);
        if (blogs.length > 0) {
          blogs.forEach(function(blog){
            if (!$scope.profile.blogs) {
              $scope.profile.blogs = [];
            }
            $scope.profile.blogs.push({
              statement: $.extend(true, {}, blog),
              value: blog['object']['value']
            });
          });
        }

        // Homepages
        var homepages = g.statementsMatching(webidRes, FOAF('homepage'), undefined);
        if (homepages.length > 0) {
          homepages.forEach(function(homepage){
            if (!$scope.profile.homepages) {
              $scope.profile.homepages = [];
            }
            $scope.profile.homepages.push({
              statement: $.extend(true, {}, homepage),
              value: homepage['object']['value']
            });
          });
        }

        // Workpages
        var workpages = g.statementsMatching(webidRes, FOAF('workplaceHomepage'), undefined);
         if (workpages.length > 0) {
          workpages.forEach(function(workpage){
            if (!$scope.profile.workpages) {
              $scope.profile.workpages = [];
            }
            $scope.profile.workpages.push({
              statement: $.extend(true, {}, workpage),
              value: workpage['object']['value']
            });
          });
        }

        $scope.profile.loading = false;
        $scope.$apply();

        if (authenticated) {
          $scope.loginButtonText = "Login";
          var authUser = ($scope.profile.fullname.value)?" as "+$scope.profile.fullname.value:"";  
          Notifier.success('Authenticated'+authUser);
          $scope.saveCredentials(true);
        }
      }
    });
  };

  $scope.saveCredentials = function (redirect) {
    var app = {
      profile: { 
        webid: $scope.profile.webid,
        owner: $scope.profile.owner,
        date: $scope.profile.date
      },
      authenticated: $scope.authenticated
    };
    $scope.profile.loading = false;
    sessionStorage.setItem($scope.appuri, JSON.stringify(app));
    // redirect to view page
    if (redirect) {
      $state.go('view');
    }
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
        $scope.loginButtonText = 'Logged in';
      } else {
        Notifier.warning('WebID-TLS authentication failed.');
        console.log('WebID-TLS authentication failed.');
      }
    }).error(function(data, status, headers) {
      Notifier.error('Could not connect to auth server: HTTP '+status);
      console.log('Could not connect to auth server: HTTP '+status);
      $scope.loginButtonText = 'Login done';
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
    $scope.authenticated = false;
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
    if (app) {
      if (!$scope.profile) {
        $scope.profile = {};
      }
      // don't let session data become stale (24h validity)
      var dateValid = app.profile.date + 1000 * 60 * 60 * 24;
      if (Date.now() < dateValid) {
        $scope.profile = app.profile;
        $scope.authenticated = app.authenticated;
        $scope.getProfile(app.profile.webid);
      } else {
        console.log("Deleting profile because of date");
        sessionStorage.removeItem($scope.appuri);
      }
    } else {
      // clear sessionStorage in case there was a change to the data structure
      console.log("Deleting profile because of structure");
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
