import faker from 'faker/locale/en_AU'; // https://www.npmjs.com/package/faker
import { v4 as uuidv4 } from 'uuid';
import dataProviderLegacy from '../../services/data-provider-legacy';

let data = [];
let token = '';
let tebrId = '';
let tebrTitle = '';
let tebrBody = []; // set to array so its possible to push more objects

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);
const today = dayjs().format('DD-MM-YYYYHH:mm:ss');
const endDateUTC = dayjs().add(1, 'month').utc().format();
const todayUTC = dayjs().utc().format(); // convert local time to UTC time
const userId = Cypress.env().users['admin'].userId;
const userGroupId = Cypress.env().users['admin'].userGroupId;
const tebrAPIModel = dataProviderLegacy.getLegacyModel();

before(() => { // token is generated and written to fixtures/data.json before any run-time via support/index.js
  cy.fixture('data').should((data) => {
    token = data.token;
  }).then(() => {
    //test data which will be used across all tests is created here
    dataProviderLegacy.setToken(token);
    dataProviderLegacy.getLegacyLookupFieldBookingRequestStatus();
    dataProviderLegacy.getLegacyLookupFieldBookingRequestType();
  });
});

describe(['tebr'], 'Integration: TEBRs', ()=> {
  beforeEach(() => { // run before each test
    // create a new TEBR specific to each CRUD functionality (deterministic test!)
    tebrTitle = 'tebr-' + faker.random.word() + ' ' + today;
    tebrBody = {
      'title': tebrTitle,
      'releaseID': null,
      'phaseID': null,
      'startDate': todayUTC,
      'endDate': endDateUTC,
      'assignedToID': userId,
      'requestorID': userId,
      'description': tebrTitle,
      'statusID': tebrAPIModel.bookingRequestStatusId,
      'typeID': tebrAPIModel.bookingRequestTypeId,
      'systems':[
        // {
        //     "systemId": "{{new-system-guid}}",
        //     "systemRoleType": "Impact",
        //     "systemRoleDependencyTypeId": "{{systems-subtype-customization-1-guid}}"
        // }
      ]
    };
    data = {
      'token': token,
      'body': tebrBody
    };
    cy.tebrs('POST', '', data).as('tebrAlias'); // save as an alias so easier to call per test
  });

  it(['smoke'], 'Admin - Create TEBR', () => {
    cy.log('**Call TEBRs API with correct token** 🔥');
    cy.get('@tebrAlias').then((resp) => { // call the tebr created as an alias in beforeEach
      expect(resp.status).to.eq(200); // assert status code
      expect(resp.headers).to.have.property('content-type', 'application/json; charset=utf-8'); // assert properties
      expect(resp.body.number).not.eq(null);
      expect(resp.body.title).eq(tebrTitle);
      expect(resp.body.releaseID).eq(null);
      expect(resp.body.phaseID).eq(null);
      expect(resp.body.startDate).not.eq(null);
      expect(resp.body.endDate).not.eq(null);
      expect(resp.body.assignedToID).eq(userId);
      expect(resp.body.requestorID).eq(userId);
      expect(resp.body.description).eq(tebrTitle);
      expect(resp.body.raisedDate).not.eq(null);
      expect(resp.body.statusID).not.eq(null);
      expect(resp.body.typeID).not.eq(null);
      expect(resp.body.isEnvironmentOnly).eq(true); // if releaseID is null, this should always be set to true
      // expect(resp.body.lastModifiedDate).not.eq(null);
      // expect(resp.body.lastModifiedBy).not.eq(null);
      cy.log(`TEBR '${resp.body.title}' successfully created.`);
    });

    cy.log('**Call TEBR API with incorrect token** 🔥');
    cy.tebrs('POST', '', { 'token': uuidv4() }).should((resp) => {
      expect(resp.status).to.eq(401);
      cy.log(`Error is '${resp.body.message}'.`);
    });

    cy.log('**Call TEBR API with empty content** 🔥');
    data = {
      'token': token,
      'body': {'title': ''}
    };
    cy.tebrs('POST', '', data).should((resp) => {
      expect(resp.status).to.eq(400);
      cy.log(`Error is '${resp.body.message}'.`);
    });
  });

  it(['smoke'], 'Admin - Retrieve TEBR', () => {
    cy.get('@tebrAlias').then((resp) => { // call the TEBR created as an alias in beforeEach
      tebrId = resp.body.id;
      cy.log('**Call TEBRs API with correct token** 🔥');
      cy.tebrs('GET', `/${tebrId}`, { 'token': token }).should((resp) => {
        expect(resp.status).to.eq(200);
        expect(resp.body.id).eq(tebrId);
        expect(resp.body.title).eq(tebrTitle);
        expect(resp.body.crTypeID).not.eq(null);
        expect(resp.body.startDate).not.eq(null);
        expect(resp.body.dueDate).not.eq(null);
        expect(resp.body.crStatusID).not.eq(null);
        cy.log(`TEBR '${resp.body.title}' successfully retrieved.`);
      });

      cy.log('**Call TEBRs API with invalid Id** 🔥');
      cy.tebrs('GET', `/${uuidv4()}`, { 'token': token }).should((resp) => {
        expect(resp.status).to.eq(404);
        cy.log(`Error is 'not found'.`);
      });

      cy.log('**Call TEBRs API with incorrect token** 🔥');
      cy.tebrs('GET', `/${tebrId}`, { 'token': '' }).should((resp) => {
        expect(resp.status).to.eq(401);
        cy.log(`Error is '${resp.body.message}'.`);
      });
    });
  });

  it.skip(['smoke'], 'Admin - Update TEBR', () => { // TODO: statuses are not working yet
    cy.get('@tebrAlias').then((resp) => { // call the TEBR created as an alias in beforeEach
      tebrId = resp.body.id;
      cy.log('**Call TEBRs API with correct token** 🔥');
      tebrBody = {
        'token': token,
        'id': tebrId,
        'title': 'updated title ' + tebrTitle,
        'description': 'updated description' + tebrTitle,
        'startDate': todayUTC,
        'endDate': endDateUTC,
        'assignedToID': userGroupId,
        'requestorID': userId,
        'statusID': tebrAPIModel.bookingRequestStatusId,
        'typeID': tebrAPIModel.bookingRequestTypeId,
        'systems':[
          // {
          //     "systemId": "{{new-system-guid}}",
          //     "systemRoleType": "Impact",
          //     "systemRoleDependencyTypeId": "{{systems-subtype-customization-1-guid}}"
          // }
        ]
      };
      data = {
        'token': token,
        'body': tebrBody
      };
      // cy.tebrs('PUT', `/${tebrId}`, data).should((resp) => {
      //   expect(resp.status).to.eq(200);
      //   expect(resp.body.id).eq(tebrId);
      //   expect(resp.body.title).eq('updated title');
      //   expect(resp.body.description).eq('updated description');
      //   expect(resp.body.crTypeID).not.eq(null);
      //   expect(resp.body.startDate).not.eq(null);
      //   expect(resp.body.dueDate).not.eq(null);
      //   expect(resp.body.crStatusID).not.eq(null);
      //   cy.log(`TEBR '${resp.body.title}' successfully updated.`);
      // });

      cy.log('**Call TEBRs API with mismatched query string parameter and request body Id** 🔥');
      tebrBody = {
        'token': token,
        'id': uuidv4(),
        'title': 'updated title',
        'startDate': today,
        'endDate': today,
        'assignedToID': userGroupId,
        'requestorID': userId,
        'statusID': tebrAPIModel.bookingRequestStatusId,
        'typeID': tebrAPIModel.bookingRequestTypeId
      };
      data = {
        'token': token,
        'body': tebrBody
      };
      cy.tebrs('PUT', `/${tebrId}`, data).should((resp) => {
        expect(resp.status).to.eq(400);
        cy.log(`Error is '${resp.body.message}'.`);
      });

      cy.log('**Call TEBRs API with missing fields** 🔥');
      cy.tebrs('PUT', `/${tebrId}`, { 'token': token, 'body': '' }).should((resp) => {
        expect(resp.status).to.eq(500);
        cy.log(`Error is '${resp.body.message}'.`);
      });

      cy.log('**Call TEBRs API with invalid Id** 🔥');
      tebrBody = {
        'token': token,
        'id': uuidv4(),
        'title': 'updated title',
        'startDate': today,
        'endDate': today,
        'assignedToID': userGroupId,
        'requestorID': userId,
        'statusID': tebrAPIModel.bookingRequestStatusId,
        'typeID': tebrAPIModel.bookingRequestTypeId
      };
      data = {
        'token': token,
        'body': tebrBody
      };
      cy.tebrs('PUT', `/${uuidv4()}`, data).should((resp) => {
        expect(resp.status).to.eq(400);
        cy.log(`Error is '${resp.body.message}'.`);
      });

      cy.log('**Call TEBRs API with incorrect token** 🔥');
      cy.tebrs('PUT', `/${tebrId}`, { 'token': '' }).should((resp) => {
        expect(resp.status).to.eq(401);
        cy.log(`Error is '${resp.body.message}'.`);
      });
    });
  });
  it(['smoke'], 'Admin - Delete TEBR', () => {
    cy.get('@tebrAlias').then((resp) => { // call the tebr created as an alias in beforeEach
      tebrId = resp.body.id;
      cy.log('**Call TEBRs API with invalid Id** 🔥');
      cy.tebrs('DELETE', `/${uuidv4()}`, { 'token': token }).should((resp) => {
        expect(resp.status).to.eq(404);
        cy.log(`Error is 'not found'.`);
      });

      cy.log('**Call TEBRs API with incorrect token** 🔥');
      cy.tebrs('DELETE', `/${tebrId}`, { 'token': '' }).should((resp) => {
        expect(resp.status).to.eq(401);
        cy.log(`Error is '${resp.body.message}'.`);
      });

      cy.log('**Call TEBRs API with correct token** 🔥');
      cy.tebrs('DELETE', `/${tebrId}`, { 'token': token }).should((resp) => {
        expect(resp.status).to.eq(200);
        cy.log('TEBR was successfully deleted.');
      });
    });
  });
});