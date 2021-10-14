import dataProviderLegacy from '/cypress/services/data-provider-legacy';
import { releasePageModel } from '/cypress/pages/release-page';
import releasesApi from '/cypress/support/api/legacy-release-calls';
import changesApi from '/cypress/support/api/legacy-change-calls';
import systemsApi from '/cypress/support/api/legacy-system-calls';
import environmentApi from '/cypress/support/api/legacy-environment-calls';
import tecrApi from '/cypress/support/api/legacy-tecr-calls';
import deploymentPlanApi from '/cypress/support/api/legacy-deployment-calls';

const aPIModel = dataProviderLegacy.getLegacyModel();
const organizationId = Cypress.env().users['admin'].organizationId;

describe('End-to-end: Release Analytics - Standard', () => {
  let changeId = '';
  let standardReleaseId = '';
  let systemId = '';
  let environmentId = '';
  let phaseId = '';

  before(() => {
    cy.log('Create Standard Release');
    cy.login();

    tecrApi.setupTecrData();

    environmentApi
      .setupEnvironmentData()
      .then(() => {
        systemsApi.createSystemViaApi({ organizationId });
      })
      .then((resp) => {
        systemId = resp.body.id;
        environmentApi.createEnvironmentViaApi(systemId);
      })
      .then((resp) => {
        environmentId = resp.body.id;
      });

    releasesApi
      .setupReleaseData()
      .then(() => releasesApi.createReleaseViaApi())
      .should((resp) => {
        standardReleaseId = resp.body.id;
      });
  });

  describe('Empty Charts exist: ', () => {
    before(() => {
      cy.visit(releasePageModel.url + '/' + standardReleaseId);
      cy.get(releasePageModel.tabButtons.analytics).click();
    });

    it('Phase & Gates chart loads as empty', () => {
      cy.get('[data-testid="PhaseGateProgress_Box"]')
        .findByText('Phase & Gate Progress')
        .should('exist');
    });

    it('Criteria by Status loads as empty', () => {
      cy.get('[data-testid="CriteriaByStatus_Box"]')
        .findByText('Criteria By Status')
        .should('exist');
      cy.get('[data-testid="CriteriaByStatus_Box"]').within(() => {
        cy.findByText('No data to render this report').should('exist');
        cy.findByText('Reload chart').should('exist');
      });
    });

    it('Activity By Status loads as empty', () => {
      cy.get('[data-testid="ActivitiesByStatus_Box"]')
        .findByText('Activity By Status')
        .should('exist');
      cy.get('[data-testid="ActivitiesByStatus_Box"]').within(() => {
        cy.findByText('No data to render this report').should('exist');
        cy.findByText('Reload chart').should('exist');
      });
    });

    it('Change Type By Status loads as empty', () => {
      cy.get('[data-testid="ChangeByTypeAndStatus_Box"]')
        .findByText('Change Type By Status')
        .should('exist');
      cy.get('[data-testid="ChangeByTypeAndStatus_Box"]').within(() => {
        cy.findByText('No data to render this report').should('exist');
        cy.findByText('Reload chart').should('exist');
      });
    });

    it('Change By Type loads as empty', () => {
      cy.get('[data-testid="ChangesByType_Box"]')
        .findByText('Change By Type')
        .should('exist');
      cy.get('[data-testid="ChangesByType_Box"]').within(() => {
        cy.findByText('No data to render this report').should('exist');
        cy.findByText('Reload chart').should('exist');
      });
    });

    it('Change By Status loads as empty', () => {
      cy.get('[data-testid="ChangesByStatus_Box"]')
        .findByText('Change By Status')
        .should('exist');
      cy.get('[data-testid="ChangesByStatus_Box"]').within(() => {
        cy.findByText('No data to render this report').should('exist');
        cy.findByText('Reload chart').should('exist');
      });
    });

    it('Scope Change Over Time loads as empty', () => {
      cy.get('[data-testid="ScopeChangeOverTime_Box"]')
        .findByText('Scope Change Over Time')
        .should('exist');
      cy.get('[data-testid="ScopeChangeOverTime_Box"]').within(() => {
        cy.findByText('No data to render this report').should('exist');
        cy.findByText('Reload chart').should('exist');
      });
    });

    it('TECR Summary loads as empty', () => {
      cy.get('[data-testid="ReleaseTecrSummary_Box"]')
        .findByText('TECR By Status')
        .should('exist');
      cy.get('[data-testid="ReleaseTecrSummary_Box"]').within(() => {
        cy.findByText('No data to render this report').should('exist');
        cy.findByText('Reload chart').should('exist');
      });
    });

    it('Booking Summary loads as empty', () => {
      cy.get('[data-testid="ReleaseBookingSummary_Box"]')
        .findByText('Booking By Status')
        .should('exist');
      cy.get('[data-testid="ReleaseBookingSummary_Box"]').within(() => {
        cy.findByText('No data to render this report').should('exist');
        cy.findByText('Reload chart').should('exist');
      });
    });

    it('Deployment Plan Summary loads as empty', () => {
      cy.get('[data-testid="ReleaseDeploymentPlanSummary_Box"]')
        .findByText('Deployment Plan By Status')
        .should('exist');
      cy.get('[data-testid="ReleaseDeploymentPlanSummary_Box"]').within(() => {
        cy.findByText('No data to render this report').should('exist');
        cy.findByText('Reload chart').should('exist');
      });
    });
  });

  describe('Charts get data', () => {
    before(() => {
      cy.log('**Pre-condition: Create new System, Release & Change** 🐙');
      changesApi
        .setupChangeData()
        .then(() => {
          cy.log(`Adding Change.`);
          return changesApi.createChangeViaApi();
        })
        .then((resp) => {
          changeId = resp.body.id;
          cy.log(`Linking System & release.`);
          return releasesApi.linkSystemToRelease(standardReleaseId, systemId);
        })
        .then(() => {
          cy.log('Linking Change to System');
          return changesApi.linkSystemToChange(changeId, systemId);
        })
        .then(() => {
          cy.log('Linking Change to Release');
          changesApi.linkChangeToRelease(changeId, standardReleaseId);
        })
        .then(() => {
          cy.log('Add stakeholder');
          return releasesApi.addStakeholdersToRelease(standardReleaseId);
        })
        .then(() => {
          cy.log('Add gate');
          return releasesApi.addGateToRelease(standardReleaseId);
        })
        .then((resp) => {
          cy.log('Add activity to Gate');
          return releasesApi.addActivityToRelease(standardReleaseId, {
            assignedWorkItemID: resp.body.id,
            status: 'InProgress',
          });
        })
        .then(() => {
          cy.log('Add phase');
          return releasesApi.addPhaseToRelease(standardReleaseId);
        })
        .then((resp) => {
          cy.log('Add activity to Phase');
          phaseId = resp.body.id;
          return releasesApi.addActivityToRelease(standardReleaseId, {
            assignedWorkItemID: phaseId,
          });
        })
        .then(() => {
          cy.log('Add Environment to Phase');
          return releasesApi.bookEnvironmentForPhase(
            standardReleaseId,
            phaseId,
            environmentId
          );
        })
        .then(() => {
          cy.log('Add TECR to Release');
          return tecrApi.createTecrViaApi({
            projectID: standardReleaseId,
          });
        })
        .then(() => {
          cy.log('Add Deployment Plan to Release');
          return deploymentPlanApi.createDeploymentPlanViaApi({
            releaseId: standardReleaseId,
            systemIds: [systemId],
          });
        });
    });

    it('Phase & Gate chart loads correctly', () => {
      cy.get('[data-testid="PhaseGateProgress_Box"]')
        .findByText('Reload chart')
        .click();

      cy.waitUntil(() =>
        cy
          .get(
            '[data-testid="PhaseGateProgress_Box"] [data-testid="1 Not Started"]'
          )
          .should('exist')
      );

      cy.get('[data-testid="PhaseGateProgress_Box"]').within(() => {
        // Check legend
        cy.get('[data-testid="1 Not Started"]').should('exist'); // the test ID is generated from count & label
        cy.get('[data-testid="1 In Progress"]').should('exist'); // the test ID is generated from count & label
        cy.get('[data-testid="0 Completed"]').should('exist'); // the test ID is generated from count & label
        cy.get('[data-testid="0 N/A"]').should('exist'); // the test ID is generated from count & label

        // Check Summary
        cy.findByText('Progress').should('exist');
        cy.findByText('Progress').siblings().first().should('have.text', '0%');
        cy.findByText('Overdue Activities').should('exist');
        cy.findByText('Overdue Activities')
          .siblings()
          .first()
          .should('have.text', '0');
        cy.findByText('Overdue Criteria').should('exist');
        cy.findByText('Overdue Criteria')
          .siblings()
          .first()
          .should('have.text', '0');

        // Check bar chart
        cy.findAllByText(aPIModel.workItemNamePhaseName).should(
          'have.length.at.least',
          1
        ); // Displayed text can be truncated + hidden title in full
        cy.findAllByText(aPIModel.workItemNameGateName).should(
          'have.length.at.least',
          1
        ); // Displayed text can be truncated + hidden title in full

        // TODO: figure out how to check line graph display as  the current targeting for these is insane
      });
    });

    it('Changes Type charts loads correctly', () => {
      cy.get('[data-testid="ChangeByTypeAndStatus_Box"]')
        .findByText('Reload chart')
        .click();

      cy.waitUntil(() =>
        cy
          .get(
            '[data-testid="ChangeByTypeAndStatus_Box"] [data-testid="1 ' +
              aPIModel.changeStatusName +
              '"]'
          )
          .should('exist')
      );

      cy.get('[data-testid="ChangeByTypeAndStatus_Box"]').within(() => {
        // Check legend
        cy.get('[data-testid="1 ' + aPIModel.changeStatusName + '"]').should(
          'exist'
        ); // the test ID is generated from count & label

        // Check Summary
        cy.findByText('Total').should('exist');
        cy.findByText('Total').siblings().first().should('have.text', '1');

        // TODO: figure out how to check line graph display as  the current targeting for these is insane
      });

      cy.get('[data-testid="ChangesByType_Box"]').within(() => {
        // TODO make 'Change' a variable as it can be client set; This will also test labels updating to custom titles.
        cy.findByText('Change By Type').should('exist');
        cy.get('[data-testid="100 ' + aPIModel.changeTypeName + '"]').should(
          'exist'
        );
      });

      cy.get('[data-testid="ChangesByStatus_Box"]').within(() => {
        // TODO make 'Change' a variable as it can be client set; This will also test labels updating to custom titles.
        cy.findByText('Change By Status').should('exist');
        cy.get('[data-testid="100 ' + aPIModel.changeStatusName + '"]').should(
          'exist'
        );
      });
    });

    it('Scope Changes Over Time loads correctly', () => {
      cy.get('[data-testid="ScopeChangeOverTime_Box"]')
        .findByText('Reload chart')
        .click();

      cy.waitUntil(() => cy.findByText('Change Added').should('exist'));

      cy.get('[data-testid="ScopeChangeOverTime_Box"]').within(() => {
        // Check legend
        cy.findByText('Added').should('exist');
        cy.findByText('Removed').should('exist');
        cy.findByText(/Current Date/).should('exist');
        cy.findByText(/Release Date/).should('exist');
        cy.findByText('Implementation Date').should('exist');

        // TODO - Figure out how to test the chart; Currently it's just rects and x-y coordinates that change.
      });
    });

    it('TECRs Summary loads correctly', () => {
      cy.get('[data-testid="ReleaseTecrSummary_Box"]')
        .findByText('Reload chart')
        .click();

      cy.waitUntil(() =>
        cy
          .get('[data-testid="ReleaseTecrSummary_Box"]')
          .findByText('Total')
          .should('exist')
      );

      cy.get('[data-testid="ReleaseTecrSummary_Box"]').within(() => {
        // Check legend
        cy.findByText('Total').should('exist');
        cy.findByText(aPIModel.changeRequestStatusName).should('exist');
      });
    });

    it('Bookings Summary loads correctly', () => {
      cy.get('[data-testid="ReleaseBookingSummary_Box"]')
        .findByText('Reload chart')
        .click();

      cy.waitUntil(() =>
        cy
          .get('[data-testid="ReleaseBookingSummary_Box"]')
          .findByText('Total')
          .should('exist')
      );

      cy.get('[data-testid="ReleaseBookingSummary_Box"]').within(() => {
        // Check legend
        cy.findByText('Total').should('exist');
        cy.findByText('Pending').should('exist');
      });
    });

    it('Deployment Plans Summary loads correctly', () => {
      cy.get('[data-testid="ReleaseDeploymentPlanSummary_Box"]')
        .findByText('Reload chart')
        .click();

      cy.waitUntil(() =>
        cy
          .get('[data-testid="ReleaseDeploymentPlanSummary_Box"]')
          .findByText('Total')
          .should('exist')
      );

      cy.get('[data-testid="ReleaseDeploymentPlanSummary_Box"]').within(() => {
        // Check legend
        cy.findByText('Total').should('exist');
        cy.findByText('Draft').should('exist');
      });
    });
  });
});

