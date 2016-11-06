(function() {
    'use strict';

    angular
        .module('vacationTrackerApp')
        .controller('VacationDetailController', VacationDetailController);

    VacationDetailController.$inject = ['$scope', '$rootScope', 'previousState', 'entity', 'Vacation', 'User', 'Principal', 'AlertService'];

    function VacationDetailController($scope, $rootScope, previousState, entity, Vacation, User, Principal, AlertService) {
        var vm = this;

        vm.vacation = entity;
        vm.previousState = previousState.name;
        vm.currentUser = null;
        vm.send = send;
        vm.confirm = confirm;
        vm.reject = reject;

        setCurrentUser();

        function setCurrentUser() {
            Principal.identity().then(function(account) {
                vm.currentUser = User.get({login: account.login});
            });
        }

        var unsubscribe = $rootScope.$on('vacationTrackerApp:vacationUpdate', function(event, result) {
            vm.vacation = result;
        });
        $scope.$on('$destroy', unsubscribe);

        function send() {
            vm.vacation.stage = (vm.vacation.type === "SICK_LEAVE") ? "CONFIRMED" : "SENT";

            Vacation.update(vm.vacation, function (result) {
                if (vm.vacation.owner.manager) {
                    AlertService.info("vacationTrackerApp.vacation.sent", {
                        vacation: {
                            startDate: $filter('date')(new Date(result.startDate), "dd/MM/yyyy"),
                            endDate: $filter('date')(new Date(result.endDate), "dd/MM/yyyy")
                        },
                        manager: vm.vacation.owner.manager
                    });
                } else {
                    AlertService.warning("User doesn't have a manager. This step will be redundant for managers without managers in later development");
                }
            });
        }

        function confirm () {
            vm.vacation.stage = "PLANNED";
            Vacation.update(vm.vacation, function (result) {
                AlertService.info("vacationTrackerApp.vacation.confirmed", {
                    owner: result.owner
                });
            });
        }

        function reject () {
            vm.vacation.stage = "SAVED";
            Vacation.update(vm.vacation, function (result) {
                AlertService.info("vacationTrackerApp.vacation.rejected", {
                    owner: result.owner
                });
            });
        }
    }
})();
