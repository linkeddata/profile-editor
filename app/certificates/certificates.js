angular.module( 'App.certificates', [
  'ui.router'
])

.config(function config( $stateProvider, $urlRouterProvider ) {
  $urlRouterProvider.otherwise( '/certificates' );
  $stateProvider.state( 'certificates', {
    url: '/certificates',
    views: {
      "main": {
        controller: 'CertsCtrl',
        templateUrl: 'app/certificates/certificates.tpl.html'
      }
    },
    data:{ pageTitle: 'Certificates' }
  })
  .state( 'certificateNew', {
    url: '/certificates/new',
    views: {
      "main": {
        controller: 'CertNewCtrl',
        templateUrl: 'app/certificates/certnew.tpl.html'
      }
    },
    data:{ pageTitle: 'New certificate' }
  });
})

.controller( 'CertsCtrl', function CertsCtrl( $scope, $location, $state ) {


  // update a value and patch profile
  $scope.updateObject = function (cert, force) {
    // Iterate through the object
    // // update object and also patch graph
    // if (obj.value && obj.statement.why.value.length == 0 && $scope.profile.sources.length > 0) {
    //   obj.picker = true;
    // } else {
    //   obj.updateObject(true, force);
    // }
  };

  $scope.deleteCert = function(id) {
    $scope.profile.certs[id].key.deleteSubject(true);
    $scope.profile.certs.splice(id, 1);
  };

  $scope.fixHexa = function(obj) {
    obj.value = (!obj.value) ? '' : obj.value.replace(/[\r\n\t\s:]+/g, '');
  };

})

.controller( 'CertNewCtrl', function CertNewCtrl( $scope, $location, $http, $state ) {
  $scope.endpoints = [];
  $scope.profile = $scope.$parent.profile;

  $scope.findEndpoint = function(webid) {
    $http({
      method: 'OPTIONS',
      url: webid,
      withCredentials: true
    }).success(function(data, status, headers) {
      // add dir to local list
      if (headers('Link')) {
        console.log(headers('Link'));
        var lh = parseLinkHeader(headers('Link'));
        if (lh['http://example.org/services#newCert'] && lh['http://example.org/services#newCert']['href'].length > 0) {
          $scope.endpoints.push(lh['http://example.org/services#newCert']['href']);
          console.log(lh['http://example.org/services#newCert']['href']);
        } else {
          console.log("Found link header: "+lh['http://example.org/services#newCert']);
        }
      } else {
        console.log(headers());
      }
    }).error(function(data, status, headers) {
      console.log("Cound not find endpoint: HTTP "+status);
    });
  };

  $scope.$watch('profile.sources', function(newVal, oldVal) {
    if (newVal !== undefined) {
      console.log(newVal);
      var srcs = newVal;
      for (i in srcs) {
        $scope.findEndpoint(srcs[i].uri);
      }
    }
  });
});
