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

.controller( 'EditProfileCtrl', function EditProfileCtrl( $scope, $upload ) {
  // blank
  $scope.pictureFile = {};
  // Copy profile object (we compare to limit number of changes later)
  // $scope.profile = ($scope.$parent.profile)?angular.copy($scope.$parent.profile):{};
  $scope.profile = $scope.$parent.profile;

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

  $scope.updateProfilePicture = function(url) {
    console.log(url);

    // 
    
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
      $scope.uploading = true;
      $upload.upload({
          method: 'POST',
          url: newPicURL,
          withCredentials: true,
          file: file
      }).success(function (data, status, headers, config) {
        $scope.uploading = false;
        var pic = headers("Location");
        $scope.updateProfilePicture(pic);
        Notifier.success('Picture uploaded successfully');
      }).error(function (data, status, headers, config) {
        $scope.uploading = false;
        Notifier.error('Could not upload picture -- HTTP '+status);
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
  $scope.addBlog = function() {
    if (!$scope.profile.blogs) {
      $scope.profile.blogs = [];
    }
    $scope.profile.blogs.push({value: ''});
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
  $scope.deleteBlog = function(id) {
     $scope.profile.blogs.splice(id, 1);
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

  // Updates
  
  // update picture
  $scope.updateProfilePicture = function(url) {
    console.log(url);
    var s = $scope.profile.picture.triple;
    // 
    
  };

  $scope.updateObject = function (property) {
    if ($scope.profile[property].value != $scope.$parent.profile[property].value) {
      // update object and also patch graph
      $scope.$parent.profile[property].updateObject($scope.profile[property].value, true);
    }
  };


  $scope.$watch('pictureFile.file', function (newFile, oldFile) {
    if (newFile != undefined || newFile !== oldFile) {
      $scope.originalImage = '';
      $scope.imageName = '';
      $scope.croppedImage = '';
      $scope.handleFileSelect(newFile[0]);
      $('#picture-cropper').openModal();
    }
  });
});
