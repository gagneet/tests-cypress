import faker from 'faker/locale/en_AU'; // https://www.npmjs.com/package/faker
import { v4 as uuidv4 } from 'uuid';

let data = [];
let token = '';
let newUserGroupId = '';
let newUserGroupName = '';
const existingUserGroupId = Cypress.env().users['admin'].userGroupId;
const existingUsername = Cypress.env().users['admin'].username;
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);
const today = dayjs().format('DD-MM-YYYYHH:mm:ss');

before(() => { // token is generated and written to fixtures/data.json before any run-time via support/index.js
  cy.fixture('data').should((data) => {
    token = data.token;
  });
});

describe(['settings'], 'Integration: User Groups', ()=> {
  beforeEach(() => { // run before each test
    // create a new user group specific to each CRUD functionality (deterministic test!)
    newUserGroupName = 'usergroup-' + faker.random.word() + ' ' + today;
    data = {
      "token": token,
      "name": newUserGroupName,
      "description": newUserGroupName
    };
    cy.userGroups('POST', '', data).as('userGroupAlias'); // save as an alias so easier to call per test
  });
  it('Admin - Create User Group', () => {
    cy.log('**Call User Groups API with correct token** 🔥');
    cy.get('@userGroupAlias').then((resp) => { // call the user group created as an alias in beforeEach
      expect(resp.status).to.eq(200); // assert status code
      expect(resp.headers).to.have.property('content-type', 'application/json; charset=utf-8'); // assert properties
      expect(resp.body.statusCode).eq('OK'); // assert objects
      expect(resp.body.success).eq(true);
      expect(resp.body.ErrorMessage).eq(null);
      expect(resp.body.Data.Id).not.eq(null);
      expect(resp.body.Data.Name).eq(newUserGroupName);
      expect(resp.body.Data.Description).eq(newUserGroupName);
      cy.log(`User Group '${resp.body.Data.Name}' successfully created.`);
    });

    cy.log('**Call User Groups API with incorrect token** 🔥');
    cy.userGroups('POST', '', { "token": uuidv4() }).should((resp) => {
      expect(resp.status).to.eq(401);
      cy.log(`Error is '${resp.body.Message}'.`);
    });

    // cy.log('**Call User Groups API with empty content** 🔥'); // TODO: Allows user group without name! This should be a 400 error!
    // data = {
    //   "token": token,
    //   "name": ''
    // };
    // cy.userGroups('POST', '', data).should((resp) => {
    //   expect(resp.status).to.eq(200); // TODO: This should be a 400 error!
    //   cy.log(`Error is '${resp.body.ErrorMessage}'.`);
    // });
  });

  it('Admin - Delete User Group', () => {
    cy.get('@userGroupAlias').then((resp) => { // call the user group created as an alias in beforeEach
      newUserGroupId = resp.body.Data.Id;
      cy.log('**Call User Groups API with correct token** 🔥');
      cy.userGroups('DELETE', `/${newUserGroupId}`, { "token": token }).should((resp) => {
        expect(resp.status).to.eq(200);
        expect(resp.body.statusCode).eq('OK');
        expect(resp.body.success).eq(true);
        expect(resp.body.ErrorMessage).eq(null);
        expect(resp.body.Data.Id).eq(newUserGroupId);
        expect(resp.body.Data.Name).eq(newUserGroupName);
        expect(resp.body.Data.Description).eq(newUserGroupName);
        // expect(resp.body.Data.Members).not.eq(null); // TODO: un-comment once CF-183 is released
        cy.log(`User Group '${resp.body.Data.Name}' successfully deleted.`);
      });

      cy.log('**Call User Groups API with invalid Id** 🔥');
      cy.userGroups('DELETE', `/${uuidv4()}`, { "token": token }).should((resp) => {
        expect(resp.status).to.eq(200); // TODO: This should be 404 - not found
        cy.log(`Error is '${resp.body.ErrorMessage}'.`);
      });

      cy.log('**Call User Groups API with incorrect token** 🔥');
      cy.userGroups('DELETE', `/${newUserGroupId}`, { "token": '' }).should((resp) => {
        expect(resp.status).to.eq(401);
        cy.log(`Error is '${resp.body.Message}'.`);
      });
    });
  });

  it('Admin - Retrieve User Group', () => {
    // this test presumes that an existing user group with a member already exists
    // the env file under config/....env.json should ensure valid uuid for user group has been included
    cy.userGroups('GET', `/${existingUserGroupId}`, { "token": token }).should((resp) => {
      // expect(resp.body.Data.Members[0].Email).eq(existingUsername); // TODO: un-comment once CF-183 is released
      // expect(resp.body.Data.Members[0].Id).not.eq(null); // TODO: un-comment once CF-183 is released
      // cy.log(`User Group '${resp.body.Data.Name}' with Member '${resp.body.Data.Members[0].Email}' successfully retrieved.`); // TODO: un-comment once CF-183 is released
    });

    // normal tests
    cy.get('@userGroupAlias').then((resp) => { // call the user group created as an alias in beforeEach
      newUserGroupId = resp.body.Data.Id;
      cy.log('**Call User Groups API with correct token** 🔥');
      cy.userGroups('GET', `/${newUserGroupId}`, { "token": token }).should((resp) => {
        expect(resp.status).to.eq(200);
        expect(resp.body.statusCode).eq('OK'); // assert objects
        expect(resp.body.success).eq(true);
        expect(resp.body.ErrorMessage).eq(null);
        expect(resp.body.Data.Id).eq(newUserGroupId);
        expect(resp.body.Data.Name).eq(newUserGroupName);
        expect(resp.body.Data.Description).eq(newUserGroupName);
        // expect(resp.body.Data.Members).not.eq(null); // TODO: un-comment once CF-183 is released
        cy.log(`User Group '${resp.body.Data.Name}' successfully retrieved.`);
      });

      cy.log('**Call User Groups API with invalid Id** 🔥');
      cy.userGroups('GET', `/${uuidv4()}`, { "token": token }).should((resp) => {
        expect(resp.status).to.eq(404);
        cy.log(`Error is 'not found'.`);
      });

      cy.log('**Call User Groups API with incorrect token** 🔥');
      cy.userGroups('GET', `/${newUserGroupId}`, { "token": '' }).should((resp) => {
        expect(resp.status).to.eq(401);
        cy.log(`Error is '${resp.body.Message}'.`);
      });
    });
  });

  it('Admin - Update User Group', () => {
    cy.get('@userGroupAlias').then((resp) => { // call the user group created as an alias in beforeEach
      newUserGroupId = resp.body.Data.Id;
      cy.log('**Call User Groups API with correct token** 🔥');
      data = {
        "token": token,
        "name": 'updated name',
        "description": 'updated description'
      };
      cy.userGroups('PATCH', `/${newUserGroupId}`, data).should((resp) => {
        expect(resp.status).to.eq(200);
        expect(resp.body.statusCode).eq('OK');
        expect(resp.body.success).eq(true);
        expect(resp.body.ErrorMessage).eq(null);
        expect(resp.body.Data.Id).eq(newUserGroupId);
        expect(resp.body.Data.Name).eq('updated name');
        expect(resp.body.Data.Description).eq('updated description');
        // expect(resp.body.Data.Members).not.eq(null); // TODO: un-comment once CF-183 is released
        cy.log(`User Group '${resp.body.Data.Name}' successfully updated.`);
      });

      cy.log('**Call User Groups API with invalid Id** 🔥');
      cy.userGroups('PATCH', `/${uuidv4()}`, { "token": token }).should((resp) => {
        expect(resp.status).to.eq(200); // TODO: should be 404!
        // cy.log(`Error is '${ErrorMessage}'.`)
      });

      cy.log('**Call User Groups API with incorrect token** 🔥');
      cy.userGroups('PATCH', `/${newUserGroupId}`, { "token": '' }).should((resp) => {
        expect(resp.status).to.eq(401);
        cy.log(`Error is '${resp.body.Message}'.`);
      });
    });
  });
  // TODO: etc. https://auapi.plutora.com/swagger/ui/index#!/UserGroups
});