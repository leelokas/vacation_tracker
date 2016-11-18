/**
 * Created by leelo on 18.11.16.
 */
(function () {
    'use strict';

    angular
        .module('vacationTrackerApp')
        .factory('XlsExportService', XlsExportService);

    XlsExportService.$inject = [];

    function XlsExportService () {
        var service = {
            downloadXls: downloadXls
        };

        return service;

        function Workbook() {
            if(!(this instanceof Workbook)) return new Workbook();
            this.SheetNames = [];
            this.Sheets = {};
        }

        function getSheet(data) {
            console.log(data);
            //TODO convert data to sheet
        }

        function downloadXls (data) {
            var wb = new Workbook();
            var ws = getSheet(data);
            var ws_name = "Upcoming vacations";

            wb.SheetNames.push(ws_name);
            wb.Sheets[ws_name] = ws;

            XLSX.writeFile(wb, 'sheetjs.xlsx');
        }
    }
})();
