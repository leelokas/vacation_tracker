
var date = new Date(new Date().setDate(new Date().getDate() + 1));

module.exports = {
    username: element(by.id('username')),

    password: element(by.id('password')),

    logout: element(by.id('logout2')),

    startDate: element(by.id('field_startDate')),
    endDate: element(by.id('field_endDate')),

    typeFilter: element(by.id('field_type')),
    ownerFilter: element(by.id('field_owner')),
    loginFilter: element(by.id('field_login')),
    filter: element(by.buttonText('Filter')),

    submit: element(by.css('button[type=submit]')),
    addNew: element(by.css('[ui-sref="vacation.new"]')),

    vacationTypeColumn: element(by.xpath('//table/tbody/tr[last()]/td[3]')),
    vacationStageColumn: element(by.xpath('//table/tbody/tr[last()]/td[4]')),
    vacationPaymentColumn: element(by.xpath('//table/tbody/tr[last()]/td[5]')),
    vacationButtonColumn: element(by.xpath('//table/tbody/tr[last()]/td[6]')),
    vacationDateColumn: element(by.xpath('//table/tbody/tr[last()]/td[1]')),

    dateString: ("0" + date.getDate()).slice(-2) + "/" + ("0" + date.getMonth()).slice(-2) + "/" + date.getFullYear(),

    endDateString: ("0" + (date.getDate()+1)).slice(-2) + "/" + ("0" + date.getMonth()).slice(-2) + "/" + date.getFullYear(),


    clickAndSubmit: function (buttonColumn,buttonText,submitId) {
        buttonColumn.element(by.buttonText(buttonText)).click();
        element(by.id(submitId)).submit();
    },

    login: function (uname, pwd) {
        browser.get('/');
        this.username.sendKeys(uname);
        this.password.sendKeys(pwd);
        this.submit.click();
    },

    checkTitle: function (tabLink, header, titleTranslation) {
        element.all(by.css(tabLink)).first().click().then(function() {
            element.all(by.css(header)).first().getAttribute('data-translate').then(function (value) {
                expect(value).toMatch(titleTranslation);
            });
        });
    },

    checkRequestData: function (column, translation) {
        column.getAttribute('data-translate').then(function(value) {
            expect(value).toMatch(translation);
        });
    },

    clickButton: function (column, text) {
        column.element(by.buttonText(text)).click();
    }
};


