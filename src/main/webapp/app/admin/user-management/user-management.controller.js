(function() {
    'use strict';

    angular
        .module('vacationTrackerApp')
        .controller('UserManagementController', UserManagementController);

    UserManagementController.$inject = ['Principal', 'User', 'AlertService', 'pagingParams', 'paginationConstants', 'JhiLanguageService'];

    function UserManagementController(Principal, User, AlertService, pagingParams, paginationConstants, JhiLanguageService) {
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
                user.previousYearBalanceInfo = user.yearlyBalances ? user.yearlyBalances.find(function (balanceInfo) {
                    return balanceInfo.year === vm.previousYear;
                }) : {};
                user.rowClass = (!user.firstWorkday || !user.manager) ? "red_highlight" : "";
                return user;
            });

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
            });
        }
    }
})();
