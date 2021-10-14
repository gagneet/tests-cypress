import faker from 'faker/locale/en_AU'; // https://www.npmjs.com/package/faker
import { v4 as uuidv4 } from 'uuid';
import dataProviderLegacy from '../../services/data-provider-legacy';

let data = [];
let token = '';
let environmentId = '';
let environmentName = '';
let systemId = '';

const userName = Cypress.env().users['admin'].username;
const environmentHealthCheck = dataProviderLegacy.getLegacyModel();
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);
const today = dayjs().format('DD-MM-YYYYHH:mm:ss');
const endDateUTC = dayjs().add(1, 'month').utc().format();
const todayUTC = dayjs().utc().format(); // convert local time to UTC time

before(() => { // token is generated and written to fixtures/data.json before any run-time via support/index.js
  cy.auth().should((resp) => {
    cy.log(`Access token '${resp.body.access_token}' successfully generated.`);
    token = resp.body.access_token;
  }).then(() => {
    // test data which will be used across all tests is created here
    dataProviderLegacy.setToken(token);
    dataProviderLegacy.getOrganization();
    dataProviderLegacy.getLegacyLookupFieldReleaseRiskLevel();
    dataProviderLegacy.getLegacyLookupFieldReleaseStatusType();
    dataProviderLegacy.getLegacyLookupFieldReleaseType();
    dataProviderLegacy.getLegacyLookupUsedForWorkItem();
    dataProviderLegacy.getLegacyLookupEnvironmentStatus();
  });
});

describe(['environment'], 'Integration: Environment Health Checks', ()=> {
  beforeEach(() => { // run before each test
    // Create System
    data = {
      'token': token,
      'name': 'system-' + faker.random.word() + ' ' + + today,
      'vendor': userName,
      'status': 'Active',
      'organizationId': environmentHealthCheck.organizationId,
      'description': 'description-' + faker.random.word() + ' ' + + today,
    };
    cy.systems('POST', '', data).then((resp) => { // Create System
      systemId = resp.body.id;
      cy.log(`system '${systemId}' successfully set`);

      // Create Envts
      data = {
         'token': token,
         'name': 'env-' + faker.random.word() + ' ' + today,
         'vendor': faker.company.companyName(),
         'linkedSystemId': systemId,
         'usageWorkItemId': environmentHealthCheck.usedForWorkItem,
         'environmentStatusId': environmentHealthCheck.environmentStatus,
         'environmentStatus': 'Active',
         'color': faker.internet.color(),
         'isSharedEnvironment': true,
         'hosts': []
      };
      cy.environments('POST', '',data).should((resp) => { // Create an Envt
        environmentId = resp.body.id;
        environmentName = resp.body.name;
        cy.log(`Environment '${environmentId}' successfully created.`);
    });
  });
  });

  it('Admin - Create EnvironmentHealthCheck', () => {
    cy.log('**Call environmentHealthCheck API with correct token** 🔥');
    data = {
      'token': token,
      'environmentId': environmentId,
      'health': 1,
      'testName': faker.random.word() + ' ' + today,
    };
   cy.environmentHealthCheck('POST', '', data).should((resp) => {
      expect(resp.status).to.eq(200); // assert status code TODO: should be 201!
      expect(resp.headers).to.have.property('content-type', 'application/json'); // assert properties
      //expect(resp.body.data.Messages).to.include("Created record for EnvironmentTransaction"); // TODO: to complete
      //expect(resp.body.data.Data).eq(null);
     // expect(resp.body.data.Status).eq('Success');
      cy.log('environmentHealthCheck successfully created.');
    });

    cy.log('**Call Environments API with incorrect token** 🔥');
    cy.environmentHealthCheck('POST', '', { 'token': uuidv4() }).should((resp) => {
      expect(resp.status).to.eq(401);//will be 401
      cy.log('Error is incorrect token.');
    });

    cy.log('**Call Environments API with empty content** 🔥');
    data = {
      'token': token,
      'environmentId': '',
    };
    cy.environmentHealthCheck('POST', '', data).should((resp) => {
      expect(resp.status).to.eq(400);
      cy.log(`Error is '${resp.body.Messages}'.`);
    });
  });

  it('Admin - Create EnvironmentHealthCheck /fullHistory', () => {
    cy.log('**Call environmentHealthCheck API with correct token** 🔥');
    data = {
      'token': token,
      'environmentId': environmentId,
      'startDate': todayUTC,
      'endDate': endDateUTC,
    };
   cy.environmentHealthCheck('POST', '/fullHistory', data).should((resp) => {
      expect(resp.status).to.eq(200); // assert status code TODO: should be 201!
      expect(resp.headers).to.have.property('content-type', 'application/json'); // assert properties
      //expect(resp.body.data.Messages).to.include([]); // TODO: to complete
      //expect(resp.body.data.Data).eq(null);
     // expect(resp.body.data.Status).eq('Success');
      cy.log('environmentHealthCheck successfully created.');
    });

    cy.log('**Call Environments API with incorrect token** 🔥');
    cy.environmentHealthCheck('POST', '/fullHistory', { 'token': uuidv4() }).should((resp) => {
      expect(resp.status).to.eq(401);//will be 401
      cy.log('Error is incorrect token.');
    });

    cy.log('**Call Environments API with empty content** 🔥');
    data = {
      'token': token,
      'environmentId': '',
    };
    cy.environmentHealthCheck('POST', '/fullHistory', data).should((resp) => {
      expect(resp.status).to.eq(400);
      cy.log(`Error is '${resp.body.Messages}'.`);
    });
  });

  it('Admin - Create EnvironmentHealthCheck /currentStatus', () => {
    cy.log('**Call environmentHealthCheck API with correct token** 🔥');
    data = {
      'token': token,
      'environmentIds': [environmentId] // qa code issue to put
    };
   cy.environmentHealthCheck('POST', '/currentStatus', data).should((resp) => {
      expect(resp.status).to.eq(200); // assert status code TODO: should be 201!
      expect(resp.headers).to.have.property('content-type', 'application/json'); // assert properties
      //expect(resp.body.data.Messages).to.include([]); // TODO: to complete
      //expect(resp.body.data.Data).eq(null);
     // expect(resp.body.data.Status).eq('Success');
      cy.log('environmentHealthCheck successfully created.');
    });

    cy.log('**Call Environments API with incorrect token** 🔥');
    cy.environmentHealthCheck('POST', '/currentStatus', { 'token': uuidv4() }).should((resp) => {
      expect(resp.status).to.eq(401);//will be 401
      cy.log('Error is incorrect token.');
    });

    cy.log('**Call Environments API with empty content** 🔥');
    data = {
      'token': token,
      'environmentIds': '',
    };
    cy.environmentHealthCheck('POST', '/currentStatus', data).should((resp) => {
      expect(resp.status).to.eq(400);
      cy.log(`Error is '${resp.body.Messages}'.`);
    });
  });
});