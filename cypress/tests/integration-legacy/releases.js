import faker from 'faker/locale/en_AU'; // https://www.npmjs.com/package/faker
import { v4 as uuidv4 } from 'uuid';
import dataProviderLegacy from '../../services/data-provider-legacy';

let data = [];
let token = '';
let releaseId = '';
let releaseName = '';
let filter = '';
let filterBody = '';
let recordsPerPage = '';
let pageNum = '';
let changeId = '';
let changeName = '';
let changeBody = []; // set to array so its possible to push more objects
let stakeholderId = '';
let systemId = '';
let systemName = '';

const userId = Cypress.env().users['admin'].userId;
const userGroupId = Cypress.env().users['admin'].userGroupId;
const organizationId = Cypress.env().users["admin"].organizationId;

const date = new Date();
const dateNow = date.toISOString();

const releaseAPIModel = dataProviderLegacy.getLegacyModel();

before(() => { // token is generated and written to fixtures/data.json before any run-time via support/index.js
  cy.fixture('data').should((data) => {
    token = data.token;
  }).then(() => {
    // test data which will be used across all tests is created here
    dataProviderLegacy.setToken(token);
    dataProviderLegacy.getLegacyLookupSystemRoleDependencyType();
    dataProviderLegacy.getLegacyLookupFieldReleaseRiskLevel();
    dataProviderLegacy.getLegacyLookupFieldReleaseStatusType();
    dataProviderLegacy.getLegacyLookupFieldReleaseType();
    dataProviderLegacy.getLegacyLookupFieldChangeDeliveryRisk();
    dataProviderLegacy.getLegacyLookupFieldChangePriority();
    dataProviderLegacy.getLegacyLookupFieldChangeStatus();
    dataProviderLegacy.getLegacyLookupFieldChangeTheme();
    dataProviderLegacy.getLegacyLookupFieldChangeType();
    dataProviderLegacy.getLegacyLookupStakeholderRole();
  });
});

