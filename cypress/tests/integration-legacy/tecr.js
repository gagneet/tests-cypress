import faker from 'faker/locale/en_AU'; // https://www.npmjs.com/package/faker
import { v4 as uuidv4 } from 'uuid';
import dataProviderLegacy from '../../services/data-provider-legacy';

let data = [];
let token = '';
let tecrId = '';
let tecrTitle = '';
const date = new Date();
const dateNow = date.toISOString();
const userId = Cypress.env().users["admin"].userId;
const tecrAPIModel = dataProviderLegacy.getLegacyModel();

before(() => { // token is generated and written to fixtures/data.json before any run-time via support/index.js
  cy.fixture('data').should((data) => {
    token = data.token;
  }).then(() => {
    //test data which will be used across all tests is created here
    dataProviderLegacy.setToken(token);
    dataProviderLegacy.getLegacyLookupFieldChangeRequestStatus();
    dataProviderLegacy.getLegacyLookupFieldChangeRequestType();
  });
});

describe(['tecr'], 'Integration: TECRs', ()=> {
  beforeEach(() => { // run before each test
    // create a new TECR specific to each CRUD functionality (deterministic test!)
    tecrTitle = 'tecr-' + faker.random.word() + ' ' + dateNow;
    data = {
      "token": token,
      "title": tecrTitle,
      "description": tecrTitle,
      "startDate": dateNow,
      "dueDate": dateNow,
      "userId": userId,
      "crStatusID": tecrAPIModel.changeRequestStatusId,
      "crTypeID": tecrAPIModel.changeRequestTypeId,
      "color": faker.internet.color()
    };
    cy.tecrs('POST', '', data).as('tecrAlias'); // save as an alias so easier to call per test
  });

  it(['smoke'], 'Admin - Create TECR', () => {
    cy.log('**Call TECRs API with correct token** 🔥');
    cy.get('@tecrAlias').then((resp) => { // call the tecr created as an alias in beforeEach
      expect(resp.status).to.eq(200); // assert status code
      expect(resp.headers).to.have.property('content-type', 'application/json; charset=utf-8'); // assert properties
      expect(resp.body.id).not.eq(null);
      expect(resp.body.title).eq(tecrTitle);
      expect(resp.body.crTypeID).not.eq(null);
      expect(resp.body.userId).not.eq(null);
      expect(resp.body.createdDate).not.eq(null);
      expect(resp.body.startDate).not.eq(null);
      expect(resp.body.dueDate).not.eq(null);
      expect(resp.body.description).eq(tecrTitle);
      expect(resp.body.crStatusID).not.eq(null);
      expect(resp.body.color).not.eq(null);
      expect(resp.body.showAsShaded).not.eq(null);
      expect(resp.body.number).not.eq(null);
      expect(resp.body.outage).not.eq(null);
      expect(resp.body.lastModifiedDate).not.eq(null);
      expect(resp.body.lastModifiedBy).not.eq(null);
      cy.log(`TECR '${resp.body.title}' successfully created.`);
    });

    cy.log('**Call TECR API with incorrect token** 🔥');
    cy.tecrs('POST', '', { "token": uuidv4() }).should((resp) => {
      expect(resp.status).to.eq(401);
      cy.log(`Error is '${resp.body.message}'.`);
    });

    cy.log('**Call TECR API with empty content** 🔥');
    data = {
      "token": token,
      "title": ''
    };
    cy.tecrs('POST', '', data).should((resp) => {
      expect(resp.status).to.eq(400);
      cy.log(`Error is '${resp.body.ErrorMessage}'.`);
    });
  });

  it(['smoke'], 'Admin - Retrieve TECR', () => {
    cy.get('@tecrAlias').then((resp) => { // call the TECR created as an alias in beforeEach
      tecrId = resp.body.id;
      cy.log('**Call TECRs API with correct token** 🔥');
      cy.tecrs('GET', `/${tecrId}`, { "token": token }).should((resp) => {
        expect(resp.status).to.eq(200);
        expect(resp.body.id).eq(tecrId);
        expect(resp.body.title).eq(tecrTitle);
        expect(resp.body.crTypeID).not.eq(null);
        expect(resp.body.startDate).not.eq(null);
        expect(resp.body.dueDate).not.eq(null);
        expect(resp.body.crStatusID).not.eq(null);
        cy.log(`TECR '${resp.body.title}' successfully retrieved.`);
      });

      cy.log('**Call TECRs API with invalid Id** 🔥');
      cy.tecrs('GET', `/${uuidv4()}`, { "token": token }).should((resp) => {
        expect(resp.status).to.eq(404);
        cy.log(`Error is 'not found'.`);
      });

      cy.log('**Call TECRs API with incorrect token** 🔥');
      cy.tecrs('GET', `/${tecrId}`, { "token": '' }).should((resp) => {
        expect(resp.status).to.eq(401);
        cy.log(`Error is '${resp.body.message}'.`);
      });
    });
  });

  it(['smoke'], 'Admin - Update TECR', () => {
    cy.get('@tecrAlias').then((resp) => { // call the TECR created as an alias in beforeEach
      tecrId = resp.body.id;
      cy.log('**Call TECRs API with correct token** 🔥');
      data = {
        "token": token,
        "id": tecrId,
        "title": 'updated title',
        "description": 'updated description',
        "startDate": dateNow,
        "dueDate": dateNow,
        "userId": userId,
        "crStatusID": tecrAPIModel.changeRequestStatusId,
        "crTypeID": tecrAPIModel.changeRequestTypeId
      };
      cy.tecrs('PUT', `/${tecrId}`, data).should((resp) => {
        expect(resp.status).to.eq(200);
        expect(resp.body.id).eq(tecrId);
        expect(resp.body.title).eq('updated title');
        expect(resp.body.description).eq('updated description');
        expect(resp.body.crTypeID).not.eq(null);
        expect(resp.body.startDate).not.eq(null);
        expect(resp.body.dueDate).not.eq(null);
        expect(resp.body.crStatusID).not.eq(null);
        cy.log(`TECR '${resp.body.title}' successfully updated.`);
      });

      cy.log('**Call TECRs API with mismatched query string parameter and request body Id** 🔥');
      data = {
        "token": token,
        "id": uuidv4(),
        "title": 'updated title',
        "startDate": dateNow,
        "dueDate": dateNow,
        "userId": userId,
        "crStatusID": tecrAPIModel.changeRequestStatusId
      };
      cy.tecrs('PUT', `/${tecrId}`, data).should((resp) => {
        expect(resp.status).to.eq(400);
        cy.log(`Error is '${resp.body.message}'.`);
      });

      cy.log('**Call TECRs API with missing fields** 🔥');
      cy.tecrs('PUT', `/${tecrId}`, { "token": token }).should((resp) => {
        expect(resp.status).to.eq(400);
        cy.log(`Error is '${resp.body.message}'.`);
      });

      cy.log('**Call TECRs API with invalid Id** 🔥');
      const randomUuid = uuidv4();
      data = {
        "token": token,
        "id": randomUuid,
        "title": 'updated title',
        "startDate": dateNow,
        "dueDate": dateNow,
        "userId": userId,
        "crStatusID": tecrAPIModel.changeRequestStatusId
      };
      cy.tecrs('PUT', `/${randomUuid}`, data).should((resp) => {
        expect(resp.status).to.eq(400);
        cy.log(`Error is '${resp.body.message}'.`);
      });

      cy.log('**Call TECRs API with incorrect token** 🔥');
      cy.tecrs('PUT', `/${tecrId}`, { "token": '' }).should((resp) => {
        expect(resp.status).to.eq(401);
        cy.log(`Error is '${resp.body.message}'.`);
      });
    });
  });

  it(['smoke'], 'Admin - Delete TECR', () => {
    cy.get('@tecrAlias').then((resp) => { // call the tecr created as an alias in beforeEach
      tecrId = resp.body.id;
      cy.log('**Call TECRs API with invalid Id** 🔥');
      cy.tecrs('DELETE', `/${uuidv4()}`, { "token": token }).should((resp) => {
        expect(resp.status).to.eq(200); // TODO: this should be 404!
        // cy.log(`Error is '${resp.body.message}'.`);
      });

      cy.log('**Call TECRs API with incorrect token** 🔥');
      cy.tecrs('DELETE', `/${tecrId}`, { "token": '' }).should((resp) => {
        expect(resp.status).to.eq(401);
        cy.log(`Error is '${resp.body.message}'.`);
      });

      cy.log('**Call TECRs API with correct token** 🔥');
      cy.tecrs('DELETE', `/${tecrId}`, { "token": token }).should((resp) => {
        expect(resp.status).to.eq(200);
        cy.log('TECR was successfully deleted.');
      });
    });
  });
});