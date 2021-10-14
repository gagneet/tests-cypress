import faker from 'faker/locale/en_AU'; // https://www.npmjs.com/package/faker

import dataProviderLegacy from '/cypress/services/data-provider-legacy';
import { today } from '/cypress/support/utils/common';
import { v4 as uuidv4 } from 'uuid';

// This file is used to generate deployment data via Plutora external API
let initialLoadDone = false;

const apiUrl = Cypress.env().apiUrl;
const baseUrl = `${apiUrl}/Builds`;

const createBuildViaApi = (
  systemId,
  releaseId,
  changeId,
  overrideData = {}
) => {
  const buildName = 'build-' + faker.random.word() + ' ' + today;
  const basicData = {
    // create build
    buildNumber: uuidv4(),
    buildTag: buildName,
    branch: buildName,
    buildStatus: 'SUCCESSFUL',
    artifacts: null,
    commitNumber: uuidv4(),
    systemId,
    releaseId,
    changes: [
      {
        changeId,
      },
    ],
    ...overrideData, // Injected data will override preceeding defaults where supplied
  };

  cy.api({
    method: 'POST',
    url: baseUrl,
    body: basicData,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + dataProviderLegacy.getToken(),
    },
    failOnStatusCode: false,
  });
};

const setupBuildData = () => {
  if (initialLoadDone) {
    return cy.wrap(null); // return chainable
  }

  initialLoadDone = true;
  return cy.fixture('data').then((data) => {
    dataProviderLegacy.setToken(data.token);
  });
};

const buildApi = {
  setupBuildData,
  createBuildViaApi,
};

export default buildApi;
