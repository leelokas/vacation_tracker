(function() {
    'use strict';

    angular
        .module('vacationTrackerApp')
        .controller('UserManagementDialogController', UserManagementDialogController);

    UserManagementDialogController.$inject = ['$uibModalInstance', 'entity', 'User', 'JhiLanguageService', 'AlertService', '$sce', '$translate'];

    function UserManagementDialogController ($uibModalInstance, entity, User, JhiLanguageService, AlertService, $sce, $translate) {
        var vm = this;

        vm.authorities = ['ROLE_USER', 'ROLE_MANAGER', 'ROLE_ACCOUNTANT', 'ROLE_ADMIN'];
        vm.previousYear = new Date().getFullYear() - 1;
        vm.clear = clear;
        vm.languages = null;
        vm.save = save;
        vm.user = entity;
        vm.users = User.query();
        vm.openCalendar = openCalendar;
        vm.datePickerOpenStatus = false;
        vm.dateOptions = {
            showWeeks: false,
            startingDay: 1
        };
        vm.managers = User.getFilteredUsers({role: 'ROLE_MANAGER'});
        vm.yearlyBalanceTooltipText = $sce.trustAsHtml($translate.instant("userManagement.savedBalances") + "<br>-");
        vm.previousYearBalanceInfo = {
            year: vm.previousYear,
            balance: null
        };

        if (vm.user.$promise) {
            vm.user.$promise.then( function(){
                if (!vm.user.yearlyBalances) return;

                addBalanceInfo();
            });
        }

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

            if (vm.previousYearBalanceInfo.balance !== null && vm.previousYearBalanceInfo.balance !== undefined) {
                vm.user.yearlyBalances.push({
                    userId: vm.user.id,
                    year: vm.previousYear,
                    balance: vm.previousYearBalanceInfo.balance
                });
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

        function addBalanceInfo () {
            vm.previousYearBalanceInfo = vm.user.yearlyBalances.find( function (data) {
                    return data.year === vm.previousYear;
                }) || vm.previousYearBalanceInfo;

            vm.yearlyBalanceTooltipText =
                $sce.trustAsHtml( $translate.instant("userManagement.savedBalances") + (
                        vm.user.yearlyBalances.sort( function (a, b) {
                            return b.year - a.year;
                        }).map( function (data) {
                            return '<br>' + data.year + ': <b>' + data.balance + '</b>';
                        })
                    )
                );
        }
    }
})();
