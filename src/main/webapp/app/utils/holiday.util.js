(function () {
    'use strict';
    angular.module('vacationTrackerApp').factory('HolidayUtils', HolidayUtils);

    HolidayUtils.$inject = ['$filter', 'Holiday'];

    function HolidayUtils($filter, Holiday) {

        var holidays = {}, paintHolidaysbyMonthTimer = {};

        function paintHolidaysbyMonth(month, year) {
            var holidaysMonthly, i, $date;
            holidaysMonthly = holidays[month + "" + year];
            if (!!holidaysMonthly) {
                for (i = 0; i < holidaysMonthly.length; i++) {
                    $date = $(".uib-datepicker-popup .dp-date_" + holidaysMonthly[i].date);
                    $date.addClass("national-holiday");
                    $date.attr("title", $filter('translate')('vacationTrackerApp.holiday.' + holidaysMonthly[i].propertiesKey));
                }
            }
        }

        function getDateString(date) {
            var fullYear, month;
            fullYear = date.getFullYear();
            month = date.getMonth() + 1;
            date = date.getDate();
            return fullYear + "-" + (month < 10 ? "0" + month : month) + "-" + (date < 10 ? "0" + date : date);
        }

        var getHolidayClasses = function (item) {
            var from, until;
            clearTimeout(paintHolidaysbyMonthTimer[item.date.getMonth()]);
            paintHolidaysbyMonthTimer[item.date.getMonth()] = setTimeout(function () {
                from = new Date(item.date.getFullYear(), item.date.getMonth(), 1);
                until = new Date(new Date(item.date.getFullYear(), item.date.getMonth() + 1, 1).getTime() - 1000);
                if (!holidays[item.date.getMonth() + "" + item.date.getFullYear()]) {
                    Holiday.getHolidays({
                        from: from.getFullYear() + "-" + (until.getMonth() + 1) + "-1",
                        until: until.getFullYear() + "-" + (until.getMonth() + 1) + "-" + until.getDate()
                    }).$promise.then(function (results) {
                        var data, date;
                        data = JSON.parse(JSON.stringify(results));
                        holidays[item.date.getMonth() + "" + item.date.getFullYear()] = [];
                        if (data.length > 0) {
                            date = new Date(Date.parse(data[data.length - 1].date));
                            holidays[date.getMonth() + "" + date.getFullYear()] = data;
                            paintHolidaysbyMonth(date.getMonth(), date.getFullYear());
                        }
                    });
                } else {
                    paintHolidaysbyMonth(item.date.getMonth(), item.date.getFullYear());
                }
            }, 100);

            return "dp-date_" + getDateString(item.date);
        };

        return {
            getHolidayDates: getHolidayClasses
        }
    }

})();
