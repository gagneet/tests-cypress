/// <reference types='cypress-tags' />

import faker from 'faker/locale/en_AU'; // https://www.npmjs.com/package/faker
import dataProviderLegacy from '../../../../services/data-provider-legacy';
import { environmentRequestsPageModel } from '../../../../pages/environment-page';
import { today, endDate } from '../../../../support/utils/common';

let token = '';
let data = [];
let systemId = '';

const apIModel = dataProviderLegacy.getLegacyModel();

const tecrTitle = 'tecr-' + faker.random.word() + ' ' + today;
const username = Cypress.env().users['admin'].uiusername;

const environmentName = 'env-' + faker.random.word() + ' ' + today; // name should be small as live search cant filter by long name
const environmentAPIModel = dataProviderLegacy.getLegacyModel();
const vendor = faker.company.companyName();
const systemName = 'system-' + faker.random.word() + ' ' + today;
const organizationId = Cypress.env().users['admin'].organizationId;

before('Preconditions: token generation and look up fields', () => {
  cy.fixture('data')
    .should((res) => {
      token = res.token;
    })
    .then(() => {
      // test data which will be used across all tests is created here
      dataProviderLegacy.setToken(token);
      dataProviderLegacy.getLegacyLookupFieldChangeRequestType();
      dataProviderLegacy.getLegacyLookupEnvironmentStatus();
      dataProviderLegacy.getLegacyLookupUsedForWorkItem();
    });
});

beforeEach(() => {
  cy.login(token)
    .visit(environmentRequestsPageModel.url)
    .loading()
    .closeTimeZoneModal();
});

describe('End-to-end: Environment Change Requests Manager', () => {
  before(() => {
    cy.log('**Pre-condition: Create System** 🌳');
    data = {
      // create System
      token: token,
      name: systemName,
      vendor: vendor,
      status: 'Active',
      organizationId: organizationId,
      description: systemName
    };
    cy.systems('POST', '', data).then((resp) => {
      expect(resp.status).to.eq(201); // assert status code
      systemId = resp.body.id;
      cy.log(`**System '${systemName}' successfully set.** 🔥`);

      cy.log('**Create Environment**🌳');
      data = {
        // create environment
        token: token,
        name: environmentName,
        vendor: vendor,
        linkedSystemId: systemId,
        usageWorkItemId: environmentAPIModel.usedForWorkItem,
        environmentStatusId: environmentAPIModel.environmentStatus,
        environmentStatus: 'Active',
        color: faker.internet.color(),
        isSharedEnvironment: false,
        hosts: []
      };
      cy.environments('POST', '', data).should((response) => {
        expect(response.status).to.eq(201); // assert status code
        cy.log(
          `**Environments '${environmentName}' successfully created.** 🔥`
        );
      });
    });
  });

  it('Create TECR (from main menu), edit, live search and delete TECR (inside TECR modal)', () => {
    cy.log('**Create new TECR**');
    cy.clearDataSearch();

    cy.get('.btn-secondary:first').click().loading();
    cy.get('.changeRequestWin').should('be.visible');
    cy.get('.ecrDetailsTabHeader').click();
    // input
    cy.createEnvironmentRequest(apIModel, { tecrTitle, username, endDate });
    cy.get('.x-btn-inner-default-small').contains('Save').click().loading();

    cy.log('**Edit TECR**');
    cy.get('[name="Title"]')
      .clear()
      .type(`edited- ${tecrTitle}`)
      .saveClose()
      .loading();

    cy.log('**Clear filter and query builder**');
    cy.clearQueryBuilder();

    cy.log('**Search TECR**');
    cy.get('#columnTitle')
      .find('input')
      .type(tecrTitle)
      .type('{enter}')
      .loading();
    cy.get('table').should('have.length', 1);
    cy.get('.fakeLink').contains(tecrTitle).click({ force: true }).loading();
    cy.get('.changeRequestWin').should('be.visible');

    cy.log('**Delete TECR**');
    cy.get('.btn-danger').last().click();
    cy.get('.x-message-box').find('.btn-danger').click().loading();
    cy.get('.x-grid-empty').should('be.visible');
  });
});
