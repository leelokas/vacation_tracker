(function() {
    'use strict';

    angular
        .module('vacationTrackerApp')
        .factory('notificationInterceptor', notificationInterceptor);

    notificationInterceptor.$inject = ['$q', 'AlertService'];

    function notificationInterceptor ($q, AlertService) {
        var service = {
            response: response
        };

        return service;

        function response (response) {
            var alertKey = response.headers('X-vacationTrackerApp-alert');
            if (angular.isString(alertKey)) {
                /*
                Alert didn't appear when saving new vacation
                TODO fix it without using timeout
                 */
                setTimeout(function() {
                    AlertService.success(alertKey, { param : response.headers('X-vacationTrackerApp-params')});
                }, 100);
            }
            return response;
        }
    }
})();
