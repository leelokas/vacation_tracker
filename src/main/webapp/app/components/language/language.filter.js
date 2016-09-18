(function() {
    'use strict';

    angular
        .module('vacationTrackerApp')
        .filter('findLanguageFromKey', findLanguageFromKey);

    function findLanguageFromKey() {
        return findLanguageFromKeyFilter;

        function findLanguageFromKeyFilter(lang) {
            return {
                'da': 'Dansk',
                'de': 'Deutsch',
                'en': 'English',
                'es': 'Español',
                'fr': 'Français',
                'gl': 'Galego',
                'hu': 'Magyar',
                'it': 'Italiano',
                'nl': 'Nederlands',
                'pl': 'Polski',
                'ro': 'Română',
                'ru': 'Русский',
                'sk': 'Slovenský',
            }[lang];
        }
    }
})();
