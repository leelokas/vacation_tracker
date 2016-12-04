(function() {
    'use strict';

    angular
        .module('vacationTrackerApp')
        .controller('UserManagementController', UserManagementController);

    UserManagementController.$inject = ['Principal', 'User', 'AlertService', '$state', 'pagingParams', 'paginationConstants', 'JhiLanguageService'];

    function UserManagementController(Principal, User, AlertService, $state, pagingParams, paginationConstants, JhiLanguageService) {
        var vm = this;

        vm.loadAll = loadAll;
        vm.clear = clear;
        vm.loadPage = loadPage;
        vm.transition = transition;
        vm.filter = filter;

        vm.predicate = pagingParams.predicate;
        vm.reverse = pagingParams.ascending;
        vm.itemsPerPage = paginationConstants.itemsPerPage;

        vm.authorities = ['ROLE_USER', 'ROLE_MANAGER', 'ROLE_ACCOUNTANT', 'ROLE_ADMIN'];
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

        vm.loadAll();

        JhiLanguageService.getAll().then(function (languages) {
            vm.languages = languages;
        });
        Principal.identity().then(function(account) {
            vm.currentAccount = account;
        });

        function loadAll () {
            User.query({
                page: pagingParams.page - 1,
                size: vm.itemsPerPage,
                sort: sort()
            }, onSuccess, onError);
        }

        function onSuccess(data) {
            for (var i = data.length - 1; i >= 0; i--) {
                if (data[i]['login'] === 'anonymoususer' || data[i]['login'] === 'system') {
                    data.splice(i, 1);
                }
            }
            vm.totalItems = data.length;
            vm.queryCount = vm.totalItems;
            vm.page = pagingParams.page;
            vm.users = data;
        }

        function onError(error) {
            AlertService.error(error.data.message);
        }

        function clear () {
            vm.user = {
                id: null, login: null, firstName: null, lastName: null, email: null,
                activated: null, langKey: null, createdBy: null, createdDate: null,
                lastModifiedBy: null, lastModifiedDate: null, resetDate: null,
                resetKey: null, authorities: null
            };
        }

        function sort () {
            var result = [vm.predicate + ',' + (vm.reverse ? 'asc' : 'desc')];
            if (vm.predicate !== 'id') {
                result.push('id');
            }
            return result;
        }

        function loadPage (page) {
            vm.page = page;
            vm.transition();
        }

        function transition () {
            $state.transitionTo($state.$current, {
                page: vm.page,
                sort: vm.predicate + ',' + (vm.reverse ? 'asc' : 'desc'),
                search: vm.currentSearch
            });
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
                size: vm.itemsPerPage,
                sort: sort()
            }, onSuccess, onError);
        }
    }
})();
