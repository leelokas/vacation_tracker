(function() {
    'use strict';

    angular
        .module('vacationTrackerApp')
        .controller('UserManagementDialogController',UserManagementDialogController);

    UserManagementDialogController.$inject = ['$stateParams', '$uibModalInstance', 'entity', 'User', 'JhiLanguageService', 'AlertService'];

    function UserManagementDialogController ($stateParams, $uibModalInstance, entity, User, JhiLanguageService, AlertService) {
        var vm = this;

        vm.authorities = ['ROLE_USER', 'ROLE_MANAGER', 'ROLE_ACCOUNTANT', 'ROLE_ADMIN'];
        vm.clear = clear;
        vm.languages = null;
        vm.save = save;
        vm.user = entity;
        vm.users = User.query();


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
            if (vm.user.manager && vm.user.manager.id === vm.user.id) {
                AlertService.error("userManagement.managerNotUpdated", vm.user.login);
            }
            vm.isSaving = true;
            vm.user.managerId = (vm.user.manager ? vm.user.manager.id : null);
            if (vm.user.id !== null) {
                User.update(vm.user, onSaveSuccess, onSaveError);
            } else {
                User.save(vm.user, onSaveSuccess, onSaveError);
            }
        }
    }
})();
