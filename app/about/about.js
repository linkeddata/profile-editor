angular.module( 'App.about', [
  'ui.router',
  // 'placeholders'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'about', {
    url: '/about',
    views: {
      "main": {
        controller: 'AboutCtrl',
        templateUrl: 'app/about/about.tpl.html'
      }
    },
    data:{ pageTitle: 'About Profile Editor?' }
  });
})

.controller( 'AboutCtrl', function AboutCtrl( $scope ) {
  // blank
  
})

;
