(function() {
    'use strict';

    angular
        .module('vacationTrackerApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider
        .state('vacation', {
            parent: 'entity',
            url: '/vacation?page&sort&search',
            data: {
                authorities: ['ROLE_USER'],
                pageTitle: 'vacationTrackerApp.vacation.home.title'
            },
            views: {
                'content@': {
                    templateUrl: 'app/entities/vacation/myVacations.html',
                    controller: 'VacationController',
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
                pagingParams: ['$stateParams', 'PaginationUtil', function ($stateParams, PaginationUtil) {
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
                    $translatePartialLoader.addPart('global');
                    return $translate.refresh();
                }]
            }
        })
        .state('overview', {
            parent: 'entity',
            url: '/vacation/overview?page&sort&search',
            data: {
                authorities: ['ROLE_USER'],
                pageTitle: 'vacationTrackerApp.vacation.home.title'
            },
            views: {
                'content@': {
                    templateUrl: 'app/entities/vacation/vacationOverview.html',
                    controller: 'VacationOverviewController',
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
                pagingParams: ['$stateParams', 'PaginationUtil', function ($stateParams, PaginationUtil) {
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
                    $translatePartialLoader.addPart('global');
                    return $translate.refresh();
                }]
            }
        })
        .state('vacation-detail', {
            parent: 'entity',
            url: '/vacation/{id}',
            data: {
                authorities: ['ROLE_USER'],
                pageTitle: 'vacationTrackerApp.vacation.detail.title'
            },
            views: {
                'content@': {
                    templateUrl: 'app/entities/vacation/vacation-detail.html',
                    controller: 'VacationDetailController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('vacation');
                    $translatePartialLoader.addPart('stage');
                    $translatePartialLoader.addPart('vacationType');
                    $translatePartialLoader.addPart('paymentType');
                    return $translate.refresh();
                }],
                entity: ['$stateParams', 'Vacation', function($stateParams, Vacation) {
                    return Vacation.get({id : $stateParams.id}).$promise;
                }],
                previousState: ["$state", function ($state) {
                    var currentStateData = {
                        name: $state.current.name || 'vacation',
                        params: $state.params,
                        url: $state.href($state.current.name, $state.params)
                    };
                    return currentStateData;
                }]
            }
        })
        .state('vacation-detail.edit', {
            parent: 'vacation-detail',
            url: '/detail/edit',
            data: {
                authorities: ['ROLE_USER']
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/entities/vacation/vacation-dialog.html',
                    controller: 'VacationDialogController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {
                        entity: ['Vacation', function(Vacation) {
                            return Vacation.get({id : $stateParams.id}).$promise;
                        }]
                    }
                }).result.then(function() {
                    $state.go('^', {}, { reload: false });
                }, function() {
                    $state.go('^');
                });
            }]
        })
        .state('vacation.new', {
            parent: 'vacation',
            url: '/new',
            data: {
                authorities: ['ROLE_USER']
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/entities/vacation/vacation-dialog.html',
                    controller: 'VacationDialogController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {
                        entity: function () {
                            return {
                                stage: null,
                                type: null,
                                payment: null,
                                startDate: null,
                                endDate: null,
                                id: null
                            };
                        }
                    }
                }).result.then(function() {
                    $state.go('vacation', null, { reload: 'vacation' });
                }, function() {
                    $state.go('vacation');
                });
            }]
        })
        .state('vacation.edit', {
            parent: 'vacation',
            url: '/{id}/edit',
            data: {
                authorities: ['ROLE_USER']
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/entities/vacation/vacation-dialog.html',
                    controller: 'VacationDialogController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {
                        entity: ['Vacation', function(Vacation) {
                            return Vacation.get({id : $stateParams.id}).$promise;
                        }]
                    }
                }).result.then(function() {
                    $state.go('vacation', null, { reload: 'vacation' });
                }, function() {
                    $state.go('^');
                });
            }]
        })
        .state('vacation.delete', {
            parent: 'vacation',
            url: '/{id}/delete',
            data: {
                authorities: ['ROLE_USER']
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/entities/vacation/vacation-delete-dialog.html',
                    controller: 'VacationDeleteController',
                    controllerAs: 'vm',
                    size: 'md',
                    resolve: {
                        entity: ['Vacation', function(Vacation) {
                            return Vacation.get({id : $stateParams.id}).$promise;
                        }]
                    }
                }).result.then(function() {
                    $state.go('vacation', null, { reload: 'vacation' });
                }, function() {
                    $state.go('^');
                });
            }]
        });
    }

})();
