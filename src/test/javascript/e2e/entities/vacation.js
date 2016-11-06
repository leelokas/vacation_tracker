'use strict';

describe('E2e tests', function () {

    var username = element(by.id('username'));
    var password = element(by.id('password'));

    var login = element(by.id('login'));
    var logout = element(by.id('logout2'));

    var startDate = element(by.id('field_startDate'));
    var endDate = element(by.id('field_endDate'));

    var submit = element(by.css('button[type=submit]'));
    var addNew = element(by.css('[ui-sref="vacation.new"]'));

    var vacationTypeColumn = element(by.xpath('//table/tbody/tr[last()]/td[2]'));
    var vacationStageColumn = element(by.xpath('//table/tbody/tr[last()]/td[3]'));
    var vacationPaymentColumn = element(by.xpath('//table/tbody/tr[last()]/td[4]'));
    var vacationButtonColumn = element(by.xpath('//table/tbody/tr[last()]/td[5]'));
    var vacationDateColumn = element(by.xpath('//table/tbody/tr[last()]/td[1]'));

    var date = new Date();
    date.setDate(date.getDate() + 1);
    var dateString = ("0" + date.getDate()).slice(-2) + "/" + ("0" + date.getMonth()).slice(-2) + "/" + date.getFullYear();

    it('should log in with user user', function () {
        browser.get('/');
        username.sendKeys('user');
        password.sendKeys('user');
        submit.click();
    });

    it('should load Vacations', function () {
        element.all(by.css('[ui-sref="vacation"]')).first().click().then(function() {
            element.all(by.css('h2')).first().getAttribute('data-translate').then(function (value) {
                expect(value).toMatch(/vacationTrackerApp.vacation.home.title/);
            });
        });
    });

    it('should load create Vacation dialog', function () {
        element(by.css('[ui-sref="vacation.new"]')).click().then(function() {
            element(by.css('h4.modal-title')).getAttribute('data-translate').then(function (value) {
                expect(value).toMatch(/vacationTrackerApp.vacation.home.createOrEditLabel/);
            });
            element(by.css('button.close')).click();
        });
    });

    it('should create a vacation', function () {
        addNew.click().then(function () {
            startDate.sendKeys(dateString);
            endDate.sendKeys(dateString);
            submit.click();
            });
        vacationTypeColumn.getAttribute('data-translate').then(function(value) {
            expect(value).toMatch(/vacationTrackerApp.VacationType.PAID/);
        });
        vacationStageColumn.getAttribute('data-translate').then(function(value) {
            expect(value).toMatch(/vacationTrackerApp.Stage.SAVED/);
        });
        vacationPaymentColumn.getAttribute('data-translate').then(function(value) {
            expect(value).toMatch(/vacationTrackerApp.PaymentType.BEFORE_VACATION/);
        });
        });


    it('should send a vacation', function () {
        vacationButtonColumn.element(by.buttonText('Send to confirmation')).click();
        vacationTypeColumn.getAttribute('data-translate').then(function(value) {
            expect(value).toMatch(/vacationTrackerApp.VacationType.PAID/);
        });
        vacationStageColumn.getAttribute('data-translate').then(function(value) {
            expect(value).toMatch(/vacationTrackerApp.Stage.SENT/);
        });
        vacationPaymentColumn.getAttribute('data-translate').then(function(value) {
            expect(value).toMatch(/vacationTrackerApp.PaymentType.BEFORE_VACATION/);
        });
        expect(vacationButtonColumn.element(by.buttonText('Cancel request')).isPresent()).toBe(true);
        expect(vacationButtonColumn.element(by.buttonText('Delete')).isPresent()).toBe(false);
    });


    it('should make a sick leave request',function() {
        addNew.click().then(function () {
            element(by.id('field_type')).sendKeys('Sick leave');
            startDate.sendKeys(dateString);
            expect(element(by.id('field_payment')).isEnabled()).toBe(false);
            expect(element(by.id('field_endDate')).isEnabled()).toBe(false);
            submit.click();
        });
        vacationTypeColumn.getAttribute('data-translate').then(function(value) {
            expect(value).toMatch(/vacationTrackerApp.VacationType.SICK_LEAVE/);
        });
      /*  vacationPaymentColumn.getAttribute('data-translate').then(function(value) {
            expect(value).toMatch(/vacationTrackerApp.PaymentType.WITH_NEXT_SALARY/);
        });
        */
        vacationButtonColumn.element(by.buttonText('Send to confirmation')).click();
        vacationStageColumn.getAttribute('data-translate').then(function(value) {
            expect(value).toMatch(/vacationTrackerApp.Stage.CONFIRMED/);
        });
        expect(vacationButtonColumn.element(by.buttonText('End date')).isPresent()).toBe(true);
    });

    it('should add end date to sick leave request', function() {
        vacationButtonColumn.element(by.buttonText('End date')).click();
        expect(element(by.id('field_startDate_sickLeave')).isEnabled()).toBe(false);
        element(by.id('field_endDate_sickLeave')).sendKeys(dateString);
        submit.click();
        vacationDateColumn.getText().then(function(text) {
            expect(text).toMatch(dateString + ' - ' + dateString);
        });
        expect(vacationButtonColumn.element(by.buttonText('End date')).isPresent()).toBe(false);
        expect(vacationButtonColumn.element(by.buttonText('Cancel request')).isPresent()).toBe(true);
        expect(vacationButtonColumn.element(by.buttonText('Delete')).isPresent()).toBe(false);

    });

    it('should make an extra vacation request', function() {
        addNew.click().then(function () {
            startDate.sendKeys(dateString);
            endDate.sendKeys(dateString);
            submit.click();
        });
        vacationButtonColumn.element(by.buttonText('Send to confirmation')).click();
    });

    it( 'should log out with user user', function () {
        logout.click();
    });

    it('should log in with manager/admin user', function() {
        browser.get('/');
        username.sendKeys('admin');
        password.sendKeys('admin');
        submit.click();
    });

    it('should confirm request', function () {
        element.all(by.css('[ui-sref="overview"]')).first().click().then(function() {
            element.all(by.xpath('//table/tbody/tr')).count().then(function(originalCount) {
                var requests = originalCount;

                element.all(by.css('[ui-sref="manager"]')).first().click().then(function() {
                    element.all(by.css('h2')).first().getAttribute('data-translate').then(function (value) {
                        expect(value).toMatch(/vacationTrackerApp.vacation.manager.title/);
                    });
                });
                element.all(by.xpath('//table/tbody/tr')).count().then(function(originalCount) {
                    var requests2 = originalCount;
                    vacationButtonColumn.element(by.buttonText('Confirm')).click();
                    var new_requests2 = element.all(by.xpath('//table/tbody/tr')).count();
                    expect(new_requests2).toBe(requests2 - 1);
                });
                element.all(by.css('[ui-sref="overview"]')).first().click().then(function(){
                    var new_requests = element.all(by.xpath('//table/tbody/tr')).count();
                    expect(new_requests).toBe(requests + 1);
                });
            });
        });

    });

    it('should reject request', function() {
        element.all(by.css('[ui-sref="overview"]')).first().click().then(function() {
            element.all(by.xpath('//table/tbody/tr')).count().then(function(originalCount) {
                var requests = originalCount;

                element.all(by.css('[ui-sref="manager"]')).first().click();
                element.all(by.xpath('//table/tbody/tr')).count().then(function(originalCount) {
                    var requests2 = originalCount;
                    vacationButtonColumn.element(by.buttonText('Reject')).click();
                    var new_requests2 = element.all(by.xpath('//table/tbody/tr')).count();
                    expect(new_requests2).toBe(requests2 - 1);
                });
                element.all(by.css('[ui-sref="overview"]')).first().click();
                var new_requests = element.all(by.xpath('//table/tbody/tr')).count();
                expect(new_requests).toBe(requests);
            });
        });
    });


/* TODO: For some reason admin cannot log back in after user has been logged in. It's possible we have to change user roles select type for this to work
    it('should give the user user manager role', function () {
        element(by.id('admin-menu')).click().then(function () {
            element(by.css('[ui-sref="user-management"]')).click().then(function () {
                element(by.css('[href="#/user-management/user/edit"]')).click();
                element(by.model('vm.user.authorities')).sendKeys('ROLE_MANAGER');
                element(by.id('editForm')).submit();
            });
        });
        logout.click();
        browser.get('/');
        username.sendKeys('user');
        password.sendKeys('user');
        submit.click();
        expect(element(by.css('[ui-sref="manager"]')).isDisplayed()).toBe(true);
        browser.get('/');
        logout.click();
    });

    it('should turn user role back to user', function() {
        browser.get('/');
        username.sendKeys('admin');
        password.sendKeys('admin');
        element(by.id('admin-menu')).click().then(function() {
            element(by.css('[ui-sref="user-management"]')).click().then(function () {
                element(by.css('[href="#/user-management/user/edit"]')).click();
                element(by.model('vm.user.authorities')).sendKeys('ROLE_USER');
                element(by.id('editForm')).submit();
            });
        });
    });
    */

    it('should log out with manager/admin user', function() {
        logout.click();
    });

    it('should log in with user user', function () {
        browser.get('/');
        username.sendKeys('user');
        password.sendKeys('user');
        submit.click();
    });


    it('should check that the request was rejected (i.e in SAVED state now) and delete the request', function() {
        element.all(by.css('[ui-sref="vacation"]')).first().click();
        element(by.xpath('//table/tbody/tr[last()-2]/td[3]')).getAttribute('data-translate').then(function(value) {
            expect(value).toMatch(/vacationTrackerApp.Stage.SAVED/);
        });
        element.all(by.xpath('//table/tbody/tr')).count().then(function(originalCount) {
            var requests = originalCount;
            element(by.xpath('//table/tbody/tr[last()-2]/td[5]')).element(by.buttonText('Delete')).click();
            element(by.id('deleteForm')).submit();
            var new_requests = element.all(by.xpath('//table/tbody/tr')).count();
            expect(new_requests).toBe(requests - 1);
        });
    });

    it('should cancel request', function() {
        element.all(by.css('[ui-sref="overview"]')).first().click().then(function() {
            element.all(by.xpath('//table/tbody/tr')).count().then(function(originalCount) {
                var requests = originalCount;

                element.all(by.css('[ui-sref="vacation"]')).first().click().then(function() {
                    vacationButtonColumn.element(by.buttonText('Cancel request')).click();
                    element(by.id('cancelForm')).submit();
                    vacationStageColumn.getAttribute('data-translate').then(function(value) {
                        expect(value).toMatch(/vacationTrackerApp.Stage.SAVED/);
                    });
                });

                element.all(by.css('[ui-sref="overview"]')).first().click().then(function(){
                    var new_requests = element.all(by.xpath('//table/tbody/tr')).count();
                    expect(new_requests).toBe(requests - 1);
                });
            });
        });
    });
});

