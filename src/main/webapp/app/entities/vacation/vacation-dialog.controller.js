(function () {
    'use strict';

    angular
        .module('vacationTrackerApp')
        .controller('VacationDialogController', VacationDialogController);

    VacationDialogController.$inject = ['$filter', '$timeout', '$scope', '$uibModalInstance', 'entity', 'Vacation', 'HolidayUtils', 'User', 'Principal'];

    function VacationDialogController($filter, $timeout, $scope, $uibModalInstance, entity, Vacation, HolidayUtils, User, Principal) {
        var vm = this;

        vm.vacation = entity;
        vm.clear = clear;
        vm.datePickerOpenStatus = {};
        vm.openCalendar = openCalendar;
        vm.save = save;
        vm.users = User.query();
        vm.vacation.selectedVacationLength = 1;

        vm.dateOptions = {
            minDate: new Date(),
            showWeeks: false,
            startingDay: 1,
            customClass: HolidayUtils.getHolidayDates
        };

        var lastWeekDate = new Date();
        lastWeekDate.setDate(lastWeekDate.getDate() - 7);
        vm.startDateOptions = {
            minDate: lastWeekDate,
            showWeeks: false,
            startingDay: 1,
            customClass: HolidayUtils.getHolidayDates
        };

        vm.endDateOptions = {
            minDate: setMinEndDate(),
            showWeeks: false,
            startingDay: 1,
            customClass: HolidayUtils.getHolidayDates
        };

        $timeout(function () {
            angular.element('.form-group:eq(1)>input').focus();
        });

        setOwner();

        function setOwner() {
            Principal.identity().then(function (account) {
                vm.vacation.owner = User.get({login: account.login});
            });
        }

        function clear() {
            $uibModalInstance.dismiss('cancel');
        }

        function save() {
            vm.isSaving = true;
            if (vm.vacation.id !== null) {
                Vacation.update(vm.vacation, onSaveSuccess, onSaveError);
            } else {
                Vacation.save(vm.vacation, onSaveSuccess, onSaveError);
            }
        }

        function onSaveSuccess(result) {
            $scope.$emit('vacationTrackerApp:vacationUpdate', result);
            $uibModalInstance.close(result);
            vm.isSaving = false;
        }

        function onSaveError() {
            vm.isSaving = false;
        }

        vm.datePickerOpenStatus.startDate = false;
        vm.datePickerOpenStatus.endDate = false;
        vm.datePickerOpenStatus.endDateSickLeave = false;


        function openCalendar(date) {
            vm.datePickerOpenStatus[date] = true;
        }

        function setMinEndDate() {
            $scope.$watch("vm.vacation.startDate", function () {
                vm.endDateOptions.minDate = vm.vacation.startDate;
                vm.endDateOptions.initDate = vm.vacation.startDate;
            });
        }

        $scope.$watch("vm.vacation.startDate", function () {
            if (vm.vacation.startDate > vm.vacation.endDate) {
                vm.vacation.endDate = null;
            }
        });

        $scope.$watch("vm.vacation.type", function (newVal, oldVal) {
            if (newVal === oldVal) return;
            if (vm.vacation.type === 'PAID' || vm.vacation.type === 'STUDY_LEAVE') {
                vm.vacation.payment = "BEFORE_VACATION";
            } else if (vm.vacation.type === 'SICK_LEAVE') {
                vm.vacation.payment = "WITH_NEXT_SALARY";
            } else {
                vm.vacation.payment = null;
            }
        });

        $scope.$watchCollection('[vm.vacation.startDate, vm.vacation.endDate]', function () {
            if (vm.vacation.startDate != null && vm.vacation.endDate != null) {
                var dateDifference = vm.vacation.endDate - vm.vacation.startDate;
                vm.vacation.selectedVacationLength = Math.floor(dateDifference / (1000 * 3600 * 24)) + 1; // milliseconds * seconds * hours
            }
        });

    }
})();
