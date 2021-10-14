import faker from 'faker/locale/en_AU'; // https://www.npmjs.com/package/faker

import dataProviderLegacy from '/cypress/services/data-provider-legacy';
import { standardApiHeaders } from './common';
import { today, todayUTC, endDateUTC } from '/cypress/support/utils/common';
import {v4 as uuidv4} from 'uuid';

// This file is used to generate deployment data via Plutora external API
let initialLoadDone = false;

const apiUrl = Cypress.env().apiUrl;
const baseUrl = `${apiUrl}/DeploymentPlan`;
const userId = Cypress.env().users['admin'].userId;
const organizationId = Cypress.env().users['admin'].organizationId;

const createDeploymentPlanViaApi = (overrideData = {}) => {
  const deploymentPlanName = 'dp-' + faker.random.word() + ' ' + today;
  const basicData = {
    // create deployment plan
    ID: uuidv4(),
    name: deploymentPlanName,
    externalIdentifier: deploymentPlanName,
    SystemIds: [],
    releaseId: null,
    organizationId: organizationId,
    description: deploymentPlanName,
    ...overrideData, // Injected data will override preceeding defaults where supplied
  };

  cy.api({
    method: 'POST',
    url: baseUrl+ '/Create',
    body: basicData,
    headers: {
      ...standardApiHeaders,
      Authorization: 'Bearer ' + dataProviderLegacy.getToken(),
    },
    failOnStatusCode: false,
  });
};

const createActivityForDeploymentPlanViaApi = (systemId, deploymentPlanId, overrideData = {}) => {
  const activityFordeploymentPlanName = 'act-' + faker.random.word() + ' ' + today;
  const basicData = [{
    // create deployment plan activity
    name: activityFordeploymentPlanName,
    planID: deploymentPlanId,
    SystemIDs: [systemId],
    responsibleID: userId,
    startDateTimePlanned: todayUTC,
    endDateTimePlanned: endDateUTC,
    description: activityFordeploymentPlanName,
    ...overrideData, // Injected data will override preceeding defaults where supplied
  }];

  cy.api({
    method: 'POST',
    url: baseUrl+'Activities/BatchCreate?deploymentPlanId='+deploymentPlanId,
    body: basicData,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + dataProviderLegacy.getToken(),
    },
    failOnStatusCode: false,
  });
};

const setupDeploymentPlanData = () => {
  if (initialLoadDone) {
    return cy.wrap(null); // return chainable
  }

  initialLoadDone = true;
  return cy.fixture('data').then((data)=>{
    dataProviderLegacy.setToken(data.token);
  });
};

const deploymentPlanApi = {
  setupDeploymentPlanData,
  createDeploymentPlanViaApi,
  createActivityForDeploymentPlanViaApi,
};

export default deploymentPlanApi;