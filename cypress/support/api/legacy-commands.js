import faker from 'faker/locale/en_AU';
import dataProviderLegacy from '/cypress/services/data-provider-legacy';
import { standardApiHeaders } from './common';

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);
const today = dayjs().format('DD-MM-YYYYHH:mm:ss');
const todayUTC = dayjs().utc().format(); // convert local time to UTC time

const apiUrl = Cypress.env().apiUrl;
const oauthUrl = Cypress.env().oauthUrl;

// the below credentials are constants so inserted here instead of individual tests
const username = Cypress.env().users['admin'].username;
const password = Cypress.env().users['admin'].password;
const clientId = Cypress.env().users['admin'].clientId;
const clientSecret = Cypress.env().users['admin'].clientSecret;
const grantType = Cypress.env().users['admin'].grantType;



Cypress.Commands.add('auth', () => { // api for generating authentication tokens
  return cy.api({
      method: 'POST', // this is the only method required so parameterisation is not required
      url: oauthUrl + '/oauth/token', // e.g. https://qa-orange-oauth.plutora.org/oauth/token
      body: {
        'client_id': clientId,
        'client_secret': clientSecret,
        'grant_type': grantType,
        'username': username,
        'password': password
      },
      headers: standardApiHeaders
  });
});


Cypress.Commands.add('connectivities', (method, url, data) => { // api for environment connectivities
  // let body = [];
  // body = data.body;
    // Sample request body object (key-pair) for reference
    // {
    //   'environmentGroupId': string: environment group guid,
    //   'sourceId': string: environment guid,
    //   'targetId': string: environment 2 guid,
    //   'connectivityTypeId': string: connectivity type guid,
    //   'direction': 'Out'
    // }
  return cy.api({
      method: method,
      url: apiUrl + '/connectivities' + url, // e.g. https://qa-orange-api.plutora.org/connectivities
      auth: {
        bearer: data.token
      },
      body: {
          'environmentGroupId': data.environmentGroupId,
          'sourceId': data.sourceId,
          'targetId': data.targetId,
          'connectivityTypeId': data.connectivityTypeId,
          'direction': data.direction
      },
      headers: standardApiHeaders,
      failOnStatusCode: false
  });
});

Cypress.Commands.add('changes', (method, url, data) => { // api for changes
  let body = [];
  if(!url.includes('filters')){
    body = data.body;
    // TODO: Put sample key-pairs here for in-code documentation
    // {
      // 'id': data.body.id,
      // 'name': data.name,
      // 'changePriorityId': data.changePriorityId,
      // 'changeStatusId': data.changeStatusId,
      // 'businessValueScore': data.businessValueScore,
      // 'assignedToId': data.assignedToId,
      // 'organizationId': data.organizationId,
      // 'changeTypeId': data.changeTypeId,
      // 'changeDeliveryRiskId': data.changeDeliveryRiskId,
      // 'expectedDeliveryDate': data.expectedDeliveryDate,
      // 'changeThemeId': data.changeThemeId,
      // 'description': data.description,
      // 'descriptionSimple': data.descriptionSimple,
      // 'raisedById': data.raisedById,
      // 'assignedToId': data.assignedToId,
      // 'systems':
      //   [{
      //     'systemId': data.systemId,
      //     'systemRoleType': data.systemRoleType
      //   }]
    // };
  }
  return cy.api({
      method: method,
      url: apiUrl + '/changes' + url, // e.g. https://qa-orange-api.plutora.org/changes
      auth: {
        bearer: data.token
      },
      body,
      headers: standardApiHeaders,
      failOnStatusCode: false
  });
});

Cypress.Commands.add('builds', (method, url, data) => { // api for builds
  return cy.api({
      method: method,
      url: apiUrl + '/builds' + url, // e.g. https://qa-orange-api.plutora.org/builds
      auth: {
        bearer: data.token
      },
      body: {
        'id': data.id,
        'buildNumber': data.buildNumber,
        'buildTag': data.buildTag,
        'branch': data.branch,
        'buildStatus': data.buildStatus,
        'artifacts': data.artifacts,
        'commitNumber': data.commitNumber,
        'systemId': data.systemId,
        'releaseId': data.releaseId,
        'changes': data.changes
      },
      headers: standardApiHeaders,
      failOnStatusCode: false
  });
});

