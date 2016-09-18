(function() {
    'use strict';

    angular
        .module('vacationTrackerApp')
        .filter('findLanguageFromKey', findLanguageFromKey);

    function findLanguageFromKey() {
        return findLanguageFromKeyFilter;

        function findLanguageFromKeyFilter(lang) {
            return {
                'en': 'English',
                'sv': 'Svenska'
            }[lang];
        }
    }
})();
