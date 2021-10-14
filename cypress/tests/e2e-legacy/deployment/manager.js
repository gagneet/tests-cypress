import faker from 'faker/locale/en_AU'; // https://www.npmjs.com/package/faker
import { deploymentPageModel } from "../../../pages/deployment-page";
import dataProviderLegacy from "../../../services/data-provider-legacy";
import dataProvider from "../../../services/data-provider";

let token = '';
let data = [];

const date = new Date();
const dateNow = date.toISOString();

const username = Cypress.env().users["admin"].uiusername;

const dPName = 'dp-' + faker.random.word() + ' ' + dateNow;
const releaseName = 'release-' + faker.random.word() + ' ' + dateNow;

const planningModel = dataProvider.getPlanningModel();
const aPIModel = dataProviderLegacy.getLegacyModel();

before("Preconditions: token generation and look up fields", () => {
  cy.fixture("data")
    .should((data) => {
      token = data.token;
    })
    .then(() => {
      // test data which will be used across all tests is created here
      dataProviderLegacy.setToken(token);
      dataProviderLegacy.getLegacyLookupSystemRoleDependencyType();
      dataProvider.setToken(token);
      dataProvider.getLegacyLookupFields();
      dataProvider.createSystem();
    });
});

beforeEach(() => {
  cy.login(token)
  .visit(deploymentPageModel.url).loading().closeTimeZoneModal();
});

