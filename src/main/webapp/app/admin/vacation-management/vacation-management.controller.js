(function() {
    'use strict';

    angular
        .module('vacationTrackerApp')
        .controller('VacationManagementController', VacationManagementController);

    VacationManagementController.$inject = ['$filter', 'Vacation', 'User', 'HolidayUtils', 'AlertService', 'pagingParams', 'paginationConstants'];

    function VacationManagementController ($filter, Vacation, User, HolidayUtils, AlertService, pagingParams, paginationConstants) {
        var vm = this;

        vm.loadPage = loadPage;
        vm.transition = transition;
        vm.openCalendar = openCalendar;
        vm.filter = filter;

        vm.predicate = pagingParams.predicate;
        vm.reverse = pagingParams.ascending;
        vm.managers = User.getFilteredUsers({role: 'ROLE_MANAGER'});

        vm.dateOptions = {
            showWeeks: false,
            startingDay: 1,
            customClass: HolidayUtils.getHolidayDates
        };
        vm.datePickerOpenStatus = {
            from: false,
            until: false
        };
        vm.filterParams = {
            owner: null,
            manager: null,
            type: null,
            stage: null,
            from: null,
            until: null
        };
        vm.pageParams = {
            page: 1,
            itemsPerPage: paginationConstants.itemsPerPage,
            totalItems: 0
        };

        loadAll();

        function sort() {
            var result = [vm.predicate + ',' + (vm.reverse ? 'asc' : 'desc')];
            if (vm.predicate !== 'id') {
                result.push('id');
            }
            return result;
        }

        function onSuccess(data, headers) {
            if (headers && headers('X-Total-Count')) {
                vm.pageParams.totalItems = headers('X-Total-Count');
                vm.pageParams.page = pagingParams.page;
            } else {
                vm.pageParams.totalItems = data.length;
                vm.pageParams.page = 1;
            }
            vm.vacations = data;
        }

        function onError(error) {
            AlertService.error(error.data.message);
        }

        function loadAll () {
            Vacation.getFilteredVacations({
                page: pagingParams.page - 1,
                size: vm.pageParams.itemsPerPage,
                sort: sort()
            }, onSuccess, onError);
        }

        function loadPage () {
            pagingParams.page = vm.pageParams.page;
            vm.transition();
        }

        function transition () {
            var dateFormat = 'yyyy-MM-dd';

            Vacation.getFilteredVacations({
                type: vm.filterParams.type,
                owner: vm.filterParams.owner === '' ? null : vm.filterParams.owner,
                manager: vm.filterParams.manager === '' ? null : vm.filterParams.manager,
                stage: vm.filterParams.stage,
                from: $filter('date')(vm.filterParams.from, dateFormat),
                until: $filter('date')(vm.filterParams.until, dateFormat),
                page: vm.pageParams.page-1,
                size: vm.pageParams.itemsPerPage,
                sort: vm.predicate + ',' + (vm.reverse ? 'asc' : 'desc')
            }, onSuccess, onError);
        }

        function openCalendar(date) {
            vm.datePickerOpenStatus[date] = true;
        }

        function filtersEmpty() {
            return !(vm.filterParams.from || vm.filterParams.until ||
                vm.filterParams.type || vm.filterParams.stage ||
                vm.filterParams.owner && vm.filterParams.owner !== '' ||
                vm.filterParams.manager && vm.filterParams.manager !== '');
        }

        function filter() {
            if (filtersEmpty()) {
                loadAll();
                return;
            }
            var dateFormat = 'yyyy-MM-dd';
            Vacation.getFilteredVacations({
                type: vm.filterParams.type,
                owner: vm.filterParams.owner === '' ? null : vm.filterParams.owner,
                manager: vm.filterParams.manager === '' ? null : vm.filterParams.manager,
                stage: vm.filterParams.stage,
                from: $filter('date')(vm.filterParams.from, dateFormat),
                until: $filter('date')(vm.filterParams.until, dateFormat),
                page: pagingParams.page - 1,
                size: vm.pageParams.itemsPerPage,
                sort: sort()
            }, onSuccess, onError);
        }
    }
})();
