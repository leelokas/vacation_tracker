(function () {
    'use strict';

    angular
        .module('vacationTrackerApp')
        .factory('User', User);

    User.$inject = ['$resource', 'DateUtils'];

    function User ($resource, DateUtils) {
        var service = $resource('api/users/:login', {}, {
            'query': {method: 'GET', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    if (data) {
                        data = angular.fromJson(data);
                        data.firstWorkday = DateUtils.convertDateTimeFromServer(data.firstWorkday);
                    }
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
                    if (data) {
                        data = angular.fromJson(data);
                        data.firstWorkday = DateUtils.convertDateTimeFromServer(data.firstWorkday);
                    }
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
