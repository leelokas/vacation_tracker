(function() {
    'use strict';

    angular
        .module('vacationTrackerApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('settings', {
            parent: 'account',
            url: '/settings',
            data: {
                authorities: ['ROLE_USER'],
                pageTitle: 'global.menu.account.settings'
            },
            views: {
                'content@': {
                    templateUrl: 'app/account/settings/settings.html',
                    controller: 'SettingsController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', 'AlertService', function ($translate, $translatePartialLoader, AlertService) {
                    AlertService.clear();
                    $translatePartialLoader.addPart('settings');
                    return $translate.refresh();
                }]
            }
        });
    }
})();