Cypress.Commands.add('deploymentPlans', (method, url, data) => { // api for deployment plans
  let systemContainer = [];
  if(data.SystemIDs!==null){
    systemContainer = [data.SystemIDs]
  }
  return cy.api({
      method: method,
      url: apiUrl + '/DeploymentPlan' + url, // e.g. https://qa-orange-api.plutora.org/DeploymentPlan
      auth: {
        bearer: data.token
      },
      body: {
        'id': data.id,
        'name': data.name,
        'description': data.description,
        'externalIdentifier': data.externalIdentifier,
        'OrganizationID': data.organizationId,
        'SystemIDs': systemContainer,
        'ReleaseID': data.ReleaseID,
      },
      headers: standardApiHeaders,
      failOnStatusCode: false
  });
});

Cypress.Commands.add('environments', (method, url, data) => { // api for environments
  return cy.api({
      method: method,
      url: apiUrl + '/environments' + url, // e.g. https://qa-orange-api.plutora.org/environments
      auth: {
        bearer: data.token
      },
      body: {
        'id': data.id,
        'name': data.name,
        'description': data.description,
        'url': data.url,
        'vendor': data.vendor,
        'linkedSystemId': data.linkedSystemId,
        'environmentMgr': data.environmentMgr,
        'usageWorkItemId': data.usageWorkItemId,
        'environmentStatusId': data.environmentStatusId,
        'environmentStatus': data.environmentStatus,
        'color': data.color,
        'isSharedEnvironment': data.isSharedEnvironment, // boolean
        'hosts': data.hosts
      },
      headers: standardApiHeaders,
      failOnStatusCode: false // test all status codes
  });
});


Cypress.Commands.add('environmentsbulk', (method, data) => { // api for environments bulk
  return cy.api({
      method: method,
      url: apiUrl + '/environments/bulk', // e.g. https://qa-orange-api.plutora.org/environments/bulk
      auth: {
        bearer: data.token
      },
      body: data.payload,
      headers: standardApiHeaders,
      failOnStatusCode: false // test all status codes
  });
});

Cypress.Commands.add('environmentgroups', (method, url, data) => { // api for environment groups
  return cy.api({
      method: method,
      url: apiUrl + '/environmentgroups' + url, // e.g. https://qa-orange-api.plutora.org/environmentgroups
      auth: {
        bearer: data.token
      },
      body: {
        'id': data.id,
        'name': data.name,
        'description': data.description,
        'color': data.color,
        'vendor': data.vendor,
        'usageWorkItemId': data.usageWorkItemId,
        'organizationId': data.organizationId,
        'environmentIDs': data.environmentIDs, //array
        'isAutoApproved': data.isAutoApproved, // boolean
        'displayBookingAlert': data.displayBookingAlert, // boolean
        'bookingAlertMessage': data.bookingAlertMessage, // boolean
      },
      headers: standardApiHeaders,
      failOnStatusCode: false // test all status codes
  });
});

Cypress.Commands.add('connectivities', (method, url, data) => { // api for environments
  return cy.api({
      method: method,
      url: apiUrl + '/connectivities' + url, // e.g. https://qa-orange-api.plutora.org/connectivities
      auth: {
        bearer: data.token
      },
      body: {
        'id': data.id,
        'environmentGroupId': data.environmentGroupId,
        'sourceId': data.sourceId,
        'targetId': data.targetId,
        'connectivityTypeId': data.connectivityTypeId,
        'direction': data.direction,
      },
      headers: standardApiHeaders,
      failOnStatusCode: false // test all status codes
  });
});

Cypress.Commands.add('environmentHealthCheck', (method, url, data) => { // api for environment health checks
  return cy.api({
      method: method,
      url: apiUrl + '/environmentHealthCheck' + url, // e.g. https://qa-orange-api.plutora.org/environmentHealthCheck
      auth: {
        bearer: data.token
      },
      body: {
        'environmentId': data.environmentId,
        'health': data.health,
        'testName': data.testName,
        'startDate': data.startDate,
        'endDate': data.endDate,
        'environmentIds': data.environmentIds,
      },
      headers: standardApiHeaders,
      failOnStatusCode: false
  });
});

