angular.module( 'App.profile', [
  'ui.router',
  'angularFileUpload',
  'ngImgCrop'
])
.config(function config( $stateProvider ) {
  $stateProvider.state( 'editProfile', {
    url: '/profile/edit?webid',
    views: {
      "main": {
        controller: 'EditProfileCtrl',
        templateUrl: 'app/profile/edit.tpl.html'
      }
    },
    data:{ pageTitle: 'Edit profile' }
  });
})
.config(function config( $stateProvider ) {
  $stateProvider.state( 'viewProfile', {
    url: '/profile/view?webid',
    views: {
      "main": {
        controller: 'ViewCtrl',
        templateUrl: 'app/profile/view.tpl.html'
      }
    },
    data:{ pageTitle: 'View profile' }
  });
})
.controller( 'ViewCtrl', function ViewCtrl( $scope, $location, $state, $stateParams ) {
  $scope.form = {};

  $scope.viewProfile = function(webid) {
    if (!$scope.$parent.profiles) {
      $scope.$parent.profiles = [];
    }
    var webid = (webid)?webid:$scope.form.webid;
    if (!$scope.$parent.profiles[webid]) {
      $scope.$parent.profiles[webid] = {};
      $scope.$parent.getProfile(webid, false);
    }
    $scope.profile = $scope.$parent.profiles[webid];
    $scope.$parent.toWebID = $scope.profile.webid;
    $scope.$parent.toLoc = '/profile/edit';
    $location.path("/profile/view").search({'webid': webid}).replace();
    $scope.form = {};
  };

  if ($stateParams['webid']) {
    var webid = $stateParams['webid'];
    // check if it's the authenticated user
    if ($scope.$parent.profile && $scope.$parent.profile.webid == webid) {
      $scope.profile = $scope.$parent.profile;
    } else if ($scope.$parent.profiles[webid] && $scope.$parent.profiles[webid].webid == webid) {
      // load previous profile if it exists
      $scope.profile = $scope.$parent.profiles[webid];
    } else {
      $scope.viewProfile(webid);
    }
  }
  $scope.$parent.toWebID = $scope.profile.webid;
  $scope.$parent.toLoc = '/profile/edit';
})
.controller( 'EditProfileCtrl', function EditProfileCtrl( $scope, $state, $location, $http, $stateParams ) {
  // blank
  $scope.form = {};
  $scope.pictureFile = {};
  $scope.bgFile = {};
  $scope.profile = {};
  $scope.overlay = $scope.$parent.overlay;

  // Adds
  $scope.addPhone = function() {
    if (!$scope.profile.phones) {
      $scope.profile.phones = [];
    }
    var newPhone = new $scope.$parent.ProfileElement(
      $rdf.st(
        $rdf.sym($scope.profile.webid),
        FOAF('phone'),
        $rdf.sym(''),
        $rdf.sym('')
      )
    );
    $scope.profile.phones.push(newPhone);
  };
  $scope.addEmail = function() {
    if (!$scope.profile.emails) {
      $scope.profile.emails = [];
    }
    var newEmail = new $scope.$parent.ProfileElement(
      $rdf.st(
        $rdf.sym($scope.profile.webid),
        FOAF('mbox'),
        $rdf.sym(''),
        $rdf.sym('')
      )
    );
    $scope.profile.emails.push(newEmail);
  };
  $scope.addBlog = function() {
    if (!$scope.profile.blogs) {
      $scope.profile.blogs = [];
    }
    var newBlog = new $scope.$parent.ProfileElement(
      $rdf.st(
        $rdf.sym($scope.profile.webid),
        FOAF('weblog'),
        $rdf.sym(''),
        $rdf.sym('')
      )
    );
    $scope.profile.blogs.push(newBlog);
  };
  $scope.addHomepage = function() {
    if (!$scope.profile.homepages) {
      $scope.profile.homepages = [];
    }
    var newHomepage = new $scope.$parent.ProfileElement(
      $rdf.st(
        $rdf.sym($scope.profile.webid),
        FOAF('homepage'),
        $rdf.sym(''),
        $rdf.sym('')
      )
    );
    $scope.profile.homepages.push(newHomepage);
  };
  $scope.addWorkpage = function() {
    if (!$scope.profile.workpages) {
      $scope.profile.workpages = [];
    }
    var newWorkpage = new $scope.$parent.ProfileElement(
      $rdf.st(
        $rdf.sym($scope.profile.webid),
        FOAF('workplaceHomepage'),
        $rdf.sym(''),
        $rdf.sym('')
      )
    );
    $scope.profile.workpages.push(newWorkpage);
  };

  // Deletes
  $scope.deletePhone = function(id) {
    $scope.profile.phones[id].value = '';
    $scope.updateObject($scope.profile.phones[id]);
    $scope.profile.phones.splice(id, 1);
  };
  $scope.deleteEmail = function(id) {
    $scope.profile.emails[id].value = '';
    $scope.updateObject($scope.profile.emails[id]);
    $scope.profile.emails.splice(id, 1);
  };
  $scope.deleteBlog = function(id) {
    $scope.profile.blogs[id].value = '';
    $scope.updateObject($scope.profile.blogs[id]);
    $scope.profile.blogs.splice(id, 1);
  };
  $scope.deleteHomepage = function(id) {
    $scope.profile.homepages[id].value = '';
    $scope.updateObject($scope.profile.homepages[id]);
    $scope.profile.homepages.splice(id, 1);
  };
  $scope.deleteWorkpage = function(id) {
    $scope.profile.workpages[id].value = '';
    $scope.updateObject($scope.profile.workpages[id]);
    $scope.profile.workpages.splice(id, 1);
  };

  $scope.deletePicture = function() {
    $scope.profile.picture.value = '';
    $scope.updateObject($scope.profile.picture);
  };

  $scope.login = function() {
    $scope.$parent.login(false);
  };

  // Updates
  // select file for picture
  $scope.handleFileSelect = function(file) {
    if (file) {
      $scope.pictureName = file.name;
      $scope.imageType = file.type;
      var reader = new FileReader();
      reader.onload = function (evt) {
        $scope.$apply(function($scope){
          $scope.originalImage=evt.target.result;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  $scope.dataURItoBlob = function(dataURI) {
    var data = dataURI.split(',')[1];
    // var binary = atob(data);
    var binary;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        binary = atob(data);
    else
        binary = decodeURI(data);

    var buffer = new ArrayBuffer(binary.length);
    var ia = new Uint8Array(buffer);
    for (var i = 0; i < binary.length; i++) {
        ia[i] = binary.charCodeAt(i);
    }
    var blob = new Blob([ia], {type: $scope.imageType});

    return blob;
    // new File() is not supported by Safari for now
    // return new File([blob.buffer], $scope.pictureName, {
    //   lastModified: new Date(0),
    //   type: $scope.imageType
    // });
  };


  // update a value and patch profile
  $scope.updateObject = function (obj, force) {
    // update object and also patch graph
    if (obj.value && obj.statement.why.value.length == 0 && $scope.profile.sources.length > 0) {
      obj.picker = true;
    } else {
      obj.updateObject(true, force);
    }
  };

  $scope.uploadPicture = function (obj, file, filename) {
    if (obj && file && filename) {
      filename = encodeURI(filename)
      newPicContainer = dirname(obj.statement.why.value)+'/';
      obj.uploading = true;
      var newPicURL = newPicContainer + filename;
      $http({
        method: 'PUT',
        url: newPicURL,
        headers: {
          'Content-Type': $scope.imageType
        },
        withCredentials: true,
        data: file
      }).success(function () {
        obj.value = newPicURL;
        $scope.updateObject(obj, true);
      }).error(function () {
        $scope.uploading = false;
        Notifier.error('Could not upload picture to ' + newPicURL + ' -- HTTP '+status);
      });
    }
  };

  $scope.savePicture = function() {
    console.log("Saving picture...");
    var newImg = $scope.dataURItoBlob($scope.croppedImage);
    if ($scope.profile.picture.statement.why.value.length == 0 && $scope.profile.sources.length > 0) {
      $scope.profile.picture.picker = true;
    } else {
      $scope.uploadPicture($scope.profile.picture, newImg, $scope.pictureName);
    }
  };
  $scope.saveBackground = function() {
    console.log("Saving background picture...");
    if ($scope.profile.bgpicture.statement.why.value.length == 0 && $scope.profile.sources.length > 0) {
      $scope.profile.bgpicture.picker = true;
    } else if ($scope.bgFile.file[0]) {
      $scope.uploadPicture($scope.profile.bgpicture, $scope.bgFile.file[0], $scope.bgFile.file[0].name);
    }
  }

  // replace white spaces with dashes (for phone numbers)
  $scope.space2dash = function(obj) {
    obj.value = (!obj.value) ? '' : obj.value.replace(/\s+/g, '-');
  };

  $scope.editProfile = function(webid) {
    if (!$scope.$parent.profiles) {
      $scope.$parent.profiles = [];
    }
    var webid = (webid)?webid:$scope.form.webid;
    if (!$scope.$parent.profiles[webid]) {
      console.log("No profile exists for "+webid);
      $scope.$parent.profiles[webid] = {};
      $scope.$parent.getProfile(webid, false, false);
    }
    $scope.profile = $scope.$parent.profiles[webid];
    $scope.$parent.toWebID = $scope.profile.webid;
    $scope.$parent.toLoc = '/profile/view';
    $location.path("/profile/edit").search({'webid': webid}).replace();
    console.log($scope.profile);
  }

  if (!$scope.profile.webid) {
    if ($stateParams['webid']) {
      var webid = $scope.form.webid = $stateParams['webid'];
      // check if it's the authenticated user
      if ($scope.$parent.profile && $scope.$parent.profile.webid == webid) {
        $scope.profile = $scope.$parent.profile;
      } else if ($scope.$parent.profiles[webid] && $scope.$parent.profiles[webid].webid == webid) {
        // load previous existing profile
        $scope.profile = $scope.$parent.profiles[webid];
      } else {
        $scope.editProfile(webid);
      }
    } else {
      $scope.profile = $scope.$parent.profile;
    }
  }
  $scope.$parent.toWebID = $scope.profile.webid;
  $scope.$parent.toLoc = '/profile/view';

  $scope.$watch('pictureFile.file', function (newFile, oldFile) {
    if (newFile != undefined) {
      $scope.originalImage = '';
      $scope.imageName = '';
      $scope.croppedImage = '2';
      $scope.handleFileSelect(newFile[0]);
      $('#picture-cropper').openModal();
    }
  });
  $scope.$watch('bgFile.file', function (newFile, oldFile) {
    if (newFile != undefined) {
      $scope.saveBackground();
    }
  });
})
.directive('pickSource', function () {
    return {
        restrict: 'AE',
        scope: {
          obj: '='
        },
        transclude: true,
        template: '<div class="modal s12" id="location-picker">'+
                  '  <div class="modal-content">'+
                  '    <div class="modal-header">'+
                  '      <h5>Put this information in:</h5>'+
                  '    </div>'+
                  '    <div class="modal-body">'+
                  '      <div class="row s12">'+
                  '        <div class="col s12 m4 valign-wrapper truncate left inline-block" ng-repeat="src in $parent.profile.sources">'+
                  '          <span aria-hidden="true" class="mdi-file-folder-shared valign right-10 inline-block"></span>'+
                  '          <a href="" class="dotted" ng-click="setWhy(src.uri)">{{src.name}}</a>'+
                  '        </div>'+
                  '      </div>'+
                  '    </div>'+
                  '    <div class="modal-footer">'+
                  '      <p>'+
                  '        <a href="#" class="blue white-text btn-flat modal-action modal-close" ng-click="cancel()">Cancel</a>'+
                  '      </p>'+
                  '    </div>'+
                  '  </div>'+
                  '</div>',
        link: function($scope, $element, $attrs) {
          $('#location-picker').openModal();
          $scope.$parent.overlay = true;

          $scope.setWhy = function(uri) {
            $scope.obj.statement['why']['uri'] = $scope.obj.statement['why']['value'] = uri;
            console.log("Set Why to:"+uri);
            console.log($scope.obj.statement);
            if ($scope.obj.statement.predicate.value == FOAF('img').value || $scope.obj.statement.predicate.value == FOAF('depiction').value) {
              console.log("Supposed to save picture");
              $scope.$parent.savePicture();
            } else if ($scope.obj.statement.predicate.value == UI('backgroundImage').value) {
              console.log("Supposed to save bgpicture");
              $scope.$parent.saveBackground();
            } else {
              console.log("Supposed to update obj");
              $scope.$parent.updateObject($scope.obj);
            }
            $scope.cancel();
          }
          $scope.cancel = function() {
            $scope.$parent.overlay = false;
            $scope.obj.picker = false;
            $('#location-picker').closeModal();
          }
        }
    };
});
