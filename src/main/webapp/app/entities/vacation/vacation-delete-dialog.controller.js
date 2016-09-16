(function() {
    'use strict';

    angular
        .module('vacationTrackerApp')
        .controller('VacationDeleteController',VacationDeleteController);

    VacationDeleteController.$inject = ['$uibModalInstance', 'entity', 'Vacation'];

    function VacationDeleteController($uibModalInstance, entity, Vacation) {
        var vm = this;

        vm.vacation = entity;
        vm.clear = clear;
        vm.confirmDelete = confirmDelete;
        
        function clear () {
            $uibModalInstance.dismiss('cancel');
        }

        function confirmDelete (id) {
            Vacation.delete({id: id},
                function () {
                    $uibModalInstance.close(true);
                });
        }
    }
})();
