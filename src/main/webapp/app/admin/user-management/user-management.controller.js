(function() {
    'use strict';

    angular
        .module('vacationTrackerApp')
        .controller('UserManagementController', UserManagementController);

    UserManagementController.$inject = ['Principal', 'User', 'AlertService', 'pagingParams', 'paginationConstants', 'JhiLanguageService', '$translate', '$sce', '$scope'];

    function UserManagementController(Principal, User, AlertService, pagingParams, paginationConstants, JhiLanguageService, $translate, $sce, $scope) {
        var vm = this;

        vm.loadAll = loadAll;
        vm.loadPage = loadPage;
        vm.transition = transition;
        vm.filter = filter;
        vm.calcYearlyBalances = calcYearlyBalances;


        vm.predicate = pagingParams.predicate;
        vm.reverse = !pagingParams.ascending;
        vm.managers = User.getFilteredUsers({role: 'ROLE_MANAGER'});

        vm.authorities = ['ROLE_USER', 'ROLE_MANAGER', 'ROLE_ACCOUNTANT', 'ROLE_ADMIN'];
        vm.previousYear = new Date().getFullYear() - 1;
        vm.users = [];
        vm.currentAccount = null;
        vm.languages = null;
        vm.page = 1;
        vm.totalItems = null;
        vm.links = null;
        vm.filterParams = {
            login: null,
            firstName: null,
            lastName: null,
            role: null,
            manager: null
        };
        vm.pageParams = {
            page: 1,
            itemsPerPage: paginationConstants.itemsPerPage,
            totalItems: 0
        };

        vm.loadAll();

        JhiLanguageService.getAll().then(function (languages) {
            vm.languages = languages;
        });
        Principal.identity().then(function(account) {
            vm.currentAccount = account;
        });

        function loadAll () {
            User.getFilteredUsers({
                page: pagingParams.page - 1,
                size: vm.pageParams.itemsPerPage,
                sort: sort()
            }, onSuccess, onError);
        }

        function onSuccess(data, headers) {
            if (headers && headers('X-Total-Count')) {
                vm.pageParams.totalItems = headers('X-Total-Count');
                vm.pageParams.page = pagingParams.page;
                vm.pageParams.itemsPerPage = paginationConstants.itemsPerPage;
            } else {
                vm.pageParams.totalItems = data.length;
                vm.pageParams.page = 1;
                vm.pageParams.itemsPerPage = data.length;
            }
            vm.users = data.map(function(user) {
                var tooltipText = "";

                if (!user.firstWorkday) {
                    user.rowClass = "red_highlight";
                    tooltipText += $translate.instant("userManagement.home.firstWorkdayMissing") + "\n";
                }
                if (!user.manager) {
                    user.rowClass = "red_highlight";
                    tooltipText += $translate.instant("userManagement.home.managerMissing");
                }
                if (tooltipText.length) {
                    user.tooltipText = tooltipText;
                }

                addBalanceInfo(user);

                return user;
            });

        }

        function addBalanceInfo(user) {
            user.balanceTooltipText = $sce.trustAsHtml($translate.instant("userManagement.savedBalances") + "<br>-");

            if (user.yearlyBalances && user.yearlyBalances.length) {
                user.balanceTooltipText = $sce.trustAsHtml(
                    '<b>' + $translate.instant("userManagement.savedBalances") + '</b>' + (
                        user.yearlyBalances.sort( function (a, b) {
                            return b.year - a.year;
                        }).map( function (data) {
                            return '<br>' + data.year + ': <b>' + data.balance + '</b>';
                        })
                    )
                );
            }

            User.getRemainingPaidDays({login: user.login}, function (data) {
                user.currentBalance = data.current;
                user.balanceTooltipText = $sce.trustAsHtml(
                    '<b>' + $translate.instant("userManagement.unusedVacation") + ':</b>' +
                    '<br>' + $translate.instant("userManagement.paidVacation") + ': <b>' + data.current + '</b>' +
                    '<br>' + $translate.instant("userManagement.studyLeave") + ': <b>' + data.studyLeaveRemaining + '</b><hr>' +
                    user.balanceTooltipText
                );
            }, onError);
        }

        function onError(error) {
            AlertService.error(error.data.message);
        }

        function sort () {
            var result = [vm.predicate + ',' + (vm.reverse ? 'asc' : 'desc')];
            if (vm.predicate !== 'createdDate') {
                result.push('createdDate');
            }
            return result;
        }

        function loadPage () {
            pagingParams.page = vm.pageParams.page;
            vm.transition();
        }

        function transition () {
            User.getFilteredUsers({
                login: vm.filterParams.login === '' ? null : vm.filterParams.login,
                firstName: vm.filterParams.firstName === '' ? null : vm.filterParams.firstName,
                lastName: vm.filterParams.lastName === '' ? null : vm.filterParams.lastName,
                manager: vm.filterParams.manager === '' ? null : vm.filterParams.manager,
                role: vm.filterParams.role,
                page: vm.pageParams.page-1,
                size: vm.pageParams.itemsPerPage,
                sort: vm.predicate + ',' + (vm.reverse ? 'asc' : 'desc')
            }, onSuccess, onError);
        }

        function filter() {
            if (!vm.filterParams.login && !vm.filterParams.firstName && !vm.filterParams.lastName && !vm.filterParams.manager && !vm.filterParams.role) {
                loadAll();
                return;
            }
            User.getFilteredUsers({
                login: vm.filterParams.login === '' ? null : vm.filterParams.login,
                firstName: vm.filterParams.firstName === '' ? null : vm.filterParams.firstName,
                lastName: vm.filterParams.lastName === '' ? null : vm.filterParams.lastName,
                manager: vm.filterParams.manager === '' ? null : vm.filterParams.manager,
                role: vm.filterParams.role,
                page: pagingParams.page - 1,
                size: vm.pageParams.itemsPerPage,
                sort: sort()
            }, onSuccess, onError);
        }

        function calcYearlyBalances() {
            User.calcYearlyBalances({}, function(data) {
                AlertService.info("userManagement.home.calculateBalancesResultMsg", data);
                loadAll();
            });
        }

		$scope.$watchCollection('[vm.filterParams.login, vm.filterParams.firstName, vm.filterParams.lastName, vm.filterParams.role, vm.filterParams.manager]', function () {
				filter();
		});
    }
})();
