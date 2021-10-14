import faker from 'faker/locale/en_AU'; // https://www.npmjs.com/package/faker
import { deploymentPageModel } from "../../../pages/deployment-page";
import dataProviderLegacy from "../../../services/data-provider-legacy";
import dataProvider from "../../../services/data-provider";

let token = "";
let data = [];

const mailosaurServerId = Cypress.env().mailosaurServerId;

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);
const endDateUTC = dayjs().add(1, 'month').utc().format();
const today = dayjs().add(30, 'days').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');

const email = Cypress.env().users["admin"].username;
const organizationId = Cypress.env().users["admin"].organizationId;
const organizationName = Cypress.env().users["admin"].organizationName;
const username = Cypress.env().users["admin"].uiusername;

const dPName = 'dp-' + faker.random.word() + ' ' + today;
const mdPName = 'mdp-' + faker.random.word() + ' ' + today;
const releaseName = 'release-' + faker.random.word() + ' ' + today;
const broadcastText = "Adhoc is pressed";

const aPIModel = dataProviderLegacy.getLegacyModel();
const planningModel = dataProvider.getPlanningModel();

before("Preconditions: token generation and look up fields", () => {
  cy.fixture("data")
  .should((data) => {
    token = data.token;
  })
  .then(() => {
    // test data which will be used across all tests is created here
    dataProviderLegacy.setToken(token);
    dataProviderLegacy.getLegacyLookupSystemRoleDependencyType();
    dataProviderLegacy.getLegacyLookupFieldReleaseRiskLevel();
    dataProviderLegacy.getLegacyLookupFieldReleaseStatusType();
    dataProviderLegacy.getLegacyLookupFieldReleaseType();
    dataProvider.setToken(token);
    dataProvider.getLegacyLookupFields();
    dataProvider.createSystemsBulk();
  });
});

beforeEach(() => {
  cy.login(token)
  .visit(deploymentPageModel.url).loading().closeTimeZoneModal() //close time zone popup
  .get(deploymentPageModel.filterSelect).eq(0).click()
  .get('.x-boundlist-item').contains('All').click();
});

