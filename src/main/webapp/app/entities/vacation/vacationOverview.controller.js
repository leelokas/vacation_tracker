(function() {
    'use strict';

    angular
        .module('vacationTrackerApp')
        .controller('VacationOverviewController', VacationOverviewController);

    VacationOverviewController.$inject = ['$filter', '$window', 'Vacation', 'User', 'AlertService', 'pagingParams', 'paginationConstants'];

    function VacationOverviewController ($filter, $window, Vacation, User, AlertService, pagingParams, paginationConstants) {
        var vm = this;

        vm.loadPage = loadPage;
        vm.transition = transition;
        vm.openCalendar = openCalendar;
        vm.filter = filter;
        vm.exportFile = exportFile;
        vm.toggle = toggle;

        vm.predicate = pagingParams.predicate;
        vm.reverse = pagingParams.ascending;
        vm.managers = User.getFilteredUsers({role: 'ROLE_MANAGER'});

        vm.selectAll = false;
        vm.dateOptions = {
            showWeeks: false,
            startingDay: 1
        };
        vm.datePickerOpenStatus = {
            from: false,
            until: false
        };
        vm.filterParams = {
            owner: null,
            manager: null,
            type: null,
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
            if (vm.selectAll) {
                for (var i = 0, len = vm.vacations.length; i < len; i++) {
                    vm.vacations[i].checked = true;
                }
            }
        }

        function onError(error) {
            AlertService.error(error.data.message);
        }

        function loadAll() {
            Vacation.getOverviewVacations({
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
            Vacation.getOverviewFilteredVacations({
                type: vm.filterParams.type,
                owner: vm.filterParams.owner === '' ? null : vm.filterParams.owner,
                manager: vm.filterParams.manager === '' ? null : vm.filterParams.manager,
                from: $filter('date')(vm.filterParams.from, dateFormat),
                until: $filter('date')(vm.filterParams.until, dateFormat),
                page: vm.pageParams.page - 1,
                size: vm.pageParams.itemsPerPage,
                sort: vm.predicate + ',' + (vm.reverse ? 'asc' : 'desc')
            }, onSuccess, onError);
        }

        function openCalendar(date) {
            vm.datePickerOpenStatus[date] = true;
        }

        function filtersEmpty() {
            return !(vm.filterParams.type || vm.filterParams.from || vm.filterParams.until ||
                vm.filterParams.owner && vm.filterParams.owner !== '' ||
                vm.filterParams.manager && vm.filterParams.manager !== '');
        }

        function filter() {
            if (filtersEmpty()) {
                loadAll();
                return;
            }
            var dateFormat = 'yyyy-MM-dd';
            Vacation.getOverviewFilteredVacations({
                type: vm.filterParams.type,
                owner: vm.filterParams.owner === '' ? null : vm.filterParams.owner,
                manager: vm.filterParams.manager === '' ? null : vm.filterParams.manager,
                from: $filter('date')(vm.filterParams.from, dateFormat),
                until: $filter('date')(vm.filterParams.until, dateFormat),
                page: pagingParams.page - 1,
                size: vm.pageParams.itemsPerPage,
                sort: sort()
            }, onSuccess, onError);
        }

        function exportFile() {
            console.log('exportFile');
            if (vm.selectAll) {
                var dateFormat = 'yyyy-MM-dd';
                Vacation.getOverviewFilteredVacations({
                    type: vm.filterParams.type,
                    owner: vm.filterParams.owner === '' ? null : vm.filterParams.owner,
                    manager: vm.filterParams.manager === '' ? null : vm.filterParams.manager,
                    from: $filter('date')(vm.filterParams.from, dateFormat),
                    until: $filter('date')(vm.filterParams.until, dateFormat),
                    page: 0,
                    size: 10000,
                    sort: sort()
                }, exportResults, onError);
            } else {
                var i, selectedVacationIds = [];
                for (i = 0; i < vm.vacations.length; i++) {
                    if (vm.vacations[i].checked) {
                        selectedVacationIds.push(vm.vacations[i].id);
                    }
                }
                $window.location = "api/file/vacationsByIds?id=" + selectedVacationIds.join("&id=");
            }
        }

        function exportResults(data, headers) {
            var i, selectedVacationIds = [];
            for (i = 0; i < data.length; i++) {
                selectedVacationIds.push(data[i].id);
            }
            $window.location = "api/file/vacationsByIds?id=" + selectedVacationIds.join("&id=");
        }

        function toggle() {
            for (var i = 0; i < vm.vacations.length; i++) {
                vm.vacations[i].checked = vm.selectAll;
            }
        }
    }
})();
