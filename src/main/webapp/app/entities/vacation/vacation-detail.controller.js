(function() {
    'use strict';

    angular
        .module('vacationTrackerApp')
        .controller('VacationDetailController', VacationDetailController);

    VacationDetailController.$inject = ['$uibModalInstance', 'entity', 'Vacation', 'User', 'Principal', 'AlertService'];

    function VacationDetailController ($uibModalInstance, entity, Vacation, User, Principal, AlertService) {
        var vm = this;

        vm.vacation = entity;
        vm.currentUser = null;
        vm.clear = clear;
        vm.send = send;
        vm.confirm = confirm;
        vm.reject = reject;

        setCurrentUser();

        function setCurrentUser() {
            Principal.identity().then(function(account) {
                vm.currentUser = User.get({login: account.login});
            });
        }

        function clear () {
            $uibModalInstance.dismiss('cancel');
        }

        function send () {
            if (vm.vacation.type === "SICK_LEAVE") {
                vm.vacation.stage = "CONFIRMED";
            } else if (!vm.vacation.owner.manager) {
                vm.vacation.stage = "PLANNED";
            } else {
                vm.vacation.stage = "SENT";
            }

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
            vm.vacation.stage = "SAVED";
            Vacation.update(vm.vacation, function (result) {
                AlertService.info("vacationTrackerApp.vacation.rejected", {
                    owner: result.owner
                });
                $uibModalInstance.close(true);
            });
        }

    }
})();
