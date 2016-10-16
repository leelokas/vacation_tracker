(function() {
    'use strict';

    angular
        .module('vacationTrackerApp')
        .controller('VacationDetailController', VacationDetailController);

    VacationDetailController.$inject = ['$scope', '$rootScope', 'previousState', 'entity', 'User', 'Principal'];

    function VacationDetailController($scope, $rootScope, previousState, entity, User, Principal) {
        var vm = this;

        vm.vacation = entity;
        vm.previousState = previousState.name;
        vm.currentUser = null;

        setCurrentUser();

        function setCurrentUser() {
            Principal.identity().then(function(account) {
                vm.currentUser = User.get({login: account.login});
            });
        }

        var unsubscribe = $rootScope.$on('vacationTrackerApp:vacationUpdate', function(event, result) {
            vm.vacation = result;
        });
        $scope.$on('$destroy', unsubscribe);
    }
})();
