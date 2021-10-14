import faker from 'faker/locale/en_AU'; // https://www.npmjs.com/package/faker
import { environmentRequestsPageModel } from '../../../pages/environment-page';
import dataProviderLegacy from '../../../services/data-provider-legacy';

let token = '';
let data = [];

const userName = Cypress.env().users['admin'].username;
const userId = Cypress.env().users['admin'].userId;
const organizationId = Cypress.env().users['admin'].organizationId;
const requestModel = dataProviderLegacy.getLegacyModel();

const date = new Date();
const dateNow = date.toISOString();
date.setDate(date.getDate() + 10); // no. of days to be added from today
const dateFuture = date.toISOString(); // converts to UTC format

let systemId = '';
let systemName = '';
let releaseId = '';
let releaseName = '';
let tebrId = '';
let tebrIdWithRelease = '';
let tebrTitle = '';
let tebrBody = [];

before('Preconditions: token generation and look up fields',() => {
  cy.fixture('data').should((data) => {
    token = data.token;
  }).then(() => {
    // test data which will be used across all tests is created here
    dataProviderLegacy.setToken(token);
    dataProviderLegacy.getOrganization();
    dataProviderLegacy.getLegacyLookupFieldReleaseRiskLevel();
    dataProviderLegacy.getLegacyLookupFieldReleaseStatusType();
    dataProviderLegacy.getLegacyLookupFieldReleaseType();
    dataProviderLegacy.getLegacyLookupFieldBookingRequestStatus();
    dataProviderLegacy.getLegacyLookupFieldBookingRequestType();
  });
});

beforeEach(() => {
  cy.login(token);
});

describe('End-to-end: Environment Requests', () => {
  before(() => {
    cy.log('**Create new TEBR**');
    systemName = 'system-' + faker.random.word() + ' ' + dateNow;
    data = {
      'token': token,
      'name': systemName,
      'vendor': userName,
      'status': 'Active',
      'organizationId': organizationId,
      'description': systemName
    };
    cy.systems('POST', '', data).then((resp) => { // create System
      systemId = resp.body.id;
      cy.log(`system '${systemId}' successfully set.`);

      releaseName = 'release-' + faker.random.word() + ' ' + dateNow;
      data = {
        'token': token,
        'identifier': releaseName,
        'name': releaseName,
        'summary': releaseName,
        'releaseTypeId': requestModel.releaseTypeId,
        'location': faker.address.country(),
        'releaseStatusTypeId': requestModel.releaseStatusTypeId,
        'releaseRiskLevelId': requestModel.releaseRiskLevelId,
        'implementationDate': dateNow,
        'displayColor': faker.internet.color(),
        'organizationId': organizationId,
        'plutoraReleaseType': 'Enterprise',
        'releaseProjectType': 'None'
      };
      cy.releases('POST', '', data).then((resp) => { // create release
        releaseId = resp.body.id;
        cy.log(`release '${releaseId}' successfully set.`);

        tebrTitle = 'tebr-' + faker.random.word() + ' ' + dateNow; // create TEBR not linked to a release
        tebrBody = {
          'title': tebrTitle,
          'releaseID': null,
          'phaseID': null,
          'startDate': dateNow,
          'endDate': dateFuture,
          'assignedToID': userId,
          'requestorID': userId,
          'description': tebrTitle,
          'statusID': requestModel.bookingRequestStatusId,
          'typeID': requestModel.bookingRequestTypeId,
          'systems':[ // TODO: link system id if required in future tests
            // {
            //     'systemId': systemId,
            //     'systemRoleType': 'Impact',
            //     'systemRoleDependencyTypeId': requestModel.systemRoleDependencyTypeId
            // }
          ]
        };
        data = {
          'token': token,
          'body': tebrBody
        };
        cy.tebrs('POST', '', data).then((resp) => { // create TEBR
          tebrId = resp.body.id;
          expect(resp.body.isEnvironmentOnly).eq(true); // if releaseID is null, this should always be set to true
          cy.log(`tebr without release '${tebrId}' successfully set.`);
        });

        tebrTitle = 'tebr-' + faker.random.word() + ' ' + dateNow; // create TEBR linked to a release
        tebrBody = {
          'title': tebrTitle,
          'releaseID': releaseId,
          'phaseID': null,
          'startDate': dateNow,
          'endDate': dateFuture,
          'assignedToID': userId,
          'requestorID': userId,
          'description': tebrTitle,
          'statusID': requestModel.bookingRequestStatusId,
          'typeID': requestModel.bookingRequestTypeId,
          'systems':[ // TODO: link system id if required in future tests
            // {
            //     'systemId': systemId,
            //     'systemRoleType': 'Impact',
            //     'systemRoleDependencyTypeId': requestModel.systemRoleDependencyTypeId
            // }
          ]
        };
        data = {
          'token': token,
          'body': tebrBody
        };
        cy.tebrs('POST', '', data).then((resp) => { // create TEBR
          tebrIdWithRelease = resp.body.id;
          expect(resp.body.isEnvironmentOnly).eq(false); // if releaseID is not null, this should always be set to false
          cy.log(`tebr with release '${tebrIdWithRelease}' successfully set.`);
        });
      });
    });
  });

  it('Check TEBR modal in UI created via External API ☑️', () => {
    cy.log('**Check TEBR without release defaults to Booking with Environment Only**')
    .visit(environmentRequestsPageModel.url + `/tebr/${tebrId}`) // directly opens up the TEBR modal
    .contains('Project/Release Details').click()
    .get('[class="x-field bookingEnvBlock x-form-item x-form-item-default x-form-type-radio x-box-item x-field-default x-vbox-form-item x-form-item-no-label x-form-cb-checked x-form-dirty"]').should('be.visible');

    cy.log('**Check TEBR with a linked release defaults to Booking with Project/Release**')
    .visit(environmentRequestsPageModel.url + `/tebr/${tebrIdWithRelease}`)
    .contains('Project/Release Details').click()
    .get('[class="x-field x-form-item x-form-item-default x-form-type-radio x-box-item x-field-default x-vbox-form-item x-form-item-no-label x-form-cb-checked"]').should('be.visible');
  });
});