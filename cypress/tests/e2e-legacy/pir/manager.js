import faker from 'faker/locale/en_AU'; // https://www.npmjs.com/package/faker
import { pIRManagerPageModel, pirModalModel } from '../../../pages/pir-page';
import { commonPageModel } from '../../../pages/home-page';
import dataProviderLegacy from '../../../services/data-provider-legacy';

let token = '';
let data = [];
let systemId = '';
let releaseId = '';

const downloadsFolder = Cypress.config('downloadsFolder');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);
const today = dayjs().format('DD-MM-YYYYHH:mm:ss');
const endDateUTC = dayjs().add(1, 'month').utc().format();
const resultEmpty = 'No Matching Records';
const recordColumn = pIRManagerPageModel.pirSummaryLink;

const userGroupName = Cypress.env().users['admin'].userGroupName;
const organizationId = Cypress.env().users['admin'].organizationId;
const systemName = 'system-' + faker.random.word() + ' ' + today;
const releaseName = 'er-' + faker.random.word() + ' ' + today;
const pirNameUI = 'pir-' + faker.random.word() + ' ' + today;
const aPIModel = dataProviderLegacy.getLegacyModel();
const vendor = faker.company.companyName();

before('Preconditions: token generation and look up fields', () => {
  cy.fixture('data').should((data) => {
    token = data.token;
  }).then(() => {
    // test data which will be used across all tests is created here
    dataProviderLegacy.setToken(token);
    dataProviderLegacy.getLegacyLookupPIRItemStatus();
  });
});

beforeEach(() => {
  cy.login(token)
  .visit(pIRManagerPageModel.url).loading().closeTimeZoneModal();
});

describe('End-to-end: PIR Manager', () => {
  it('Create, edit and delete PIR 🏗️', () => {
    cy.contains('New PIR Item').click()
    .get(pirModalModel.pirWindow).should('be.visible');

    cy.log('**Create PIR**')
    .get(pirModalModel.summaryInput).eq(0).type(pirNameUI)
    .get(pirModalModel.descriptionInput).eq(0).type(pirNameUI)
    .get(pirModalModel.statusList).click()
    .get('.x-boundlist-item').contains(aPIModel.pIRItemStatusName).click()
    .get(pirModalModel.saveBtn).click().loading();

    cy.log('Edit PIR**')
    .get(pirModalModel.descriptionInput).eq(0).type('this is the description for ' + pirNameUI)
    .get(pirModalModel.saveBtn).click().loading();

    cy.log('**Delete PIR**')
    .get('.btn-danger').click()
    .get('.x-message-box').find('.btn-danger').click().loading();
  });
});