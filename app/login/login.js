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
  }).state( 'rsalogin', {
    url: '/RSAlogin?nomenu',
    views: {
      "main": {
        controller: 'RSALoginCtrl',
        templateUrl: 'app/login/RSAlogin.tpl.html'
      }
    },
    data:{ pageTitle: 'RSA Login' }
  });
})

.controller( 'LoginCtrl', function LoginCtrl( $scope, $location, $state ) {
  $scope.TLSlogin = function() {
    $scope.$parent.TLSlogin(true);
  };

  $scope.RSAlogin = function() {
    console.log("RSA login");
    PopupCenter('/#/RSAlogin?nomenu=true','RSA login','500','300');
  };
})

.controller( 'RSALoginCtrl', function RSALoginCtrl( $scope, $location, $stateParams ) {
  if ($stateParams['nomenu']) {
    $scope.$parent.showMenu = false;
  }
  $scope.toFetch = 'https://deiu.rww.io/profile/card#me';

  $scope.errorFetcher = function(ok, body, xhr) {
    console.log("Calling errorFetcher");
    console.log(ok);
    console.log(xhr);
    console.log(body);
  }

  $scope.redirectToKeyStore = function(profile) {
    console.log("Calling redirect");
    if (profile.keystore && profile.keystore.value.length > 0) {
      console.log(profile.keystore.value);
      window.location.replace(profile.keystore.value);
    }
  }

  $scope.loadProfile = function() {
    console.log("Calling loadProfile");
    $scope.$parent.getProfile($scope.toFetch).then($scope.redirectToKeyStore);
  };

});
