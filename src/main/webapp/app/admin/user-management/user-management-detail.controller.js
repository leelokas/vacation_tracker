(function() {
    'use strict';

    angular
        .module('vacationTrackerApp')
        .controller('UserManagementDetailController', UserManagementDetailController);

    UserManagementDetailController.$inject = ['$stateParams', 'User', '$translate', '$sce'];

    function UserManagementDetailController ($stateParams, User, $translate, $sce) {
        var vm = this;

        vm.previousYear = new Date().getFullYear() - 1;
        vm.managerInfo = '-';
        vm.currentBalance = '-';
        vm.balanceTooltipText = $sce.trustAsHtml($translate.instant("userManagement.savedBalances") + "<br>-");

        vm.load = load;
        vm.user = {};

        vm.load($stateParams.login);

        function load (login) {
            User.get({login: login}, function(result) {
                vm.user = result;
                if (vm.user.manager) {
                    vm.managerInfo = vm.user.manager.firstName + " " + vm.user.manager.lastName + " (" + vm.user.manager.login + ")";
                }
                addBalanceInfo();
            });
        }

        function addBalanceInfo() {
            vm.balanceTooltipText = $sce.trustAsHtml($translate.instant("userManagement.savedBalances") + "<br>-");

            if (vm.user.yearlyBalances && vm.user.yearlyBalances.length) {
                vm.balanceTooltipText = $sce.trustAsHtml(
                    '<b>' + $translate.instant("userManagement.savedBalances") + '</b>' + (
                        vm.user.yearlyBalances.sort( function (a, b) {
                            return b.year - a.year;
                        }).map( function (data) {
                            return '<br>' + data.year + ': <b>' + data.balance + '</b>';
                        })
                    )
                );
            }

            User.getRemainingPaidDays({login: vm.user.login}, function (data) {
                vm.currentBalance = data.current;
                vm.balanceTooltipText = $sce.trustAsHtml(
                    '<b>' + $translate.instant("userManagement.unusedVacation") + ':</b>' +
                    '<br>' + $translate.instant("userManagement.paidVacation") + ': <b>' + data.current + '</b>' +
                    '<br>' + $translate.instant("userManagement.studyLeave") + ': <b>' + data.studyLeaveRemaining + '</b><hr>' +
                    vm.balanceTooltipText
                );
            }, onError);
        }

        function onError(error) {
            AlertService.error(error.data.message);
        }
    }
})();