describe('End-to-end: Release Analytics - Enterprise', () => {
  let changeId = '';
  let standardReleaseId = '';
  let enterpriseReleaseId = '';
  let systemId = '';
  let environmentId = '';
  let phaseId = '';

  before(() => {
    cy.log('Create Enterprise Release');
    cy.login();

    tecrApi.setupTecrData();

    environmentApi
      .setupEnvironmentData()
      .then(() => {
        systemsApi.createSystemViaApi({ organizationId });
      })
      .then((resp) => {
        systemId = resp.body.id;
        environmentApi.createEnvironmentViaApi(systemId);
      })
      .then((resp) => {
        environmentId = resp.body.id;
      });

    releasesApi
      .setupReleaseData()
      .then(() =>
        releasesApi.createReleaseViaApi({
          plutoraReleaseType: 'Enterprise',
          releaseProjectType: 'None',
        })
      )
      .should((resp) => {
        enterpriseReleaseId = resp.body.id;
      });
  });

  describe('Empty Charts exist: ', () => {
    before(() => {
      cy.visit(releasePageModel.url + '/' + enterpriseReleaseId);
      cy.get(releasePageModel.tabButtons.analytics).click();
    });

    it('Phase & Gates chart loads as empty', () => {
      cy.get('[data-testid="PhaseGateProgress_Box"]')
        .findByText('Phase & Gate Progress')
        .should('exist');
    });

    it('Criteria by Status loads as empty', () => {
      cy.get('[data-testid="CriteriaByStatus_Box"]')
        .findByText('Criteria By Status')
        .should('exist');
      cy.get('[data-testid="CriteriaByStatus_Box"]').within(() => {
        cy.findByText('No data to render this report').should('exist');
        cy.findByText('Reload chart').should('exist');
      });
    });

    it('Activity By Status loads as empty', () => {
      cy.get('[data-testid="ActivitiesByStatus_Box"]')
        .findByText('Activity By Status')
        .should('exist');
      cy.get('[data-testid="ActivitiesByStatus_Box"]').within(() => {
        cy.findByText('No data to render this report').should('exist');
        cy.findByText('Reload chart').should('exist');
      });
    });

    it('Change Type By Status loads as empty', () => {
      cy.get('[data-testid="ChangeByTypeAndStatus_Box"]')
        .findByText('Change Type By Status')
        .should('exist');
      cy.get('[data-testid="ChangeByTypeAndStatus_Box"]').within(() => {
        cy.findByText('No data to render this report').should('exist');
        cy.findByText('Reload chart').should('exist');
      });
    });

    it('Change By Type loads as empty', () => {
      cy.get('[data-testid="ChangesByType_Box"]')
        .findByText('Change By Type')
        .should('exist');
      cy.get('[data-testid="ChangesByType_Box"]').within(() => {
        cy.findByText('No data to render this report').should('exist');
        cy.findByText('Reload chart').should('exist');
      });
    });

    it('Change By Status loads as empty', () => {
      cy.get('[data-testid="ChangesByStatus_Box"]')
        .findByText('Change By Status')
        .should('exist');
      cy.get('[data-testid="ChangesByStatus_Box"]').within(() => {
        cy.findByText('No data to render this report').should('exist');
        cy.findByText('Reload chart').should('exist');
      });
    });

    it('TECR Summary loads as empty', () => {
      cy.get('[data-testid="ReleaseTecrSummary_Box"]')
        .findByText('TECR By Status')
        .should('exist');
      cy.get('[data-testid="ReleaseTecrSummary_Box"]').within(() => {
        cy.findByText('No data to render this report').should('exist');
        cy.findByText('Reload chart').should('exist');
      });
    });

    it('Booking Summary loads as empty', () => {
      cy.get('[data-testid="ReleaseBookingSummary_Box"]')
        .findByText('Booking By Status')
        .should('exist');
      cy.get('[data-testid="ReleaseBookingSummary_Box"]').within(() => {
        cy.findByText('No data to render this report').should('exist');
        cy.findByText('Reload chart').should('exist');
      });
    });

    it('Deployment Plan Summary loads as empty', () => {
      cy.get('[data-testid="ReleaseDeploymentPlanSummary_Box"]')
        .findByText('Deployment Plan By Status')
        .should('exist');
      cy.get('[data-testid="ReleaseDeploymentPlanSummary_Box"]').within(() => {
        cy.findByText('No data to render this report').should('exist');
        cy.findByText('Reload chart').should('exist');
      });
    });
  });

  describe('Charts get data', () => {
    before(() => {
      cy.log('**Pre-condition: Create new System, Child Release & Change** 🐙');
      changesApi
        .setupChangeData()
        .then(() => {
          cy.log(`Adding Change.`);
          return changesApi.createChangeViaApi();
        })
        .then((resp) => {
          changeId = resp.body.id;
          cy.log('Adding Child Release');
          return releasesApi.createReleaseViaApi({
            parentReleaseId: enterpriseReleaseId,
          });
        })
        .then((resp) => {
          standardReleaseId = resp.body.id;
          cy.log(`Linking System & Enterprise.`);
          return releasesApi.linkSystemToRelease(enterpriseReleaseId, systemId);
        })
        .then(() => {
          cy.log('Linking System & Child');
          return releasesApi.linkSystemToRelease(standardReleaseId, systemId);
        })
        .then(() => {
          cy.log('Linking Change to System');
          return changesApi.linkSystemToChange(changeId, systemId);
        })
        .then(() => {
          cy.log('Linking Change to Child Release'); // Can't link Changes to Enterprise directly
          return changesApi.linkChangeToRelease(changeId, standardReleaseId);
        })
        .then(() => {
          cy.log('Add stakeholder to Enterprise');
          return releasesApi.addStakeholdersToRelease(enterpriseReleaseId);
        })
        .then(() => {
          cy.log('Add stakeholder to Child');
          return releasesApi.addStakeholdersToRelease(standardReleaseId);
        })
        .then(() => {
          cy.log('Add Enterprise Gates & Phases');
          return releasesApi.addGateToRelease(enterpriseReleaseId);
        })
        .then((resp) => {
          return releasesApi.addActivityToRelease(enterpriseReleaseId, {
            assignedWorkItemID: resp.body.id,
            status: 'InProgress',
          });
        })
        .then(() => {
          return releasesApi.addPhaseToRelease(enterpriseReleaseId);
        })
        .then((resp) => {
          return releasesApi.addActivityToRelease(enterpriseReleaseId, {
            assignedWorkItemID: resp.body.id,
          });
        })
        .then(() => {
          cy.log('Add Child Gates & Phases');
          return releasesApi.getPhasesForReleases(standardReleaseId);
        })
        .then((resp) => {
          phaseId = resp.body[0].id;
          return releasesApi.addActivityToRelease(standardReleaseId, {
            assignedWorkItemID: phaseId,
            status: 'InProgress',
          });
        })
        .then(() => {
          return releasesApi.getGatesForReleases(standardReleaseId);
        })
        .then((resp) => {
          return releasesApi.addActivityToRelease(standardReleaseId, {
            assignedWorkItemID: resp.body[0].id,
          });
        })
        .then(() => {
          cy.log('Add Environment to Phase');
          return releasesApi.bookEnvironmentForPhase(
            standardReleaseId,
            phaseId,
            environmentId
          );
        })
        .then(() => {
          cy.log('Add TECR to Release');
          return tecrApi.createTecrViaApi({
            projectID: standardReleaseId,
          });
        })
        .then(() => {
          cy.log('Add Deployment Plan to Release');
          return deploymentPlanApi.createDeploymentPlanViaApi({
            releaseId: standardReleaseId,
            systemIds: [systemId],
          });
        });
    });

    it('Phase & Gate chart loads correctly', () => {
      cy.get('[data-testid="PhaseGateProgress_Box"]')
        .findByText('Reload chart')
        .click();

      cy.waitUntil(() =>
        cy
          .get(
            '[data-testid="PhaseGateProgress_Box"] [data-testid="2 Not Started"]'
          )
          .should('exist')
      );

      cy.get('[data-testid="PhaseGateProgress_Box"]').within(() => {
        // Check legend
        cy.get('[data-testid="2 Not Started"]').should('exist'); // the test ID is generated from count & label
        cy.get('[data-testid="2 In Progress"]').should('exist'); // the test ID is generated from count & label
        cy.get('[data-testid="0 Completed"]').should('exist'); // the test ID is generated from count & label
        cy.get('[data-testid="0 N/A"]').should('exist'); // the test ID is generated from count & label

        // Check Summary
        cy.findByText('Progress').should('exist');
        cy.findByText('Progress').siblings().first().should('have.text', '0%');
        cy.findByText('Overdue Activities').should('exist');
        cy.findByText('Overdue Activities')
          .siblings()
          .first()
          .should('have.text', '0');
        cy.findByText('Overdue Criteria').should('exist');
        cy.findByText('Overdue Criteria')
          .siblings()
          .first()
          .should('have.text', '0');

        // Check bar chart
        cy.findAllByText(aPIModel.workItemNamePhaseName).should(
          'have.length.at.least',
          1
        ); // Displayed text can be truncated + hidden title in full
        cy.findAllByText(aPIModel.workItemNameGateName).should(
          'have.length.at.least',
          1
        ); // Displayed text can be truncated + hidden title in full

        // TODO: figure out how to check line graph display as  the current targeting for these is insane
      });
    });

    it('Changes Type charts loads correctly', () => {
      cy.get('[data-testid="ChangeByTypeAndStatus_Box"]')
        .findByText('Reload chart')
        .click();

      cy.waitUntil(() =>
        cy
          .get(
            '[data-testid="ChangeByTypeAndStatus_Box"] [data-testid="1 ' +
              aPIModel.changeStatusName +
              '"]'
          )
          .should('exist')
      );

      cy.get('[data-testid="ChangeByTypeAndStatus_Box"]').within(() => {
        // Check legend
        cy.get('[data-testid="1 ' + aPIModel.changeStatusName + '"]').should(
          'exist'
        ); // the test ID is generated from count & label

        // Check Summary
        cy.findByText('Total').should('exist');
        cy.findByText('Total').siblings().first().should('have.text', '1');

        // TODO: figure out how to check line graph display as  the current targeting for these is insane
      });

      cy.get('[data-testid="ChangesByType_Box"]').within(() => {
        // TODO make 'Change' a variable as it can be client set; This will also test labels updating to custom titles.
        cy.findByText('Change By Type').should('exist');
        cy.get('[data-testid="100 ' + aPIModel.changeTypeName + '"]').should(
          'exist'
        );
      });

      cy.get('[data-testid="ChangesByStatus_Box"]').within(() => {
        // TODO make 'Change' a variable as it can be client set; This will also test labels updating to custom titles.
        cy.findByText('Change By Status').should('exist');
        cy.get('[data-testid="100 ' + aPIModel.changeStatusName + '"]').should(
          'exist'
        );
      });
    });
    it('TECRs Summary loads correctly', () => {
      cy.get('[data-testid="ReleaseTecrSummary_Box"]')
        .findByText('Reload chart')
        .click();

      cy.waitUntil(() =>
        cy
          .get('[data-testid="ReleaseTecrSummary_Box"]')
          .findByText('Total')
          .should('exist')
      );

      cy.get('[data-testid="ReleaseTecrSummary_Box"]').within(() => {
        // Check legend
        cy.findByText('Total').should('exist');
        cy.findByText(aPIModel.changeRequestStatusName).should('exist');
      });
    });

    it('Bookings Summary loads correctly', () => {
      cy.get('[data-testid="ReleaseBookingSummary_Box"]')
        .findByText('Reload chart')
        .click();

      cy.waitUntil(() =>
        cy
          .get('[data-testid="ReleaseBookingSummary_Box"]')
          .findByText('Total')
          .should('exist')
      );

      cy.get('[data-testid="ReleaseBookingSummary_Box"]').within(() => {
        // Check legend
        cy.findByText('Total').should('exist');
        cy.findByText('Pending').should('exist');
      });
    });

    it('Deployment Plans Summary loads correctly', () => {
      cy.get('[data-testid="ReleaseDeploymentPlanSummary_Box"]')
        .findByText('Reload chart')
        .click();

      cy.waitUntil(() =>
        cy
          .get('[data-testid="ReleaseDeploymentPlanSummary_Box"]')
          .findByText('Total')
          .should('exist')
      );

      cy.get('[data-testid="ReleaseDeploymentPlanSummary_Box"]').within(() => {
        // Check legend
        cy.findByText('Total').should('exist');
        cy.findByText('Draft').should('exist');
      });
    });
  });
});
