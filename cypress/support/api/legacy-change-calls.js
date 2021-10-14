import faker from 'faker/locale/en_AU'; // https://www.npmjs.com/package/faker

import dataProviderLegacy from '/cypress/services/data-provider-legacy';
import { standardApiHeaders } from './common';
import { endDateUTC, today } from '/cypress/support/utils/common';

// This file is used to generate Release data via Plutora external API
const apiUrl = Cypress.env().apiUrl;
const basicUrl = `${apiUrl}/changes`;
const aPIModel = dataProviderLegacy.getLegacyModel();
const userId = Cypress.env().users['admin'].userId;
const organizationId = Cypress.env().users['admin'].organizationId;

let initialLoadDone = false;

const createChangeViaApi = (overrideData = {}) => {
  const changeName = 'change-' + faker.random.word() + ' ' + today;
  const basicData = {
    name: changeName,
    changePriorityId: aPIModel.changePriorityId,
    changeStatusId: aPIModel.changeStatusId,
    businessValueScore: faker.datatype.number({ min: 0, max: 100 }),
    organizationId: organizationId,
    changeTypeId: aPIModel.changeTypeId,
    changeDeliveryRiskId: aPIModel.changeDeliveryRiskId,
    expectedDeliveryDate: endDateUTC,
    changeThemeId: aPIModel.changeThemeId,
    description: changeName,
    descriptionSimple: changeName,
    raisedById: userId,
    assignedToId: userId,
    ...overrideData, // override any basic fields if passed in
  };

  return cy.api({
    method: 'POST',
    url: basicUrl,
    body: basicData,
    headers: {
      ...standardApiHeaders,
      Authorization: 'Bearer ' + dataProviderLegacy.getToken(),
    },
    failOnStatusCode: false,
  });
};

const linkSystemToChange = (changeId, systemId, overrideData = {}) => {
  const basicData = {
    systemId,
    systemRoleType: 'Impact',
    ...overrideData,
  };

  cy.api({
    method: 'POST',
    url: `${basicUrl}/${changeId}/systems`,
    body: basicData,
    headers: {
      ...standardApiHeaders,
      Authorization: 'Bearer ' + dataProviderLegacy.getToken(),
    },
    failOnStatusCode: false,
  });
};

const linkChangeToRelease = (changeId, releaseId, overrideData = {}) => {
  const basicData = {
    releaseId,
    targetRelease: true,
    actualDeliveryRelease: true,
    ...overrideData,
  };

  cy.api({
    method: 'PUT',
    url: `${basicUrl}/${changeId}/deliveryreleases/${releaseId}`,
    body: basicData,
    headers: {
      ...standardApiHeaders,
      Authorization: 'Bearer ' + dataProviderLegacy.getToken(),
    },
    failOnStatusCode: false,
  });
};

const setupChangeData = () => {
  if (initialLoadDone) {
    return cy.wrap(null); // return chainable
  }

  initialLoadDone = true;
  return cy.fixture('data').then((data) => {
    dataProviderLegacy.setToken(data.token);
    dataProviderLegacy.getLegacyLookupFieldChangeDeliveryRisk();
    dataProviderLegacy.getLegacyLookupFieldChangePriority();
    dataProviderLegacy.getLegacyLookupFieldChangeStatus();
    dataProviderLegacy.getLegacyLookupFieldChangeTheme();
    dataProviderLegacy.getLegacyLookupFieldChangeType();
  });
};

const changesApi = {
  setupChangeData,
  createChangeViaApi,
  linkChangeToRelease,
  linkSystemToChange,
};

export default changesApi;
