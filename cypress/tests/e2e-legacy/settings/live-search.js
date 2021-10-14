import faker from 'faker/locale/en_AU'; // https://www.npmjs.com/package/faker
import {changePageModel} from '../../../pages/release-page';
import {homePageModel} from '../../../pages/home-page';

import dataProviderLegacy from '../../../services/data-provider-legacy';

let token = '';
let data = [];
let systemId = '';
let releaseId = '';
let releaseIdParent = '';
let changeId = '';
let changeBody ='';

const downloadsFolder = Cypress.config('downloadsFolder');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);
const today = dayjs().format('DD-MM-YYYYHH:mm:ss');
const endDateUTC = dayjs().add(1, 'month').utc().format();
const userId = Cypress.env().users['admin'].userId;
const organizationId = Cypress.env().users['admin'].organizationId;
const changeName = 'change-' + faker.random.word() + ' ' + today;
const changeReleaseName = 'release-' + faker.random.word() + ' ' + today;
const systemName = 'system-' + faker.random.word() + ' ' + today;
const vendor = faker.company.companyName();
const aPIModel = dataProviderLegacy.getLegacyModel();

before('Preconditions: token generation and look up fields', () => {
  cy.fixture('data').should((data) => {
    token = data.token;
  }).then(() => {
    // test data which will be used across all tests is created here
    dataProviderLegacy.setToken(token);
    dataProviderLegacy.getLegacyLookupFieldReleaseRiskLevel();
    dataProviderLegacy.getLegacyLookupFieldReleaseStatusType();
    dataProviderLegacy.getLegacyLookupFieldReleaseType();
    dataProviderLegacy.getLegacyLookupFieldChangePriority();
    dataProviderLegacy.getLegacyLookupFieldChangeStatus();
    dataProviderLegacy.getLegacyLookupFieldChangeType();
    dataProviderLegacy.getLegacyLookupFieldChangeDeliveryRisk();
    dataProviderLegacy.getLegacyLookupFieldChangeTheme();
  });
});

beforeEach(() => {
  cy.login(token)
  .visit(homePageModel.url).loading().closeTimeZoneModal(); //close time zone popup
});

describe('End-to-end: Change Manager', () => {
  before(() => {
    cy.log('**Pre-condition: Create new System, Release & Change** 🐙');
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
      changeId = resp.body.id;
      cy.log(`**Change '${changeName}' successfully set.** ⭐`);

      cy.log('**Create system** 🌳');
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
        systemId = resp.body.id;
        cy.log(`**System '${systemName}' successfully set.** ⭐`);
        
        cy.log('**Create Release** 🌳');
        data = { // create Project Release
          'token': token,
          'identifier':changeReleaseName,
          'name':changeReleaseName,
          'summary':changeName,
          'releaseTypeId': aPIModel.releaseTypeId,
          'location': faker.address.country(),
          'releaseStatusTypeId': aPIModel.releaseStatusTypeId,
          'releaseRiskLevelId': aPIModel.releaseRiskLevelId,
          'implementationDate': endDateUTC,
          'displayColor': faker.internet.color(),
          'organizationId': organizationId,
          'parentReleaseId': releaseIdParent,
          'parentRelease': null,
          'plutoraReleaseType': 'Independent',
          'releaseProjectType': 'NotIsProject'
        };
        cy.releases('POST', '', data).then((resp) => {
          expect(resp.status).to.eq(201); // assert status code
          releaseId = resp.body.id;
          cy.log(`**Release '${changeReleaseName}' successfully set.** 🔥`);
          
          cy.log('**Set a system on a release** 🌳');
          data = { // link Release and System
            'token': token,
            'systemId': systemId,
            'systemRoleDependencyTypeId': aPIModel.systemRoleDependencyTypeId
          };
          cy.releases('POST', `/${releaseId}/systems`, data).then(() => {
            expect(resp.status).to.eq(201); // assert status code
            cy.log(`**System '${systemName}' successfully set on '${changeReleaseName}'** 🔥`);
          });
        });
      });
    });
  });

  it('Searches and navigates to Change Name', () => {
    cy.log('**Visit site and click Search**')
    .search(changeName)
    .get('.changeWindowCls').should('be.visible');

    cy.log('**Delete change** 🗑️')
    .get('.btn-danger').first().click()
    .get('.x-message-box').find('.btn-danger').click().loading();
  });

  it('Searches and navigates to Release Name', () => {
    cy.log('**Visit site and click Search**')
    .search(changeReleaseName)
    .get('.releaseWindow').should('be.visible');

    cy.log('**Delete release** 🗑️')
    .get('.btn-danger').last().click()
    .get('.x-message-box').find('.btn-danger').click().loading();
  });
  it('Searches and navigates to System Name', () => {
    cy.log('**Visit site and click Search**')
    .search(systemName)
    .get('.plt__texteditor__label').should('be.visible');

    cy.log('**Delete system** 🗑️')
    .get('.plt__button--tertiary').contains('Action').click()
    .get('.delete').click()
    .get('.plt__button--delete').click()
  });
});