import { activityByStatusPageModel, deploymentPageModel } from "../../../pages/deployment-page";
import releasesApi from '/cypress/support/api/legacy-release-calls';
import systemsApi from '/cypress/support/api/legacy-system-calls';
import deploymentPlanApi from '/cypress/support/api/legacy-deployment-calls';

const downloadsFolder = Cypress.config("downloadsFolder");
const organizationId = Cypress.env().users["admin"].organizationId;

describe('End-to-end: Deployment plan - Activities by Status', ()=>{
  let releaseId = '';
  let releaseName = '';
  let systemId = '';
  let systemName = '';
  let deploymentPlanId = '';
  let deploymentPlanName = '';

  before("Preconditions: create system, release and deployment-plan", () => {
    cy.login();
    
    releasesApi.setupReleaseData()
    .then(() => {
      cy.log('**Create release**');
      return releasesApi.createReleaseViaApi({
        plutoraReleaseType: 'Enterprise',
        releaseProjectType: 'None',
      });
    })
    .then((resp)=>{
      releaseId = resp.body.id;
      releaseName = resp.body.name;
      cy.log('**Create system**');
      return systemsApi.createSystemViaApi({ organizationId });
    })
    .then((resp)=>{
      systemId = resp.body.id;
      systemName = resp.body.name;
      cy.log('**Linking System to release**');
      return releasesApi.linkSystemToRelease(releaseId, systemId);
    })
    .then(()=>{
      cy.log('**Create deployment plan**');
      return deploymentPlanApi.createDeploymentViaApi({systemIds: [systemId], releaseId});
    })
    .then((resp)=>{
      deploymentPlanId = resp.body.data.ID;
      deploymentPlanName = resp.body.data.Name;
      cy.log('**Create 2 activities in deployment plan**');
      deploymentPlanApi.createActivityForDeploymentPlanViaApi(systemId, deploymentPlanId);
      deploymentPlanApi.createActivityForDeploymentPlanViaApi(systemId, deploymentPlanId);
    });
  });
  it('Set the pre-requisites', ()=>{
    cy.visit(deploymentPageModel.url).loading().closeTimeZoneModal();
    cy.searchDP(deploymentPlanName);
    
    cy.log('**Grouping the activity**');
    cy.get(deploymentPageModel.dPLeftTab).eq(2).click();
    cy.get('.x-grid-item-container:first>table').should('be.visible');
    cy.get('.x-grid-row-checker').first().click(); // get first activity
    cy.findByTextThenClick('Group/Ungroup'); // group activity
    cy.get('.x-grid-row-checker').eq(1).click(); // get second activity
    cy.findByTextThenClick('Group/Ungroup'); // group activity
    cy.get(deploymentPageModel.saveBtn).first().click({force:true}).loading();

    cy.log('**Update: Draft to Approved**');
    cy.get(deploymentPageModel.dPLeftTab).eq(0).click().loading();
    cy.updateMode('Approve').saveClose().loading();
    cy.get('.x-tab-top').first().click({force:true}); // filter to all
  
    cy.get(deploymentPageModel.dPContainer).find(deploymentPageModel.dPName).contains(deploymentPlanName).click({force:true});
  
    cy.log('**Update: Approved to Execution**');
    cy.updateMode('Execute');
    cy.saveClose().loading();
  });
  it('View and clear grid', ()=>{
    cy.visit(activityByStatusPageModel.url).loading().closeTimeZoneModal();

    cy.log('**Clear grid** 🗑️');
    cy.get('.x-grid-item-container').should('be.visible');
    cy.findByTextThenClick('Clear');
    cy.get('.x-grid-empty').should('be.visible');

    cy.log('**View single release** 🧍‍♂️');
    cy.get('[name="MasterPlanBySystemsReleaseIds"]').click();
    cy.get('.multiSelList').should('be.visible');
    cy.get('.x-boundlist-item').contains(releaseName).click();
    cy.findByTextThenClick('View').loading();
    cy.get('.x-grid-item-container').find('table').should('be.visible');
    cy.get('.x-tagfield-list:first>.x-tagfield-item').should('have.length', 1);

    cy.log('**View multiple releases and multiple groups** 🧑‍🤝‍🧑');
    cy.get('[name="MasterPlanBySystemsReleaseIds"]').click();
    cy.get('.multiSelList').should('be.visible');
    cy.get('.x-boundlist-item:last').click();
    cy.findByTextThenClick('View').loading();
    cy.get('.x-grid-item-container').find('table').should('be.visible');
    cy.get('.x-tagfield-list:first>.x-tagfield-item').should('have.length', 2); // confirm there are 2 releases
    cy.get('.x-tagfield-list:last>.x-tagfield-item').should('have.length', 2); // confirm there 

    cy.log('**View single groups** 🧑‍🤝‍🧑');
    cy.get('.x-tagfield-item-close:last').click().loading();
    cy.findByTextThenClick('View').loading();
    cy.get('.x-tagfield-item-text:last').then((el)=>{
      const actTitle = el.text();
      cy.get(`[data-qtip="${actTitle}, ${actTitle}"]`);
    });
    cy.get('.x-tagfield-list:last>.x-tagfield-item').should('have.length', 1);

    cy.log('**Untick status** ❌');
    cy.get('.master-btn').click({multiple:true}).loading();
    cy.get('.x-grid-empty').should('be.visible');

    cy.log('**Tick status** ✅');
    cy.get('.master-btn').click({multiple:true}).loading();
    cy.get('.x-grid-item-container').find('table').should('be.visible');

    cy.log('**Export to XLS**');
    cy.findByTextThenClick('Export to XLS');
    cy.wait(3000); // envt is slow. need to wait to downloaded file

    cy.log("**Confirm downloaded file**");
    cy.task("readDirectory", downloadsFolder).then((value) => {
        expect(value).to.eq(true);
    });

    cy.log('**Remove download folder**');
    cy.task('deleteFolder', downloadsFolder);

    cy.log('**Go to deployment-plan modal from i icon**');
    cy.get(`[data-qtip="${systemName}"]`).siblings('.x-grid-cell-first').click().loading();
    cy.get(deploymentPageModel.dPWindow).should('be.visible');
    cy.get('.sub-titles').should('contain', deploymentPlanName);
    cy.saveClose();
  });
});
