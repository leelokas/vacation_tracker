(function() {
    'use strict';

    angular
        .module('vacationTrackerApp')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['$rootScope', '$scope', 'Principal', '$timeout', '$state', 'Auth'];

    function HomeController ($rootScope, $scope, Principal, $timeout, $state, Auth) {
        var vm = this;

        vm.account = null;
        vm.isAuthenticated = null;
        vm.authenticationError = false;
        vm.credentialsExpiredError = false;
        vm.credentials = {};
        vm.login = login;
        vm.password = null;
        vm.rememberMe = true;
        vm.username = null;

        $scope.$on('authenticationSuccess', function() {
            getAccount();
        });

        getAccount();

        $timeout(function (){angular.element('#username').focus();});

        function getAccount() {
            Principal.identity().then(function(account) {
                vm.account = account;
                vm.isAuthenticated = Principal.isAuthenticated;
                if (vm.isAuthenticated()) {
                    $state.go("vacation");
                }
            });
        }

        function login (event) {
            event.preventDefault();
            Auth.login({
                username: vm.username,
                password: vm.password,
                rememberMe: vm.rememberMe
            }).then(function () {
                vm.authenticationError = false;
                vm.credentialsExpiredError = false;
                if ($state.current.name === 'register' || $state.current.name === 'activate' ||
                    $state.current.name === 'finishReset' || $state.current.name === 'requestReset') {
                    $state.go('home');
                }

                $rootScope.$broadcast('authenticationSuccess');

                // previousState was set in the authExpiredInterceptor before being redirected to login modal.
                // since login is succesful, go to stored previousState and clear previousState
                if (Auth.getPreviousState()) {
                    var previousState = Auth.getPreviousState();
                    Auth.resetPreviousState();
                    $state.go(previousState.name, previousState.params);
                }

                $state.go('vacation');
            }).catch(function (error) {

                if (error.data.message.indexOf("expired") >= -1) {
                    vm.credentialsExpiredError = true;
                } else {
                    vm.authenticationError = true;
                }
            });
        }

    }
})();
