import faker from 'faker/locale/en_AU'; // https://www.npmjs.com/package/faker
import dataProviderLegacy from '../../../services/data-provider-legacy';
import { changePageModel } from '../../../pages/release-page';
 
let token = '';
let data = [];
let changeBody ='';

const downloadsFolder = Cypress.config('downloadsFolder');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);
const today = dayjs().format('DD-MM-YYYYHH:mm:ss');
const aPIModel = dataProviderLegacy.getLegacyModel();
const changeName = 'change-' + faker.random.word() + ' ' + today;
const endDateUTC = dayjs().add(1, 'month').utc().format();
const userId = Cypress.env().users['admin'].userId;
const organizationId = Cypress.env().users['admin'].organizationId;

before('Preconditions: token generation and look up fields', () => {
  cy.fixture('data').should((data) => {
    token = data.token;
  }).then(() => {
    // test data which will be used across all tests is created here
    dataProviderLegacy.setToken(token);
    dataProviderLegacy.getLegacyLookupFieldChangePriority();
    dataProviderLegacy.getLegacyLookupFieldChangeStatus();
    dataProviderLegacy.getLegacyLookupFieldChangeType();
    dataProviderLegacy.getLegacyLookupFieldChangeDeliveryRisk();
    dataProviderLegacy.getLegacyLookupFieldChangeTheme();
  });
});

beforeEach(() => {
  cy.login(token)
  .visit(changePageModel.url).loading().closeTimeZoneModal();
});

describe('End-to-end: Change Manager', () => {
  before(() => {
    cy.log('**Pre-condition: Change** 🐙');
    changeBody = {
      'name': changeName,
      'changePriorityId': aPIModel.changePriorityId,
      'changeStatusId': aPIModel.changeStatusId,
      'businessValueScore': faker.random.number({'min': 0, 'max': 100}),
      'organizationId': organizationId,
      'changeTypeId': aPIModel.changeTypeId,
      'changeDeliveryRiskId': aPIModel.changeDeliveryRiskId,
      'expectedDeliveryDate': endDateUTC,
      'changeThemeId': aPIModel.changeThemeId,
      'description': changeName,
      'descriptionSimple': changeName,
      'raisedById': userId,
      'assignedToId': userId
    };
    data = {
      'token': token,
      'body': changeBody
    };
    cy.changes('POST', '', data).then((resp) => {
      expect(resp.status).to.eq(201); // assert status code
      cy.log(`**Change ${changeName} successfully set**`)
    });
  });

  it('Add/edit/delete Change 🏗️', () => {
    cy.get(changePageModel.searchInput).clear()
    .get('.x-hbox-form-item').last().click()
    .get('.x-boundlist-item').contains('All').click() // choose all ownership
    .get('table').should('be.visible').and('have.length.greaterThan', 2) // to confirm that the page completely loaded

    cy.log('**Create new change**')
    .findByTextThenClick('New Change')
    .get(changePageModel.nameInput).type('change-' + faker.random.word() + ' ' + today)
    .get(changePageModel.themeInput).siblings().click().loading()
    .get('.x-boundlist-item').contains(aPIModel.changeThemeName).click()
    .get(changePageModel.deliveryRiskInput).click().loading()
    .get('.x-boundlist-item').contains(aPIModel.changeDeliveryRiskName).click()
    .get(changePageModel.priorityInput).click({force:true}).loading()
    .get('.x-boundlist-item-over').click()
    .findByTextThenClick('Save').loading();
    
    cy.log('**Edit change**')
    .get(changePageModel.nameInput).clear().type('change-' + faker.random.word() + ' ' + today)
    .findByTextThenClick('Save').loading();

    cy.log('**Delete change**')
    .get('.btn-danger').click()
    .get('.x-message-box').find('.btn-danger').click().loading();
  });
  it('Duplicate change 🏗️', () => {
    cy.get('table').should('be.visible'); // to confirm that the page completely loaded

    cy.log('**Search a change**')
    .get(changePageModel.searchInput).clear().type(changeName)
    .get('table').should('have.length', 1)
    .get(changePageModel.changeNameColumn).should('contain', changeName);

    cy.log('**Duplicate change**')
    .get('.x-grid-row-checker').click()
    .findByTextThenClickForce('Action')
    .findByTextThenClickForce('Duplicate')
    .get(changePageModel.duplicateWindow).find('.x-btn-inner-default-small').contains('Duplicate').click().loading()
    .get('table').should('have.length', 2);
  });
  it('Export Changes to XLS 🏗️', () => {
    cy.log('**Search changes**')
    .get(changePageModel.searchInput).clear()
    .get('table').should('have.length.greaterThan', 2)
    .get(changePageModel.searchInput).type(changeName).loading()
    .get('table').should('have.length', 2)
    .get(changePageModel.changeNameColumn).then((el)=>{
      cy.get(el).should('contain', changeName);
    });

    cy.log('**Action drop down menu**')
    .findByTextThenClick('Action')
    .findByTextThenClickForce('Export to XLS')
    .wait(3000); // envt is slow. need to wait to downloaded file

    cy.log("**Confirm downloaded file**")
    .task("readDirectory", downloadsFolder).then((value) => {
        expect(value).to.eq(true);
    });

    cy.log('**Remove download folder**')
    .task('deleteFolder', downloadsFolder);
  });
  it('Bulk lock and bulk unlock changes 🏗️', () => { 
    cy.get('table').should('be.visible'); // to confirm that the page completely loaded

    cy.log('**Search changes**')
    .get(changePageModel.searchInput).clear()
    .get('table').should('have.length.greaterThan', 2)
    .get(changePageModel.searchInput).type(changeName).loading()
    .get('table').should('have.length', 2)
    .get(changePageModel.changeNameColumn).then((el)=>{
      cy.get(el).should('contain', changeName);
    });

    cy.log('**Bulk lock changes**')
    .get('.x-column-header-checkbox').click({force:true})
    .findByTextThenClick('Action')
    .get('.bulkLockChangeAction').click({force:true})
    .get('[fill="#CBCCCD"]').should('have.length', 2);

    cy.log('**Bulk unlock changes**')
    .findByTextThenClick('Action')
    .findByTextThenClickForce('Unlock Selected Items').loading()
    .get('[fill="#00AEEF"]').should('have.length', 2);
  });
  it('Bulk delete 🏗️', () => {
    cy.log('**Search changes**')
    .get(changePageModel.searchInput).clear()
    .get('table').should('have.length.greaterThan', 2)
    .get(changePageModel.searchInput).type(changeName).loading()
    .get('table').should('have.length', 2)
    .get(changePageModel.changeNameColumn).then((el)=>{
      cy.get(el).should('contain', changeName);
    });

    cy.log('**Bulk delete changes**')
    .get('.x-column-header-checkbox').click()
    .findByTextThenClick('Action')
    .findByTextThenClickForce('Delete')
    .get('.x-message-box').find('.btn-danger').click().loading()
    .get('.x-grid-empty').should('contain', 'No Matching Records');
  });
});