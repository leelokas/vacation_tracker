(function() {
    'use strict';

    angular
        .module('vacationTrackerApp')
        .controller('VacationDialogController', VacationDialogController);

    VacationDialogController.$inject = ['$timeout', '$scope', '$stateParams', '$uibModalInstance', 'entity', 'Vacation', 'User'];

    function VacationDialogController ($timeout, $scope, $stateParams, $uibModalInstance, entity, Vacation, User) {
        var vm = this;

        vm.vacation = entity;
        vm.clear = clear;
        vm.datePickerOpenStatus = {};
        vm.openCalendar = openCalendar;
        vm.save = save;
        vm.users = User.query();

        $timeout(function (){
            angular.element('.form-group:eq(1)>input').focus();
        });

        function clear () {
            $uibModalInstance.dismiss('cancel');
        }

        function save () {
            vm.isSaving = true;
            if (vm.vacation.id !== null) {
                Vacation.update(vm.vacation, onSaveSuccess, onSaveError);
            } else {
                Vacation.save(vm.vacation, onSaveSuccess, onSaveError);
            }
        }

        function onSaveSuccess (result) {
            $scope.$emit('vacationTrackerApp:vacationUpdate', result);
            $uibModalInstance.close(result);
            vm.isSaving = false;
        }

        function onSaveError () {
            vm.isSaving = false;
        }

        vm.datePickerOpenStatus.startDate = false;
        vm.datePickerOpenStatus.endDate = false;

        function openCalendar (date) {
            vm.datePickerOpenStatus[date] = true;
        }
    }
})();
