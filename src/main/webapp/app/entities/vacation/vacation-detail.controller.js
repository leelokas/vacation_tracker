(function() {
    'use strict';

    angular
        .module('vacationTrackerApp')
        .controller('VacationDetailController', VacationDetailController);

    VacationDetailController.$inject = ['$scope', '$rootScope', '$stateParams', 'previousState', 'entity', 'Vacation', 'User'];

    function VacationDetailController($scope, $rootScope, $stateParams, previousState, entity, Vacation, User) {
        var vm = this;

        vm.vacation = entity;
        vm.previousState = previousState.name;

        var unsubscribe = $rootScope.$on('vacationTrackerApp:vacationUpdate', function(event, result) {
            vm.vacation = result;
        });
        $scope.$on('$destroy', unsubscribe);
    }
})();
