import faker from 'faker/locale/en_AU'; // https://www.npmjs.com/package/faker

import dataProviderLegacy from '/cypress/services/data-provider-legacy';
import { standardApiHeaders } from './common';
import { today } from '/cypress/support/utils/common';

// This file is used to generate Release data via Plutora external API

const apiUrl = Cypress.env().apiUrl;
const organizationId = Cypress.env().users['admin'].organizationId;

const createSystemViaApi = (overrideData = {}) => {
  const systemName = 'system-' + faker.random.word() + ' ' + today;
  const basicData = {
    name: systemName,
    vendor: faker.company.companyName(),
    status: 'Active',
    organizationId: organizationId,
    description: systemName,
    ...overrideData, // override any basic fields if passed in
  };

  return cy.api({
    method: 'POST',
    url: apiUrl + '/systems',
    body: basicData,
    headers: {
      ...standardApiHeaders,
      Authorization: 'Bearer ' + dataProviderLegacy.getToken(),
    },
    failOnStatusCode: false,
  });
};

const systemsApi = {
  createSystemViaApi,
};

export default systemsApi;
