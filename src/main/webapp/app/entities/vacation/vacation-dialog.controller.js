(function() {
    'use strict';

    angular
        .module('vacationTrackerApp')
        .controller('VacationDialogController', VacationDialogController);

    VacationDialogController.$inject = ['$timeout', '$scope', '$uibModalInstance', 'entity', 'Vacation', 'User', 'Principal'];

    function VacationDialogController ($timeout, $scope, $uibModalInstance, entity, Vacation, User, Principal) {
        var vm = this;

        vm.vacation = entity;
        vm.clear = clear;
        vm.datePickerOpenStatus = {};
        vm.openCalendar = openCalendar;
        vm.save = save;
        vm.users = User.query();

        vm.dateOptions = {
            minDate: new Date(),
            showWeeks: false,
            startingDay: 1
        };

        var lastWeekDate = new Date();
        lastWeekDate.setDate(lastWeekDate.getDate() - 7);
        vm.startDateOptions = {
            minDate: lastWeekDate,
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

        setOwner();

        function setOwner() {
            Principal.identity().then(function(account) {
                vm.vacation.owner = User.get({login: account.login});
            });
        }

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
        vm.datePickerOpenStatus.endDateSickLeave = false;


        function openCalendar (date) {
            vm.datePickerOpenStatus[date] = true;
        }

        function setMinEndDate(){
            $scope.$watch("vm.vacation.startDate", function() {
                vm.endDateOptions.minDate = vm.vacation.startDate;
                vm.endDateOptions.initDate = vm.vacation.startDate;
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
