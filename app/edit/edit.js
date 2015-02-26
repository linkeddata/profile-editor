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

  // Adds
  $scope.addPhone = function() {
    if (!$scope.profile.phones) {
      $scope.profile.phones = [];
    }
    if ($scope.profile.webid.indexOf('#') >= 0) {
      var docURI = $scope.profile.webid.slice(0, $scope.profile.webid.indexOf('#'));
    } else {
      var docURI = $scope.profile.webid;
    }
    var newPhone = new $scope.$parent.ProfileElement(
      $rdf.st(
        $rdf.sym($scope.profile.webid),
        FOAF('phone'),
        $rdf.sym(''),
        $rdf.sym(docURI)
      )
    );
    $scope.profile.phones.push(newPhone);
  };
  $scope.addEmail = function() {
    if (!$scope.profile.emails) {
      $scope.profile.emails = [];
    }
    if ($scope.profile.webid.indexOf('#') >= 0) {
      var docURI = $scope.profile.webid.slice(0, $scope.profile.webid.indexOf('#'));
    } else {
      var docURI = $scope.profile.webid;
    }
    var newEmail = new $scope.$parent.ProfileElement(
      $rdf.st(
        $rdf.sym($scope.profile.webid),
        FOAF('mbox'),
        $rdf.sym(''),
        $rdf.sym(docURI)
      )
    );
    $scope.profile.emails.push(newEmail);
  };
  $scope.addBlog = function() {
    if (!$scope.profile.blogs) {
      $scope.profile.blogs = [];
    }
    if ($scope.profile.webid.indexOf('#') >= 0) {
      var docURI = $scope.profile.webid.slice(0, $scope.profile.webid.indexOf('#'));
    } else {
      var docURI = $scope.profile.webid;
    }
    var newBlog = new $scope.$parent.ProfileElement(
      $rdf.st(
        $rdf.sym($scope.profile.webid),
        FOAF('weblog'),
        $rdf.sym(''),
        $rdf.sym(docURI)
      )
    );
    $scope.profile.blogs.push(newBlog);
  };
  $scope.addHomepage = function() {
    if (!$scope.profile.homepages) {
      $scope.profile.homepages = [];
    }
    if ($scope.profile.webid.indexOf('#') >= 0) {
      var docURI = $scope.profile.webid.slice(0, $scope.profile.webid.indexOf('#'));
    } else {
      var docURI = $scope.profile.webid;
    }
    var newHomepage = new $scope.$parent.ProfileElement(
      $rdf.st(
        $rdf.sym($scope.profile.webid),
        FOAF('homepage'),
        $rdf.sym(''),
        $rdf.sym(docURI)
      )
    );
    $scope.profile.homepages.push(newHomepage);
  };
  $scope.addWorkpage = function() {
    if (!$scope.profile.workpages) {
      $scope.profile.workpages = [];
    }
    if ($scope.profile.webid.indexOf('#') >= 0) {
      var docURI = $scope.profile.webid.slice(0, $scope.profile.webid.indexOf('#'));
    } else {
      var docURI = $scope.profile.webid;
    }
    var newWorkpage = new $scope.$parent.ProfileElement(
      $rdf.st(
        $rdf.sym($scope.profile.webid),
        FOAF('workplaceHomepage'),
        $rdf.sym(''),
        $rdf.sym(docURI)
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

  $scope.login = function() {
    $scope.$parent.login();
  };

  // Updates
  
  // update a value and patch profile
  $scope.updateObject = function (obj) {
    // update object and also patch graph
    obj.updateObject(true);
  };

  // update picture
  $scope.updateProfilePicture = function(url) {
    $scope.profile.picture.value = url;
    $scope.updateObject($scope.profile.picture);
  };

  // select file for picture
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

    return new File(parts, $scope.imageName, {
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

  // replace white spaces with dashes (for phone numbers)
  $scope.space2dash = function(obj) {
    obj.value = (!obj.value) ? '' : obj.value.replace(/\s+/g, '-');
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