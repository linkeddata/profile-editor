angular.module( 'App.edit', [
  'ui.router',
  'angularFileUpload',
  'ngImgCrop'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'editProfile', {
    url: '/edit/profile',
    views: {
      "main": {
        controller: 'EditProfileCtrl',
        templateUrl: 'app/edit/profile.tpl.html'
      }
    },
    data:{ pageTitle: 'Edit profile' }
  });
})

.controller( 'EditProfileCtrl', function AboutCtrl( $scope, $upload ) {
  // blank
  $scope.pictureFile = {};
  // Copy profile object (we compare to limit number of changes later)
  $scope.profile = ($scope.$parent.profile)?angular.copy($scope.$parent.profile):{};

  if (!$scope.profile.picture) {
    $scope.profile.picture = "images/generic_photo.png";
    if ($scope.$parent.profile && $scope.$parent.profile.picture) {
      $scope.profile.picture = $scope.$parent.profile.picture;
    }
  }

  $scope.handleFileSelect = function(file) {
    if (file) {
      $scope.imageName = file.name;
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
    var parts = [blob]; 

    var fileName = "picture."+$scope.imageName.split('.')[1];

    return new File(parts, fileName, {
      type: $scope.imageType
    });
  };

  $scope.uploadPicture = function (file) {
    if (file) {
      var newPicURL = '';
      newPicURL = dirname($scope.profile.webid)+'/';

      $upload.upload({
          method: 'POST',
          url: newPicURL,
          withCredentials: true,
          file: file
      }).progress(function (evt) {
          var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
          console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
      }).success(function (data, status, headers, config) {
          console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
      });
    }
  };

  $scope.savePicture = function() {
    var newImg = $scope.dataURItoBlob($scope.croppedImage);
    $scope.uploadPicture(newImg);
  };

  // Adds
  $scope.addPhone = function() {
    if (!$scope.profile.phones) {
      $scope.profile.phones = [];
    }
    $scope.profile.phones.push({value: ''});
  };
  $scope.addEmail = function() {
    if (!$scope.profile.emails) {
      $scope.profile.emails = [];
    }
    $scope.profile.emails.push({value: ''});
  };
  $scope.addHomepage = function() {
    if (!$scope.profile.homepages) {
      $scope.profile.homepages = [];
    }
    $scope.profile.homepages.push({value: ''});
  };
  $scope.addWorkpage = function() {
    if (!$scope.profile.workpages) {
      $scope.profile.workpages = [];
    }
    $scope.profile.workpages.push({value: ''});
  };

  // Deletes
  $scope.deletePhone = function(id) {
     $scope.profile.phones.splice(id, 1);
  };
  $scope.deleteEmail = function(id) {
     $scope.profile.emails.splice(id, 1);
  };
  $scope.deleteHomepage = function(id) {
     $scope.profile.homepages.splice(id, 1);
  };
  $scope.deleteWorkpage = function(id) {
     $scope.profile.workpages.splice(id, 1);
  };

  $scope.login = function() {
    $scope.$parent.login();
  };

  $scope.$watch('profile.fullname', function (newVal, oldVal) {
    //$scope.upload($scope.files);
    console.log(newVal);
    console.log($scope.$parent.profile.fullname);
    if (newVal != $scope.$parent.profile.fullname) {
      console.log("Has changed");
    }
    // $('#picture-cropper').openModal();
  });

  $scope.$watch('pictureFile.file', function (newFile, oldFile) {
    if (newFile != undefined || newFile !== oldFile) {
      console.log(newFile[0]);
      $scope.originalImage = '';
      $scope.imageName = '';
      $scope.croppedImage = '';
      $scope.handleFileSelect(newFile[0]);
      $('#picture-cropper').openModal();
    }
  });
});
