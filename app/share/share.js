angular.module( 'App.share', [
  'ui.router',
  'monospaced.qrcode'
  // 'placeholders'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'share', {
    url: '/share?webid',
    views: {
      "main": {
        controller: 'ShareCtrl',
        templateUrl: 'app/share/share.tpl.html'
      }
    },
    data:{ pageTitle: 'Share WebID' }
  });
})

.controller( 'ShareCtrl', function ViewCtrl( $scope, $state, $stateParams ) {
  // compute version based on WebID length
  $scope.getQRparams = function(uri) {
    if (uri) {
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
    }
  };

  $scope.showQR = function() {
    var webid = ($stateParams['webid'])?$stateParams['webid']:$scope.profile.webid;
    $scope.webid = webid;
    $scope.viewerURI = $scope.$parent.appuri+'/#/profile/view?webid='+encodeURIComponent(webid);
    $scope.webidQr = $scope.getQRparams(webid);
    $scope.viewerQr = $scope.getQRparams($scope.viewerURI);
  }

  if ($stateParams['webid'] || ($scope.profile && $scope.profile.webid)) {
    $scope.showQR();
  }

  $scope.$watch('profile.webid', function (newValue, oldValue) {
    if (newValue != undefined) {
      $scope.showQR();
    }
  });
  
});
