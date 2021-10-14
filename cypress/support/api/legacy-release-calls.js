import faker from 'faker/locale/en_AU'; // https://www.npmjs.com/package/faker

import dataProviderLegacy from '/cypress/services/data-provider-legacy';
import { PlutoraEnum } from '/cypress/support/plutora-enums';
import { standardApiHeaders } from './common';
import { today, todayUTC, endDateUTC } from '/cypress/support/utils/common';

// This file is used to generate Release data via Plutora external API
let initialLoadDone = false;

const apiUrl = Cypress.env().apiUrl;
const baseUrl = `${apiUrl}/releases`;
const aPIModel = dataProviderLegacy.getLegacyModel();
const userId = Cypress.env().users['admin'].userId;
const organizationId = Cypress.env().users['admin'].organizationId;

const createReleaseViaApi = (overrideData = {}) => {
  const projectReleaseName = 'pr-' + faker.random.word() + ' ' + today;
  const basicData = {
    // create Project Release
    identifier: projectReleaseName,
    name: projectReleaseName,
    summary: projectReleaseName,
    releaseTypeId: aPIModel.releaseTypeId,
    location: faker.address.country(),
    releaseStatusTypeId: aPIModel.releaseStatusTypeId,
    releaseRiskLevelId: aPIModel.releaseRiskLevelId,
    implementationDate: endDateUTC,
    displayColor: faker.internet.color(),
    organizationId: organizationId,
    plutoraReleaseType: PlutoraEnum.Release.ReleaseType.Independent,
    releaseProjectType: PlutoraEnum.Release.ReleaseProjectType.NotIsProject,
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

// Links a System to a Release
const linkSystemToRelease = (releaseId, systemId, overrideData = {}) => {
  const basicData = {
    systemId,
    systemRoleType: 'Impact',
    systemRoleDependencyTypeId: aPIModel.systemRoleDependencyTypeId,
    ...overrideData,
  };

  cy.api({
    method: 'POST',
    url: `${baseUrl}/${releaseId}/systems`,
    body: basicData,
    headers: {
      ...standardApiHeaders,
      Authorization: 'Bearer ' + dataProviderLegacy.getToken(),
    },
    failOnStatusCode: false,
  });
};

const addGateToRelease = (releaseId, overrideData = {}) => {
  const basicData = {
    startDate: todayUTC,
    endDate: endDateUTC,
    isIgnore: false,
    isIgnoreChild: false,
    workItemNameID: aPIModel.workItemNameGateId,
    ...overrideData,
  };

  cy.api({
    method: 'POST',
    url: `${baseUrl}/${releaseId}/gates`,
    body: basicData,
    headers: {
      ...standardApiHeaders,
      Authorization: 'Bearer ' + dataProviderLegacy.getToken(),
    },
    failOnStatusCode: false,
  });
};

const addPhaseToRelease = (releaseId, overrideData = {}) => {
  const basicData = {
    startDate: todayUTC,
    endDate: endDateUTC,
    isIgnore: false,
    isIgnoreChild: false,
    workItemNameID: aPIModel.workItemNamePhaseId,
    ...overrideData,
  };

  cy.api({
    method: 'POST',
    url: `${baseUrl}/${releaseId}/phases`,
    body: basicData,
    headers: {
      ...standardApiHeaders,
      Authorization: 'Bearer ' + dataProviderLegacy.getToken(),
    },
    failOnStatusCode: false,
  });
};

const addStakeholdersToRelease = (releaseId, overrideData = {}) => {
  const basicData = {
    userId: userId,
    stakeholderRoleIds: [aPIModel.stakeholderRoleId],
    responsible: true,
    accountable: true,
    informed: false,
    consulted: false,
    ...overrideData,
  };

  cy.api({
    method: 'POST',
    url: `${baseUrl}/${releaseId}/stakeholders`,
    body: basicData,
    headers: {
      ...standardApiHeaders,
      Authorization: 'Bearer ' + dataProviderLegacy.getToken(),
    },
    failOnStatusCode: false,
  });
};

const addActivityToRelease = (releaseId, overrideData = {}) => {
  const basicData = {
    identifier: faker.random.word(),
    title: faker.random.word(),
    status: 'NotStarted',
    description: faker.random.word(),
    activityDependencyType: 'None',
    type: 'Activity',
    assignedToID: userId,
    assignedWorkItemID: aPIModel.workItemNamePhaseId,
    startDate: todayUTC,
    endDate: endDateUTC,
    forecastDate: endDateUTC,
    ...overrideData,
  };

  cy.api({
    method: 'POST',
    url: `${baseUrl}/${releaseId}/activities`,
    body: basicData,
    headers: {
      ...standardApiHeaders,
      Authorization: 'Bearer ' + dataProviderLegacy.getToken(),
    },
    failOnStatusCode: false,
  });
};

const getPhasesForReleases = (releaseId) => {
    cy.api({
        method: 'GET',
        url: `${baseUrl}/${releaseId}/phases`,
        headers: {
          ...standardApiHeaders,
          Authorization: 'Bearer ' + dataProviderLegacy.getToken(),
        },
        failOnStatusCode: false,
      });
};

const getGatesForReleases = (releaseId) => {
    cy.api({
        method: 'GET',
        url: `${baseUrl}/${releaseId}/gates`,
        headers: {
          ...standardApiHeaders,
          Authorization: 'Bearer ' + dataProviderLegacy.getToken(),
        },
        failOnStatusCode: false,
      });
};

const bookEnvironmentForPhase = (releaseId, phaseId, environmentId) => {
    cy.api({
        method: 'POST',
        url: `${baseUrl}/${releaseId}/phases/${phaseId}/environments/${environmentId}`,
        body: null,
        headers: {
        ...standardApiHeaders,
        Authorization: 'Bearer ' + dataProviderLegacy.getToken(),
        },
        failOnStatusCode: false,
    });
}

const setupReleaseData = () => {
  if (initialLoadDone) {
    return cy.wrap(null); // return chainable
  }

  initialLoadDone = true;
  return cy.fixture('data').then((data) => {
    dataProviderLegacy.setToken(data.token);
    dataProviderLegacy.getLegacyLookupFieldReleaseRiskLevel();
    dataProviderLegacy.getLegacyLookupFieldReleaseStatusType();
    dataProviderLegacy.getLegacyLookupFieldReleaseType();
    dataProviderLegacy.getLegacyLookupSystemRoleDependencyType();
    dataProviderLegacy.getLegacyWorkItemNameGate();
    dataProviderLegacy.getLegacyWorkItemNamePhase();
    dataProviderLegacy.getLegacyLookupStakeholderRole();
  });
};

const releasesApi = {
    setupReleaseData,
    createReleaseViaApi,
    linkSystemToRelease,
    addActivityToRelease,
    addGateToRelease,
    addPhaseToRelease,
    addStakeholdersToRelease,
    bookEnvironmentForPhase,
    getPhasesForReleases,
    getGatesForReleases,
};

export default releasesApi;