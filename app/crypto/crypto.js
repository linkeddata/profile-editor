angular.module( 'App.crypto', [
  'ui.router'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'crypto', {
    url: '/crypto',
    views: {
      "main": {
        controller: 'CryptoCtrl',
        templateUrl: 'app/crypto/crypto.tpl.html'
      }
    },
    data:{ pageTitle: 'Crypto' }
  });
})

.controller( 'CryptoCtrl', function LoginCtrl( $scope, $location, $state ) {


});
