angular.module( 'App.edit', [
  'ui.router',
  // 'placeholders'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'edit', {
    url: '/edit',
    views: {
      "main": {
        controller: 'LoginCtrl',
        templateUrl: 'app/edit/edit.tpl.html'
      }
    },
    data:{ pageTitle: 'Edit profile' }
  });
})

.controller( 'EditCtrl', function AboutCtrl( $scope ) {
  // blank
  
})

;
