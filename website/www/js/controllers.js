angular.module('starter.controllers', [ 'ngFitText' ])

.controller('AppCtrl', function($scope, $state, $rootScope) {
  $rootScope.volume = 100;
  $rootScope.range = 4;
  $rootScope.notification = 10;
  $rootScope.subcat = 10;

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

.controller('MainCtrl', function($scope, $state, $rootScope, $ionicPopup, $ionicModal, $interval) {
  $scope.$on("$ionicView.beforeEnter", function(event, data){
    hideSubcategory();
  });

  if (typeof $rootScope.socket === "undefined") {
    $state.go('app.loading');
  }

  $scope.btnCategory = function(event) {
    $rootScope.socket.emit('message', event.currentTarget.id);
    displaySubcategory(event.currentTarget);
    clearTimeout($scope.timeout_cat);
    $scope.timeout_cat = setTimeout(function(){
      hideSubcategory();
    }, $rootScope.subcat * 1000);
  };

  $scope.btnSubCategory = function(event) {
    $rootScope.socket.emit('message', event.currentTarget.id);
    hideSubcategory();
  };

  $rootScope.socket.on('message', function(msg) {
    var danger = ["DANGER", "ACCIDENT", "CHAUSSEE", "VIGILANCE"],
    comportement = ["COMPORTEMENT", "VITESSE", "DISTANCE", "CONDUITE"],
    anomalie = ["ANOMALIE", "ECLAIRAGE", "CARROSSERIE", "PNEUMATIQUE"];
    $scope.category = msg.replace("btn_", "").toUpperCase();

    if ($.inArray($scope.category, danger) > -1) {
      var audio = new Audio("alert.wav");
      audio.volume = $rootScope.volume / 100;
      audio.play();
      $scope.modalColor = "#cf2a27";
    } else if ($.inArray($scope.category, comportement) > -1) {
      $scope.modalColor = "#ff9900";
    } else if ($.inArray($scope.category, anomalie) > -1) {
      $scope.modalColor = "#f1c232";
    }

    showModal();
  });

  function showModal() {
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
      }, $rootScope.notification * 1000);

      $scope.countdownModal = $rootScope.notification;
      $interval.cancel($scope.watchTimeRemainingCountdownModal);
      $scope.watchTimeRemainingCountdownModal = $interval(function(){
        $scope.countdownModal = $scope.countdownModal - 1 ;
        if($scope.countdownModal <= 0){
          $interval.cancel($scope.watchTimeRemainingCountdownModal);
        }
      }, 1000);
    });
  }

  $scope.btnBack = function() {
    hideSubcategory();
  };

  function hideSubcategory() {
    $('#btn_danger, #btn_comportement, #btn_anomalie').show();
    $('#btn_back, #subcategory_danger, #subcategory_comportement, #subcategory_anomalie').hide();

    $('#btn_clicked').html("");
  }

  function displaySubcategory(btn_clicked) {
    $('#btn_back').show();

    $scope.countdownCat = $rootScope.subcat;
    $interval.cancel($scope.watchTimeRemaining);
    $scope.watchTimeRemaining = $interval(function(){
      $scope.countdownCat = $scope.countdownCat - 1 ;
      if($scope.countdownCat <= 0){
        $interval.cancel($scope.watchTimeRemaining);
      }
    }, 1000);

    $('#btn_danger, #btn_comportement, #btn_anomalie, #subcategory_danger, #subcategory_comportement, #subcategory_anomalie').hide();

    $('#btn_clicked').html("<h2 class='center'>" + angular.element(btn_clicked).text() + "</h2>");
    $(btn_clicked.id.replace("btn_", "#subcategory_")).show();
  }

});