Cypress.Commands.add('lookupFields', (method, url, data) => { // api for look-up fields
  return cy.api({
      method: method,
      url: apiUrl + '/LookupFields' + url,
      auth: {
        bearer: data.token
      },
      headers: standardApiHeaders,
      failOnStatusCode: false
  });
});

Cypress.Commands.add('organizations', (method, url, data) => { // api for organizations
  return cy.api({
      method: method,
      url: apiUrl + '/organizations' + url, // e.g. https://qa-orange-api.plutora.org/organizations
      auth: {
        bearer: data.token
      },
      headers: standardApiHeaders,
      failOnStatusCode: false
  });
});

Cypress.Commands.add('releases', (method, url, data) => { // api for releases
  let body = '';
  if(method === 'POST' && url.includes('filters')){ // this is very specific to POST endpoint releases/filter but why??? 🤯
    body = data.body;
  }else{
    body = {
      'id': data.id,
      'identifier': data.identifier,
      'name': data.name,
      'summary': data.summary,
      'releaseTypeId': data.releaseTypeId,
      'location': data.location,
      'releaseStatusTypeId': data.releaseStatusTypeId,
      'releaseRiskLevelId': data.releaseRiskLevelId,
      'implementationDate': data.implementationDate,
      'displayColor': data.displayColor,
      'organizationId': data.organizationId,
      'managerId': data.managerId,
      'parentReleaseId': data.parentReleaseId,
      'parentRelease': data.parentRelease,
      'plutoraReleaseType': data.plutoraReleaseType,
      'releaseProjectType': data.releaseProjectType,
      'systemId': data.systemId,
      'systemRoleType': data.systemRoleType,
      'systemRoleDependencyTypeId': data.systemRoleDependencyTypeId,
      'startDate': data.startDate,
      'endDate': data.endDate,
      'workItemNameID': data.workItemNameID,
      'userId': data.userId,
      'groupId': data.groupId,
      'stakeholderRoleIds': data.stakeholderRoleIds,
      'responsible': data.responsible,
      'accountable': data.accountable,
      'informed': data.informed,
      'consulted': data.consulted,
      'title': data.title,
      'status': data.status,
      'description': data.description,
      'activityDependencyType': data.activityDependencyType,
      'type': data.type,
      'assignedToID': data.assignedToID,
      'assignedWorkItemID': data.assignedWorkItemID,
      'forecastDate': data.forecastDate
    };
  }
  return cy.api({
      method: method,
      url: apiUrl + '/releases' + url, // e.g. https://qa-orange-api.plutora.org/releases
      auth: {
        bearer: data.token
      },
      body,
      headers: standardApiHeaders,
      failOnStatusCode: false
  });
});

Cypress.Commands.add('systems', (method, url, data) => { // api for history
  let body = '';
  if(url.includes('bulk')) {
    body = [];
    for(let item of data.payload) {
      body.push({
        'id': item.id,
        'name': item.name,
        'systemAlias': item.systemAlias,
        'vendor': item.vendor,
        'status': item.status,
        'organizationId': item.organizationId,
        'description': item.description
      });
    }
  } else {
    body = {
      'id': data.id,
      'name': data.name,
      'systemAlias': data.systemAlias,
      'vendor': data.vendor,
      'status': data.status,
      'organizationId': data.organizationId,
      'description': data.description
    };
  }
  return cy.api({
      method: method,
      url: apiUrl + '/systems' + url, // e.g. https://qa-orange-api.plutora.org/systems
      auth: {
        bearer: data.token
      },
      body,
      headers: standardApiHeaders,
      failOnStatusCode: false
  });
});

Cypress.Commands.add('stakeholders', (method, url, data) => { // api for stakeholders
  return cy.api({
      method: method,
      url: apiUrl + url, // e.g. https://qa-orange-api.plutora.org/entity(module)
      auth: {
        bearer: data.token
      },
      body: {
        'userId': data.userId,
        'stakeholderRoleIds': data.stakeholderRoleIds,
        'responsible': data.responsible, // bool
        'accountable': data.accountable, // bool
        'informed': data.informed, // bool
        'consulted': data.consulted, // bool
      },
      headers: standardApiHeaders,
      failOnStatusCode: false
  });
});

