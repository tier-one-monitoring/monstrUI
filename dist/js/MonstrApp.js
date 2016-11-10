var app = angular.module('MonstrApp',[]);

app.controller('maincontroller', function(){
	$(window).load(function(){
		CMSJobStatus.startApp("#CMSJobStatus_AppHolder");
                console.log('Maincontroller started');
	});
})

app.directive('bigbox', function(){
	return{
		restrict:'E',
		templateUrl: 'dist/js/directives/bigbox.html',
		scope:{	boxName:'@boxName'}
              };
});

app.directive('mediumbox', function(){
        return{
                restrict:'E',
                templateUrl: 'dist/js/directives/mediumbox.html',
                scope:{ boxName:'@boxName'}
              };
});

app.directive('smallbox', function(){
        return{
                restrict:'E',
                templateUrl: 'dist/js/directives/smallbox.html',
                scope:{ boxName:'@boxName'}
              };
});

