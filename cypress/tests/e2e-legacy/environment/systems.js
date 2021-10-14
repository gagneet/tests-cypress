import faker from 'faker/locale/en_AU'; // https://www.npmjs.com/package/faker
import { environmentSystemsPageModel } from '../../../pages/environment-page';

let token = '';

const orgName = Cypress.env().users['admin'].organizationName;
const downloadsFolder = Cypress.config('downloadsFolder');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);
const today = dayjs().format('DD-MM-YYYYHH:mm:ss');
const systemNameUI = 'system-ui-' + faker.address.countryCode() + ' ' + today;

before('Preconditions: token generation and look up fields', () => {
  cy.fixture('data').should((data) => {
    token = data.token;
  });
});

beforeEach(() => {
  cy.login(token)
  .visit(environmentSystemsPageModel.url).closeTimeZoneModal(); //close time zone popup
});

describe('End-to-end: Systems', () => {
  it('Create a system 🏗️', () => {
    cy.contains('New System').click()
    .get(environmentSystemsPageModel.name).type(systemNameUI)
    .get(environmentSystemsPageModel.vendorName).type(systemNameUI)
    .get(environmentSystemsPageModel.portfolioAssociation).type(orgName)
    .get('.plt__dropdowntreeview__label').contains(orgName).first().click();
    cy.saveClose();
    cy.contains('Your changes have been saved').should('exist');
  });
  it('Update a system 🛠️', () => {
    cy.systemGridSearch(systemNameUI);
    cy.editSystem(systemNameUI);
  });
  it('Export to XLS 📎', () => {
    cy.get('.plt__grid__cell__clickable').should('be.visible');

    cy.log('**Export system to XLS**');
    cy.get(environmentSystemsPageModel.checkBox).first().click();
    cy.contains('Action').click();
    cy.contains('Export XLS').click();
    cy.wait(3000);

    cy.log("**Confirm downloaded file**")
    .task("readDirectory", downloadsFolder).then((value) => {
        expect(value).to.eq(true);
    });

    cy.log('**Remove download folder**')
    .task('deleteFolder', downloadsFolder);
  });
  it('Duplicate then delete system 👬🏻 🗑️', () => {
    cy.systemGridSearch(systemNameUI);
    cy.duplicateSystem();

    cy.get(environmentSystemsPageModel.searchFilter).first().clear()
    .type(systemNameUI).type('{enter}').trigger('input');
    cy.deleteSystem();
  });
});

