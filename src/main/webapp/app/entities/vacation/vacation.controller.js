(function() {
    'use strict';

    angular
        .module('vacationTrackerApp')
        .controller('VacationController', VacationController);

    VacationController.$inject = ['$state', '$filter', '$translate', 'Vacation', 'AlertService', 'pagingParams', 'User', 'Principal', 'paginationConstants'];

    function VacationController ($state, $filter, $translate, Vacation, AlertService, pagingParams, User, Principal, paginationConstants) {
        var vm = this;

        vm.loadPage = loadPage;
        vm.transition = transition;
        vm.send = send;
        vm.openCalendar = openCalendar;
        vm.filter = filter;
        vm.displayCancelButton = displayCancelButton;
        vm.currentUser = null;

        vm.predicate = pagingParams.predicate;
        vm.reverse = pagingParams.ascending;
        vm.itemsPerPage = paginationConstants.itemsPerPage;

        setCurrentUser();


        function setCurrentUser() {
            Principal.identity().then(function(account) {
                vm.currentUser = User.get({login: account.login});
            });
        }

        vm.paidDaysLeft = {};
        vm.dateOptions = {
            showWeeks: false,
            startingDay: 1
        };
        vm.datePickerOpenStatus = {
            from: false,
            until: false
        };
        vm.filterParams = {
            from: null,
            until: null,
            type: null,
            stage: null,
            payment: null
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

        function loadAll () {
            Vacation.getOwnVacations({
                page: pagingParams.page - 1,
                size: vm.itemsPerPage,
                sort: sort()
            }, onSuccess, onError);

            loadRemainingPaidDays();
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

        function displayCancelButton (vacation) {
            return vacation.stage !== 'SAVED' &&
                !(vacation.type !== "SICK_LEAVE" && new Date(vacation.endDate) < new Date() && vacation.stage === 'CONFIRMED');
        }

        function getVacationDuration(vacation) {
            var yearStart = new Date(new Date().getFullYear() + "-01-01"),
                yearEnd = new Date(new Date().getFullYear() + "-12-31"),
                start = new Date(vacation.startDate) >= yearStart ? new Date(vacation.startDate) : yearStart,
                end = new Date(vacation.endDate) <= yearEnd ? new Date(vacation.endDate) : yearEnd;
            return (end - start) / (1000 * 60 * 60 * 24) + 1;
        }

        function hasEnoughPaidVacation(vacation) {
            return vacation.type === 'PAID' && getVacationDuration(vacation) <= vm.paidDaysLeft.endOfYear;
        }

        function send (vacation) {
            var callback, options;

            callback = function (result) {
                if (!result) {
                    return;
                }
                vacation.stage = (vacation.type === "SICK_LEAVE" || !vacation.owner.manager) ? "PLANNED" : "SENT";
                Vacation.update(vacation, function (result) {
                    loadAll();
                    if (vacation.type === "SICK_LEAVE") {
                        AlertService.info("vacationTrackerApp.vacation.sendSickLeave", {
                            vacation: {
                                startDate: $filter('date')(new Date(result.startDate), "dd/MM/yyyy")
                            },
                            manager: vacation.owner.manager
                        });
                    } else if (vacation.owner.manager) {
                        AlertService.info("vacationTrackerApp.vacation.sent", {
                            vacation: {
                                startDate: $filter('date')(new Date(result.startDate), "dd/MM/yyyy"),
                                endDate: $filter('date')(new Date(result.endDate), "dd/MM/yyyy")
                            },
                            manager: vacation.owner.manager
                        });
                    }
                });
            };

            options = {
                title: "<h4 class='modal-title'>" + $translate.instant("entity.send.title") + "</h4>",
                message: "<p>" + $translate.instant("vacationTrackerApp.vacation.send.question") + "</p>",
                buttons: {
                    confirm: {
                        label: "<span class='glyphicon glyphicon-send'></span>&nbsp;<span>" +
                                $translate.instant("entity.action.send") + "</span>",
                        className: "btn-success"
                    },
                    cancel: {
                        label: "<span class='glyphicon glyphicon-arrow-left'></span>&nbsp;<span>" +
                                $translate.instant("entity.action.back") + "</span>",
                        className: "btn-default"
                    }
                },
                callback: callback
            };

            if (vacation.type !== "PAID" || hasEnoughPaidVacation(vacation)) {
                callback(true);
            } else {
                bootbox.confirm(options);
            }
        }

        function openCalendar(date) {
            vm.datePickerOpenStatus[date] = true;
        }

        function filter() {
            var dateFormat = 'yyyy-MM-dd';
            Vacation.getFilteredVacations({
                type: vm.filterParams.type,
                owner: vm.currentUser.login,
                stage: vm.filterParams.stage,
                payment: vm.filterParams.payment,
                from: $filter('date')(vm.filterParams.from, dateFormat),
                until: $filter('date')(vm.filterParams.until, dateFormat),
                page: pagingParams.page - 1,
                size: vm.itemsPerPage,
                sort: sort()
            }, onSuccess, onError);
        }

        function loadRemainingPaidDays () {
            User.getRemainingPaidDays({}, function(data) {
                vm.paidDaysLeft = data;
                if (!data.hasTwoWeekPaidVacation) {
                    AlertService.warning("vacationTrackerApp.vacation.twoWeekPaidVacationRequired");
                }
            }, onError);
        }
    }
})();
