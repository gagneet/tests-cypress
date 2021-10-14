import faker from 'faker/locale/en_AU'; // https://www.npmjs.com/package/faker
import { environmentBuildsPageModel } from '../../../pages/environment-page';

let data = [];
let token = '';

const dayjs = require('dayjs');
const today = dayjs().format('DD-MM-YYYYHH:mm:ss');

const organizationId = Cypress.env().users["admin"].organizationId;
const systemName = 'system-' + faker.address.countryCode() + ' ' + today;

before(() => { // token is generated and written to fixtures/data.json before any run-time via support/index.js
  cy.fixture('data').should((data) => {
    token = data.token;
  });
});

beforeEach(() => {
  cy.login(token)
  .visit(environmentBuildsPageModel.url).closeTimeZoneModal();
});

describe('End-to-end: Builds Manager', () => {
  before(() => { // run before each test
    data = { // create System
      'token': token,
      'name': systemName,
      'vendor': faker.company.companyName(),
      'status': 'Active',
      'organizationId': organizationId,
      'description': systemName,
    };
    cy.systems('POST', '', data).then((resp) => {
      expect(resp.status).to.eq(201); // assert status code
      cy.log(`**System '${systemName}' successfully set.** 🔥`);
    });
  });

  it('Create a build 🏗️', () => {
    cy.log('**Open New Build modal and enter details**')
    .get(environmentBuildsPageModel.newBuildBtn).click()
    .get(environmentBuildsPageModel.buildWindow).should('be.visible')
    .get(environmentBuildsPageModel.buildWindow).find('.plt__dropdown__placeholder:first').click().type(systemName)
    .get(`[title="${systemName}"]`).click()
    .get(environmentBuildsPageModel.buildNumberInput).type('buildNumber-' + faker.random.number() + today)
    .get(environmentBuildsPageModel.manualBtn).click()
    .get(environmentBuildsPageModel.buildWindow).find('button:last').click()

    cy.contains('Your changes have been saved').should('exist');
  });
});