Cypress.Commands.add('userGroups', (method, url, data) => { // api for user groups
  return cy.api({
      method: method,
      url: apiUrl + '/usergroups' + url, // e.g. https://qa-orange-api.plutora.org/usergroups
      auth: {
        bearer: data.token
      },
      body: {
        'Name': data.name,
        'Description': data.description
      },
      headers: standardApiHeaders,
      failOnStatusCode: false
  });
});

Cypress.Commands.add('users', (method, url, data) => { // api for users
  return cy.api({
      method: method,
      url: apiUrl + '/users' + url, // e.g. https://qa-orange-api.plutora.org/users
      auth: {
        bearer: data.token
      },
      headers: standardApiHeaders,
      body: {
        'name': data.name,
        'Status': data.Status,
        'ValidUntilDate': data.ValidUntilDate,
        'Roles': data.Roles,
        'Groups': data.Groups,
        'CanLogin': data.CanLogin,
        'OrganizationID':data.OrganizationID
      },
      failOnStatusCode: false
  });
});

Cypress.Commands.add('tecrs', (method, url, data) => { // api for TECRs
  return cy.api({
      method: method,
      url: apiUrl + '/TECRs' + url, // e.g. https://qa-orange-api.plutora.org/TECRs
      auth: {
        bearer: data.token
      },
      body: {
        'id': data.id,
        'title': data.title,
        'startDate': data.startDate,
        'dueDate': data.dueDate,
        'description': data.description,
        'userID': data.userId,
        'crStatusID': data.crStatusID,
        'crTypeID': data.crTypeID,
        'color': data.color,
        'projectID': data.projectID,
        'environments': data.environments,
        'environmentGroups': data.environmentGroups,
      },
      headers: standardApiHeaders,
      failOnStatusCode: false
  });
});

Cypress.Commands.add('tebrs', (method, url, data) => { // api for TEBRs
  let body = [];
  if(!url.includes('filters')){
    body = data.body;
  }
  return cy.api({
      method: method,
      url: apiUrl + '/TEBRs' + url, // e.g. https://qa-orange-api.plutora.org/TEBRs
      auth: {
        bearer: data.token
      },
      body,
      headers: standardApiHeaders,
      failOnStatusCode: false
  });
});

Cypress.Commands.add('workitemnames', (method, url, data) => { // api for work item names
  return cy.api({
      method: method,
      url: apiUrl + '/WorkItemNames' + url,
      auth: {
        bearer: data.token
      },
      headers: standardApiHeaders,
      failOnStatusCode: false
  });
});

