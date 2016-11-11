(function() {
    'use strict';

    angular
        .module('vacationTrackerApp')
        .controller('VacationOverviewController', VacationOverviewController);

    VacationOverviewController.$inject = ['$state', '$filter', 'Vacation', 'AlertService', 'pagingParams', 'paginationConstants'];

    function VacationOverviewController ($state, $filter, Vacation, AlertService, pagingParams, paginationConstants) {
        var vm = this;

        vm.loadPage = loadPage;
        vm.transition = transition;
        vm.openCalendar = openCalendar;
        vm.filter = filter;
        vm.redirect = redirect;

        vm.predicate = pagingParams.predicate;
        vm.reverse = pagingParams.ascending;
        vm.itemsPerPage = paginationConstants.itemsPerPage;

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
            type: null,
            from: null,
            until: null
        };

        loadAll();

        function sort() {
            var result = [vm.predicate + ',' + (vm.reverse ? 'asc' : 'desc')];
            if (vm.predicate !== 'id') {
                result.push('id');
            }
            return result;
        }
        function onSuccess(data) {
            vm.totalItems = data.length;
            vm.queryCount = vm.totalItems;
            vm.vacations = data;
            vm.page = pagingParams.page;
        }
        function onError(error) {
            AlertService.error(error.data.message);
        }

        function loadAll() {
            Vacation.getOverviewVacations({
                page: pagingParams.page - 1,
                size: vm.itemsPerPage,
                sort: sort()
            }, onSuccess, onError);
        }

        function loadPage(page) {
            vm.page = page;
            vm.transition();
        }

        function transition() {
            $state.transitionTo($state.$current, {
                page: vm.page,
                sort: vm.predicate + ',' + (vm.reverse ? 'asc' : 'desc'),
                search: vm.currentSearch
            });
        }

        function openCalendar(date) {
            vm.datePickerOpenStatus[date] = true;
        }

        function filter() {
            var dateFormat = 'yyyy-MM-dd';
            Vacation.getFilteredVacations({
                stage: "PLANNED",
                type: vm.filterParams.type,
                from: $filter('date')(vm.filterParams.from, dateFormat),
                until: $filter('date')(vm.filterParams.until, dateFormat),
                page: pagingParams.page - 1,
                size: vm.itemsPerPage,
                sort: sort()
            }, function(plannedData) {
                Vacation.getFilteredVacations({
                    stage: "CONFIRMED",
                    type: vm.filterParams.type,
                    from: $filter('date')(vm.filterParams.from, dateFormat),
                    until: $filter('date')(vm.filterParams.until, dateFormat),
                    page: pagingParams.page - 1,
                    size: vm.itemsPerPage,
                    sort: sort()
                }, function(confirmedData) {
                    onSuccess(plannedData.concat(confirmedData));
                }, onError)
            }, onError);
        }

        function redirect(){
            window.location = "api/file/vacations";
        }

    }
})();
