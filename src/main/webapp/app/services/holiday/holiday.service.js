(function () {
    'use strict';

    angular
        .module('vacationTrackerApp')
        .factory('Holiday', Holiday);

    Holiday.$inject = ['$resource'];

    function Holiday($resource) {
        return $resource('api/holidays', {from: '@from', until: '@until'}, {
            getHolidays: {
                method: 'GET',
                isArray: true,
                transformResponse: function (data) {
                    if (data) {
                        data = angular.fromJson(data);
                    }
                    return data;
                }
            }
        });
    }
})();
