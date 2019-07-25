(function() {
    'use strict';
    angular
        .module('vacationTrackerApp')
        .factory('Vacation', Vacation);

    Vacation.$inject = ['$resource', 'DateUtils'];

    function Vacation ($resource, DateUtils) {
        var resourceUrl =  'api/vacations/:id', getMethodCallback;

        getMethodCallback = function(data) {
            if (data) {
                data = angular.fromJson(data);
                data.startDate = DateUtils.convertLocalDateFromServer(data.startDate);
                data.endDate = DateUtils.convertLocalDateFromServer(data.endDate);
            }
            return data;
        };

        return $resource(resourceUrl, {}, {
            'query': {
                method: 'GET',
                isArray: true
            },
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    return getMethodCallback(data);
                }
            },
            'getOwnVacations': {
                method: 'GET',
                url: 'api/vacations/currentUser',
                isArray: true,
                transformResponse: function (data) {
                    return getMethodCallback(data);
                }
            },
            'getOwnFilteredVacations': {
                method: 'GET',
                url: 'api/vacations/currentUser/filter',
                isArray: true,
                transformResponse: function (data) {
                    return getMethodCallback(data);
                }
            },
            'getOverviewVacations': {
                method: 'GET',
                url: 'api/vacations/confirmed',
                isArray: true,
                transformResponse: function (data) {
                    return getMethodCallback(data);
                }
            },
            'getAllSubordinateVacations': {
                method: 'GET',
                url: 'api/vacations/subordinateVacations',
                isArray: true,
                transformResponse: function (data) {
                    return getMethodCallback(data);
                }
            },
            'getFilteredVacations': {
                method: 'GET',
                url: 'api/vacations/filter',
                isArray: true,
                transformResponse: function (data) {
                    return getMethodCallback(data);
                }
            },
            'getOverviewFilteredVacations': {
                method: 'GET',
                url: 'api/vacations/overview/filter',
                isArray: true,
                transformResponse: function (data) {
                    return getMethodCallback(data);
                }
            },
            'update': {
                method: 'PUT',
                transformRequest: function (data) {
                    data.startDate = DateUtils.convertLocalDateToServer(data.startDate);
                    data.endDate = DateUtils.convertLocalDateToServer(data.endDate);
                    return angular.toJson(data);
                }
            },
            'save': {
                method: 'POST',
                transformRequest: function (data) {
                    if (!data.stage) {
                        data.stage = "SAVED";
                    }
                    data.startDate = DateUtils.convertLocalDateToServer(data.startDate);
                    data.endDate = DateUtils.convertLocalDateToServer(data.endDate);
                    return angular.toJson(data);
                }
            }
        });
    }
})();
