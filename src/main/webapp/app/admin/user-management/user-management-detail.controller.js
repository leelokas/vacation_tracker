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
        vm.yearlyBalance = '-';
        vm.yearlyBalanceTooltipText = $sce.trustAsHtml($translate.instant("userManagement.savedBalances") + "<br>-");

        vm.load = load;
        vm.user = {};

        vm.load($stateParams.login);

        function load (login) {
            User.get({login: login}, function(result) {
                vm.user = result;
                if (vm.user.manager) {
                    vm.managerInfo = vm.user.manager.firstName + " " + vm.user.manager.lastName + " (" + vm.user.manager.login + ")";
                }
                if (vm.user.yearlyBalances && vm.user.yearlyBalances.length) {
                    var balanceInfo = vm.user.yearlyBalances.find( function (balanceInfo) {
                        return balanceInfo.year === vm.previousYear;
                    });
                    if (balanceInfo) {
                        vm.yearlyBalance = balanceInfo.balance + " " + $translate.instant("userManagement.days");
                    }

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
            });
        }
    }
})();
