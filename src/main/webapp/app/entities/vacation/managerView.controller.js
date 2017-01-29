(function() {
    'use strict';

    angular
        .module('vacationTrackerApp')
        .controller('ManagerViewController', managerViewController);

    managerViewController.$inject = ['$state', '$translate', 'Vacation', 'AlertService', 'pagingParams', 'paginationConstants'];

    function managerViewController ($state, $translate, Vacation, AlertService, pagingParams, paginationConstants) {
        var vm = this;

        vm.loadPage = loadPage;
        vm.predicate = pagingParams.predicate;
        vm.reverse = pagingParams.ascending;
        vm.transition = transition;
        vm.itemsPerPage = paginationConstants.itemsPerPage;
        vm.confirm = confirm;
        vm.reject = reject;

        loadAll();

        function loadAll () {
            Vacation.getAllSubordinateVacations({
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
            function onSuccess(data, headers) {
                vm.totalItems = headers('X-Total-Count');
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

        function confirm (vacation) {
            vacation.stage = "PLANNED";
            Vacation.update(vacation, function (result) {
                loadAll();
                AlertService.info("vacationTrackerApp.vacation.confirmed", {
                    owner: result.owner
                });
            });
        }

        function reject (vacation) {
            var options = {
                title: "<h4 class='modal-title'>" + $translate.instant("entity.reject.title") + "</h4>",
                message: "<p>" + $translate.instant("vacationTrackerApp.vacation.reject.question") + "</p>" +
                    "<label for='rejectComment'>" + $translate.instant("entity.action.addComment") + "</label>" +
                    "<textarea class='form-control' type='text' id='rejectComment' rows='1'></textarea>",
                buttons: {
                    confirm: {
                        label: "<span class='glyphicon glyphicon-ban-circle'></span>&nbsp;<span>" +
                        $translate.instant("entity.action.reject") + "</span>",
                        className: "btn-danger"
                    },
                    cancel: {
                        label: "<span class='glyphicon glyphicon-arrow-left'></span>&nbsp;<span>" +
                        $translate.instant("entity.action.back") + "</span>",
                        className: "btn-default"
                    }
                },
                callback: function (result) {
                    if (!result) {
                        return;
                    }
                    vacation.rejectComment = angular.element('#rejectComment').val() === "" ? null : angular.element('#rejectComment').val();
                    vacation.stage = "SAVED";
                    Vacation.update(vacation, function (result) {
                        loadAll();
                        AlertService.info("vacationTrackerApp.vacation.rejected", {
                            owner: result.owner
                        });
                    });
                }
            };

            bootbox.confirm(options);
        }
    }
})();
