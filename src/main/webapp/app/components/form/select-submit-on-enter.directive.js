(function() {
    'use strict';

    angular
        .module('vacationTrackerApp')
        .directive('submitOnEnter', submitOnEnter);

    function submitOnEnter() {
        var directive = {
            restrict: 'A',
            require: 'select',
            link: linkFunc
        };

        return directive;

        function linkFunc (scope, element, attrs) {
            element.bind("keypress", function(event) {
                if (event.which === 13) {
                    if (element.closest('form').length) {
                        event.preventDefault();
                        element.closest('form').triggerHandler('submit');
                    }
                }
            });
        }
    }
})();
