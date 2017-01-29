(function() {
    'use strict';

    angular
        .module('vacationTrackerApp')
        .controller('VacationManagementDetailController', VacationManagementDetailController);

    VacationManagementDetailController.$inject = ['$uibModalInstance', 'entity'];

    function VacationManagementDetailController ($uibModalInstance, entity) {
        var vm = this;

        vm.vacation = entity;
        vm.clear = clear;

        function clear () {
            $uibModalInstance.dismiss('cancel');
        }
    }
})();