describe("End-to-end: Deployment Manager", () => {
  before(() => {
    cy.log('**Create Release** 🌲')
    data = { // create Enterprise Release
      'token': token,
      'identifier': releaseName,
      'name': releaseName,
      'summary': releaseName,
      'releaseTypeId': planningModel.releaseTypeId,
      'location': faker.address.country(),
      'releaseStatusTypeId': planningModel.releaseStatusTypeId,
      'releaseRiskLevelId': planningModel.releaseRiskLevelId,
      'implementationDate': dateNow,
      'displayColor': faker.internet.color(),
      'organizationId': planningModel.organizationId,
      'parentReleaseId': null,
      'parentRelease': null,
      'plutoraReleaseType': 'Enterprise',
      'releaseProjectType': 'None',
    };
    cy.releases('POST', '', data).then((resp) => {
      const releaseId = resp.body.id;
      expect(resp.status).to.eq(201); // assert status code
      cy.log(`**Release '${releaseName}' successfully set. 🔥**`);

      data = { // link Release and System
        'token': token,
        'systemId': planningModel.systemId,
        'systemRoleType': 'Impact',
        'systemRoleDependencyTypeId': aPIModel.systemRoleDependencyTypeId
      };
      cy.releases('POST', `/${releaseId}/systems`, data).then((resp)=>{
        expect(resp.status).to.eq(201); // assert status code
        cy.log(`**Release successfully linked to system. 🔥**`);
      });
    });
    data = { // create deployment plan
      'token': token,
      'name': dPName,
      'description': dPName,
      'externalIdentifier': 'external-id-' + faker.random.number(),
      "SystemIDs": null,
      'organizationId': planningModel.organizationId
    };
    cy.deploymentPlans('POST', '/Create', data).then((resp)=>{
      expect(resp.status).to.eq(200);
      cy.log(`**Dp '${dPName}' successfully set. 🔥**`);
    });
  });

  it('Update stakeholder 🤵', ()=>{
    cy.clearQuery()
    .get(deploymentPageModel.liveSearch).clear()
    .get(deploymentPageModel.dPContainer).should('have.length.greaterThan', 2)
    .get(deploymentPageModel.liveSearch).type(dPName)
    .get(deploymentPageModel.dPContainer).should('have.length', 1)
    .get(deploymentPageModel.dPName).should('have.text', dPName)
    .get(deploymentPageModel.dPCheckBox).click()
    .findByTextThenClick('Update Stakeholders')
    .get(deploymentPageModel.updateStakeholderWindow).should('be.visible')
    .findByTextThenClick('Add Stakeholder')
    .get(deploymentPageModel.stakeholderNameInput).type(username)
    .get('.x-boundlist-item-over').click({force:true})
    .get('label').contains('Responsible (R)').click()
    .findByTextThenClick('Add & Close')
    .get('.btn-secondary:first').should('contain', 'Update & Close').click().loading();
  });
  it("Create and use Query Builder 👷", () => {
    cy.clearQuery()
    .get(deploymentPageModel.liveSearch).clear()
    .get(deploymentPageModel.queryBuilderButton).click()
    .get(deploymentPageModel.queryBuilderWindow).should('be.visible').loading()
    .get('.x-form-arrow-trigger-default:first').click({force:true})
    .get('.x-boundlist-item').contains('Plan Name').click({force:true})
    .selectByTextThenClick('contains')
    .get(deploymentPageModel.queryConditionInput).type(dPName)
    .findByTextThenClick('Run').loading()
    .get(deploymentPageModel.dPContainer).should('have.length', 1).each((el)=>{
      cy.get(el).find('td').eq(2).find('a').should('contain', dPName);
    });
  });
  it("Live Search and filter 🔍 ", () => {
    cy.clearQuery()
    .get(deploymentPageModel.liveSearch).clear()
    .get(deploymentPageModel.dPContainer).should('have.length.greaterThan', 2)
    .get(deploymentPageModel.liveSearch).type(dPName)
    .get(deploymentPageModel.dPContainer).should('have.length', 1)
    .get(deploymentPageModel.dPName).contains(dPName);

    cy.log("**Filter: I'm a Stakeholder**")
    .get('.facelift-combobox').click()
    .get('.x-boundlist-item').contains("I'm a Stakeholder").click().loading()
    .get(deploymentPageModel.dPContainer).should('have.length', 1)
    .get(deploymentPageModel.dPName).contains(dPName);

    cy.log('**Filter: All**')
    .get('.facelift-combobox').click()
    .get('.x-boundlist-item').contains("All").click().loading()
    .get(deploymentPageModel.dPContainer).should('have.length', 1)
    .get(deploymentPageModel.dPName).contains(dPName);
  });
  it('Details appearing at the specific deployment plan row', ()=>{
    cy.searchDP(dPName);

    cy.log('**Add system and release**')
    .get(deploymentPageModel.dPLeftTab).eq(0).click()
    .get(deploymentPageModel.systemInput).parents('.x-form-trigger-wrap-default').find('.x-form-arrow-trigger-default').click({force:true}).loading()
    .get(deploymentPageModel.systemInput).type(planningModel.systemName)
    .get(deploymentPageModel.systemListContainer).find('.x-boundlist-item').should('have.length', 1).contains(planningModel.systemName, {matchCase:true}).click({force:true})
    .get(deploymentPageModel.releaseInput).parents('.x-form-trigger-wrap-default').find('.x-form-arrow-trigger-default').click({force:true})
    .get('.x-boundlist-floating').last().find('.x-boundlist-item').should('have.length', 1).contains(releaseName, {matchCase:true}).click({force:true})
    .get(deploymentPageModel.saveBtn).click({force:true}).loading();

    cy.log('**Edit stakeholder to be accountable 🤵**')
    .get(deploymentPageModel.dPLeftTab).eq(1).click().loading()
    .get('.x-grid-item-container:first>table')
    .get('[data-columnid="stakeholderNameId"]').click().loading()
    .get('.deploymentPlanWindow').should('be.visible')
    .get('label').contains('Accountable (A)').click()
    .findByTextThenClick('Edit & Close')
    .saveClose().loading();

    cy.get(deploymentPageModel.dPContainer).find('td').then((el)=>{
      cy.get(el).eq(2).find(deploymentPageModel.dPName).should('contain', dPName)
      .get(el).eq(4).find('.x-grid-cell-inner').should('contain', releaseName)
      .get(el).eq(5).find('.x-grid-cell-inner').should('contain', releaseName)
      .get(el).eq(7).find(`[data-qtip="${username}"]`);
    });
  });
  it('DP update on the grid going through the modes', ()=>{
    cy.searchDP(dPName);

    cy.log('**Update: Draft > Approved**')
    .updateMode('Approve').saveClose().loading()
    .get('.x-tab-top').first().click({force:true}); // filter to all

    cy.get(deploymentPageModel.dPContainer).find(deploymentPageModel.dPName).contains(dPName).click();
    cy.log('**Update: Approved > Execution**')
    .updateMode('Execute');

    cy.log('**Update: Execution > Complete**')
    .updateMode('Complete');
  });
  it('Duplicate and delete', ()=>{
    cy.get(deploymentPageModel.liveSearch).clear()
    .get(deploymentPageModel.dPContainer).should('have.length.greaterThan', 2)
    .get(deploymentPageModel.liveSearch).type(dPName)
    .get(deploymentPageModel.dPContainer).should('have.length', 1)
    .get(deploymentPageModel.dPName).contains(dPName);

    cy.log('**Duplicate deployment plan**')
    .get(deploymentPageModel.dPCheckBox).click() // duplicate
    .findByTextThenClickForce('Duplicate')
    .get('.duplicateDeploymentPlanWindow').findByTextThenClick('Duplicate & Close').loading()
    .get('.x-tab-top').first().click({force:true}) // filter to all
    .get(deploymentPageModel.dPContainer).should('have.length', 2);

    cy.log('**Delete deployment plan**')
    .get(deploymentPageModel.dPCheckAllBox).click() // delete
    .findByTextThenClick('Delete')
    .get(deploymentPageModel.messageBox).first().find('.x-btn-inner-default-small').contains('Delete').click({force:true}).loading()
    .get('.x-grid-empty').should('contain', 'No Matching Records');
  });
  it('Add/Edit/Delete DP', ()=>{
    cy.log('**Create a DP**')
    .get('.grid-toolbar').should('be.visible')
    .get(deploymentPageModel.newBtn).click()
    .get(deploymentPageModel.addDPBtn).first().click({force:true}).loading()
    .get(deploymentPageModel.dPWindow).should('be.visible')
    .get(deploymentPageModel.nameInput).type(dPName)
    .get(deploymentPageModel.dPExternalInput).type(dPName)
    .get(deploymentPageModel.systemInput).parents('.x-form-trigger-wrap-default').find('.x-form-arrow-trigger-default').click({force:true}).loading()
    .get(deploymentPageModel.systemInput).type(planningModel.systemName)
    .get(deploymentPageModel.systemListContainer).find('.x-boundlist-item').should('have.length', 1).contains(planningModel.systemName, {matchCase:true}).click({force:true})
    .get(deploymentPageModel.releaseInput).parents('.x-form-trigger-wrap-default').find('.x-form-arrow-trigger-default').click({force:true})
    .get('.x-boundlist-floating').last().find('.x-boundlist-item').should('have.length', 1).contains(releaseName, {matchCase:true}).click({force:true})
    .get(deploymentPageModel.saveBtn).click({force:true}).loading();

    cy.log('**Update the external identifier**')
    .get(deploymentPageModel.dPExternalInput).clear().type('extIdentifier-' + faker.random.word() + ' ' + dateNow)
    .get(deploymentPageModel.saveBtn).click({force:true}).loading();

    cy.log('**Delete a DP**')
    .get('.btn-danger:first').click()
    .get(deploymentPageModel.messageBox).find('.btn-danger').click().loading();
  });
});