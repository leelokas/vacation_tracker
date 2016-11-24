(function () {
    'use strict';

    angular
        .module('vacationTrackerApp')
        .factory('User', User);

    User.$inject = ['$resource'];

    function User ($resource) {
        var service = $resource('api/users/:login', {}, {
            'query': {method: 'GET', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    data = angular.fromJson(data);
                    return data;
                }
            },
            'getRemainingPaidDays': {
                method: 'GET',
                url: 'api/users/remainingDays'
            },
            'getFilteredUsers': {
                method: 'GET',
                url: 'api/users/filter',
                isArray: true,
                transformResponse: function (data) {
                    data = angular.fromJson(data);
                    return data;
                }
            },
            'save': { method:'POST' },
            'update': { method:'PUT' },
            'delete':{ method:'DELETE'}
        });

        return service;
    }
})();
