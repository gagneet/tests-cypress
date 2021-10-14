import faker from 'faker/locale/en_AU'; // https://www.npmjs.com/package/faker
import { v4 as uuidv4 } from 'uuid';
import dataProviderLegacy from '../../services/data-provider-legacy';

let data = [];
let token = '';
let dPId = '';
let dPName = '';

const userId = Cypress.env().users["admin"].userId;
const organizationId = Cypress.env().users["admin"].organizationId;
const dPAPIModel = dataProviderLegacy.getLegacyModel();
const date = new Date();
const dateNow = date.toISOString();

before(() => { // token is generated and written to fixtures/data.json before any run-time via support/index.js
  cy.fixture('data').should((data) => {
    token = data.token;
  }).then(() => {
    // test data which will be used across all tests is created here
    dataProviderLegacy.setToken(token);
    // dataProviderLegacy.getLegacyLookupFieldChangeDeliveryRisk();
    // dataProviderLegacy.getLegacyLookupFieldChangePriority();
    // dataProviderLegacy.getLegacyLookupFieldChangeStatus();
    // dataProviderLegacy.getLegacyLookupFieldChangeTheme();
    // dataProviderLegacy.getLegacyLookupFieldChangeType();
  });
});

describe(['dp'], 'Integration: Deployment Plans', ()=> {
  beforeEach(() => { // run before each test
    // create a new deployment plan specific to each CRUD functionality (deterministic test!)
    dPName = 'dp-' + faker.random.word() + ' ' + dateNow;
    data = {
      "token": token,
      "name": dPName,
      "description": dPName,
      "externalIdentifier": 'external-id-' + faker.random.number(),
      "organizationId": organizationId,
      "systems": [],
      // "releaseId": releaseId
    };
    cy.deploymentPlans('POST', '/Create', data).as('dPAlias'); // save as an alias so easier to call per test (POST then CREATE? 🤯)
  });

  it(['smoke'], 'Admin - Create Deployment Plan', () => {
    cy.log('**Call Deployment Plans API with correct token** 🔥');
    cy.get('@dPAlias').then((resp) => { // call the dp created as an alias in beforeEach
      expect(resp.status).to.eq(200); // assert status code TODO: should be 201!
      expect(resp.headers).to.have.property('content-type', 'application/json; charset=utf-8'); // assert properties
      expect(resp.body.data.Name).eq(dPName); // assert objects
      expect(resp.body.data.Description).eq(dPName);
      expect(resp.body.data.ExternalIdentifier).not.eq(null);
      expect(resp.body.data.OrganizationID).eq(organizationId);
      expect(resp.body.data.EnableGroupTask).eq(true);
      expect(resp.body.data.IsAllowEdit).eq(false);
      expect(resp.body.data.AccountableID).eq(null);
      expect(resp.body.data.Accountable).eq(null);
      expect(resp.body.data.Status).eq(null);
      // TODO: assert more - Heaps to add!!!
      cy.log(`Deployment Plan '${resp.body.data.Name}' successfully created.`);
    });

    cy.log('**Call Deployment Plans API with incorrect token** 🔥');
    cy.deploymentPlans('POST', '/Create', { "token": uuidv4() }).should((resp) => {
      expect(resp.status).to.eq(401);
      cy.log(`Error is '${resp.body.message}'.`);
    });

    cy.log('**Call Deployment Plans API with empty content** 🔥');
    data = {
      "token": token,
      "name": ''
    };
    cy.deploymentPlans('POST', '/Create', data).should((resp) => {
      expect(resp.status).to.eq(200); // TODO: should be 400!
      cy.log(`Error is '${resp.body.error}'.`);
    });
  });

  it(['smoke'], 'Admin - Delete Deployment Plan', () => {
    cy.get('@dPAlias').then((resp) => { // call the deployment plan created as an alias in beforeEach
      dPId = resp.body.data.ID;
      cy.log('**Call Deployment Plans API with correct token** 🔥');
      cy.deploymentPlans('DELETE', `/Delete/${dPId}`, { "token": token, "id": dPId }).should((resp) => {
        expect(resp.status).to.eq(200); // TODO: This should return 204!
        cy.log(`Deployment Plan '${dPName}' successfully deleted.`);
      });

      cy.log('**Call Deployment Plans API with Id not defined in body** 🔥');
      cy.deploymentPlans('DELETE', `/Delete/${uuidv4()}`, { "token": token }).should((resp) => {
        expect(resp.status).to.eq(200); // TODO: This should return a 4xx error!
        cy.log(`Error is '${resp.body.message}'.`);
      });

      cy.log('**Call Deployment Plans API with invalid Id** 🔥');
      cy.deploymentPlans('DELETE', `/Delete/${uuidv4()}`, { "token": token, "id": uuidv4() }).should((resp) => {
        expect(resp.status).to.eq(200); // TODO: This should return a 4xx error!
        cy.log(`Error is '${resp.body.message}'.`);
      });

      cy.log('**Call Deployment Plans API with incorrect token** 🔥');
      cy.deploymentPlans('DELETE', `/Delete/${dPId}`, { "token": '' }).should((resp) => {
        expect(resp.status).to.eq(401);
        cy.log(`Error is '${resp.body.message}'.`);
      });
    });
  });

  it(['smoke'], 'Admin - Retrieve Deployment Plans', () => {
    cy.get('@dPAlias').then((resp) => { // call the deployment plan created as an alias in beforeEach
      dPId = resp.body.data.ID;
      cy.log('**Call Deployment Plans API with correct token** 🔥');
      cy.deploymentPlans('GET', `/Get/${dPId}`, { "token": token, "id": dPId }).should((resp) => {
        expect(resp.status).to.eq(200);
        expect(resp.body.data.Name).eq(dPName);
        expect(resp.body.data.Description).eq(dPName);
        expect(resp.body.data.ExternalIdentifier).not.eq(null);
        expect(resp.body.data.OrganizationID).eq(organizationId);
        // TODO: assert more - Heaps to add!!!
        cy.log(`Deployment Plan '${resp.body.data.Name}' successfully retrieved.`);
      });

      cy.log('**Call Deployment Plans API with invalid Id** 🔥');
      cy.deploymentPlans('GET', `/Get/${uuidv4()}`, { "token": token, "id": uuidv4() }).should((resp) => {
        expect(resp.status).to.eq(400);
        cy.log(`Error is '${resp.body.message}'.`);
      });

      cy.log('**Call Deployment Plans API with incorrect token** 🔥');
      cy.deploymentPlans('GET', `/Get/${dPId}`, { "token": '' }).should((resp) => {
        expect(resp.status).to.eq(401);
        cy.log(`Error is '${resp.body.message}'.`);
      });
    });
  });

  it(['smoke'], 'Admin - Update Deployment Plan', () => {
    cy.get('@dPAlias').then((resp) => { // call the deployment plan created as an alias in beforeEach
      dPId = resp.body.data.ID;
      dPName = 'updated name ' + dateNow;
      cy.log('**Call Deployment Plans API with correct token** 🔥');
      data = {
        "token": token,
        "id": dPId,
        "name": dPName,
        "description": dPName,
        "externalIdentifier": '',
        "organizationId": organizationId,
        "systems": [],
        // "releaseId": releaseId
      };
      cy.deploymentPlans('PUT', `/Update/${dPId}`, data).should((resp) => {
        expect(resp.status).to.eq(200);
        expect(resp.body.data.Name).eq(dPName);
        expect(resp.body.data.Description).eq(dPName);
        expect(resp.body.data.ExternalIdentifier).eq('');
        expect(resp.body.data.OrganizationID).eq(organizationId);
        expect(resp.body.data.EnableGroupTask).eq(true);
        expect(resp.body.data.IsAllowEdit).eq(false);
        expect(resp.body.data.AccountableID).eq(null);
        expect(resp.body.data.Accountable).eq(null);
        expect(resp.body.data.Status).eq(null);
        // TODO: assert more - systems, releases, etc.
        cy.log(`Deployment Plan '${resp.body.name}' successfully updated.`);
      });

      cy.log('**Call Deployment Plans API with duplicate name** 🔥');
      data = {
        "token": token,
        "id": dPId,
        "name": dPName,
        "organizationId": organizationId,
        "changePriorityId": dPAPIModel.changePriorityId,
        "changeStatusId": dPAPIModel.changeStatusId,
        "changeTypeId": dPAPIModel.changeTypeId,
        "changeDeliveryRiskId": dPAPIModel.changeDeliveryRiskId,
        "changeThemeId": dPAPIModel.changeThemeId,
        "raisedById": userId,
      };
      cy.deploymentPlans('PUT', `/Update/${dPId}`, data).should((resp) => {
        expect(resp.status).to.eq(200); // TODO: should be 204?
        // cy.log(`Error is '${resp.body.internalServerValidationError}'.`);
      });

      cy.log('**Call Deployment Plans API with invalid Id** 🔥');
      cy.deploymentPlans('PUT', `/Update/${uuidv4()}`, { "token": token }).should((resp) => {
        expect(resp.status).to.eq(400);
        cy.log(`Error is '${resp.body.message}'.`);
      });

      cy.log('**Call Deployment Plans API with incorrect token** 🔥');
      cy.deploymentPlans('PUT', `/Update/${dPId}`, { "token": '' }).should((resp) => {
        expect(resp.status).to.eq(401);
        cy.log(`Error is '${resp.body.message}'.`);
      });
    });
  });
  // TODO: etc. https://auapi.plutora.com/swagger/ui/index#!/DeploymentPlan
});