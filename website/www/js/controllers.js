angular.module('starter.controllers', [])

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

    // $ionicLoading.show({
    //   template: 'Loading...',
    //   duration: 3000
    // }).then(function(){
    //   console.log("The loading indicator is now displayed");
    // });

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

.controller('MainCtrl', function($scope, $state, $rootScope, $ionicPopup) {
  $scope.$on("$ionicView.beforeEnter", function(event, data){
    hidesubcategoryregory();
  });

  if (typeof $rootScope.socket === "undefined") {
    $state.go('app.loading');
  }

  $scope.btnCategory = function(event) {
    $rootScope.socket.emit('message', event.currentTarget.id);
    displaysubcategoryregory(event.currentTarget);
  };

  $scope.btnSubCategory = function(event) {
    $rootScope.socket.emit('message', event.currentTarget.id);
    hidesubcategoryregory();
  };

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

    $('#btn_clicked').html("<h1 class='center'>" + angular.element(btn_clicked).html() + "</h1>");
    $(btn_clicked.id.replace("btn_", "#subcategory_")).show();
  }

});
