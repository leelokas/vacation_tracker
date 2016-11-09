(function() {
    'use strict';

    angular
        .module('vacationTrackerApp')
        .controller('VacationController', VacationController);

    VacationController.$inject = ['$state', '$filter', 'Vacation', 'ParseLinks', 'AlertService', 'pagingParams', 'paginationConstants'];

    function VacationController ($state, $filter, Vacation, ParseLinks, AlertService, pagingParams, paginationConstants) {
        var vm = this;

        vm.loadPage = loadPage;
        vm.predicate = pagingParams.predicate;
        vm.reverse = pagingParams.ascending;
        vm.transition = transition;
        vm.itemsPerPage = paginationConstants.itemsPerPage;
        vm.send = send;
        vm.paidDaysLeft = { // TODO fix after #16 is done
            current: 20,
            endOfYear: 28
        };

        loadAll();

        function loadAll () {
            Vacation.getOwnVacations({
                page: pagingParams.page - 1,
                size: vm.itemsPerPage,
                sort: sort()
            }, onSuccess, onError);
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

        function send (vacation) {

            if (vacation.type === "SICK_LEAVE") {
                vacation.stage = "CONFIRMED";
            }
            else if (!vacation.owner.manager) {
                vacation.stage = "PLANNED";
            }
            else {
                vacation.stage = "SENT";
            }


            Vacation.update(vacation, function (result) {
                loadAll();
                if (vacation.owner.manager) {
                    AlertService.info("vacationTrackerApp.vacation.sent", {
                        vacation: {
                            startDate: $filter('date')(new Date(result.startDate), "dd/MM/yyyy"),
                            endDate: $filter('date')(new Date(result.endDate), "dd/MM/yyyy")
                        },
                        manager: vacation.owner.manager
                    });
                }
            });
        }
    }
})();