describe(['release'], 'Integration: Releases (Enterprise)', ()=> {
  beforeEach(() => { // run before each test
    // create a new release specific to each CRUD functionality (deterministic test!)
    releaseName = 'release-' + faker.random.word() + ' ' + dateNow;
    data = {
      'token': token,
      'identifier': releaseName,
      'name': releaseName,
      'summary': releaseName,
      'releaseTypeId': releaseAPIModel.releaseTypeId,
      'location': faker.address.country(),
      'releaseStatusTypeId': releaseAPIModel.releaseStatusTypeId,
      'releaseRiskLevelId': releaseAPIModel.releaseRiskLevelId,
      'implementationDate': dateNow,
      'displayColor': faker.internet.color(),
      'organizationId': organizationId,
      'managerId': userId,
      'plutoraReleaseType': 'Enterprise',
      'releaseProjectType': 'None'
    };
    cy.releases('POST', '', data).as('erAlias').then((resp) => { // save as an alias so easier to call per test
      systemName = 'system-' + faker.random.word() + ' ' + dateNow;
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
      });
    });
  });

  it(['smoke'], 'Create Release', () => { // TODO: Link type, status, rik
    cy.log('**Call Releases API with correct token** 🔥');
    cy.get('@erAlias').then((resp) => { // call the release created as an alias in beforeEach
      expect(resp.status).to.eq(201); // assert status code
      expect(resp.headers).to.have.property('content-type', 'application/json; charset=utf-8'); // assert properties
      expect(resp.body.name).eq(releaseName); // assert objects
      expect(resp.body.identifier).eq(releaseName);
      expect(resp.body.summary).eq(releaseName);
      expect(resp.body.lastModifiedDate).not.eq(null);
      expect(resp.body.location).not.eq(null);
      expect(resp.body.releaseTypeId).eq(releaseAPIModel.releaseTypeId);
      expect(resp.body.releaseType).not.eq(null);
      expect(resp.body.releaseStatusTypeId).eq(releaseAPIModel.releaseStatusTypeId);
      expect(resp.body.releaseStatusType).not.eq(null);
      expect(resp.body.releaseRiskLevelId).eq(releaseAPIModel.releaseRiskLevelId);
      expect(resp.body.releaseRiskLevel).not.eq(null);
      expect(resp.body.implementationDate).not.eq(null);
      expect(resp.body.displayColor).not.eq(null);
      expect(resp.body.organizationId).eq(organizationId);
      expect(resp.body.organization).not.eq(null);
      expect(resp.body.managerId).not.eq(null);
      expect(resp.body.manager).not.eq(null);
      expect(resp.body.parentReleaseId).eq(null);
      expect(resp.body.parentRelease).eq(null);
      expect(resp.body.plutoraReleaseType).eq('Enterprise');
      expect(resp.body.releaseProjectType).eq('None');
      // TODO: assert more heaps on custom fields!
      cy.log(`Release '${resp.body.name}' successfully created.`);
    });

    cy.log('**Call Releases API with incorrect token** 🔥');
    cy.releases('POST', '', { "token": uuidv4() }).should((resp) => {
      expect(resp.status).to.eq(401);
      cy.log(`Error is '${resp.body.message}'.`);
    });

    cy.log('**Call Releases API with empty content** 🔥');
    data = {
      "token": token,
      "name": ''
    };
    cy.releases('POST', '', data).should((resp) => {
      expect(resp.status).to.eq(400);
      cy.log(`Error is '${resp.body.message}'.`);
    });
  });

  it('Post Releases with filters', () => {
    filterBody = {
        "expandoObject": {
          "Left": {
            "Left": "releaseStatusType",
            "Operator": "NotEquals",
            "Right": "Cancelled"
          },
          "Operator": "AND",
          "Right": {
            "Left": {
              "Left": "plutoraReleaseType",
              "Operator": "NotEquals",
              "Right": "Enterprise"
            },
            "Operator": "AND",
            "Right": {
              "Left": {
                "Left": {
                  "Left": "identifier",
                  "Operator": "StartsWith",
                  "Right": "CHG"
                },
                "Operator": "AND",
                "Right": {
                  "Left": "identifier",
                  "Operator": "Contains",
                  "Right": ""
                }
              },
              "Operator": "OR",
              "Right": {
                "Left": {
                  "Left": "identifier",
                  "Operator": "NotContains",
                  "Right": "CHG"
                },
                "Operator": "AND",
                "Right": {
                  "Left": "identifier",
                  "Operator": "Equals",
                  "Right": "LAMP_Payments | RLSE0010753"
                }
              }
            }
          }
        },
        "recordsPerPage": 100,
        "pageNum": 0
      };
    data = {
      'token': token,
      'body': JSON.stringify(filterBody)
    };
    cy.releases('POST', '/filter', data).should((resp) => {
      releaseId = resp.body.id;
      cy.log('**Call Releases API with correct token and without results** 🔥');
      expect(resp.body.resultSet).not.eq(null); // assert objects
      expect(resp.body.returnCount).not.eq(null);
      expect(resp.body.totalCount).not.eq(null);
      expect(resp.body.pageNum).not.eq(null);
      expect(resp.body.recordsPerPage).not.eq(null);
      cy.log(`A total of '${resp.body.totalCount}' records successfully retrieved.`);

      cy.log('**Call Releases API with incorrect token** 🔥');
      cy.releases('GET', '', { "token": '' }).should((resp) => {
        expect(resp.status).to.eq(401);
        cy.log(`Error is '${resp.body.message}'.`);
      });
    });
  });

  it(['smoke'], 'Delete Release', () => {
    cy.get('@erAlias').then((resp) => { // call the release created as an alias in beforeEach
      releaseId = resp.body.id;
      cy.log('**Call Releases API with correct token** 🔥');
      cy.releases('DELETE', `/${releaseId}`, { "token": token }).should((resp) => {
        expect(resp.status).to.eq(200); // TODO: This should return 204!
        cy.log(`Release '${releaseName}' successfully deleted.`);
      });

      cy.log('**Call Releases API with invalid Id** 🔥');
      cy.releases('DELETE', `/${uuidv4()}`, { "token": token }).should((resp) => {
        expect(resp.status).to.eq(404);
        cy.log(`Error is 'not found'.`);
      });

      cy.log('**Call Releases API with incorrect token** 🔥');
      cy.releases('DELETE', `/${releaseId}`, { "token": '' }).should((resp) => {
        expect(resp.status).to.eq(401);
        cy.log(`Error is '${resp.body.message}'.`);
      });
    });
  });

  it(['smoke'], 'Retrieve Releases', () => {
    cy.releases('GET', '', {'token': token}).should((resp) => {
      releaseId = resp.body.id;
      cy.log('**Call Releases API with correct token** 🔥');
      expect(resp.status).to.eq(200);
      expect(resp.body[0].id).not.eq(null); // assert mandatory objects
      expect(resp.body[0].identifier).not.eq(null);
      expect(resp.body[0].name).not.eq(null);
      expect(resp.body[0].implemetationDate).not.eq(null);
      expect(resp.body[0].plutoraReleaseType).not.eq(null);
      expect(resp.body[0].releaseProjectType).not.eq(null);
      expect(resp.body[0].lastModifiedDate).not.eq(null);
      cy.log(`A total of '${resp.body.length}' records successfully retrieved.`);

      cy.log('**Call Releases API with incorrect token** 🔥');
      cy.releases('GET', '', { "token": '' }).should((resp) => {
        expect(resp.status).to.eq(401);
        cy.log(`Error is '${resp.body.message}'.`);
      });
    });
  });

  it.skip('Retrieve Releases with filters', () => { // TODO: This seems to be a bug so skipping for now
    filter = '%60identifier%60%20%60Equals%60%20%60CHG0052380%20%7C%20DWH%20(SAS)%60';
    recordsPerPage = 0;
    pageNum = 0;
    cy.releases('GET', `/?filter=${filter}&recordsPerPage=${recordsPerPage}&pageNum=${pageNum}`, { "token": token}).should((resp) => {
      releaseId = resp.body.id;
      cy.log('**Call Releases API with correct token** 🔥');
      expect(resp.status).to.eq(200);
      expect(resp.body.resultSet).not.eq(null); // assert objects
      expect(resp.body.returnCount).not.eq(null);
      expect(resp.body.totalCount).not.eq(null);
      expect(resp.body.pageNum).not.eq(null);
      expect(resp.body.recordsPerPage).not.eq(null);
      cy.log(`A total of '${resp.body.totalCount}' records successfully retrieved.`);

      cy.log('**Call Releases API with incorrect token** 🔥');
      cy.releases('GET', '', { "token": '' }).should((resp) => {
        expect(resp.status).to.eq(401);
        cy.log(`Error is '${resp.body.message}'.`);
      });
    });
  });

  it(['smoke'], 'Retrieve Release', () => {
    cy.get('@erAlias').then((resp) => { // call the release created as an alias in beforeEach
      releaseId = resp.body.id;
      cy.log('**Call Releases API with correct token** 🔥');
      cy.releases('GET', `/${releaseId}`, { "token": token }).should((resp) => {
        expect(resp.status).to.eq(200);
        expect(resp.body.identifier).eq(releaseName);
        expect(resp.body.summary).eq(releaseName);
        expect(resp.body.organizationId).eq(organizationId);
        expect(resp.body.plutoraReleaseType).eq('Enterprise');
        expect(resp.body.releaseProjectType).eq('None');
        // TODO: assert more heaps on custom fields!
        cy.log(`Release '${resp.body.name}' successfully retrieved.`);
      });

      cy.log('**Call Releases API with invalid Id** 🔥');
      cy.releases('GET', `/${uuidv4()}`, { "token": token }).should((resp) => {
        expect(resp.status).to.eq(404);
        cy.log(`Error is 'not found'.`);
      });

      cy.log('**Call Releases API with incorrect token** 🔥');
      cy.releases('GET', `/${releaseId}`, { "token": '' }).should((resp) => {
        expect(resp.status).to.eq(401);
        cy.log(`Error is '${resp.body.message}'.`);
      });
    });
  });

  it('Retrieve Release with associated Changes', () => {
    cy.get('@erAlias').then((resp) => { // call the release created as an alias in beforeEach
      releaseId = resp.body.id;
      // create new changes
      changeName = 'change-' + faker.random.word() + ' ' + dateNow;
      changeBody = {
        'name': changeName,
        'changePriorityId': releaseAPIModel.changePriorityId,
        'changeStatusId': releaseAPIModel.changeStatusId,
        'businessValueScore': faker.random.number({'min': 0, 'max': 100}),
        'organizationId': organizationId,
        'changeTypeId': releaseAPIModel.changeTypeId,
        'changeDeliveryRiskId': releaseAPIModel.changeDeliveryRiskId,
        'expectedDeliveryDate': dateNow,
        'changeThemeId': releaseAPIModel.changeThemeId,
        'description': changeName,
        'descriptionSimple': changeName,
        'raisedById': userId,
        'assignedToId': userId
      };
      data = {
        'token': token,
        'body': changeBody
      };
      cy.changes('POST', '', data).then((respChange) => {
        changeId = respChange.body.id;
        changeBody = {
          'releaseId': releaseId,
          'targetRelease': true,
          'actualDeliveryRelease': true
        };
        data = {
          'token': token,
          'body': changeBody
        };
        cy.changes('PUT', `/${changeId}/deliveryReleases/${releaseId}`, data);
      });
      // cy.log('**Call Releases API with correct token** 🔥');
      // cy.releases('GET', `/${releaseId}`, { "token": token }).should((resp) => {
      //   expect(resp.status).to.eq(200);
      //   expect(resp.body.identifier).eq(releaseName);
      //   expect(resp.body.summary).eq(releaseName);
      //   expect(resp.body.organizationId).eq(organizationId);
      //   expect(resp.body.plutoraReleaseType).eq('Enterprise');
      //   expect(resp.body.releaseProjectType).eq('None');
      //   // TODO: assert more heaps on custom fields!
      //   cy.log(`Release '${resp.body.name}' successfully retrieved.`);
      // });

      // cy.log('**Call Releases API with invalid Id** 🔥');
      // cy.releases('GET', `/${uuidv4()}`, { "token": token }).should((resp) => {
      //   expect(resp.status).to.eq(404);
      //   cy.log(`Error is 'not found'.`);
      // });

      // cy.log('**Call Releases API with incorrect token** 🔥');
      // cy.releases('GET', `/${releaseId}`, { "token": '' }).should((resp) => {
      //   expect(resp.status).to.eq(401);
      //   cy.log(`Error is '${resp.body.message}'.`);
      // });
    });
  });

  it(['smoke'], 'Update Release', () => {
    cy.get('@erAlias').then((resp) => { // call the release created as an alias in beforeEach
      releaseId = resp.body.id;
      releaseName = 'updated name ' + dateNow;
      cy.log('**Call Releases API with correct token** 🔥');
      data = {
        'token': token,
        'id': releaseId,
        'identifier': releaseName,
        'name': releaseName,
        'summary': 'updated summary',
        'releaseTypeId': releaseAPIModel.releaseTypeId,
        'location': 'Nowhere',
        'releaseStatusTypeId': releaseAPIModel.releaseStatusTypeId,
        'releaseRiskLevelId': releaseAPIModel.releaseRiskLevelId,
        'implementationDate': dateNow,
        'displayColor': '#999999',
        'organizationId': organizationId,
        'plutoraReleaseType': 'Enterprise',
        'releaseProjectType': 'NotIsProject'
      };
      cy.releases('PUT', `/${releaseId}`, data).should((resp) => {
        expect(resp.status).to.eq(204);
        cy.log(`Release '${releaseName}' successfully updated.`);
      });

      cy.log('**Call Releases API with missing mandatory fields** 🔥');
      data = {
        'token': token,
        'id': releaseId,
        'identifier': releaseName,
        'name': releaseName
      };
      cy.releases('PUT', `/${releaseId}`, data).should((resp) => {
        expect(resp.status).to.eq(400);
        cy.log(`Error is '${resp.body.message}'.`);
      });

      cy.log('**Call Releases API with invalid Id** 🔥');
      data = {
        'token': token,
        'id': '93b05dc9-5286-49bb-9632-13240dc1f8e6', // non-existing guid
        'identifier': releaseName,
        'name': releaseName,
        'summary': 'updated summary',
        'releaseTypeId': releaseAPIModel.releaseTypeId,
        'location': 'Nowhere',
        'releaseStatusTypeId': releaseAPIModel.releaseStatusTypeId,
        'releaseRiskLevelId': releaseAPIModel.releaseRiskLevelId,
        'implementationDate': dateNow,
        'displayColor': '#999999',
        'organizationId': organizationId,
        'plutoraReleaseType': 'Enterprise',
        'releaseProjectType': 'NotIsProject'
      };
      cy.releases('PUT', `/93b05dc9-5286-49bb-9632-13240dc1f8e6`, data).should((resp) => {
        expect(resp.status).to.eq(404);
        cy.log(`Error is 'not found'.`);
      });

      cy.log('**Call Releases API with mismatching Id in url and body** 🔥');
      data = {
        'token': token,
        'id': releaseId,
        'identifier': releaseName,
        'name': releaseName,
        'summary': 'updated summary',
        'releaseTypeId': releaseAPIModel.releaseTypeId,
        'location': 'Nowhere',
        'releaseStatusTypeId': releaseAPIModel.releaseStatusTypeId,
        'releaseRiskLevelId': releaseAPIModel.releaseRiskLevelId,
        'implementationDate': dateNow,
        'displayColor': '#999999',
        'organizationId': organizationId,
        'plutoraReleaseType': 'Enterprise',
        'releaseProjectTyp': 'NotIsProject'
      };
      cy.releases('PUT', `/${uuidv4()}`, data).should((resp) => {
        expect(resp.status).to.eq(400);
        cy.log(`Error is '${resp.body.message}'.`);
      });

      cy.log('**Call Releases API with incorrect token** 🔥');
      cy.releases('PUT', `/${releaseId}`, { "token": '' }).should((resp) => {
        expect(resp.status).to.eq(401);
        cy.log(`Error is '${resp.body.message}'.`);
      });
    });
  });

  it('Create Release with Stakeholders', () => {
    cy.get('@erAlias').then((resp) => { // call the release created (already has owner / manager) as an alias in beforeEach
      releaseId = resp.body.id;
      cy.log('**Call Releases API with correct token** 🔥');
      data = {
        'token': token,
        'groupId': userGroupId,
        'stakeholderRoleIds': [releaseAPIModel.stakeholderRoleId],
        'responsible': true,
        'accountable': true,
        'informed': false,
        'consulted': false
      };
      cy.releases('POST', `/${releaseId}/stakeholders`, data).should((resp) => {
        expect(resp.status).to.eq(201);
        cy.log(`Release '${releaseName}' successfully created.`);
        cy.releases('GET', `/${releaseId}/stakeholders/${userGroupId}`, data).should((resp) => {
          expect(resp.status).to.eq(200);
          expect(resp.body.userId).to.eq(null); // since user group was added
          expect(resp.body.user).to.eq(''); // since user group was added
          expect(resp.body.groupId).to.eq(userGroupId);
          expect(resp.body.group).not.eq(null);
          expect(resp.body.stakeholderRoleIds).to.contain(releaseAPIModel.stakeholderRoleId);
          expect(resp.body.responsible).to.eq(true);
          expect(resp.body.accountable).to.eq(true);
          expect(resp.body.informed).to.eq(false);
          expect(resp.body.consulted).to.eq(false);
        });
      });

      cy.log('**Call Releases API with an existing stakeholder** 🔥');
      data = {
        'token': token,
        'userId': userId,
        'stakeholderRoleIds': [releaseAPIModel.stakeholderRoleId],
        'responsible': true,
        'accountable': true,
        'informed': true,
        'consulted': true
      };
      cy.releases('POST', `/${releaseId}/stakeholders`, data).should((resp) => {
        expect(resp.status).to.eq(400);
        cy.log(`Error is '${resp.body.modelState.internalServerValidationError[0]}'.`);
      });

      cy.log('**Call Releases API with invalid Role Id** 🔥');
      data = {
        'token': token,
        'userId': userId,
        'stakeholderRoleIds': [uuidv4()]
      };
      cy.releases('POST', `/${releaseId}/stakeholders`, data).should((resp) => {
        expect(resp.status).to.eq(400);
        cy.log(`Error is '${resp.body.modelState.internalServerValidationError[0]}'.`);
      });
    });
  });

  it('Update Release with Stakeholders', () => {
    cy.get('@erAlias').then((resp) => { // call the release created as an alias in beforeEach
      releaseId = resp.body.id;
      data = {
        'token': token,
        'id': releaseId,
        'identifier': releaseName,
        'name': releaseName,
        'releaseTypeId': releaseAPIModel.releaseTypeId,
        'releaseStatusTypeId': releaseAPIModel.releaseStatusTypeId,
        'releaseRiskLevelId': releaseAPIModel.releaseRiskLevelId,
        'implementationDate': dateNow,
        'displayColor': faker.internet.color(),
        'organizationId': organizationId,
        'managerId': '' // set it to blank so it can be updated
      };
      cy.releases('GET', `/${releaseId}/stakeholders`, data).should((resp) => {
        stakeholderId = resp.body[0].id;
        cy.log('**Call Releases API with Owner as Stakeholder and setting it as non-accountable** 🔥');
        data = {
          'token': token,
          'userId': userId,
          'stakeholderRoleIds': [releaseAPIModel.stakeholderRoleId],
          'responsible': true,
          'accountable': false,
          'informed': true,
          'consulted': true
        };
        cy.releases('PUT', `/${releaseId}/stakeholders/${stakeholderId}`, data).should((resp) => {
          expect(resp.status).to.eq(400);
          cy.log(`Error is '${resp.body.modelState.internalServerValidationError[0]}'.`);
        });
      });
      cy.releases('PUT', `/${releaseId}`, data).should((resp) => {
        cy.releases('GET', `/${releaseId}`, {'token': token}).should((resp) => { // verify that it was updated to blank
          expect(resp.status).to.eq(200);
          expect(resp.body.managerId).eq(null);
          expect(resp.body.manager).eq(null);
          cy.log('**Call Releases API with correct token** 🔥');
          cy.releases('GET', `/${releaseId}/stakeholders`, data).should((resp) => {
            stakeholderId = resp.body[0].id;
            data = {
              'token': token,
              'userId': userId,
              'stakeholderRoleIds': [releaseAPIModel.stakeholderRoleId],
              'responsible': false,
              'accountable': false,
              'informed': false,
              'consulted': true
            };
            cy.releases('PUT', `/${releaseId}/stakeholders/${stakeholderId}`, data).should((resp) => {
              expect(resp.status).to.eq(204);
              cy.log(`Release '${releaseName}' successfully updated.`);
              cy.releases('GET', `/${releaseId}/stakeholders`, data).should((resp) => {
                expect(resp.body[0].userId).to.eq(userId);
                expect(resp.body[0].stakeholderRoleIds).to.contain(releaseAPIModel.stakeholderRoleId);
                expect(resp.body[0].responsible).to.eq(false);
                expect(resp.body[0].accountable).to.eq(false);
                expect(resp.body[0].informed).to.eq(false);
                expect(resp.body[0].consulted).to.eq(true);
              });
            });
          });
        });
      });

      cy.log('**Call Releases API with invalid Stakeholder Id** 🔥');
      cy.releases('PUT', `/${releaseId}/stakeholders/${uuidv4()}`, {'token': token}).should((resp) => {
        expect(resp.status).to.eq(400);
        cy.log(`Error is '${resp.body.message}'.`);
      });
    });
  });

  it('Post System to Release', () => {
    cy.log('**Call Releases API with correct token** 🔥');
    cy.get('@erAlias').then((resp) => { // call the release created as an alias in beforeEach
      releaseId = resp.body.id;
      cy.log('**Call Releases API with correct token** 🔥');
      data = {
        'token': token,
        'systemId': systemId,
        'systemRoleType': 'Impact',
        'systemRoleDependencyTypeId': releaseAPIModel.systemRoleDependencyTypeId
      };
      cy.releases('POST', `/${releaseId}/systems`, data).should((resp) => {
        expect(resp.status).to.eq(201);
        expect(resp.body.systemId).to.eq(systemId);
        expect(resp.body.system).to.eq(systemName);
        expect(resp.body.systemRoleDependencyTypeId).to.eq(releaseAPIModel.systemRoleDependencyTypeId);
        expect(resp.body.systemRoleDependencyType).to.eq(releaseAPIModel.systemRoleDependencyTypeName);
        expect(resp.body.isGhost).to.eq(false);
        expect(resp.body.isDeleted).to.eq(false);
        cy.log(`Release '${releaseName}' successfully updated.`);
      });

      cy.log('**Call Releases API with missing mandatory fields** 🔥');
      data = {
        'token': token,
        'systemId': systemId
      };
      cy.releases('POST', `/${releaseId}/systems`, data).should((resp) => {
        expect(resp.status).to.eq(400);
        cy.log(`Error is '${resp.body.message}'.`);
      });

      cy.log('**Call Releases API with invalid System Id** 🔥');
      data = {
        'token': token,
        'systemId': uuidv4(),
        'systemRoleType': 'Impact',
        'systemRoleDependencyTypeId': releaseAPIModel.systemRoleDependencyTypeId
      };
      cy.releases('POST', `/${releaseId}/systems`, data).should((resp) => {
        expect(resp.status).to.eq(404);
        cy.log(`Error is 'not found'.`);
      });

      cy.log('**Call Releases API with incorrect token** 🔥');
      cy.releases('POST', `/${releaseId}/systems`, { 'token': '' }).should((resp) => {
        expect(resp.status).to.eq(401);
        cy.log(`Error is '${resp.body.message}'.`);
      });
    });
  });
  // TODO: etc. https://auapi.plutora.com/swagger/ui/index#!/releases
});