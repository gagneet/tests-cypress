import { standardApiHeaders } from './common';
import dataProviderLegacy from '/cypress/services/data-provider-legacy';

const apiUrl = Cypress.env().apiUrl;
const basicUrl = `${apiUrl}/environmentHealthCheck`;

// todo expand method to include file if needed
function createHealthCheck(environmentId, health, testName) {
    const data = {
        environmentId,
        health,
        testName,
    };

    return cy.api({
        method: "POST",
        url: basicUrl,
        auth: {
          bearer: dataProviderLegacy.getToken(),
        },
        body: data,
        headers: standardApiHeaders,
        failOnStatusCode: false
    });
}

export const environmentHealthCheckApi = {
    createHealthCheck,
}