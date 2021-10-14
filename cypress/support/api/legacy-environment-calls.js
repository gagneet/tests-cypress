import faker from 'faker/locale/en_AU'; // https://www.npmjs.com/package/faker

import dataProviderLegacy from '/cypress/services/data-provider-legacy';
import { standardApiHeaders } from './common';
import { today } from '/cypress/support/utils/common';

// This file is used to generate deployment data via Plutora external API
let initialLoadDone = false;

const apiUrl = Cypress.env().apiUrl;
const baseUrl = `${apiUrl}/environment`;
const organizationId = Cypress.env().users['admin'].organizationId;
const aPIModel = dataProviderLegacy.getLegacyModel();

const createEnvironmentViaApi = (systemId, overrideData = {}) => {
  const environmentName = 'env-' + faker.random.word() + ' ' + today;
  const basicData = {
    // create environment
    name: environmentName,
    vendor: faker.company.companyName(),
    organizationId: organizationId,
    description: environmentName,
    LinkedSystemId: systemId,
    usageWorkItemId: aPIModel.usedForWorkItem,
    environmentStatusId: aPIModel.environmentStatus,
    isSharedEnvironment: false,
    color: faker.internet.color(),
    ...overrideData, // Injected data will override preceeding defaults where supplied
  };

  cy.api({
    method: 'POST',
    url: baseUrl + 's',
    body: basicData,
    headers: {
      ...standardApiHeaders,
      Authorization: 'Bearer ' + dataProviderLegacy.getToken(),
    },
    failOnStatusCode: false,
  });
};

const createEnvironmentGroupViaApi = (overrideData = {}) => {
  const environmentGroupName = 'env-group-' + faker.random.word() + ' ' + today;
  const basicData = {
    // create environment group
    name: environmentGroupName,
    description: environmentGroupName,
    color: faker.internet.color(),
    environmentIDs: [],
    organizationId: organizationId,
    vendor: faker.company.companyName(),
    isAutoApproved: true,
    displayBookingAlert: true,
    ...overrideData, // Injected data will override preceeding defaults where supplied
  };

  cy.api({
    method: 'POST',
    url: baseUrl + 'groups',
    body: basicData,
    headers: {
      ...standardApiHeaders,
      Authorization: 'Bearer ' + dataProviderLegacy.getToken(),
    },
    failOnStatusCode: false,
  });
};

const createConnectivitiesViaApi = (
  environmentGroupId,
  sourceId,
  targetId,
  overrideData = {}
) => {
  const basicData = {
    // create connectivities
    environmentGroupId,
    sourceId,
    targetId,
    connectivityTypeId: aPIModel.environmentMapConnectivityTypeId,
    direction: 'Out',
    ...overrideData, // Injected data will override preceeding defaults where supplied
  };

  cy.api({
    method: 'POST',
    url: apiUrl + '/connectivities',
    body: basicData,
    headers: {
      ...standardApiHeaders,
      Authorization: 'Bearer ' + dataProviderLegacy.getToken(),
    },
    failOnStatusCode: false,
  });
};

const createEnvironmentsBulk = (systemId) => {
  const basicData = [
    {
      name: 'env-' + faker.address.countryCode() + ' ' + today,
      vendor: faker.company.companyName(),
      linkedSystemId: systemId,
      usageWorkItemId: aPIModel.usedForWorkItem,
      environmentStatusId: aPIModel.environmentStatus,
      environmentStatus: 'Active',
      color: faker.internet.color(),
      isSharedEnvironment: true,
      hosts: [],
    },
    {
      name: 'env-' + faker.address.countryCode() + ' ' + today,
      vendor: faker.company.companyName(),
      linkedSystemId: systemId,
      usageWorkItemId: aPIModel.usedForWorkItem,
      environmentStatusId: aPIModel.environmentStatus,
      environmentStatus: 'Active',
      color: faker.internet.color(),
      isSharedEnvironment: true,
      hosts: [],
    },
    {
      name: 'env-' + faker.address.countryCode() + ' ' + today,
      vendor: faker.company.companyName(),
      linkedSystemId: systemId,
      usageWorkItemId: aPIModel.usedForWorkItem,
      environmentStatusId: aPIModel.environmentStatus,
      environmentStatus: 'Active',
      color: faker.internet.color(),
      isSharedEnvironment: true,
      hosts: [],
    },
  ];

  cy.api({
    method: 'POST',
    url: baseUrl + 's/bulk',
    body: basicData,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + dataProviderLegacy.getToken(),
    },
    failOnStatusCode: false,
  });
};

const setupEnvironmentData = () => {
  if (initialLoadDone) {
    return cy.wrap(null); // return chainable
  }

  initialLoadDone = true;
  return cy.fixture('data').then((data) => {
    dataProviderLegacy.setToken(data.token);
    dataProviderLegacy.getLegacyLookupEnvironmentStatus();
    dataProviderLegacy.getLegacyLookupEnvironmentPhaseUsage();
    dataProviderLegacy.getLegacyLookupUsedForWorkItem();
    dataProviderLegacy.getLegacyLookupEnvironmentMapConnectivityType();
  });
};

const environmentApi = {
  setupEnvironmentData,
  createEnvironmentViaApi,
  createEnvironmentGroupViaApi,
  createConnectivitiesViaApi,
  createEnvironmentsBulk,
};

export default environmentApi;