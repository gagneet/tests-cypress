
import faker from 'faker/locale/en_AU';
import { environmentHealthCheckPageModel } from '/cypress/pages/environment-page';
import { environmentHealthCheckApi } from "/cypress/support/api/legacy-environment-health-check-calls";
import dataProviderLegacy from '/cypress/services/data-provider-legacy';
import { today } from '/cypress/support/utils/common';

const organizationId = Cypress.env().users['admin'].organizationId;

let token = '';

beforeEach(() => {
  cy.login(token)
    .visit(environmentHealthCheckPageModel.url).loading().closeTimeZoneModal();

  cy.findByText("Clear all filters").click();
});

describe('End-to-end: Health Check Dashboard', () => {
  const systemName = 'Cypress Health Check System ' + today;
  const environmentName = 'Cypress Health Check Environment ' + today;
  const environmentGroupName = 'Cypress Health Check Environment Group ' + today;
  const environmentAPIModel = dataProviderLegacy.getLegacyModel();

  let systemId;
  let environmentId;
  let environmentGroupId;

  before(() => {
    cy.fixture('data').should((data) => {
      token = data.token;
      dataProviderLegacy.setToken(token);
      dataProviderLegacy.getLegacyLookupEnvironmentStatus();
      dataProviderLegacy.getLegacyLookupUsedForWorkItem();
    })
      .then(() => {
        cy.systems('POST', '', {
          'token': token,
          'name': systemName,
          'vendor': 'cypress',
          'status': 'Active',
          'organizationId': organizationId,
          'description': '👻',
        })
      })
      .then((resp) => {
        expect(resp.status).to.eq(201);
        systemId = resp.body.id;
        cy.environments('POST', '', {
          'token': token,
          'name': environmentName,
          'vendor': "cypress",
          'status': 'Active',
          'organizationId': organizationId,
          'description': "👻",
          'linkedSystemId': systemId,
          'color': faker.internet.color(),
          'isSharedEnvironment': false,
          'usageWorkItemId': environmentAPIModel.usedForWorkItem,
          'environmentStatusId': environmentAPIModel.environmentStatus,
        })
      })
      .then((resp) => {
        expect(resp.status).to.eq(201);
        environmentId = resp.body.id;
        cy.environmentgroups('POST', '', {
          'token': token,
          'name': environmentGroupName,
          'description': '👻',
          'color': faker.internet.color(),
          'environmentIDs': [environmentId],
          'organizationId': organizationId,
          'vendor': 'cypress',
          'isAutoApproved': false,
          'displayBookingAlert': false,
        }).then(resp => {
          expect(resp.status).to.eq(201);
          environmentGroupId = resp.body.id;
        });
      });
  });

  beforeEach(() => {
    environmentHealthCheckApi.createHealthCheck(environmentId, "NoData", "", token);
  });

  it('Shows environment on environment view', () => {
    cy.findByText('Select Filter').click();
    cy.findByTestId("dropdown-options-wrapper").findByText('Environment').click();
    cy.findByText('Select Environments').click();

    cy.findByPlaceholderText('Search Environment...').type(environmentName);
    cy.findByTestId('dropdown-options-wrapper').findByText(environmentName).should("be.visible").click({ force: true });
    cy.root().click();

    cy.get('.plt__page__body').findByText(environmentName).click()
      .get(environmentHealthCheckPageModel.environmentName).should("contain", environmentName);
  });

  it('shows environment group environments on environment group view', () => {
    cy.findByText('Select Filter').click();
    cy.findByTestId("dropdown-options-wrapper").findByText('Environment Group').click();
    cy.findByText('Select Environment Groups').click();

    cy.findByPlaceholderText('Search Environment Group...').type(environmentGroupName);
    cy.findByTestId('dropdown-options-wrapper').findByText(environmentGroupName).should("be.visible").click({ force: true });
    cy.root().click();

    cy.get('.plt__page__body').findByText(environmentName).click()
      .get(environmentHealthCheckPageModel.environmentName).should("contain", environmentName);
  });

  it('shows system environment on system view', () => {
    cy.findByText('Select Filter').click();
    cy.findByTestId("dropdown-options-wrapper").findByText('System').click();
    cy.findByText('Select Systems').click();

    cy.findByPlaceholderText("Search System...").type(systemName);
    cy.findByTestId('dropdown-options-wrapper').findByText(systemName).should("be.visible").click({ force: true });
    cy.root().click();

    cy.get('.plt__page__body').findByText(environmentName).click()
      .get(environmentHealthCheckPageModel.environmentName).should("contain", environmentName);
  });

  it('shows correct no data display', () => {
    cy.findByText('Clear all filters').click();
    cy.findByText('Select a filter and type names to show environments').should("be.visible");
  });

  it('only shows environments with that have their status selected in the status filter dropdown', () => {
    environmentHealthCheckApi.createHealthCheck(environmentId, "Online", "")
      .then(resp => {
        expect(resp.status).to.eq(200);

        cy.findByText('Select Filter').click();
        cy.findByTestId("dropdown-options-wrapper").findByText('Environment').click();
        cy.findByText('Select Environments').click();
        cy.findByPlaceholderText('Search Environment...').type(environmentName);

        cy.findByTestId('dropdown-options-wrapper').findByText(environmentName).click({ force: true })
          .root().click();

        cy.get('.plt__page__body').findByText(environmentName);
        cy.findByText("Status").click();
        cy.findByTestId("dropdown-options-wrapper").findByText("Online").click();
        cy.findByText('Select a filter and type names to show environments').should('exist');
      });
  });

  it('link to environment group is present when selecting environment group', () => {
    cy.findByText('Select Filter').click();
    cy.findByTestId("dropdown-options-wrapper").findByText('Environment Group').click();
    cy.findByText('Select Environment Groups').click();

    cy.findByPlaceholderText('Search Environment Group...').type(environmentGroupName);
    cy.findByTestId('dropdown-options-wrapper').findByText(environmentGroupName).click({ force: true });
    cy.root().click();

    cy.get('.plt__page__body').findByText(environmentGroupName).invoke('attr', 'href').should('eq', `/environment/groups/${environmentGroupId}`)
      .get('.plt__page__body').findByText(environmentGroupName).invoke('attr', 'target').should('eq', '_blank');
  });

  it('link to system is present when selecting system', () => {
    cy.findByText('Select Filter').click();
    cy.findByTestId("dropdown-options-wrapper").findByText('System').click();
    cy.findByText('Select Systems').click();

    cy.findByPlaceholderText("Search System...").type(systemName);
    cy.findByTestId('dropdown-options-wrapper').findByText(systemName).click({ force: true });
    cy.root().click();

    cy.get('.plt__page__body').findByText(systemName).invoke('attr', 'href').should('eq', `/environment/systems/${systemId}`)
      .get('.plt__page__body').findByText(systemName).invoke('attr', 'target').should('eq', '_blank');
  });

  it('Environment view filters with a query builder filter', () => {
    cy.findByText('Select Filter').click();
    cy.findByTestId("dropdown-options-wrapper").findByText('Environment').click();
    cy.get(".plt__qbbutton__icon").click();

    cy.findByText('Query Builder').should("be.visible");

    cy.get(environmentHealthCheckPageModel.queryBuilderColumnDropdownSelector).should("exist").click({ force: true });
    cy.get(environmentHealthCheckPageModel.queryBuilderDropdownOptionsSelector).findByText("Environment Name").click();
    cy.findByText("contains").click();
    cy.get(environmentHealthCheckPageModel.queryBuilderValueSearchSelector).should("exist").type(today);
    cy.findByText("Run Query").click();

    cy.findByText('Query Builder').should("not.exist");

    cy.findByText("Select Environments").should("be.visible").click();
    cy.findByText(environmentName).should("be.visible");
  });

  it('Refreshes grid when refresh button is pressed', () => {

    cy.findByText('Select Filter').click();
    cy.findByTestId("dropdown-options-wrapper").findByText('Environment').click();
    cy.findByText('Select Environments').click();
    cy.findByPlaceholderText('Search Environment...').type(environmentName);

    cy.findByTestId('dropdown-options-wrapper').findByText(environmentName).click({ force: true });
    cy.root().click();

    cy.get('.plt__page__body').findByText(environmentName);
    cy.findByText("Status").click();
    cy.findByTestId("dropdown-options-wrapper").findByText("No Data").click();
    cy.findByText('Select a filter and type names to show environments').should('exist');

    environmentHealthCheckApi.createHealthCheck(environmentId, "Online", "")
      .then((resp) => {
        cy.expect(resp.status).to.eq(200);

        cy.findByText('Refresh').click();
        cy.get('.plt__page__body').findByText(environmentName);
      });
  });

  it('shows statuses in legend', () => {
    cy.findByText('Legend').click();

    cy.get(environmentHealthCheckPageModel.legendPopoverSelector).contains('Online').should("be.visible");
    cy.get(environmentHealthCheckPageModel.legendPopoverSelector).contains('Offline').should("be.visible");
    cy.get(environmentHealthCheckPageModel.legendPopoverSelector).contains('Issue').should("be.visible");
    cy.get(environmentHealthCheckPageModel.legendPopoverSelector).contains('Unknown').should("be.visible");
    cy.get(environmentHealthCheckPageModel.legendPopoverSelector).contains('No Data').should("be.visible");

    cy.root().click();

    cy.get(environmentHealthCheckPageModel.legendPopoverSelector).should("not.exist");
  });
});