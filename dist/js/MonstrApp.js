var app = angular.module('MonstrApp',['MonstrApp.directives']);

app.controller('maincontroller', function($scope){
  
  $(window).load(function(){
    //SSB.startApp("#SSB_AppHolder");
    //CMSJobStatus.startApp("#CMSJobStatus_AppHolder");
    $scope.modules = {
      'SSB': SSB,
      'CMSJobStatus': CMSJobStatus,
      'PhedexQuality': PhedexQuality
    };
  });
});

app.directive('bigbox', function(){
  return{
    restrict:'E',
    templateUrl: 'dist/js/directives/bigbox.html',
    scope:{ boxName:'@boxName'}
              };
});

app.directive('mediumbox', function(){
  return{
          restrict:'E',
          templateUrl: 'dist/js/directives/mediumbox.html',
          scope:{ boxName:'@boxName'}
        };
});
angular.module('MonstrApp.directives', []).directive('smallbox', ['$timeout', function(timer){
  return{
          link: function (scope, elem, attrs, ctrl) {
            var run = function() {
              //scope.$parent.modules[scope.boxName].startApp(scope.boxName);
              var options = {};
              if (scope.boxOptions) {
                options = scope.boxOptions;
              }
              var current = new scope.$parent.modules[scope.boxApp](scope.boxName, options);
              
              //app.startApp(scope.boxName);
            };
            timer(run, 500);
          },
          restrict:'E',
          templateUrl: 'dist/js/directives/smallbox.html',
          scope:{ boxApp: '@boxApp', boxName:'@boxName', boxDescription: '@boxDescription', boxOptions: '@boxOptions'}
        };
}]);