describe("End-to-end: Deployment Plan: information tabr", () => {
  before(() => {
    cy.log('**Create release** 🌲')
    data = { // create Enterprise Release
      'token': token,
      'identifier': releaseName,
      'name': releaseName,
      'summary': releaseName,
      'releaseTypeId': aPIModel.releaseTypeId,
      'location': faker.address.country(),
      'releaseStatusTypeId': aPIModel.releaseStatusTypeId,
      'releaseRiskLevelId': aPIModel.releaseRiskLevelId,
      'implementationDate': endDateUTC,
      'displayColor': faker.internet.color(),
      'organizationId': organizationId,
      'parentReleaseId': null,
      'parentRelease': null,
      'plutoraReleaseType': 'Enterprise',
      'releaseProjectType': 'None',
    };
    cy.releases('POST', '', data).then((resp) => {
      const releaseId = resp.body.id;
      expect(resp.status).to.eq(201); // assert status code
      cy.log(`**Release '${releaseName}' successfully set. 🔥**`);

      cy.log('**Set release to a system** 🌲')
      data = { // link Release and System
        'token': token,
        'systemId': planningModel.systemBulkId2,
        'systemRoleType': 'Impact',
        'systemRoleDependencyTypeId': aPIModel.systemRoleDependencyTypeId
      };
      cy.releases('POST', `/${releaseId}/systems`, data).then((resp)=>{
        expect(resp.status).to.eq(201); // assert status code
        cy.log(`**Release successfully linked to system. 🔥**`);
      });
    });

    cy.log('**Create deployment plan** 🌲')
    data = { // create deployment plan
      "token": token,
      "name": dPName,
      "description": dPName,
      "externalIdentifier": 'external-id-' + faker.random.number(),
      "organizationId": organizationId,
      "SystemIDs": null,
    };
    cy.deploymentPlans('POST', '/Create', data).then((resp)=>{
      expect(resp.status).to.eq(200);
      cy.log(`**Dp '${dPName}' successfully set. 🔥**`);
    });
  });
  it('Add/delete multiple systems and add release', ()=>{
    cy.clearQuery()
    .get('.x-tab-top').first().click({force:true}) // filter to all
    .get(deploymentPageModel.liveSearch).clear()
    .get(deploymentPageModel.dPContainer).should('have.length.greaterThan', 2)
    .get(deploymentPageModel.liveSearch).type(dPName)
    .get(deploymentPageModel.dPContainer).should('have.length', 1)
    .get(deploymentPageModel.dPName).contains(dPName).click({force: true});

    cy.log('**Add multiple system**')
    .get(deploymentPageModel.dPLeftTab).eq(0).click()
    .get(deploymentPageModel.systemInput).parents('.x-form-trigger-wrap-default').find('.x-form-arrow-trigger-default').click({force:true}).loading()
    .addSystem(planningModel.systemBulkName1)
    .addSystem(planningModel.systemBulkName2)
    .addSystem(planningModel.systemBulkName3);

    cy.log('**Delete system**')
    .get('.x-tagfield-item-close').first().click();

    cy.log('**Bringing down releases from selected systems**')
    .get(deploymentPageModel.releaseInput).parents('.x-form-trigger-wrap-default').find('.x-form-arrow-trigger-default').click({force:true})
    .get('.x-boundlist-floating').last().find('.x-boundlist-item').should('be.visible').contains(releaseName).click({force:true})
    .saveClose().loading();
  });
  it('Details inside deployment plan window', ()=>{
    cy.get(deploymentPageModel.liveSearch).clear()
    .get(deploymentPageModel.dPContainer).should('have.length.greaterThan', 2)
    .get(deploymentPageModel.liveSearch).type(dPName)
    .get(deploymentPageModel.dPContainer).should('have.length', 1)
    .get(deploymentPageModel.dPName).should('have.text', dPName).click()
    .get(deploymentPageModel.dPWindow).should('be.visible')
    .get(deploymentPageModel.dPLeftTab).eq(0).click();

    cy.log('**Details appearing at the window title**')
    .get('.x-window-header-title-default').then((el)=>{
      cy.get(el).find('.sub-titles').first().should('contain', dPName);
      cy.get(el).get('.title-section').eq(0).should('contain', 'Draft')
      .get('.title-section').eq(1).should('contain', username)
      .get('.title-section').eq(1).should('contain', dayjs().format('DD/MM/YYYY'))
      .get('.title-section').eq(2).should('contain', username)
      .get('.title-section').eq(2).should('contain', dayjs().format('DD/MM/YYYY'));
    });
    cy.log('**Details appearing at the top chevron panel**')
    .get('.chevron-inprogress').then((el)=>{
      cy.get(el).get('[class="deployment-status-text deployment-status-date"]').should('contain', dayjs().format('DD MMM YYYY'))
      .get('[class="deployment-status-text deployment-status-user"]').should('contain', username);
    })
    .saveClose().loading();
  });
  it('Add/edit/delete stakeholder', ()=>{
    cy.get(deploymentPageModel.liveSearch).clear()
    .get(deploymentPageModel.dPContainer).should('have.length.greaterThan', 2)
    .get(deploymentPageModel.liveSearch).type(dPName)
    .get(deploymentPageModel.dPContainer).should('have.length', 1)
    .get(deploymentPageModel.dPName).should('contain', dPName).click()
    .log('**Add stakeholder**')
    .get(deploymentPageModel.dPLeftTab).eq(1).click()
    .findByTextThenClick('Add New Stakeholder')
    .get(deploymentPageModel.stakeholderNameInput).type(username)
    .get('.x-boundlist-item-over').click({force:true})
    .findByTextThenClick('Add & Close');

    cy.log('Edit stakeholder')
    .get('.x-grid-cell-stakeholderNameId').contains(username).click()
    .get('.deploymentPlanWindow').should('be.visible')
    .get('label').contains('Accountable (A)').click()
    .findByTextThenClick('Edit & Close');

    cy.log('Delete stakeholder')
    .get('[data-qtip="Delete"]').click().loading()
    .saveClose().loading();
  });
  it('Broadcasting (email notification)', ()=>{
    cy.get(deploymentPageModel.liveSearch).clear()
    .get(deploymentPageModel.dPContainer).should('have.length.greaterThan', 2)
    .get(deploymentPageModel.liveSearch).type(dPName)
    .get(deploymentPageModel.dPContainer).should('have.length', 1)
    .get(deploymentPageModel.dPName).should('contain', dPName).click();

    cy.log('**Add stakeholder**')
    .get(deploymentPageModel.dPLeftTab).eq(1).click()
    .findByTextThenClick('Add New Stakeholder')
    .get(deploymentPageModel.stakeholderNameInput).type(username)
    .get('.x-boundlist-item-over').click({force:true})
    .get('label').contains('Accountable (A)').click()
    .findByTextThenClick('Add & Close');
    cy.findAllByText('Save').eq(0).click();

    cy.log('**Update status to execution**')
    .get(deploymentPageModel.dPLeftTab).eq(0).click()
    .updateMode('Approve')
    .saveClose().loading() // Update: Draft > Approved
    .get(deploymentPageModel.dPContainer).find(deploymentPageModel.dPName).contains(dPName).click()
    .updateMode('Execute'); // Update: Approved > Execution
    cy.findAllByText('Save').first().click();

    cy.log('**Create an activity**')
    .get(deploymentPageModel.dPLeftTab).eq(2).click()
    .get('.white-button').eq(0).click()
    .get('.x-grid-item-container').first().find('table').should('have.length',1)
    .get(deploymentPageModel.activityName).click()
    .get(deploymentPageModel.activityWindow).should('be.visible')
    .get(deploymentPageModel.responsibleInput).type(username).type('{enter}')
    .get('li').contains(username).click()
    .get('.x-btn-inner-default-toolbar-small').last().click()
    cy.findAllByText('Save').eq(0).click();

    cy.log('**Broadcast**')
    .get(deploymentPageModel.dPLeftTab).eq(0).click()
    .get(deploymentPageModel.broadcastSendBtn).click({force:true}).wait(120000); //without wait it is trying to find the last email

    cy.log('**Check email**')
    .mailosaurGetMessage(mailosaurServerId, {
      sentTo: email
    }, { timeout: 60000}).then(email => {
      new Date(today);
      expect(email.subject).to.contain(broadcastText);
      expect(email.html.body).to.contains(dPName);
    });
  });
  it('Master deployment plan', ()=>{
    cy.log('**Create master deployment plan**')
    .get('.grid-toolbar').should('be.visible');

    cy.findAllByText('New').click()
    .get(deploymentPageModel.addDPBtn).last().click({force:true})
    .get(deploymentPageModel.mdPWindow).should('be.visible')
    .get(deploymentPageModel.nameInput).type(mdPName);

    cy.log('**Edit portfolio**')
    .get(deploymentPageModel.portfolioInput).click()
    .get(deploymentPageModel.portfolioInput).clear().type(organizationName)
    .get('.x-grid-item-container').last().find('table').should('have.length.greaterThan', 1)
    .get('.x-tree-node-text').contains(organizationName).click({force:true});

    cy.log('**Bringing down systems from selected child deployment plans**')
    .findByTextThenClick('Add/Remove Deployment Plans').loading()
    .get('.drag-and-drop-window').should('be.visible')
    .get(deploymentPageModel.dPInput).type(dPName)
    .get('.x-grid-item-container').first().find('table').should('have.length', 1).as('drag')
    .get('.x-grid-item-container').eq(1).as('drop')
    .dragDrop('@drag', '@drop')
    .get('.drag-and-drop-window').find('.btn-secondary').last().click()
    .saveClose().loading();

    cy.log('**Bringing down releases from selected systems**')
    .get(deploymentPageModel.liveSearch).clear()
    .get(deploymentPageModel.dPContainer).should('have.length.greaterThan', 2)
    .get(deploymentPageModel.liveSearch).type(mdPName)
    .get(deploymentPageModel.dPContainer).should('have.length', 1)
    .get(deploymentPageModel.mdPName).should('have.text', mdPName).click({force:true})
    .get('[name^="compactTagWithLocalSearch-"]').eq(1).parents('.x-form-trigger-wrap-default').find('.x-form-arrow-trigger-default').click({force:true})
    .get('.x-boundlist-floating').find('.x-boundlist-item').should('be.visible').contains(releaseName).click({force:true})
    .saveClose().loading();
  });
  it('Audit, delete release, and delete DP', ()=>{
    cy.get(deploymentPageModel.liveSearch).clear()
    .get(deploymentPageModel.dPContainer).should('have.length.greaterThan', 2)
    .get(deploymentPageModel.liveSearch).type(dPName)
    .get(deploymentPageModel.dPContainer).should('have.length', 1)
    .get(deploymentPageModel.dPName).should('have.text', dPName).click();

    cy.log('**Audit**')
    .get('[class="x-btn-icon-el x-btn-icon-el-default-small facelift-audit-svg "]').click()
    .get(deploymentPageModel.auditWindow).should('be.visible')
    .get('[class="timeline-badge Added"]').should('have.length.greaterThan', 1)
    .get(deploymentPageModel.auditWindow).find('.x-tool-img').click();

    cy.log('**Delete release**')
    .get('.x-tagfield-item-close').eq(2).click({force: true})
    .get(deploymentPageModel.saveBtn).click({force:true}).loading();

    cy.log('**Delete DP**')
    .get('.btn-danger').click()
    .get('.x-message-box').find('.btn-danger').click().loading();
  });
});
