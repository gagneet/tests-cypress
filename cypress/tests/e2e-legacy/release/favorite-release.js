import faker from 'faker/locale/en_AU'; // https://www.npmjs.com/package/faker
import dataProviderLegacy from '../../../services/data-provider-legacy';
import { releasePageModel } from '../../../pages/release-page';

let token = '';
let data = [];

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);
const today = dayjs().format('DD-MM-YYYYHH:mm:ss');
const endDateUTC = dayjs().add(1, 'month').utc().format();

const organizationId = Cypress.env().users['admin'].organizationId;
const releaseName = 'release-' + faker.random.word() + ' ' + today;
const aPIModel = dataProviderLegacy.getLegacyModel();

before('Preconditions: token generation and look up fields', () => {
  cy.fixture('data').should((data) => {
    token = data.token;
  }).then(() => {
    // test data which will be used across all tests is created here
    dataProviderLegacy.setToken(token);
    dataProviderLegacy.getLegacyLookupFieldReleaseRiskLevel(); // look up field for releases
    dataProviderLegacy.getLegacyLookupFieldReleaseStatusType();
    dataProviderLegacy.getLegacyLookupFieldReleaseType();
  });
});

beforeEach(() => {
  cy.login(token)
  .visit(releasePageModel.url).loading().closeTimeZoneModal();
});
describe('End-to-end: Release Manager', () => {
  before(() => {
    cy.log('**Pre-condition: Create new Release** 🐙');
    data = { // create Enterprise Release
      'token': token,
      'identifier': releaseName,
      'name': releaseName,
      'summary': 'summary for ' + releaseName,
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
    cy.releases('POST', '', data).then((resp)=>{
      expect(resp.status).to.eq(201); // assert status code
      cy.log(`**Release ${releaseName} successfully set**`)
    })
  });
  it('Favorites release', () => {
    cy.log('**Set release to favorites** ⭐')
    .search(releaseName)
    .get(releasePageModel.releaseWindow).should('be.visible')
    .get(releasePageModel.favBtn).click()
    .saveClose().loading();

    cy.log('**Confirm favorite release in navbar**')
    .get('.plt__navbar__nav__panel__actions--menu').first().click()
    .get('.plt__navbar__nav__panel__actions__menu__submenu__secondary').contains('Favorite Releases').click()
    .get('.plt__navbar__nav__panel__actions__menu__submenu').children().last().then((el)=>{
      let content = el.text()
      if (content===`E${releaseName}`){
        cy.log('**Release succesfully set to favorites** 🔥')
      }
    });
    
    cy.log('**Delete release** 🗑️')
    .search(releaseName)
    .get('.release-window-footer').find('.btn-danger').click()
    .get('.x-message-box').find('.btn-danger').click().loading();
  });
});