(function() {
    'use strict';

    angular
        .module('vacationTrackerApp')
        .controller('VacationManagementDialogController', VacationManagementDialogController);

    VacationManagementDialogController.$inject = ['$timeout', '$scope', '$uibModalInstance', 'entity', 'Vacation', 'User'];

    function VacationManagementDialogController ($timeout, $scope, $uibModalInstance, entity, Vacation, User) {
        var vm = this;

        vm.vacation = entity;
        vm.clear = clear;
        vm.datePickerOpenStatus = {};
        vm.openCalendar = openCalendar;
        vm.save = save;
        //TODO Siia vb mingi parem lahendus leida, kui size:100 panna
        vm.users = User.query({size:100});


        vm.datePickerOpenStatus.startDate = false;
        vm.datePickerOpenStatus.endDate = false;

        vm.startDateOptions = {
            showWeeks: false,
            startingDay: 1
        };
        vm.endDateOptions = {
            minDate: setMinEndDate(),
            showWeeks: false,
            startingDay: 1
        };

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

        function openCalendar (date) {
            vm.datePickerOpenStatus[date] = true;
        }

        function setMinEndDate () {
            $scope.$watch("vm.vacation.startDate", function() {
                vm.endDateOptions.minDate = vm.vacation.startDate;
            });
        }
        $scope.$watch("vm.vacation.startDate", function () {
            if (vm.vacation.startDate > vm.vacation.endDate){
                vm.vacation.endDate = "";
            }
        });

        $scope.$watch("vm.vacation.type", function () {
            if (vm.vacation.type === 'PAID' || vm.vacation.type === 'STUDY_LEAVE'){
                vm.vacation.payment = "BEFORE_VACATION";
            } else if (vm.vacation.type == 'SICK_LEAVE') {
                vm.vacation.payment = "WITH_NEXT_SALARY";
            } else {
                vm.vacation.payment = null;
            }
        });

    }
})();
