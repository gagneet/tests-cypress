import faker from 'faker/locale/en_AU'; // https://www.npmjs.com/package/faker
import { v4 as uuidv4 } from 'uuid';
import dataProviderLegacy from '../../services/data-provider-legacy';

let data = [];
let token = '';
let buildId = '';
let buildTag = '';
let buildNumber = '';
let changeBody ='';
let changeId = '';
let systemId = '';
let releaseId = '';
let changeName = '';
let systemName = '';
let enterpriseReleaseName = '';

const userId = Cypress.env().users['admin'].userId;
const organizationId = Cypress.env().users["admin"].organizationId;
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);
const today = dayjs().format('DD-MM-YYYYHH:mm:ss');
const endDateUTC = dayjs().add(1, 'month').utc().format();

const aPIModel = dataProviderLegacy.getLegacyModel();

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
    dataProviderLegacy.getLegacyLookupFieldReleaseRiskLevel(); // look up field for releases
    dataProviderLegacy.getLegacyLookupFieldReleaseStatusType();
    dataProviderLegacy.getLegacyLookupFieldReleaseType();
    dataProviderLegacy.getLegacyLookupSystemRoleDependencyType();
  });
});

describe(['build'], 'Integration: Builds', ()=> {
  beforeEach(() => { // run before each test
    cy.log('**Pre-condition: Create new System, Release & Change** 🐙');
    changeName = 'change-' + faker.address.countryCode() + ' ' + today;
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
      changeId = resp.body.id;
      enterpriseReleaseName = 'er-' + faker.address.countryCode() + ' ' + today;
      data = { // create Enterprise Release (as a parent)
        'token': token,
        'identifier': enterpriseReleaseName,
        'name': enterpriseReleaseName,
        'summary': enterpriseReleaseName,
        'releaseTypeId': aPIModel.releaseTypeId,
        'location': faker.address.country(),
        'releaseStatusTypeId': aPIModel.releaseStatusTypeId,
        'releaseRiskLevelId': aPIModel.releaseRiskLevelId,
        'implementationDate': endDateUTC,
        'displayColor': faker.internet.color(),
        'organizationId': organizationId,
        'parentReleaseId': null,
        'parentRelease': null,
        'plutoraReleaseType': 'Enterprise',
        'releaseProjectType': 'None'
      };
      cy.releases('POST', '', data).then((resp) => {
        releaseId = resp.body.id;
        systemName = 'system-' + faker.address.countryCode() + ' ' + today;
        data = { // create System
          'token': token,
          'name': systemName,
          'vendor': faker.company.companyName(),
          'status': 'Active',
          'organizationId': organizationId,
          'description': systemName,
        };
        cy.systems('POST', '', data).then((resp) => {
          systemId = resp.body.id;
          cy.log(`System '${systemId}' successfully set.`);
          data = { // link Release and System
            'token': token,
            'systemId': systemId,
            'systemRoleType': 'Impact',
            'systemRoleDependencyTypeId': aPIModel.systemRoleDependencyTypeId
          };
          cy.releases('POST', `/${releaseId}/systems`, data).then(() => {
            changeBody = {
              'systemId': systemId,
              'systemRoleType': 'Impact'
            };
            data = { // link System & Change
              'token': token,
              'body': changeBody
            };
            cy.changes('POST', `/${changeId}/systems`, data).then((resp) => {
              // create a new build specific to each CRUD functionality (deterministic test!)
              buildNumber = 'buildNumber-' + faker.random.number() + today;
              buildTag = 'buildTag-' + faker.random.number() + today;
              data = {
                'token': token,
                'buildNumber': buildNumber,
                'buildTag': buildTag,
                'branch': 'main',
                'buildStatus': 'SUCCESSFUL',
                'artifacts': null,
                'commitNumber': faker.random.number(),
                'systemId': systemId,
                'releaseId': releaseId,
                // 'changes': [ // TODO: for some reason, the linkage between system and release doesn't work
                //   {
                //     'changeId': changeId,
                //     'changeNumber': faker.random.number(),
                //     'changeName': changeName
                //   }
                // ]
              };
              cy.builds('POST', '', data).as('buildAlias');
            });
          });
        });
      });
    });
  });

  it('Get All Builds', () => {
    cy.log('**Call Builds API with correct token** 🔥');
    cy.builds('GET', '', {'token': token}).then((resp) => { // call the build created as an alias in beforeEach
      expect(resp.status).to.eq(200); // assert status code
      expect(resp.headers).to.have.property('content-type', 'application/json; charset=utf-8'); // assert properties
      expect(resp.body.returnCount).eq(resp.body.resultSet.length); // assert objects
      expect(resp.body.returnCount).not.eq(null);
      expect(resp.body.totalCount).not.eq(null);
      cy.log(`No. of builds '${resp.body.resultSet.length}' successfully retrieved.`);
    });

    cy.log('**Call Builds API with incorrect token** 🔥');
    cy.builds('GET', '', {'token': uuidv4()}).should((resp) => {
      expect(resp.status).to.eq(401);
      cy.log(`Error is '${resp.body.message}'.`);
    });
  });

  it(['smoke'], 'Admin - Create Builds', () => {
    cy.log('**Call Builds API with correct token** 🔥');
    cy.get('@buildAlias').then((resp) => { // call the build created as an alias in beforeEach
      expect(resp.status).to.eq(201); // assert status code
      expect(resp.headers).to.have.property('content-type', 'application/json; charset=utf-8'); // assert properties
      expect(resp.body.buildNumber).eq(buildNumber); // assert objects
      expect(resp.body.buildTag).eq(buildTag);
      expect(resp.body.branch).eq('main');
      expect(resp.body.buildStatus).eq('SUCCESSFUL');
      expect(resp.body.artifacts).eq(null);
      expect(resp.body.commitNumber).not.eq(null);
      expect(resp.body.systemId).eq(systemId);
      expect(resp.body.systemName).eq(systemName);
      expect(resp.body.releaseId).eq(releaseId);
      expect(resp.body.releaseName).eq(enterpriseReleaseName);
      expect(resp.body.releaseIdentifier).eq(enterpriseReleaseName);
      expect(resp.body.releaseType).not.eq(null);
      expect(resp.body.releaseImplementationDate).not.eq(null);
      expect(resp.body.dateCreated).not.eq(null);
      expect(resp.body.lastModifiedUser).not.eq(null);
      expect(resp.body.lastModified).not.eq(null);
      expect(resp.body.createdBy).not.eq(null);
      cy.log(`Build '${resp.body.buildNumber}' successfully created.`);
    });

    cy.log('**Call Builds API with incorrect token** 🔥');
    cy.builds('POST', '', { 'token': uuidv4() }).should((resp) => {
      expect(resp.status).to.eq(401);
      cy.log(`Error is '${resp.body.message}'.`);
    });

    cy.log('**Call Builds API with empty content** 🔥');
    data = {
      'token': token,
      'buildNumber': ''
    };
    cy.builds('POST', '', data).should((resp) => {
      expect(resp.status).to.eq(400);
      cy.log(`Error is '${resp.body.message}'.`);
    });
  });

  // it('Admin - Delete Build', () => {
  //   cy.get('@buildAlias').then((resp) => { // call the build created as an alias in beforeEach
  //     buildId = resp.body.id;
  //     cy.log('**Call Build API with correct token** 🔥');
  //     cy.builds('DELETE', `/${buildId}`, { "token": token }).should((resp) => {
  //       expect(resp.status).to.eq(200); // TODO: This should return 204!
  //       cy.log(`Build '${buildNumber}' successfully deleted.`);
  //     });

  //     cy.log('**Call Build API with invalid Id** 🔥');
  //     cy.builds('DELETE', `/${uuidv4()}`, { "token": token }).should((resp) => {
  //       expect(resp.status).to.eq(404);
  //       cy.log(`Error is 'not found'.`);
  //     });

  //     cy.log('**Call Build API with incorrect token** 🔥');
  //     cy.builds('DELETE', `/${buildId}`, { "token": '' }).should((resp) => {
  //       expect(resp.status).to.eq(401);
  //       cy.log(`Error is '${resp.body.message}'.`);
  //     });
  //   });
  // });

  it(['smoke'], 'Admin - Retrieve Build', () => {
    cy.get('@buildAlias').then((resp) => { // call the build created as an alias in beforeEach
      buildId = resp.body.id;
      cy.log('**Call Build API with correct token** 🔥');
      cy.builds('GET', `/${buildId}`, { "token": token }).should((resp) => {
        expect(resp.status).to.eq(200);
        expect(resp.body.id).eq(buildId); // assert objects
        expect(resp.body.buildNumber).eq(buildNumber);
        expect(resp.body.buildTag).eq(buildTag);
        cy.log(`Build '${resp.body.buildNumber}' successfully retrieved.`);
      });

      cy.log('**Call Build API with invalid Id** 🔥');
      cy.builds('GET', `/${uuidv4()}`, { 'token': token }).should((resp) => {
        expect(resp.status).to.eq(404);
        cy.log(`Error is 'not found'.`);
      });

      cy.log('**Call Build API with incorrect token** 🔥');
      cy.builds('GET', `/${buildId}`, { 'token': '' }).should((resp) => {
        expect(resp.status).to.eq(401);
        cy.log(`Error is '${resp.body.message}'.`);
      });
    });
  });

  it(['smoke'], 'Admin - Update Build', () => {
    cy.get('@buildAlias').then((resp) => { // call the build created as an alias in beforeEach
      buildId = resp.body.id;
      buildNumber = 'updated number ' + today;
      buildTag = 'updated tag ' + today;
      cy.log('**Call Build API with correct token** 🔥');
      data = {
        'token': token,
        'id': buildId,
        'buildNumber': buildNumber,
        'systemId': systemId,
        'buildTag': buildTag,
        'branch': 'new-branch',
        'artifacts': 'artifacts',
        'commitNumber': '001',
        'buildStatus': 'FAILED',
        'releaseId': releaseId,
      };
      cy.builds('PUT', `/${buildId}`, data).should((resp) => {
        expect(resp.status).to.eq(200);
        expect(resp.body.buildNumber).eq(buildNumber);
        expect(resp.body.systemId).eq(systemId);
        expect(resp.body.buildTag).eq(buildTag);
        expect(resp.body.branch).eq('new-branch');
        expect(resp.body.artifacts).eq('artifacts');
        expect(resp.body.commitNumber).eq('001');
        expect(resp.body.buildStatus).eq('FAILED');
        expect(resp.body.releaseId).eq(releaseId);
        cy.log(`Build '${resp.body.buildNumber}' successfully updated.`);
      });

      cy.log('**Call Build API with invalid Id** 🔥');
      cy.builds('PUT', `/${uuidv4()}`, { 'token': token }).should((resp) => {
        expect(resp.status).to.eq(400);
        cy.log(`Error is '${resp.body.message}'.`);
      });

      cy.log('**Call Build API with incorrect token** 🔥');
      cy.builds('PUT', `/${buildId}`, { 'token': '' }).should((resp) => {
        expect(resp.status).to.eq(401);
        cy.log(`Error is '${resp.body.message}'.`);
      });
    });
  });
  // TODO: etc. https://auapi.plutora.com/swagger/ui/index#!/builds
});