(function() {
    'use strict';

    angular
        .module('vacationTrackerApp')
        .provider('AlertService', AlertService);

    function AlertService () {
        this.toast = false;
        /*jshint validthis: true */
        this.$get = getService;

        this.showAsToast = function(isToast) {
            this.toast = isToast;
        };

        getService.$inject = ['$timeout', '$sce', '$translate'];

        function getService ($timeout, $sce, $translate) {
            var toast = this.toast,
                alertId = 0, // unique id for each alert. Starts from 0.
                alerts = [],
                alertTimeoutIds = [],
                timeout = 10000; // default timeout

            return {
                factory: factory,
                isToast: isToast,
                add: addAlert,
                closeAlert: closeAlert,
                closeAlertByIndex: closeAlertByIndex,
                clear: clear,
                get: get,
                success: success,
                error: error,
                info: info,
                warning : warning
            };

            function isToast() {
                return toast;
            }

            function clear() {
                alerts = [];
            }

            function get() {
                return alerts;
            }

            function success(msg, params, position) {
                return this.add({
                    type: 'success',
                    msg: msg,
                    params: params,
                    timeout: timeout,
                    toast: toast,
                    position: position
                });
            }

            function error(msg, params, position) {
                return this.add({
                    type: 'danger',
                    msg: msg,
                    params: params,
                    timeout: timeout,
                    toast: toast,
                    position: position
                });
            }

            function warning(msg, params, position) {
                return this.add({
                    type: 'warning',
                    msg: msg,
                    params: params,
                    timeout: timeout,
                    toast: toast,
                    position: position
                });
            }

            function info(msg, params, position) {
                return this.add({
                    type: 'info',
                    msg: msg,
                    params: params,
                    timeout: timeout,
                    toast: toast,
                    position: position
                });
            }

            function factory(alertOptions) {
                var alert = {
                    type: alertOptions.type,
                    msg: $sce.trustAsHtml(alertOptions.msg),
                    id: alertOptions.alertId,
                    timeout: alertOptions.timeout,
                    toast: alertOptions.toast,
                    position: alertOptions.position ? alertOptions.position : 'top right',
                    scoped: alertOptions.scoped,
                    close: function (alerts) {
                        return closeAlert(this.id, alerts);
                    }
                };
                if (!alert.scoped) {
                    if (alerts.length >= 4) {
                        closeAlertByIndex(0, alerts, alertTimeoutIds);
                    }
                    alerts.push(alert);
                }
                return alert;
            }

            function addAlert(alertOptions, extAlerts) {
                alertOptions.alertId = alertId++;
                alertOptions.msg = $translate.instant(alertOptions.msg, alertOptions.params);
                var that = this;
                var alert = this.factory(alertOptions);
                if (alertOptions.timeout && alertOptions.timeout > 0) {
                    alertTimeoutIds.push($timeout(function () {
                        that.closeAlert(alertOptions.alertId, extAlerts, alertTimeoutIds);
                    }, alertOptions.timeout));
                }
                return alert;
            }

            function closeAlert(id, extAlerts, extAlertTimeoutIds) {
                var thisAlerts = extAlerts ? extAlerts : alerts;
                var thisAlertTimeoutIds = extAlertTimeoutIds ? extAlertTimeoutIds : alertTimeoutIds;
                return closeAlertByIndex(thisAlerts.map(function(e) { return e.id; }).indexOf(id), thisAlerts, thisAlertTimeoutIds);
            }

            function closeAlertByIndex(index, thisAlerts, thisAlertTimeoutIds) {
                $timeout.cancel(thisAlertTimeoutIds[index]);
                thisAlertTimeoutIds.splice(index, 1);
                return thisAlerts.splice(index, 1);
            }
        }
    }
})();
