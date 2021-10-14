import faker from 'faker/locale/en_AU'; // https://www.npmjs.com/package/faker

import dataProviderLegacy from '/cypress/services/data-provider-legacy';
import { standardApiHeaders } from './common';
import { today, todayUTC, endDateUTC } from '/cypress/support/utils/common';

// This file is used to generate deployment data via Plutora external API
let initialLoadDone = false;

const apiUrl = Cypress.env().apiUrl;
const baseUrl = `${apiUrl}/TEBRs`;
const userId = Cypress.env().users['admin'].userId;
const aPIModel = dataProviderLegacy.getLegacyModel();

const createTebrViaApi = (overrideData = {}) => {
  const tebrName = 'tebr-' + faker.random.word() + ' ' + today;
  const basicData = {
    // create tebr
    title: tebrName,
    releaseID: null,
    phaseID: null,
    startDate: todayUTC,
    endDate: endDateUTC,
    assignedToID: userId,
    requestorID: userId,
    description: tebrName,
    statusID: aPIModel.bookingRequestStatusId,
    typeID: aPIModel.bookingRequestTypeId,
    systems: [
      // {
      //     "systemId": "{{new-system-guid}}",
      //     "systemRoleType": "Impact",
      //     "systemRoleDependencyTypeId": "{{systems-subtype-customization-1-guid}}"
      // }
    ],
    ...overrideData, // Injected data will override preceeding defaults where supplied
  };

  cy.api({
    method: 'POST',
    url: baseUrl,
    body: basicData,
    headers: {
      ...standardApiHeaders,
      Authorization: 'Bearer ' + dataProviderLegacy.getToken(),
    },
    failOnStatusCode: false,
  });
};

const setupTebrData = () => {
  if (initialLoadDone) {
    return cy.wrap(null); // return chainable
  }

  initialLoadDone = true;
  return cy.fixture('data').then((data) => {
    dataProviderLegacy.setToken(data.token);
    dataProviderLegacy.getLegacyLookupFieldBookingRequestStatus();
    dataProviderLegacy.getLegacyLookupFieldBookingRequestType();
  });
};

const tebrApi = {
  setupTebrData,
  createTebrViaApi,
};

export default tebrApi;
