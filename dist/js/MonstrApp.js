//var app = angular.module('MonstrApp',['MonstrApp.directives']);
var app = angular.module('MonstrApp',[]);

app.controller('maincontroller', function($scope){
  
  $(window).load(function(){
    //SSB.startApp("#SSB_AppHolder");
    //CMSJobStatus.startApp("#CMSJobStatus_AppHolder");
    $scope.modules = {
      'SSB': SSB,
      'CMSJobStatus': CMSJobStatus,
      'PhedexQuality': PhedexQuality,
      'PhedexTransfers': PhedexTransfers,
      'MonstrJournal': MonstrJournal
    };
  });
});



app.directive('mediumbox', ['$timeout', function(timer){
  return{
          link: function (scope, elem, attrs, ctrl) {
            var run = function() {
              var options = {};
              if (scope.boxOptions) {
                options = scope.boxOptions;
              }
              console.log(scope);
              console.log(scope.$parent.modules);
              console.log(scope.boxApp);
              var current = new scope.$parent.modules[scope.boxApp](scope.boxName, options);
            };
            timer(run, 500);
          },
          restrict:'E',
          templateUrl: '/dist/js/directives/mediumbox.html',
          scope:{ boxApp: '@boxApp', boxName:'@boxName', boxDescription: '@boxDescription', boxOptions: '@boxOptions'}
        };
}]);

app.directive('smallbox', ['$timeout', function(timer){
  return{
          link: function (scope, elem, attrs, ctrl) {
            var run = function() {
              var options = {};
              if (scope.boxOptions) {
                options = scope.boxOptions;
              }
              console.log(scope);
              console.log(scope.$parent.modules);
              console.log(scope.boxApp);
              var current = new scope.$parent.modules[scope.boxApp](scope.boxName, options);
            };
            timer(run, 500);
          },
          restrict:'E',
          templateUrl: '/dist/js/directives/smallbox.html',
          scope:{ boxApp: '@boxApp', boxName:'@boxName', boxDescription: '@boxDescription', boxOptions: '@boxOptions'}
        };
}]);

app.directive('ucbigbox', ['$timeout', function(timer){
  return{
          link: function (scope, elem, attrs, ctrl) {
            var run = function() {
              var options = {};
              if (scope.boxOptions) {
                options = scope.boxOptions;
              }
              console.log(scope);
              console.log(scope.$parent.modules);
              console.log(scope.boxApp);
              var current = new scope.$parent.modules[scope.boxApp](scope.boxName, options);
            };
            timer(run, 500);
          },
          restrict:'E',
          templateUrl: '/dist/js/directives/ucbigbox.html',
          scope:{ boxApp: '@boxApp', boxName:'@boxName', boxDescription: '@boxDescription', boxOptions: '@boxOptions'}
        };
}]);

app.directive('ucmediumbox', ['$timeout', function(timer){
  return{
          link: function (scope, elem, attrs, ctrl) {
            var run = function() {
              var options = {};
              if (scope.boxOptions) {
                options = scope.boxOptions;
              }
              console.log(scope);
              console.log(scope.$parent.modules);
              console.log(scope.boxApp);
              var current = new scope.$parent.modules[scope.boxApp](scope.boxName, options);
            };
            timer(run, 500);
          },
          restrict:'E',
          templateUrl: '/dist/js/directives/ucmediumbox.html',
          scope:{ boxApp: '@boxApp', boxName:'@boxName', boxDescription: '@boxDescription', boxOptions: '@boxOptions'}
        };
}]);

app.directive('ucsmallbox', ['$timeout', function(timer){
  return{
          link: function (scope, elem, attrs, ctrl) {
            var run = function() {
              var options = {};
              if (scope.boxOptions) {
                options = scope.boxOptions;
              }
              console.log(scope);
              console.log(scope.$parent.modules);
              console.log(scope.boxApp);
              var current = new scope.$parent.modules[scope.boxApp](scope.boxName, options);
            };
            timer(run, 500);
          },
          restrict:'E',
          templateUrl: '/dist/js/directives/ucsmallbox.html',
          scope:{ boxApp: '@boxApp', boxName:'@boxName', boxDescription: '@boxDescription', boxOptions: '@boxOptions'}
        };
}]);