(function() {
    'use strict';

    angular
        .module('vacationTrackerApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider
        .state('vacation-management', {
            parent: 'admin',
            url: '/vacation-management?page&sort&search',
            data: {
                authorities: ['ROLE_ADMIN'],
                pageTitle: 'global.menu.admin.vacationManagement'
            },
            views: {
                'content@': {
                    templateUrl: 'app/admin/vacation-management/vacation-management.html',
                    controller: 'VacationManagementController',
                    controllerAs: 'vm'
                }
            },
            params: {
                page: {
                    value: '1',
                    squash: true
                },
                sort: {
                    value: 'id,asc',
                    squash: true
                },
                search: null
            },
            resolve: {
                pagingParams: ['$stateParams', 'PaginationUtil', 'AlertService', function ($stateParams, PaginationUtil, AlertService) {
                    AlertService.clear();
                    return {
                        page: PaginationUtil.parsePage($stateParams.page),
                        sort: $stateParams.sort,
                        predicate: PaginationUtil.parsePredicate($stateParams.sort),
                        ascending: PaginationUtil.parseAscending($stateParams.sort),
                        search: $stateParams.search
                    };
                }],
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('vacation');
                    $translatePartialLoader.addPart('stage');
                    $translatePartialLoader.addPart('vacationType');
                    $translatePartialLoader.addPart('paymentType');
                    return $translate.refresh();
                }]
            }
        })
        .state('vacation-management-detail', {
            parent: 'vacation-management',
            url: '/{id}/details',
            data: {
                authorities: ['ROLE_ADMIN']
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/admin/vacation-management/vacation-management-detail.html',
                    controller: 'VacationManagementDetailController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {
                        entity: ['Vacation', function(Vacation) {
                            return Vacation.get({id : $stateParams.id}).$promise;
                        }]
                    }
                }).result.then(function() {
                    $state.go('vacation-management', null, { reload: true });
                }, function() {
                    $state.go('^');
                });
            }]
        })
        .state('vacation-management.new', {
            parent: 'vacation-management',
            url: '/new',
            data: {
                authorities: ['ROLE_ADMIN']
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/admin/vacation-management/vacation-management-dialog.html',
                    controller: 'VacationManagementDialogController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {
                        entity: function () {
                            return {
                                stage: 'SENT',
                                type: 'PAID',
                                payment: 'BEFORE_VACATION',
                                startDate: null,
                                endDate: null,
                                id: null
                            };
                        }
                    }
                }).result.then(function() {
                    $state.go('vacation-management', null, { reload: true });
                }, function() {
                    $state.go('vacation-management');
                });
            }]
        })
        .state('vacation-management.edit', {
            parent: 'vacation-management',
            url: '/{id}/edit',
            data: {
                authorities: ['ROLE_ADMIN']
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/admin/vacation-management/vacation-management-dialog.html',
                    controller: 'VacationManagementDialogController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {
                        entity: ['Vacation', function(Vacation) {
                            return Vacation.get({id : $stateParams.id}).$promise;
                        }]
                    }
                }).result.then(function() {
                    $state.go('vacation-management', null, { reload: true });
                }, function() {
                    $state.go('^');
                });
            }]
        });
    }
})();
