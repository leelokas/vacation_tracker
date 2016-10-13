(function() {
    'use strict';

    angular
        .module('vacationTrackerApp')
        .controller('VacationCancelController', VacationCancelController);

    VacationCancelController.$inject = ['$uibModalInstance', 'entity', 'Vacation'];

    function VacationCancelController($uibModalInstance, entity, Vacation) {
        var vm = this;

        vm.vacation = entity;
        vm.clear = clear;
        vm.confirmCancel = confirmCancel;

        function clear () {
            $uibModalInstance.dismiss('cancel');
        }

        function confirmCancel () {
            vm.vacation.stage = "SAVED";
            Vacation.update(vm.vacation, function () {
                $uibModalInstance.close(true);
            });
        }
    }
})();
