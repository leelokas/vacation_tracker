(function() {
    'use strict';

    angular
        .module('vacationTrackerApp')
        .controller('VacationDetailController', VacationDetailController);

    VacationDetailController.$inject = ['$uibModalInstance', '$translate', '$filter', 'entity', 'Vacation', 'User', 'Principal', 'AlertService'];

    function VacationDetailController ($uibModalInstance, $translate, $filter, entity, Vacation, User, Principal, AlertService) {
        var vm = this;

        vm.vacation = entity;
        vm.currentUser = null;
        vm.paidDaysLeft = {};
        vm.clear = clear;
        vm.send = send;
        vm.confirm = confirm;
        vm.reject = reject;

        setCurrentUser();
        loadRemainingPaidDays();

        function setCurrentUser() {
            Principal.identity().then(function(account) {
                vm.currentUser = User.get({login: account.login});
            });
        }

        function loadRemainingPaidDays () {
            User.getRemainingPaidDays({}, function(data) {
                vm.paidDaysLeft = data;
            });
        }

        function clear () {
            $uibModalInstance.dismiss('cancel');
        }

        function getVacationDuration() {
            var yearStart = new Date(new Date().getFullYear() + "-01-01"),
                yearEnd = new Date(new Date().getFullYear() + "-12-31"),
                start = new Date(vm.vacation.startDate) >= yearStart ? new Date(vm.vacation.startDate) : yearStart,
                end = new Date(vm.vacation.endDate) <= yearEnd ? new Date(vm.vacation.endDate) : yearEnd;
            return (end - start) / (1000 * 60 * 60 * 24) + 1;
        }

        function hasEnoughPaidVacation() {
            return vm.vacation.type === 'PAID' && getVacationDuration() <= vm.paidDaysLeft.endOfYear;
        }

        function send () {
            var callback, options;

            callback = function(result) {
                if (!result) {
                    return;
                }
                vm.vacation.stage = (vm.vacation.type === "SICK_LEAVE" || !vm.vacation.owner.manager) ? "PLANNED" : "SENT";
                Vacation.update(vm.vacation, function (result) {
                    if (vm.vacation.owner.manager) {
                        AlertService.info("vacationTrackerApp.vacation.sent", {
                            vacation: {
                                startDate: $filter('date')(new Date(result.startDate), "dd/MM/yyyy"),
                                endDate: $filter('date')(new Date(result.endDate), "dd/MM/yyyy")
                            },
                            manager: vm.vacation.owner.manager
                        });
                    }
                    $uibModalInstance.close(true);
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

            if (vm.vacation.type !== "PAID" || hasEnoughPaidVacation()) {
                callback(true);
            } else {
                bootbox.confirm(options);
            }
        }

        function confirm () {
            vm.vacation.stage = "PLANNED";
            Vacation.update(vm.vacation, function (result) {
                AlertService.info("vacationTrackerApp.vacation.confirmed", {
                    owner: result.owner
                });
                $uibModalInstance.close(true);
            });
        }

        function reject () {
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
                    vm.vacation.rejectComment = angular.element('#rejectComment').val() === "" ? null : angular.element('#rejectComment').val();
                    vm.vacation.stage = "SAVED";
                    Vacation.update(vm.vacation, function (result) {
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
