import faker from 'faker/locale/en_AU'; // https://www.npmjs.com/package/faker

import dataProviderLegacy from '/cypress/services/data-provider-legacy';
import { standardApiHeaders } from './common';
import { today, endDate } from '/cypress/support/utils/common';

const apiUrl = Cypress.env().apiUrl;
const baseUrl = `${apiUrl}/tecrs`;
const userId = Cypress.env().users['admin'].userId;
const aPIModel = dataProviderLegacy.getLegacyModel();
let initialLoadDone = false;

const createTecrViaApi = (overrideData = {}) => {
  const tecrName = 'tecr-' + faker.random.word() + ' ' + today;
  const basicData = {
    title: tecrName,
    crTypeID: aPIModel.changeRequestTypeId,
    crStatusID: aPIModel.changeRequestStatusId,
    projectID: null, // Release Id
    environmentStacklayerID: null,
    userID: userId,
    initiatorID: userId,
    startDate: today,
    dueDate: endDate,
    description: tecrName,
    isShowOnScheduler: true,
    color: faker.internet.color(),
    showAsShaded: true,
    environmentGroups: [],
    outage: 'No',
    outageStartDate: today,
    outageEndDate: endDate,
    environments: [],
    ...overrideData // Injected data will override preceeding defaults where supplied
  };

  cy.api({
    method: 'POST',
    url: baseUrl,
    body: basicData,
    headers: {
      ...standardApiHeaders,
      Authorization: 'Bearer ' + dataProviderLegacy.getToken()
    },
    failOnStatusCode: false
  });
};

const setupTecrData = () => {
  if (initialLoadDone) {
    return cy.wrap(null); // return chainable
  }

  initialLoadDone = true;
  return cy.fixture('data').then((data) => {
    dataProviderLegacy.setToken(data.token);
    dataProviderLegacy.getLegacyLookupFieldChangeRequestStatus();
    dataProviderLegacy.getLegacyLookupFieldChangeRequestType();
  });
};

const tecrApi = {
  setupTecrData,
  createTecrViaApi
};

export default tecrApi;
