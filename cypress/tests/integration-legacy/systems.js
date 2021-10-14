import faker from 'faker/locale/en_AU'; // https://www.npmjs.com/package/faker
import { v4 as uuidv4 } from 'uuid';

let data = [];
let token = '';
let systemId = '';
let systemName = '';
let vendorName = '';

const organizationId = Cypress.env().users["admin"].organizationId;
const date = new Date();
const dateNow = date.toISOString();

before(() => { // token is generated and written to fixtures/data.json before any run-time via support/index.js
  cy.fixture('data').should((data) => {
    token = data.token;
  });
});

describe(['system'], 'Integration: Systems', ()=> {
  beforeEach(() => { // run before each test
    // create a new system specific to each CRUD functionality (deterministic test!)
    systemName = 'system-' + faker.random.word() + ' ' + dateNow;
    vendorName = faker.company.companyName();
    data = {
      "token": token,
      "name": systemName,
      "system": [{ "name" : 'alias-' + systemName}], // TODO: not working? returns []
      "vendor": vendorName,
      "status": "Active",
      "organizationId": organizationId,
      "description": systemName
    };
    cy.systems('POST', '', data).as('systemAlias'); // save as an alias so easier to call per test
  });

  it(['smoke'], 'Admin - Create System', () => {
    cy.log('**Call Systems API with correct token** 🔥');
    cy.get('@systemAlias').then((resp) => { // call the system created as an alias in beforeEach
      expect(resp.status).to.eq(201); // assert status code
      expect(resp.headers).to.have.property('content-type', 'application/json; charset=utf-8'); // assert properties
      expect(resp.body.name).eq(systemName); // assert objects
      // expect(resp.body.systemAlias).eq('alias-' + systemName);
      expect(resp.body.vendor).eq(vendorName);
      expect(resp.body.status).eq('Active');
      expect(resp.body.organizationId).eq(organizationId);
      expect(resp.body.description).eq(systemName);
      expect(resp.body.isAllowEdit).eq(false);
      // TODO: assert inMyOrganization, linkedEnvironments, additionalInformation
      cy.log(`System '${resp.body.name}' successfully created.`);
    });

    cy.log('**Call Systems API with incorrect token** 🔥');
    cy.systems('POST', '', { "token": uuidv4() }).should((resp) => {
      expect(resp.status).to.eq(401);
      cy.log(`Error is '${resp.body.message}'.`);
    });

    cy.log('**Call Systems API with empty content** 🔥');
    data = {
      "token": token,
      "name": ''
    };
    cy.systems('POST', '', data).should((resp) => {
      expect(resp.status).to.eq(400);
      cy.log(`Error is '${resp.body.message}'.`);
    });
  });

  it(['smoke'], 'Admin - Delete System', () => {
    cy.get('@systemAlias').then((resp) => { // call the system created as an alias in beforeEach
      systemId = resp.body.id;
      cy.log('**Call Systems API with correct token** 🔥');
      cy.systems('DELETE', `/${systemId}`, { "token": token }).should((resp) => {
        expect(resp.status).to.eq(200); // TODO: This should return 204!
        cy.log(`System '${systemName}' successfully deleted.`);
      });

      cy.log('**Call Systems API with invalid Id** 🔥');
      cy.systems('DELETE', `/${uuidv4()}`, { "token": token }).should((resp) => {
        expect(resp.status).to.eq(404);
        cy.log(`Error is 'not found'.`);
      });

      cy.log('**Call Systems API with incorrect token** 🔥');
      cy.systems('DELETE', `/${systemId}`, { "token": '' }).should((resp) => {
        expect(resp.status).to.eq(401);
        cy.log(`Error is '${resp.body.message}'.`);
      });
    });
  });

  it(['smoke'], 'Admin - Retrieve Systems', () => {
    cy.get('@systemAlias').then((resp) => { // call the system created as an alias in beforeEach
      systemId = resp.body.id;
      cy.log('**Call Systems API with correct token** 🔥');
      cy.systems('GET', `/${systemId}`, { "token": token }).should((resp) => {
        expect(resp.status).to.eq(200);
        expect(resp.body.name).eq(systemName); // assert objects
        // expect(resp.body.systemAlias).eq('alias-' + systemName);
        expect(resp.body.vendor).eq(vendorName);
        expect(resp.body.status).eq('Active');
        expect(resp.body.organizationId).eq(organizationId);
        expect(resp.body.description).eq(systemName);
        expect(resp.body.isAllowEdit).eq(false);
        // TODO: assert inMyOrganization, linkedEnvironments, additionalInformation
        cy.log(`System '${resp.body.name}' successfully retrieved.`);
      });

      cy.log('**Call Systems API with invalid Id** 🔥');
      cy.systems('GET', `/${uuidv4()}`, { "token": token }).should((resp) => {
        expect(resp.status).to.eq(404);
        cy.log(`Error is 'not found'.`);
      });

      cy.log('**Call Systems API with incorrect token** 🔥');
      cy.systems('GET', `/${systemId}`, { "token": '' }).should((resp) => {
        expect(resp.status).to.eq(401);
        cy.log(`Error is '${resp.body.message}'.`);
      });
    });
  });

  it(['smoke'], 'Admin - Update System', () => {
    cy.get('@systemAlias').then((resp) => { // call the system created as an alias in beforeEach
      systemId = resp.body.id;
      systemName = 'updated name ' + dateNow;
      cy.log('**Call Systems API with correct token** 🔥');
      data = {
        "token": token,
        "id": systemId,
        "name": systemName,
        "vendor": 'updated vendor',
        "status": "Inactive",
        "organizationId": organizationId,
        "description": 'updated description'
      };
      cy.systems('PUT', `/${systemId}`, data).should((resp) => {
        expect(resp.status).to.eq(200);
        expect(resp.body.name).eq(systemName);
        expect(resp.body.vendor).eq('updated vendor');
        expect(resp.body.status).eq('Inactive');
        expect(resp.body.organizationId).eq(organizationId);
        expect(resp.body.description).eq('updated description');
        cy.log(`System '${resp.body.name}' successfully updated.`);
      });

      // cy.log('**Call Systems API with duplicate name** 🔥'); // TODO: This behaves weird!
      // data = {
      //   "token": token,
      //   "id": systemId,
      //   "name": 'updated name',
      //   "vendor": 'updated vendor',
      //   "status": "Active",
      //   "organizationId": organizationId,
      //   // "description": 'updated description'
      // };
      // cy.systems('PUT', `/${systemId}`, data).should((resp) => {
      //   expect(resp.status).to.eq(400);
      //   cy.log(`Error is '${resp.body.modelState.internalServerValidationError}'.`);
      // });

      cy.log('**Call Systems API with invalid Id** 🔥');
      cy.systems('PUT', `/${uuidv4()}`, { "token": token }).should((resp) => {
        expect(resp.status).to.eq(400);
        cy.log(`Error is '${resp.body.message}'.`);
      });

      cy.log('**Call Systems API with incorrect token** 🔥');
      cy.systems('PUT', `/${systemId}`, { "token": '' }).should((resp) => {
        expect(resp.status).to.eq(401);
        cy.log(`Error is '${resp.body.message}'.`);
      });
    });
  });
  // TODO: etc. https://auapi.plutora.com/swagger/ui/index#!/systems
});