Cypress.Commands.add('createModules', (token) => { // command for creating change, system, release, environment and linking them together
  // TODO: include Builds and maybe TECR's?
  // arrange (KISS principle) - this is just to generate data (fixed and no need to return parameters except token)
  let data = [];
  const userId = Cypress.env().users['admin'].userId;
  const organizationId = Cypress.env().users['admin'].organizationId;
  const systemName = 'system-' + faker.random.word() + ' ' + today;
  const changeName = 'change-' + faker.random.word() + ' ' + today;
  const releaseName = 'release-' + faker.random.word() + ' ' + today;
  const environmentName = 'env-' + faker.random.word() + ' ' + today;
  const aPIModel = dataProviderLegacy.getLegacyModel();

  dataProviderLegacy.setToken(token);
  dataProviderLegacy.getLegacyLookupEnvironmentStatus(); // look up field for environments
  dataProviderLegacy.getLegacyLookupFieldChangeDeliveryRisk(); // look up field for changes
  dataProviderLegacy.getLegacyLookupFieldChangePriority();
  dataProviderLegacy.getLegacyLookupFieldChangeStatus();
  dataProviderLegacy.getLegacyLookupFieldChangeTheme();
  dataProviderLegacy.getLegacyLookupFieldChangeType();
  dataProviderLegacy.getLegacyLookupFieldReleaseRiskLevel(); // look up field for releases
  dataProviderLegacy.getLegacyLookupFieldReleaseStatusType();
  dataProviderLegacy.getLegacyLookupFieldReleaseType();
  dataProviderLegacy.getLegacyLookupUsedForWorkItem();

  // act
  cy.log('**Create new System, Environment, Release, & Change**');
  data = { // create System
    'token': token,
    'name': systemName,
    'vendor': faker.company.companyName(),
    'status': 'Active',
    'organizationId': organizationId,
    'description': systemName,
  };
  cy.systems('POST', '', data).then((resp) => {
    const systemId = resp.body.id;

    data = { // create Environment
      'token': token,
      'name': environmentName,
      'description': environmentName,
      'url': faker.internet.url(),
      'vendor': faker.company.companyName(),
      'linkedSystemId': systemId,
      'usageWorkItemId': aPIModel.usedForWorkItem,
      'environmentStatusId': aPIModel.environmentStatus,
      'color': faker.internet.color(),
      'isSharedEnvironment': false,
      'hosts': []
    };
    cy.environments('POST', '', data).then((resp) => {
      const environmentId = resp.body.id;

      data = { // create Enterprise Release
        'token': token,
        'identifier': releaseName,
        'name': releaseName,
        'summary': releaseName,
        'releaseTypeId': aPIModel.releaseTypeId,
        'location': faker.address.country(),
        'releaseStatusTypeId': aPIModel.releaseStatusTypeId,
        'releaseRiskLevelId': aPIModel.releaseRiskLevelId,
        'implementationDate': todayUTC,
        'displayColor': faker.internet.color(),
        'organizationId': organizationId,
        'parentReleaseId': null,
        'parentRelease': null,
        'plutoraReleaseType': 'Enterprise',
        'releaseProjectType': 'None'
      };
      cy.releases('POST', '', data).then((resp) => {
        const releaseId = resp.body.id;

        const changeBody = {
          'name': changeName,
          'changePriorityId': aPIModel.changePriorityId,
          'changeStatusId': aPIModel.changeStatusId,
          'businessValueScore': faker.random.number({'min': 0, 'max': 100}),
          'organizationId': organizationId,
          'changeTypeId': aPIModel.changeTypeId,
          'changeDeliveryRiskId': aPIModel.changeDeliveryRiskId,
          'expectedDeliveryDate': todayUTC,
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
        cy.changes('POST', '', data);
        cy.log(`System ${systemId}, Environment ${environmentId}, Release ${releaseId} successfully created.`);

        // insert objects into data.json fixture file
        // https://docs.cypress.io/api/commands/writefile#Append-contents-to-the-end-of-a-file
        const filename = 'cypress/fixtures/data.json';
        cy.readFile(filename).then((obj) => {
          obj.systemId = systemId;
          obj.systemName = systemName;
          obj.environmentId = environmentId;
          obj.environmentName = environmentName;
          obj.releaseId = releaseId;
          obj.releaseName = releaseName;
          cy.writeFile(filename, obj);
        });
    });
  });
});
});

Cypress.Commands.add('masterDeploymentPlans', (method, url, data) => { // api for deployment plans
  return cy.api({
      method: method,
      url: apiUrl + '/MasterDeploymentPlan' + url, // e.g. https://qa-orange-api.plutora.org/DeploymentPlan
      auth: {
        bearer: data.token
      },
      body: {
        'id': data.id,
        'name': data.name,
        'deploymentPlanIds': [data.deploymentPlanIds],
        'OrganizationID': data.OrganizationID
      },
      headers: standardApiHeaders,
      failOnStatusCode: false
  });
});

Cypress.Commands.add('deploymentPlanActivity', (method, url, data) => { // api for deployment plans
  let body = [];
  if(!url.includes('filters')){
    body = data.body;
  }
  return cy.api({
      method: method,
      url: apiUrl + '/DeploymentPlanActivities' + url, // e.g. https://qa-orange-api.plutora.org/DeploymentPlan
      auth: {
        bearer: data.token
      },
      body,
      headers: standardApiHeaders,
      failOnStatusCode: false
  });
});
