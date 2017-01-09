angular.module('starter.controllers', [ 'ngFitText' ])

.controller('AppCtrl', function($scope, $state, $rootScope) {
  $scope.launch = function() {
    if (typeof $rootScope.socket !== "undefined") {
      $rootScope.socket.disconnect();
      $state.go('app.loading');
    }
  };
})

.controller('SettingsCtrl', function($scope, $state, $rootScope) {

})

.controller('LoadingCtrl', function($scope, $ionicLoading, $state, $timeout, $ionicHistory, $rootScope, WORK_STATE, SERVER_ADDR) {
  $scope.$on("$ionicView.beforeEnter", function(event, data){
    delete $rootScope.socket;
    $ionicHistory.nextViewOptions({
      disableBack: true
    });
    $('#loading_status').text("Chargement de l'application...");
    $('progress').val(0);
  });

  $scope.$on("$ionicView.enter", function(event, data){
    $('#loading_status').text("Connexion au serveur...");

    $rootScope.socket = io.connect(SERVER_ADDR[WORK_STATE]);

    $rootScope.socket.on('ack', function(msg){
      if(msg == "connected"){
        $( "progress" ).animate({
          value: 100,
        }, 100, "linear", function() {
          $('#loading_status').text("Chargement terminé.");
          $timeout(function() {
            $state.go('app.main');
          }, 200);
        });
      }
    });
  });
})

.controller('MainCtrl', function($scope, $state, $rootScope, $ionicPopup, $ionicModal) {
  $scope.$on("$ionicView.beforeEnter", function(event, data){$scope.countdownCat = 5;
    $scope.countdownCat = 5;
    hidesubcategoryregory();
  });

  if (typeof $rootScope.socket === "undefined") {
    $state.go('app.loading');
  }

  $scope.btnCategory = function(event) {
    $rootScope.socket.emit('message_cat', event.currentTarget.id);
    displaysubcategoryregory(event.currentTarget);
    clearTimeout($scope.timeout_cat);
    $scope.timeout_cat = setTimeout(function(){
      hidesubcategoryregory();
    }, 5000);
  };
  $scope.btnSubCategory = function(event) {
    $rootScope.socket.emit('message_subcat', event.currentTarget.id);
    hidesubcategoryregory();
  };

  function start_countdown(time) {
    $scope.countdownCat = time;
    setInterval(function () {
      if(time > 0)
        start_countdown(time-1);
    }, 1000);
  }

  $rootScope.socket.on('message_cat', function(msg) {
    console.log("CAT:" + msg);
    $scope.category = msg.replace("btn_", "");

    if (typeof $scope.modal != "undefined") {
      if ($scope.modal.isShown())
        $scope.modal.hide();

      $scope.modal.remove();
    }

    $ionicModal.fromTemplateUrl('templates/modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
      $scope.modal.show();
      clearTimeout($scope.timeout);
      $scope.timeout = setTimeout(function(){
        $scope.modal.hide();
      }, 5000);

      $scope.countdownCat = 5;
      clearTimeout($scope.timeout_cat);
      $scope.timeout_cat = setInterval(function () {
        if($scope.countdownCat > 0)
          $scope.countdownCat = $scope.countdownCat - 1;
      }, 1000);
    });

  });

  $rootScope.socket.on('message_subcat', function(msg){
    console.log("SUBCAT:" + msg);
  });

  $scope.btnBack = function() {
    hidesubcategoryregory();
  };

  function hidesubcategoryregory() {
    $('#btn_danger, #btn_comportement, #btn_anomalie').show();
    $('#btn_back, #subcategory_danger, #subcategory_comportement, #subcategory_anomalie').hide();

    $('#btn_clicked').html("");
  }

  function displaysubcategoryregory(btn_clicked) {
    $('#btn_back').show();
    $('#btn_danger, #btn_comportement, #btn_anomalie, #subcategory_danger, #subcategory_comportement, #subcategory_anomalie').hide();

    $('#btn_clicked').html("<h1 class='center'>" + angular.element(btn_clicked).text() + "</h1>");
    $(btn_clicked.id.replace("btn_", "#subcategory_")).show();
  }

});
