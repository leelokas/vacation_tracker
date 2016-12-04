(function() {
    'use strict';

    angular
        .module('vacationTrackerApp')
        .controller('UserManagementDialogController',UserManagementDialogController);

    UserManagementDialogController.$inject = ['$scope', '$uibModalInstance', 'entity', 'User', 'JhiLanguageService', 'AlertService'];

    function UserManagementDialogController ($scope, $uibModalInstance, entity, User, JhiLanguageService, AlertService) {
        var vm = this;

        vm.authorities = ['ROLE_USER', 'ROLE_MANAGER', 'ROLE_ACCOUNTANT', 'ROLE_ADMIN'];
        vm.clear = clear;
        vm.languages = null;
        vm.save = save;
        vm.user = entity;
        vm.users = User.query();
        vm.openCalendar = openCalendar;
        vm.datePickerOpenStatus = false;
        $scope.dateOptions = {
            minDate: new Date(),
            showWeeks: false,
            startingDay: 1
        };

        JhiLanguageService.getAll().then(function (languages) {
            vm.languages = languages;
        });

        function clear () {
            $uibModalInstance.dismiss('cancel');
        }

        function onSaveSuccess (result) {
            vm.isSaving = false;
            $uibModalInstance.close(result);
        }

        function onSaveError () {
            vm.isSaving = false;
        }

        function save () {
            vm.isSaving = true;
            if (vm.user.manager) {
                vm.user.managerId = vm.user.manager.id;
                if (vm.user.manager.id === vm.user.id) {
                    AlertService.error("userManagement.managerNotUpdated");
                }
            } else {
                vm.user.managerId = -1;
            }
            if (vm.user.id !== null) {
                User.update(vm.user, onSaveSuccess, onSaveError);
            } else {
                User.save(vm.user, onSaveSuccess, onSaveError);
            }
        }

        function openCalendar () {
            vm.datePickerOpenStatus = true;
        }
    }
})();
