// Globals
var PROXY = "https://rww.io/proxy?uri={uri}";
var AUTH_PROXY = "https://rww.io/auth-proxy?uri=";
var TIMEOUT = 90000;
var DEBUG = true;

// Namespaces
var RDF = $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
var RDFS = $rdf.Namespace("http://www.w3.org/2000/01/rdf-schema#");
var FOAF = $rdf.Namespace("http://xmlns.com/foaf/0.1/");
var OWL = $rdf.Namespace("http://www.w3.org/2002/07/owl#");
var SPACE = $rdf.Namespace("http://www.w3.org/ns/pim/space#");

$rdf.Fetcher.crossSiteProxyTemplate=PROXY;

// Angular
angular.module( 'App', [
  'App.about',
  'App.login',
  'App.view',
  'App.edit',
  'App.share',
  'ui.router'
])

.config( function AppConfig ( $stateProvider, $urlRouterProvider ) {
  $urlRouterProvider.otherwise( 'edit/profile' );
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
  $scope.appuri = window.location.host+window.location.pathname;
  $scope.loginButtonText = 'Login';
  $scope.webid = '';

  $scope.profile = {};
  $scope.profile.loading = false;
  $scope.authenticated = false;

  $scope.ProfileElement = function(s) {
    this.locked = false;
    this.failed = false;
    this.picker = false;
    this.statement = angular.copy(s);
    this.value = this.prev = '';
    if (s && s['object']['value']) {
      var val = s['object']['value']
      if (val.indexOf('tel:') >= 0) {
        val = val.slice(4, val.length);
      } else if (val.indexOf('mailto:') >= 0) {
        val = val.slice(7, val.length);
      }
      this.value = val;
      this.prev = val;
    }
  };

  $scope.ProfileElement.prototype.updateObject = function(update, force) {
    // do not update if value hasn't changed
    if (this.value == this.prev && !force) {
      return;
    }

    if (!this.failed) {
      this.prev = angular.copy(this.value);
    }
    var oldS = angular.copy(this.statement);
    if (this.statement) {
      if (this.statement['object']['termType'] == 'literal') {
        this.statement['object']['value'] = this.value;
      } else if (this.statement['object']['termType'] == 'symbol') {
        val = this.value;
        if (this.statement['predicate'].compareTerm(FOAF('mbox')) == 0) {
          val = "mailto:"+val;
        } else if (this.statement['predicate'].compareTerm(FOAF('phone')) == 0) {
          val = "tel:"+val;
        }
        this.statement['object']['uri'] = val;
        this.statement['object']['value'] = val;
      }
    }

    if (update) {
      this.locked = true;
      var query = '';
      var graphURI = '';
      if (oldS && oldS['object']['value'].length > 0) {
        var query = "DELETE DATA { " + oldS.toNT() + " }";
        if (oldS['why'] && oldS['why']['value'].length > 0) {
          graphURI = oldS['why']['value'];
        } else {
          graphURI = oldS['subject']['value'];
        }
        // add separator
        if (this.value.length > 0) {
          query += " ;\n";
        }
      }
      if (this.value.length > 0) {
        // should ask the user where the new triple should be saved
        query += "INSERT DATA { " + this.statement.toNT() + " }";
        if (graphURI.length == 0) {
          if (this.statement && this.statement['why']['value'].length > 0) {
            graphURI = this.statement['why']['value'];
          } else {
            graphURI = this.statement['subject']['value'];
          }
        }
      }

      // send PATCH request
      if (graphURI && graphURI.length > 0) {
        var that = this;
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
          that.locked = false;
          Notifier.success('Profile updated!');
        }).error(function(data, status, headers) {
          that.locked = false;
          that.failed = true;
          that.statement = oldS;
          Notifier.error('Could not update profile: HTTP '+status);
          console.log(data);
        });
      }
    }
  };

  // Load a user's profile
  // string uri  - URI of resource containing profile information
  // bool authenticated - whether the user was previously authenticated or now
  // bool loadMore - whether it loads extended profile documents
  $scope.getProfile = function(uri, authenticated, loadMore) {
    if (!$scope.profile) {
      $scope.profile = {};
    }
    if (!$scope.profile.webid || $scope.profile.webid.length == 0) {
      $scope.profile.webid = uri;
    }
    var g = $rdf.graph();
    var f = $rdf.fetcher(g, TIMEOUT);

    var docURI = (uri.indexOf('#') >= 0)?uri.slice(0, uri.indexOf('#')):uri;
    var webidRes = $rdf.sym($scope.profile.webid);
    $scope.profile.loading = true;
    if (authenticated) {
      $scope.authenticated = true;
    }
    // fetch user data
    f.nowOrWhenFetched(docURI,undefined,function(ok, body, xhr) {
      if (!ok) {
        console.log('Warning - profile not found.');
        var extra = '';
        if (loadMore) {
          extra = 'additional';
        }
        Notifier.error('Failed to fetch '+extra+' profile '+uri+'. HTTP '+xhr.status);
        if (!$scope.profile.fullname) {
          $scope.profile.fullname = uri;
        }
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
        if (!$scope.profile.date) {
          $scope.profile.date = Date.now();
        }
        // save docURI to list of sources
        if (!$scope.profile.sources) {
          $scope.profile.sources = [];
        }
        if ($scope.profile.sources.indexOf(docURI) < 0) {
          $scope.profile.sources.push(docURI);
        }

        // try to fetch additional data from sameAs, seeAlso and preferenceFile
        if (!loadMore) {
          var sameAs = g.statementsMatching(webidRes, OWL('sameAs'), undefined);
          if (sameAs.length > 0) {
            sameAs.forEach(function(same){
              $scope.getProfile(same['object']['value'], false, true);
            });
          }
          var seeAlso = g.statementsMatching(webidRes, OWL('seeAlso'), undefined);
          if (seeAlso.length > 0) {
            seeAlso.forEach(function(see){
              $scope.getProfile(see['object']['value'], false, true);
            });
          }
          var prefs = g.statementsMatching(webidRes, SPACE('preferencesFile'), undefined);
          if (prefs.length > 0) {
            prefs.forEach(function(pref){
              if (pref['object']['value']) {
                $scope.getProfile(pref['object']['value'], false, true);
              }
            });
          }
        }

        // get info
        if (!$scope.profile.fullname) {
          var fullname = g.statementsMatching(webidRes, FOAF('name'), undefined)[0];
          if (!fullname || fullname['object']['value'].length == 0) {
            fullname = $rdf.st(webidRes, FOAF('name'), $rdf.lit(''), $rdf.sym(''));
          }        
          $scope.profile.fullname = new $scope.ProfileElement(fullname);
        }
        // Firstname
        if (!$scope.profile.firstname) {
          var firstname = g.statementsMatching(webidRes, FOAF('givenName'), undefined)[0];
          if (!firstname || firstname['object']['value'].length == 0) {
            firstname = $rdf.st(webidRes, FOAF('givenName'), $rdf.lit(''), $rdf.sym(''));
          }
          $scope.profile.firstname = new $scope.ProfileElement(firstname);
        }
        // Lastname
        if (!$scope.profile.lastname) {
          var lastname = g.statementsMatching(webidRes, FOAF('familyName'), undefined)[0];
          if (!lastname || lastname['object']['value'].length == 0) {
            lastname = $rdf.st(webidRes, FOAF('familyName'), $rdf.lit(''), $rdf.sym(''));
          }
          $scope.profile.lastname = new $scope.ProfileElement(lastname);
        }
        // Nickname
        if (!$scope.profile.nick) {
          var nick = g.statementsMatching(webidRes, FOAF('nick'), undefined)[0];
          if (!nick || nick['object']['value'].length == 0) {
            nick = $rdf.st(webidRes, FOAF('nick'), $rdf.lit(''), $rdf.sym(''));
          }
          $scope.profile.nick = new $scope.ProfileElement(nick);
        }
        // Gender
        if (!$scope.profile.gender) {
          var gender = g.statementsMatching(webidRes, FOAF('gender'), undefined)[0];
          if (!gender || gender['object']['value'].length == 0) {
            gender = $rdf.st(webidRes, FOAF('gender'), $rdf.lit(''), $rdf.sym(''));
          }
          $scope.profile.gender = new $scope.ProfileElement(gender);
        }

        // Get profile picture
        if (!$scope.profile.picture) {
          var img = g.statementsMatching(webidRes, FOAF('img'), undefined)[0];
          var pic;
          if (img) {
            pic = img;
          } else {
            // check if profile uses depic instead
            var depic = g.statementsMatching(webidRes, FOAF('depiction'), undefined)[0];  
            if (depic) {
              pic = depic;
            }
          }
          if (!pic || pic['object']['value'].length == 0) {
            pic = $rdf.st(webidRes, FOAF('img'), $rdf.sym(''), $rdf.sym(''));
          }
          $scope.profile.picture = new $scope.ProfileElement(pic);
        }
        // Phones
        if (!$scope.profile.phones) {
          $scope.profile.phones = [];
        }
        var phones = g.statementsMatching(webidRes, FOAF('phone'), undefined);
        if (phones.length > 0) {
          phones.forEach(function(phone){
            $scope.profile.phones.push(new $scope.ProfileElement(phone));
          });
        }

        // Emails
        if (!$scope.profile.emails) {
          $scope.profile.emails = [];
        }
        var emails = g.statementsMatching(webidRes, FOAF('mbox'), undefined);
        if (emails.length > 0) {
          emails.forEach(function(email){
            $scope.profile.emails.push(new $scope.ProfileElement(email));
          });
        }

        // Blogs
        if (!$scope.profile.blogs) {
          $scope.profile.blogs = [];
        }
        var blogs = g.statementsMatching(webidRes, FOAF('weblog'), undefined);
        if (blogs.length > 0) {
          blogs.forEach(function(blog){
            $scope.profile.blogs.push(new $scope.ProfileElement(blog));
          });
        }

        // Homepages
        if (!$scope.profile.homepages) {
          $scope.profile.homepages = [];
        }
        var homepages = g.statementsMatching(webidRes, FOAF('homepage'), undefined);
        if (homepages.length > 0) {
          homepages.forEach(function(homepage){
            $scope.profile.homepages.push(new $scope.ProfileElement(homepage));
          });
        }

        // Workpages
        if (!$scope.profile.workpages) {
          $scope.profile.workpages = [];
        }
        var workpages = g.statementsMatching(webidRes, FOAF('workplaceHomepage'), undefined);
         if (workpages.length > 0) {
          workpages.forEach(function(workpage){
            $scope.profile.workpages.push(new $scope.ProfileElement(workpage));
          });
        }

        $scope.profile.loading = false;
        $scope.$apply();

        // debug
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
    sessionStorage.setItem($scope.appuri, JSON.stringify(app));
    // redirect to view page
    if (redirect) {
      // switch to view once it's available
      $state.go('editProfile');
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
        $scope.profile.webid = user;
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
