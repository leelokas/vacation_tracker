(function() {
    'use strict';

    angular
        .module('vacationTrackerApp')
        .controller('VacationOverviewController', VacationOverviewController);

    VacationOverviewController.$inject = ['$state', '$filter', '$translate', 'Vacation', 'AlertService', 'XlsExportService', 'pagingParams', 'paginationConstants'];

    function VacationOverviewController ($state, $filter, $translate, Vacation, AlertService, XlsExportService, pagingParams, paginationConstants) {
        var vm = this;

        vm.loadPage = loadPage;
        vm.transition = transition;
        vm.openCalendar = openCalendar;
        vm.filter = filter;
        vm.exportFile = exportFile;
        vm.toggle = toggle;

        vm.predicate = pagingParams.predicate;
        vm.reverse = pagingParams.ascending;
        vm.itemsPerPage = paginationConstants.itemsPerPage;

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
                owner: vm.filterParams.owner === '' ? null : vm.filterParams.owner,
                manager: vm.filterParams.manager === '' ? null : vm.filterParams.manager,
                from: $filter('date')(vm.filterParams.from, dateFormat),
                until: $filter('date')(vm.filterParams.until, dateFormat),
                page: pagingParams.page - 1,
                size: vm.itemsPerPage,
                sort: sort()
            }, function(plannedData) {
                Vacation.getFilteredVacations({
                    stage: "CONFIRMED",
                    type: vm.filterParams.type,
                    owner: vm.filterParams.owner === '' ? null : vm.filterParams.owner,
                    manager: vm.filterParams.manager === '' ? null : vm.filterParams.manager,
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

        function getRowObject(obj) {
            var oneDay = 24 * 60 * 60 * 1000,
                startDate = new Date(obj.startDate),
                endDate = obj.endDate ? new Date(obj.endDate) : null;
            return {
                name: obj.owner.firstName + " " + obj.owner.lastName,
                startDate: obj.startDate,
                endDate: obj.endDate,
                duration: endDate ? Math.round(Math.abs((startDate.getTime() - endDate.getTime()) / (oneDay))) + 1 : null,
                type: $translate.instant('vacationTrackerApp.VacationType.' + obj.type),
                payment: $translate.instant('vacationTrackerApp.PaymentType.' + obj.payment)
            };
        }

        function exportFile() {
            var i, selectedVacations = [], exportData = [];
            for (i = 0; i < vm.vacations.length; i++) {
                if (vm.vacations[i].checked) {
                    selectedVacations.push(vm.vacations[i]);
                }
            }
            for (i = 0; i < selectedVacations.length; i++) {
                exportData.push(getRowObject(selectedVacations[i]));
            }
            XlsExportService.downloadXls(exportData);
        }

        function toggle() {
            for (var i = 0; i < vm.vacations.length; i++) {
                vm.vacations[i].checked = vm.selectAll;
            }
        }
    }
})();
