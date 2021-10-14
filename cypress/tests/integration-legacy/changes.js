import faker from 'faker/locale/en_AU'; // https://www.npmjs.com/package/faker
import { v4 as uuidv4 } from 'uuid';
import dataProviderLegacy from '../../services/data-provider-legacy';

let data = [];
let token = '';
let count = ''; // used for bulk
let changeId = '';
let changeName = '';
let changeBody = []; // set to array so its possible to push more objects

const userId = Cypress.env().users['admin'].userId;
const organizationId = Cypress.env().users['admin'].organizationId;
const changeAPIModel = dataProviderLegacy.getLegacyModel();
const date = new Date();
const dateNow = date.toISOString();

before(() => { // token is generated and written to fixtures/data.json before any run-time via support/index.js
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
  });
});

describe(['change'], 'Integration: Changes', ()=> {
  beforeEach(() => { // run before each test
    // create a new change specific to each CRUD functionality (deterministic test!)
    changeName = 'change-' + faker.random.word() + ' ' + dateNow;
    changeBody = {
      'name': changeName,
      'changePriorityId': changeAPIModel.changePriorityId,
      'changeStatusId': changeAPIModel.changeStatusId,
      'businessValueScore': faker.random.number({'min': 0, 'max': 100}),
      'organizationId': organizationId,
      'changeTypeId': changeAPIModel.changeTypeId,
      'changeDeliveryRiskId': changeAPIModel.changeDeliveryRiskId,
      'expectedDeliveryDate': dateNow,
      'changeThemeId': changeAPIModel.changeThemeId,
      'description': changeName,
      'descriptionSimple': changeName,
      'raisedById': userId,
      'assignedToId': userId
      // "stakeholders": [{
      //   "userId": userId,
      //     "stakeholderRoleIds": [
      //             "{{stakeholder-role-1-guid}}",
      //             "{{stakeholder-role-2-guid}}"
      //     ],
      //   "responsible": true,
      //   "accountable": true,
      //   "informed": true,
      //   "consulted": true
      // }],
      // "systems": [],
      // "deliveryReleases": [],
      // "comments": []
    };
    data = {
      'token': token,
      'body': changeBody
    };
    cy.changes('POST', '', data).as('changeAlias'); // save as an alias so easier to call per test
  });

  it(['smoke'], 'Create Change', () => {
    cy.log('**Call Changes API with correct token** 🔥');
    cy.get('@changeAlias').then((resp) => { // call the change created as an alias in beforeEach
      expect(resp.status).to.eq(201); // assert status code
      expect(resp.headers).to.have.property('content-type', 'application/json; charset=utf-8'); // assert properties
      expect(resp.body.name).eq(changeName); // assert objects
      expect(resp.body.businessValueScore).not.eq(null);
      expect(resp.body.organizationId).eq(organizationId);
      expect(resp.body.changePriorityId).eq(changeAPIModel.changePriorityId);
      expect(resp.body.changePriorityName).not.eq(null);
      expect(resp.body.changeStatusId).eq(changeAPIModel.changeStatusId);
      expect(resp.body.changeStatusName).not.eq(null);
      expect(resp.body.changeTypeId).eq(changeAPIModel.changeTypeId);
      expect(resp.body.changeTypeName).not.eq(null);
      expect(resp.body.changeDeliveryRiskId).eq(changeAPIModel.changeDeliveryRiskId);
      expect(resp.body.changeDeliveryRiskName).not.eq(null);
      expect(resp.body.changeThemeId).eq(changeAPIModel.changeThemeId);
      expect(resp.body.changeThemeName).not.eq(null);
      expect(resp.body.expectedDeliveryDate).not.eq(null);
      expect(resp.body.description).eq(changeName);
      expect(resp.body.descriptionSimple).eq(changeName);
      expect(resp.body.raisedById).eq(userId);
      expect(resp.body.assignedToId).eq(userId);
      // TODO: assert more - systems, releases, etc.
      cy.log(`Change '${resp.body.name}' successfully created.`);
    });

    cy.log('**Call Changes API with incorrect token** 🔥');
    cy.changes('POST', '', { 'token': uuidv4() }).should((resp) => {
      expect(resp.status).to.eq(401);
      cy.log(`Error is '${resp.body.message}'.`);
    });

    cy.log('**Call Changes API with empty content** 🔥');
    data = {
      'token': token,
      'body': {'name': ''}
    };
    cy.changes('POST', '', data).should((resp) => {
      expect(resp.status).to.eq(400);
      cy.log(`Error is '${resp.body.message}'.`);
    });
  });

  it(['smoke'], 'Delete Change', () => {
    cy.get('@changeAlias').then((resp) => { // call the change created as an alias in beforeEach
      changeId = resp.body.id;
      cy.log('**Call Changes API with correct token** 🔥');
      cy.changes('DELETE', `/${changeId}`, { 'token': token }).should((resp) => {
        expect(resp.status).to.eq(200); // TODO: This should return 204!
        cy.log(`Change '${changeName}' successfully deleted.`);
      });

      cy.log('**Call Changes API with invalid Id** 🔥');
      cy.changes('DELETE', `/${uuidv4()}`, { 'token': token }).should((resp) => {
        expect(resp.status).to.eq(200); // TODO: This should return 404!
        // cy.log(`Error is 'not found'.`);
      });

      cy.log('**Call Changes API with incorrect token** 🔥');
      cy.changes('DELETE', `/${changeId}`, { 'token': '' }).should((resp) => {
        expect(resp.status).to.eq(401);
        cy.log(`Error is '${resp.body.message}'.`);
      });
    });
  });

  it(['smoke'], 'Retrieve Changes', () => {
    cy.get('@changeAlias').then((resp) => { // call the change created as an alias in beforeEach
      changeId = resp.body.id;
      cy.log('**Call Changes API with correct token** 🔥');
      cy.changes('GET', `/${changeId}`, { 'token': token }).should((resp) => {
        expect(resp.status).to.eq(200);
        expect(resp.body.name).eq(changeName);
        expect(resp.body.organizationId).eq(organizationId);
        expect(resp.body.description).eq(changeName);
        expect(resp.body.descriptionSimple).eq(changeName);
        expect(resp.body.raisedById).eq(userId);
        expect(resp.body.assignedToId).eq(userId);
        // TODO: assert more - systems, releases, etc.
        cy.log(`Change '${resp.body.name}' successfully retrieved.`);
      });

      cy.log('**Call Changes API with invalid Id** 🔥');
      cy.changes('GET', `/${uuidv4()}`, { 'token': token }).should((resp) => {
        expect(resp.status).to.eq(404);
        cy.log(`Error is 'not found'.`);
      });

      cy.log('**Call Changes API with incorrect token** 🔥');
      cy.changes('GET', `/${changeId}`, { 'token': '' }).should((resp) => {
        expect(resp.status).to.eq(401);
        cy.log(`Error is '${resp.body.message}'.`);
      });
    });
  });

  it(['smoke'], 'Update Change', () => {
    cy.get('@changeAlias').then((resp) => { // call the change created as an alias in beforeEach
      changeId = resp.body.id;
      changeName = 'updated name ' + dateNow;
      cy.log('**Call Changes API with correct token** 🔥');
      changeBody = {
        'id': changeId,
        'name': changeName,
        'changePriorityId': changeAPIModel.changePriorityId,
        'changeStatusId': changeAPIModel.changeStatusId,
        'businessValueScore': 0,
        'organizationId': organizationId,
        'changeTypeId': changeAPIModel.changeTypeId,
        'changeDeliveryRiskId': changeAPIModel.changeDeliveryRiskId,
        'changeThemeId': changeAPIModel.changeThemeId,
        'description': changeName,
        'descriptionSimple': changeName,
        'raisedById': userId,
        'assignedToId': '',
        // "stakeholders": [{
        //   "userId": userId,
        //     "stakeholderRoleIds": [
        //             "{{stakeholder-role-1-guid}}",
        //             "{{stakeholder-role-2-guid}}"
        //     ],
        //   "responsible": true,
        //   "accountable": true,
        //   "informed": true,
        //   "consulted": true
        // }],
        // "systems": []
        // "systemId": uuidv4(),
        // "systemRoleType": "Impact"
        // "deliveryReleases": [],
        // "comments": []
      };
      data = {
        'token': token,
        'body': changeBody
      };
      cy.changes('PUT', `/${changeId}`, data).should((resp) => {
        expect(resp.status).to.eq(200);
        expect(resp.body.name).eq(changeName);
        expect(resp.body.businessValueScore).eq(0);
        expect(resp.body.organizationId).eq(organizationId);
        expect(resp.body.changePriorityId).eq(changeAPIModel.changePriorityId);
        expect(resp.body.changePriorityName).not.eq(null);
        expect(resp.body.changeStatusId).eq(changeAPIModel.changeStatusId);
        expect(resp.body.changeStatusName).not.eq(null);
        expect(resp.body.changeTypeId).eq(changeAPIModel.changeTypeId);
        expect(resp.body.changeTypeName).not.eq(null);
        expect(resp.body.changeDeliveryRiskId).eq(changeAPIModel.changeDeliveryRiskId);
        expect(resp.body.changeDeliveryRiskName).not.eq(null);
        expect(resp.body.changeThemeId).eq(changeAPIModel.changeThemeId);
        expect(resp.body.changeThemeName).not.eq(null);
        expect(resp.body.expectedDeliveryDate).not.eq(null);
        expect(resp.body.description).eq(changeName);
        expect(resp.body.descriptionSimple).eq(changeName);
        expect(resp.body.raisedById).eq(userId);
        expect(resp.body.assignedToId).eq(null);
        // TODO: assert more - systems, releases, etc.
        cy.log(`Change '${resp.body.name}' successfully updated.`);
      });

      cy.log('**Call Changes API with duplicate name** 🔥');
      changeBody = {
        'id': changeId,
        'name': changeName,
        'organizationId': organizationId,
        'changePriorityId': changeAPIModel.changePriorityId,
        'changeStatusId': changeAPIModel.changeStatusId,
        'changeTypeId': changeAPIModel.changeTypeId,
        'changeDeliveryRiskId': changeAPIModel.changeDeliveryRiskId,
        'changeThemeId': changeAPIModel.changeThemeId,
        'raisedById': userId,
      };
      data = {
        'token': token,
        'body': changeBody
      };
      cy.changes('PUT', `/${changeId}`, data).should((resp) => {
        expect(resp.status).to.eq(200); // TODO: should be 204?
        // cy.log(`Error is '${resp.body.internalServerValidationError}'.`);
      });

      cy.log('**Call Changes API with invalid Id** 🔥');
      cy.changes('PUT', `/${uuidv4()}`, data).should((resp) => {
        expect(resp.status).to.eq(400);
        cy.log(`Error is '${resp.body.message}'.`);
      });

      cy.log('**Call Changes API with incorrect token** 🔥');
      cy.changes('PUT', `/${changeId}`, { 'token': '' }).should((resp) => {
        expect(resp.status).to.eq(401);
        cy.log(`Error is '${resp.body.message}'.`);
      });
    });
  });

  it('Create Change (Bulk)', () => {
    cy.log('**Call Changes API with correct token** 🔥');
    count = 4;
    changeBody = [];
    for(let i=0; i<count; i++) {
      changeName = 'change-' + faker.random.word() + ' ' + dateNow;
      changeBody.push({
        'name': changeName,
        'changePriorityId': changeAPIModel.changePriorityId,
        'changeStatusId': changeAPIModel.changeStatusId,
        'businessValueScore': faker.random.number({'min': 0, 'max': 100}),
        'organizationId': organizationId,
        'changeTypeId': changeAPIModel.changeTypeId,
        'changeDeliveryRiskId': changeAPIModel.changeDeliveryRiskId,
        'expectedDeliveryDate': dateNow,
        'changeThemeId': changeAPIModel.changeThemeId,
        'description': changeName,
        'descriptionSimple': changeName,
        'raisedById': userId,
        'assignedToId': userId
        // "stakeholders": [{
        //   "userId": userId,
        //     "stakeholderRoleIds": [
        //             "{{stakeholder-role-1-guid}}",
        //             "{{stakeholder-role-2-guid}}"
        //     ],
        //   "responsible": true,
        //   "accountable": true,
        //   "informed": true,
        //   "consulted": true
        // }],
        // "systems": [],
        // "deliveryReleases": [],
        // "comments": []
      });
    }
    data = {
      'token': token,
      'body': changeBody
    };
    cy.changes('POST', '/bulk', data).should((resp) => {
      expect(resp.status).to.eq(200); // assert status code
      expect(resp.headers).to.have.property('content-type', 'application/json; charset=utf-8'); // assert properties
      expect(resp.body).to.be.an('array'); // assert objects // TODO: why does it return []???
      cy.log(`Changes (Bulk) successfully created.`);
    });

    cy.log('**Call Changes API with incorrect token** 🔥');
    cy.changes('POST', '/bulk', { 'token': uuidv4() }).should((resp) => {
      expect(resp.status).to.eq(401);
      cy.log(`Error is '${resp.body.message}'.`);
    });

    cy.log('**Call Changes API with empty content** 🔥');
    data = {
      'token': token,
      'body': {'name': ''}
    };
    cy.changes('POST', '/bulk', data).should((resp) => {
      expect(resp.status).to.eq(400);
      cy.log(`Error is '${resp.body.message}'.`);
    });
  });
  // TODO: etc. https://auapi.plutora.com/swagger/ui/index#!/changes
});