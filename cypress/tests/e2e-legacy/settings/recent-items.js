import faker from 'faker/locale/en_AU'; // https://www.npmjs.com/package/faker
import dataProviderLegacy from '../../../services/data-provider-legacy';
import {releasePageModel} from '../../../pages/release-page';
import { homePageModel } from '../../../pages/home-page';

let token = '';
let data = [];

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);
const today = dayjs().format('DD-MM-YYYYHH:mm:ss');
const endDateUTC = dayjs().add(1, 'month').utc().format();

const organizationId = Cypress.env().users['admin'].organizationId;
const enterpriseReleaseName = 'er-' + faker.random.word() + ' ' + today;
const aPIModel = dataProviderLegacy.getLegacyModel();

before('Preconditions: token generation and look up fields', () => {
  cy.fixture('data').should((data) => {
    token = data.token;
  }).then(() => {
    // test data which will be used across all tests is created here
    dataProviderLegacy.setToken(token);
    dataProviderLegacy.getLegacyLookupFieldChangeDeliveryRisk();
    dataProviderLegacy.getLegacyLookupFieldChangePriority();
    dataProviderLegacy.getLegacyLookupFieldChangeStatus();
    dataProviderLegacy.getLegacyLookupFieldChangeTheme();
    dataProviderLegacy.getLegacyLookupFieldChangeType();
    dataProviderLegacy.getLegacyLookupFieldReleaseRiskLevel(); // look up field for releases
    dataProviderLegacy.getLegacyLookupFieldReleaseStatusType();
    dataProviderLegacy.getLegacyLookupFieldReleaseType();
    dataProviderLegacy.getLegacyLookupSystemRoleDependencyType();
  });
});

beforeEach(() => {
  cy.login(token)
  .visit(releasePageModel.url).loading().closeTimeZoneModal();
});

describe('End-to-end: Tests and updates recent items', () => {
  before(() => {
    cy.log('**Pre-condition: Create new Release** 🐙');
    data = { 
      'token': token,
      'identifier': enterpriseReleaseName,
      'name': enterpriseReleaseName,
      'summary': enterpriseReleaseName,
      'releaseTypeId': aPIModel.releaseTypeId,
      'location': faker.address.country(),
      'releaseStatusTypeId': aPIModel.releaseStatusTypeId,
      'releaseRiskLevelId': aPIModel.releaseRiskLevelId,
      'implementationDate': endDateUTC,
      'displayColor': faker.internet.color(),
      'organizationId': organizationId,
      'parentReleaseId': null,
      'parentRelease': null,
      'plutoraReleaseType': 'Enterprise',
      'releaseProjectType': 'None'
    };
    cy.releases('POST', '', data).then((resp) => {
      expect(resp.status).to.eq(201); // assert status code
      cy.log(`**Release ${enterpriseReleaseName} successfully set**`)
    });
  });

  it('Navigates to a recent item', () => {
    cy.search(enterpriseReleaseName)
    .get('.releaseWindow').should('be.visible')
    .get('[name="Name"]').clear().type('new description')
    .saveClose().loading()
    .get(homePageModel.recentItems).click() //click on recent items tab
    .get(homePageModel.item).first().click() //click on first index
    .get('.releaseWindow').should('be.visible')
    .get('.sub-title').contains(enterpriseReleaseName)
    .saveClose().loading();
  });
});
