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

        $scope.dateOptions = {
            minDate: new Date(),
            showWeeks: false,
            startingDay: 1
        };

        var lastWeekDate = new Date();
        lastWeekDate.setDate(lastWeekDate.getDate() - 7);
        $scope.startDateOptions = {
            minDate: lastWeekDate,
            showWeeks: false,
            startingDay: 1
        };

        $scope.endDateOptions = {
            minDate: vm.vacation.startDate,
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
    }
})();
