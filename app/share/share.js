angular.module( 'App.share', [
  'ui.router',
  'monospaced.qrcode'
  // 'placeholders'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'share', {
    url: '/share',
    views: {
      "main": {
        controller: 'ShareCtrl',
        templateUrl: 'app/share/share.tpl.html'
      }
    },
    data:{ pageTitle: 'Share profile' }
  });
})

.controller( 'ShareCtrl', function ViewCtrl( $scope, $state, $stateParams ) {
  $scope.profile = $scope.$parent.profile;
  var viewerURI = $scope.$parent.appuri+'#/view?webid='+encodeURIComponent($scope.profile.webid);
  // compute version based on WebID length
  $scope.getQRparams = function(uri) {
    var l = uri.length;
    var v;
    switch (true) {
      case (l < 62):
        v = 4;
        break;
      case (l >= 62 && l < 122):
        v = 7;
        break;
      case (l >= 122 && l < 213):
        v = 14;
        break;
      default:
        // too big
        v = 0;
        break;
    }
    return {
      uri: uri,
      version: v,
      level: 'M',
      size: 250,
      margin: 15
    };
  };

  $scope.webidQr = $scope.getQRparams($scope.profile.webid);
  $scope.viewerQr = $scope.getQRparams(viewerURI);

});
