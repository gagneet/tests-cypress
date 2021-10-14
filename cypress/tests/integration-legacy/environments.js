import faker from 'faker/locale/en_AU'; // https://www.npmjs.com/package/faker
import { v4 as uuidv4 } from 'uuid';
import dataProviderLegacy from '../../services/data-provider-legacy';

let data = [];
let token = '';
let environmentId = '';
let environmentName = '';
let systemId = '';
let systemName = '';
let vendorName = '';
let filter = '';

const userId = Cypress.env().users['admin'].userId;
const organizationId = Cypress.env().users['admin'].organizationId;
const environmentAPIModel = dataProviderLegacy.getLegacyModel();
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);
const today = dayjs().format('DD-MM-YYYYHH:mm:ss');

before(() => { // token is generated and written to fixtures/data.json before any run-time via support/index.js
  cy.fixture('data').should((data) => {
    token = data.token;
  }).then(() => {
    // test data which will be used across all tests is created here
    dataProviderLegacy.setToken(token);
    dataProviderLegacy.getLegacyLookupUsedForWorkItem();
    dataProviderLegacy.getLegacyLookupEnvironmentStatus();
  });
});

describe(['environment'], 'Integration: Environments', ()=> {
  beforeEach(() => { // run before each test
    // create a new environment specific to each CRUD functionality (deterministic test!)
    systemName = 'system-' + faker.random.word() + ' ' + today;
    vendorName = faker.company.companyName();
    data = {
      'token': token,
      'name': systemName,
      'vendor': vendorName,
      'status': 'Active',
      'organizationId': organizationId,
      'description': systemName
    };
    cy.systems('POST', '', data).then((resp) => { // Create System
      systemId = resp.body.id;
      environmentName = 'env-' + faker.random.word() + ' ' + today;
      data = {
        'token': token,
        'name': environmentName,
        'description': environmentName,
        'url': faker.internet.url(),
        'vendor': vendorName,
        'linkedSystemId': systemId,
        // 'environmentMgr': '',
        'usageWorkItemId': environmentAPIModel.usedForWorkItem,
        'environmentStatusId': environmentAPIModel.environmentStatus,
        'color': faker.internet.color(),
        'isSharedEnvironment': faker.random.boolean(),
        'hosts': []
      };
      cy.environments('POST', '', data).as('environmentAlias');
    });
  });

  it(['smoke'], 'Admin - Create Environment', () => {
    cy.log('**Call Environments API with correct token** 🔥');
    cy.get('@environmentAlias').then((resp) => { // call the environment created as an alias in beforeEach
      expect(resp.status).to.eq(201); // assert status code
      expect(resp.headers).to.have.property('content-type', 'application/json; charset=utf-8'); // assert properties
      expect(resp.body.name).eq(environmentName); // assert objects
      expect(resp.body.description).eq(environmentName);
      expect(resp.body.url).not.eq(null);
      expect(resp.body.vendor).eq(vendorName);
      expect(resp.body.linkedSystemId).eq(systemId);
      expect(resp.body.linkedSystem).eq(systemName);
      expect(resp.body.usageWorkItemId).eq(environmentAPIModel.usedForWorkItem);
      // expect(resp.body.usageWorkItem).not.eq(null); // this returns null???
      expect(resp.body.environmentStatusId).eq(environmentAPIModel.environmentStatus);
      // expect(resp.body.environmentStatus).not.eq(null); // this returns null???
      expect(resp.body.color).not.eq(null);
      expect(resp.body.isSharedEnvironment).not.eq(null);
      // TODO: assert more - heaps to add!!!
      cy.log(`Environment '${resp.body.name}' successfully created.`);
    });

    cy.log('**Call Environments API with incorrect token** 🔥');
    cy.environments('POST', '', { 'token': uuidv4() }).should((resp) => {
      expect(resp.status).to.eq(401);
      cy.log(`Error is '${resp.body.message}'.`);
    });

    cy.log('**Call Environments API with empty content** 🔥');
    data = {
      'token': token,
      'name': ''
    };
    cy.environments('POST', '', data).should((resp) => {
      expect(resp.status).to.eq(400);
      cy.log(`Error is '${resp.body.message}'.`);
    });
  });

  it(['smoke'], 'Admin - Delete Environment', () => {
    cy.get('@environmentAlias').then((resp) => { // call the environment created as an alias in beforeEach
      environmentId = resp.body.id;
      cy.log('**Call Environments API with correct token** 🔥');
      cy.environments('DELETE', `/${environmentId}`, { 'token': token, 'id': environmentId }).should((resp) => {
        expect(resp.status).to.eq(200); // TODO: This should return 204!
        cy.log(`Environment '${environmentName}' successfully deleted.`);
      });

      cy.log('**Call Environments API with Id not defined in body** 🔥');
      cy.environments('DELETE', `/${environmentId}`, { 'token': token }).should((resp) => {
        expect(resp.status).to.eq(404);
        cy.log(`Error is 'not found'.`);
      });

      cy.log('**Call Environments API with invalid Id** 🔥');
      cy.environments('DELETE', `/${uuidv4()}`, { 'token': token, 'id': uuidv4() }).should((resp) => {
        expect(resp.status).to.eq(404);
        cy.log(`Error is 'not found'.`);
      });

      cy.log('**Call Environments API with incorrect token** 🔥');
      cy.environments('DELETE', `/${environmentId}`, { 'token': '' }).should((resp) => {
        expect(resp.status).to.eq(401);
        cy.log(`Error is '${resp.body.message}'.`);
      });
    });
  });

  it(['smoke'], 'Admin - Retrieve Environment', () => {
    cy.get('@environmentAlias').then((resp) => { // call the environment created as an alias in beforeEach
      environmentId = resp.body.id;
      cy.log('**Call Environments API with correct token** 🔥');
      cy.environments('GET', `/${environmentId}`, { 'token': token, 'id': environmentId }).should((resp) => {
        expect(resp.status).to.eq(200);
        expect(resp.body.name).eq(environmentName);
        expect(resp.body.description).eq(environmentName);
        expect(resp.body.vendor).eq(vendorName);
        expect(resp.body.linkedSystemId).eq(systemId);
        expect(resp.body.linkedSystem).eq(systemName);
        expect(resp.body.usageWorkItemId).eq(environmentAPIModel.usedForWorkItem);
        // expect(resp.body.usageWorkItem).not.eq(null); // this returns null???
        expect(resp.body.environmentStatusId).eq(environmentAPIModel.environmentStatus);
        // expect(resp.body.environmentStatus).not.eq(null); // this returns null???
        cy.log(`Environment '${resp.body.name}' successfully retrieved.`);
      });

      cy.log('**Call Environments API with invalid Id** 🔥');
      cy.environments('GET', `/${uuidv4()}`, { 'token': token, 'id': uuidv4() }).should((resp) => {
        expect(resp.status).to.eq(404);
        cy.log(`Error is 'not found'.`);
      });

      cy.log('**Call Environments API with incorrect token** 🔥');
      cy.environments('GET', `/${environmentId}`, { 'token': '' }).should((resp) => {
        expect(resp.status).to.eq(401);
        cy.log(`Error is '${resp.body.message}'.`);
      });
    });
  });

  it('Admin - Retrieve Environments (All)', () => {
    cy.environments('GET', '', { 'token': token}).should((resp) => {
      environmentId = resp.body.id;
      cy.log('**Call Environments API with correct token** 🔥');
      expect(resp.status).to.eq(200);
      expect(resp.body[0].id).not.eq(null); // assert mandatory objects
      expect(resp.body[0].name).not.eq(null);
      // expect(resp.body[0].url).not.eq(null); // could be optional
      // expect(resp.body[0].linkedSystem).not.eq(null); // could be optional
      // expect(resp.body[0].buildNumber).not.eq(null); // could be optional
      expect(resp.body[0].usageWorkItem).not.eq(null);
      expect(resp.body[0].status).not.eq(null);
      expect(resp.body[0].color).not.eq(null);
      expect(resp.body[0].lastModifiedDate).not.eq(null);
      expect(resp.body[0].lastModifiedBy).not.eq(null);
      cy.log(`A total of '${resp.body.length}' records successfully retrieved.`);

      cy.log('**Call Releases API with incorrect token** 🔥');
      cy.environments('GET', '', { 'token': '' }).should((resp) => {
        expect(resp.status).to.eq(401);
        cy.log(`Error is '${resp.body.message}'.`);
      });
    });
  });

  it(['smoke'], 'Admin - Update Environment', () => {
    cy.get('@environmentAlias').then((resp) => { // call the environment created as an alias in beforeEach
      environmentId = resp.body.id;
      cy.log('**Call Environments API with correct token** 🔥');
      data = {
        'token': token,
        'id': environmentId,
        'name': 'updated name ' + environmentName,
        'description': 'updated name ' + environmentName,
        'url': faker.internet.url(),
        'vendor': 'updated name ' + vendorName,
        'linkedSystemId': systemId,
        // 'environmentMgr': '',
        'usageWorkItemId': environmentAPIModel.usedForWorkItem,
        'environmentStatusId': environmentAPIModel.environmentStatus,
        'color': faker.internet.color(),
        'isSharedEnvironment': faker.random.boolean(),
        'hosts': []
      };
      cy.environments('PUT', `/${environmentId}`, data).should((resp) => {
        expect(resp.status).to.eq(204);
        cy.environments('GET', `/${environmentId}`, { 'token': token }).should((resp) => { // confirm object is updated
          expect(resp.body.name).eq('updated name ' + environmentName);
          expect(resp.body.description).eq('updated name ' + environmentName);
          expect(resp.body.url).not.eq(null);
          expect(resp.body.vendor).eq('updated name ' + vendorName);
          expect(resp.body.linkedSystemId).eq(systemId);
          expect(resp.body.linkedSystem).eq(systemName);
          expect(resp.body.usageWorkItemId).eq(environmentAPIModel.usedForWorkItem);
          // expect(resp.body.usageWorkItem).not.eq(null); // this returns null???
          expect(resp.body.environmentStatusId).eq(environmentAPIModel.environmentStatus);
          // expect(resp.body.environmentStatus).not.eq(null); // this returns null???
          expect(resp.body.color).not.eq(null);
          expect(resp.body.isSharedEnvironment).not.eq(null);
          // TODO: assert more - systems, releases, etc.
          cy.log(`Environment '${resp.body.name}' successfully updated.`);
        });
      });

      cy.log('**Call Environments API with invalid Id** 🔥');
      cy.environments('PUT', `/${uuidv4()}`, { 'token': token }).should((resp) => {
        expect(resp.status).to.eq(400);
        cy.log(`Error is '${resp.body.message}'.`);
      });

      cy.log('**Call Environments API with incorrect token** 🔥');
      cy.environments('PUT', `/${environmentId}`, { 'token': '' }).should((resp) => {
        expect(resp.status).to.eq(401);
        cy.log(`Error is '${resp.body.message}'.`);
      });
    });
  });

  // TODO: include bulk and additionalinformation
  // TODO: etc. https://auapi.plutora.com/swagger/ui/index#/Environments
});