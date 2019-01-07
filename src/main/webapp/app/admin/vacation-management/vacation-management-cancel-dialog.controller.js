(function() {
    'use strict';

    angular
        .module('vacationTrackerApp')
        .controller('VacationManagementCancelController', VacationManagementCancelController);

    VacationManagementCancelController.$inject = ['$uibModalInstance', 'entity', 'Vacation'];

    function VacationManagementCancelController($uibModalInstance, entity, Vacation) {
        var vm = this;

        vm.vacation = entity;
        vm.clear = clear;
        vm.confirmCancel = confirmCancel;

        function clear () {
            $uibModalInstance.dismiss('cancel');
        }

        function confirmCancel () {
            if (vm.vacation.type === 'SICK_LEAVE') {
                vm.vacation.endDate = null;
            }
            vm.vacation.stage = "SAVED";
            Vacation.update(vm.vacation, function () {
                $uibModalInstance.close(true);
            });
        }
    }
})();
