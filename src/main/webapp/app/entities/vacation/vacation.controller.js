(function () {
    'use strict';

    angular
        .module('vacationTrackerApp')
        .controller('VacationController', VacationController);

    VacationController.$inject = ['$filter', '$translate', 'Vacation', 'Holiday', 'AlertService', 'pagingParams', 'User', 'Principal', 'paginationConstants'];

    function VacationController($filter, $translate, Vacation, Holiday, AlertService, pagingParams, User, Principal, paginationConstants) {
        var vm = this;

        var holidays = {};

        vm.loadPage = loadPage;
        vm.transition = transition;
        vm.send = send;
        vm.openCalendar = openCalendar;
        vm.filter = filter;
        vm.displayCancelButton = displayCancelButton;
        vm.currentUser = null;

        vm.predicate = pagingParams.predicate;
        vm.reverse = pagingParams.ascending;

        setCurrentUser();

        function setCurrentUser() {
            Principal.identity().then(function (account) {
                vm.currentUser = User.get({login: account.login});
            });
        }

        var paintHolidaysbyMonthTimer = {};

        function paintHolidaysbyMonth(month, year) {
            var holidaysMonthly, i, $date;
            holidaysMonthly = holidays[month + "" + year];
            if (!!holidaysMonthly) {
                for (i = 0; i < holidaysMonthly.length; i++) {
                    $date = $(".uib-datepicker-popup .dp-date_" + holidaysMonthly[i].date);
                    $date.addClass("national-holiday");
                    $date.attr("title", $filter('translate')('vacationTrackerApp.holiday.' + holidaysMonthly[i].propertiesKey));
                }
            }
        }

        vm.paidDaysLeft = {};
        vm.dateOptions = {
            showWeeks: false,
            startingDay: 1,
            customClass: function (item) {
                var from, until;
                clearTimeout(paintHolidaysbyMonthTimer[item.date.getMonth()]);
                paintHolidaysbyMonthTimer[item.date.getMonth()] = setTimeout(function () {
                    from = new Date(item.date.getFullYear(), item.date.getMonth(), 1);
                    until = new Date(new Date(item.date.getFullYear(), item.date.getMonth() + 1, 1).getTime() - 1000);
                    if (!holidays[item.date.getMonth() + "" + item.date.getFullYear()]) {
                        Holiday.getHolidays({
                            from: from.getFullYear() + "-" + (until.getMonth() + 1) + "-1",
                            until: until.getFullYear() + "-" + (until.getMonth() + 1) + "-" + until.getDate()
                        }).$promise.then(function (results) {
                            var data, date;
                            data = JSON.parse(JSON.stringify(results));
                            holidays[item.date.getMonth() + "" + item.date.getFullYear()] = [];
                            if (data.length > 0) {
                                date = new Date(Date.parse(data[data.length - 1].date));
                                holidays[date.getMonth() + "" + date.getFullYear()] = data;
                                paintHolidaysbyMonth(date.getMonth(), date.getFullYear());
                            }
                        });
                    } else {
                        paintHolidaysbyMonth(item.date.getMonth(), item.date.getFullYear());
                    }
                }, 100);

                return "dp-date_" + new Date(item.date).toISOString().slice(0, 10);
            }
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

        function loadAll() {
            Vacation.getOwnVacations({
                page: pagingParams.page - 1,
                size: vm.pageParams.itemsPerPage,
                sort: sort()
            }, onSuccess, onError);

            loadRemainingPaidDays();
        }

        function loadPage() {
            pagingParams.page = vm.pageParams.page;
            vm.transition();
        }

        function transition() {
            var dateFormat = 'yyyy-MM-dd';

            Vacation.getFilteredVacations({
                type: vm.filterParams.type,
                owner: vm.currentUser.login,
                stage: vm.filterParams.stage,
                payment: vm.filterParams.payment,
                from: $filter('date')(vm.filterParams.from, dateFormat),
                until: $filter('date')(vm.filterParams.until, dateFormat),
                page: vm.pageParams.page - 1,
                size: vm.pageParams.itemsPerPage,
                sort: vm.predicate + ',' + (vm.reverse ? 'asc' : 'desc')
            }, onSuccess, onError);
        }

        function displayCancelButton(vacation) {
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

        function send(vacation) {
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

        function filtersEmpty() {
            return !(vm.filterParams.from || vm.filterParams.until ||
                vm.filterParams.type || vm.filterParams.stage || vm.filterParams.payment);
        }

        function filter() {
            if (filtersEmpty()) {
                loadAll();
                return;
            }
            var dateFormat = 'yyyy-MM-dd';
            Vacation.getFilteredVacations({
                type: vm.filterParams.type,
                owner: vm.currentUser.login,
                stage: vm.filterParams.stage,
                payment: vm.filterParams.payment,
                from: $filter('date')(vm.filterParams.from, dateFormat),
                until: $filter('date')(vm.filterParams.until, dateFormat),
                page: pagingParams.page - 1,
                size: vm.pageParams.itemsPerPage,
                sort: sort()
            }, onSuccess, onError);
        }

        function loadRemainingPaidDays() {
            User.getRemainingPaidDays({}, function (data) {
                vm.paidDaysLeft = data;
                if (!data.hasTwoWeekPaidVacation) {
                    AlertService.warning("vacationTrackerApp.vacation.twoWeekPaidVacationRequired");
                }
            }, onError);
        }
    }

})();
