import faker from 'faker/locale/en_AU'; // https://www.npmjs.com/package/faker
import { deploymentPageModel } from "../../../pages/deployment-page";
import dataProvider from "../../../services/data-provider";

let token = '';
let data = [];
let planID = '';

const dayjs = require('dayjs');
const today = dayjs().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
var customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)

const organizationId = Cypress.env().users["admin"].organizationId;
const userID = Cypress.env().users["admin"].userId;
const username = Cypress.env().users["admin"].uiusername;
const image = 'plutora-logo.png';
const downloadsFolder = Cypress.config("downloadsFolder");
const importActivities = 'activitiesImport.xlsx';

const dPName = 'dp-' + faker.random.word() + ' ' + today;
const mdPName = 'mdp-' + faker.random.word() + ' ' + today;

const planningModel = dataProvider.getPlanningModel();

function timeDiffCalc(dateFuture, dateNow) {
  let diffInMilliSeconds = Math.abs(dateFuture - dateNow) / 1000;

  const days = Math.floor(diffInMilliSeconds / 86400); // calculate days
  diffInMilliSeconds -= days * 86400;
  return days;
}

before("Preconditions: token generation and look up fields", () => {
  cy.fixture("data")
    .should((data) => {
      token = data.token;
    })
    .then(() => {
      dataProvider.setToken(token);
      dataProvider.getLegacyLookupFields();
      dataProvider.createSystemsBulk();
    });
});

beforeEach(() => {
  cy.login(token)
  .visit(deploymentPageModel.url).loading().closeTimeZoneModal();
});

describe("End-to-end: Deployment Plan: activity tab", () => {
  before(() => {
    cy.log('**Create deployment plan** 🌳');
    data = { // create deployment plan
      "token": token,
      "name": 'dp-' + faker.random.word() + ' ' + today,
      "description": 'dp-' + faker.random.word() + ' ' + today,
      "externalIdentifier": 'external-id-' + faker.random.number(),
      "organizationId": organizationId,
      "SystemIDs": null,
    };
    cy.deploymentPlans('POST', '/Create', data).then((resp)=>{
      planID = resp.body.data.ID;
      expect(resp.status).to.eq(200);
      cy.log(`**Deployment plan successfully created**`);
      
      cy.log('**Create activity in deployment plan** 🌳');
      data = {  // create activity in dp
        "token": token,
        'body': [
          {
            'name': 'act-' + faker.random.word() + ' ' + today,
            'planID': planID,
            'responsibleID': userID,
          }
        ]
      };
      cy.deploymentPlanActivity('POST', `/BatchCreate?deploymentPlanId=${planID}`, data).then((resp)=>{  // create activity in dp
        expect(resp.status).to.eq(200);
        cy.log(`**Activity successfully created**`);
      });

      cy.log('**Create master deployment plan** 🌳');
      data = { // create mdp
        "token": token,
        'name': mdPName,
        'deploymentPlanIds': planID,
        'OrganizationID': organizationId
      };
      cy.masterDeploymentPlans('POST', '/Create', data).then((resp)=>{
        expect(resp.status).to.eq(200);
        let mdpId = resp.body.data.ID;
        cy.log(`**Master deployment plan '${mdPName}'successfully created**`);

        cy.log('**Create activity in master deployment plan** 🌳');
        data = { // create activity in mdp
          "token": token,
          'body': [
            {
              'name': 'act-' + faker.random.word() + ' ' + today,
              'planID': mdpId,
              'responsibleID': userID,
            }
          ]
        };
        cy.deploymentPlanActivity('POST', `/BatchCreate?deploymentPlanId=${mdpId}`, data).then((resp)=>{
          expect(resp.status).to.eq(200);
          cy.log(`**Activity in '${mdPName}' successfully created**`);
        });
      });
    });
  });
  it('Add/edit/delete activity', ()=>{
    cy.clearQuery()
    .get('.grid-toolbar').should('be.visible');
    
    cy.log('**Create a Deployment Plan**')
    .get(deploymentPageModel.newBtn).click()
    .get(deploymentPageModel.addDPBtn).first().click({force:true}).loading()
    .get(deploymentPageModel.dPWindow).should('be.visible')
    .get(deploymentPageModel.nameInput).type(dPName)
    .get(deploymentPageModel.dPExternalInput).type(dPName)
    .get(deploymentPageModel.systemInput).parents('.x-form-trigger-wrap-default').find('.x-form-arrow-trigger-default').click({force:true}).loading()
    .addSystem(planningModel.systemBulkName1)
    .addSystem(planningModel.systemBulkName2)
    .addSystem(planningModel.systemBulkName3)
    .get(deploymentPageModel.saveBtn).first().click({force:true}).loading();

    cy.log('**Create an activity**')
    .get(deploymentPageModel.dPLeftTab).eq(2).click()
    .get(deploymentPageModel.gridBtn).click({force:true})
    .get('.white-button').eq(0).dblclick() // create 2 activities
    .get('.x-grid-item-container').first().find('table').should('have.length',2)
    .get(deploymentPageModel.saveBtn).first().click({force:true}).loading(); // save DP

    cy.log('**Edit an activity**')
    .get(deploymentPageModel.activityName).first().click()
    .get(deploymentPageModel.activityWindow).should('be.visible')
    .get('[name="Name"]').last().clear().type('act-' + faker.random.word() + ' ' + today)
    .closeActivityWindow() // close activity window
    .get(deploymentPageModel.saveBtn).first().click({force:true}).loading(); // save DP

    cy.log('**Delete an activity**')
    .get('.x-grid-row-checker').first().click()
    .get('.white-button').eq(1).click()
    .get('.x-message-box').should('be.visible')
    .get('.x-message-box').find('.btn-danger').click()
    .saveClose().loading();
  });
  it('Group/ungroup activity', ()=>{
    cy.searchDP(dPName)

    cy.log('**Add more activity**')
    .get(deploymentPageModel.dPLeftTab).eq(2).click()
    .get(deploymentPageModel.gridBtn).click({force:true})
    .get('.white-button').eq(0).dblclick(); // create 2 activities
    
    cy.log('**Group activity**')
    .get('.x-column-header-text-wrapper').first().click() // get all activity
    .findByTextThenClick('Group/Ungroup'); // group activity
    
    cy.log('**Collapse All Groups**')
    .get('.white-button').last().click();

    cy.log('**Expand All Groups**')
    .get('.white-button').last().click();

    cy.log('**Ungroup activity**')
    .get('.x-column-header-text-wrapper').first().click() // get all activity
    .findByTextThenClick('Group/Ungroup') // ungroup activity
    .saveClose().loading();
  });
  it('Set dependency, system, and re-order activity', ()=>{
    cy.searchDP(dPName);
    
    cy.log('**Set DP to an MDP**')
    .get(deploymentPageModel.dPWindow).should('be.visible')
    .get(deploymentPageModel.dPLeftTab).eq(0).click().loading()
    .get('.x-tagfield-input-field').eq(2).type(mdPName)
    .get('.x-boundlist-floating').find('.x-boundlist-item').contains(mdPName).click({force:true})
    .get(deploymentPageModel.saveBtn).first().click({force:true}).loading();

    cy.log('**Set Dependency**')
    .get(deploymentPageModel.dPLeftTab).eq(2).click().loading()
    .get(deploymentPageModel.gridBtn).click({force:true})
    .get(deploymentPageModel.activityName).first().click()
    .get(deploymentPageModel.activityWindow).should('be.visible')
    .get('.greenCrossDiv').click()
    .get('.dependencyWindow').should('be.visible')
    .get('.deploymentPlanStandardGrid').last().find('table').first().as('drag') // drag and drop from siblings activity
    .get('.deployment-plan-activity-dependency-grid').find('.x-grid-item-container').as('drop')
    .dragDrop('@drag', '@drop')
    .get('.deploymentPlanStandardGrid').last().find('table').last().as('drag') // drag and drop from siblings activity
    .dragDrop('@drag', '@drop')
    .get('.deploymentPlanStandardGrid').first().find('table').eq(1).click()  // drag and drop from mdp activity
    .get('.deploymentPlanStandardGrid').last().find('table').as('drag')
    .dragDrop('@drag', '@drop')
    .get('.deploymentPlanStandardGrid').first().find('table').last().click()  // drag and drop from dp activity
    .get('.deploymentPlanStandardGrid').last().find('table').as('drag')
    .dragDrop('@drag', '@drop');
    
    cy.log('**Update the dependency type**')
    .get('.dependency-name-label').eq(0).click() // set as finish to finish
    .get('.x-boundlist-item').contains('Finish To Finish').click({force:true})
    .get('.dependency-name-label').eq(1).click() // set as start to start
    .get('.x-boundlist-item').contains('Start To Start').click({force:true})
    .get('.dependency-name-label').eq(2).click() // set as start to finish
    .get('.x-boundlist-item').contains('Start To Finish').click({force:true})
    .get('.dependencyWindow').find('.btn-secondary').click().loading();
    
    cy.log('**Set systems**')
    .get(deploymentPageModel.systemInput).last().click()
    .get('.x-boundlist-item').contains(planningModel.systemBulkName1).click({force: true})
    .get('.x-boundlist-item').contains(planningModel.systemBulkName2).click({force: true})
    .get('.x-boundlist-item').contains(planningModel.systemBulkName3).click({force: true})
    .closeActivityWindow(); // close activity window

    cy.log('**Drag and drop to re-order activities in the grid**')
    .get('.x-grid-item-container:first>table:first') // drag first activity to be the second
    .trigger('mousedown')
    .get('.x-grid-item-container:first>table:nth-child(2)').trigger('mousemove', { clientX: 100, clientY: 100 })
    .get('.x-grid-item-container:first>table:last').trigger('mousemove', { clientX: 100, clientY: 100 })
    .trigger('mouseup', {force:true})
    .saveClose().loading();
  });
  it('Bulk updates', ()=>{
    cy.searchDP(dPName);
    
    cy.log('**Add stakeholder**')
    .get(deploymentPageModel.dPLeftTab).eq(1).click()
    .findByTextThenClick('Add New Stakeholder')
    .get(deploymentPageModel.stakeholderNameInput).type(username)
    .get('.x-boundlist-item-over').click({force:true})
    .get('label').contains('Responsible (R)').click()
    .findByTextThenClick('Add & Close')
    .get(deploymentPageModel.saveBtn).first().click({force:true}).loading();

    cy.log('**Bulk Update**')
    .get(deploymentPageModel.dPLeftTab).eq(2).click().loading()
    .get(deploymentPageModel.gridBtn).click({force:true})
    .get(deploymentPageModel.dPCheckAllBox).first().click()
    .findByTextThenClick('Bulk Update');

    cy.log('**Bulk Update: Responsible**')
    .get('#responsibleCheckboxId').click()
    .get('#responsibleComboId').click()
    .get('.x-boundlist-item').contains(username).click();

    cy.log('**Bulk Update: System**')
    .get('#applicationActivityCheckboxId').click()
    .get('#applicationActivityComboId-trigger-picker').click()
    .get('.x-boundlist-item').contains(planningModel.systemBulkName1).click();

    cy.log('**Bulk Update: Planning Date & Time**')
    .get('#startDateEnabledCheckboxId').click() // start date
    .get('.activities-bulk-update-start-date').click()
    .get('.facelift-date-time-picker').first().find(`[aria-label="${dayjs().format('MMMM DD')}"]`).click()
    .get(deploymentPageModel.applySelectedDateBtn).first().click()
    .get('.activities-bulk-update-end-date').click() // end date
    .get('.facelift-date-time-picker').last().find(`[aria-label="${dayjs().endOf('month').format('MMMM DD')}"]`).click()
    .get(deploymentPageModel.applySelectedDateBtn).last().click()
    .get('.save-btn').click().loading();

    cy.log('**Bulk Update: Reset**')
    .get(deploymentPageModel.dPCheckAllBox).first().click()
    .findByTextThenClick('Bulk Update')
    .get('#responsibleCheckboxId').click() // bulk update: responsible 
    .get('#applicationActivityCheckboxId').click() // bulk update: system 
    .get('#startDateEnabledCheckboxId').click() // bulk update: date 
    .get('.save-btn').click().loading();

    cy.log('**Bulk Update: Shift updates**')
    .get(deploymentPageModel.dPCheckAllBox).first().click()
    .findByTextThenClick('Bulk Update')
    .get('#startDateEnabledCheckboxId').click() // bulk update: date 
    .get('label').contains('Shift Planned Start and End Dates').click()
    .get('label').contains('Day(s)').siblings('div').first().clear().type('1')
    .get('.save-btn').click().loading()
    .saveClose().loading();
  });
  it("Bringing down Activity Sets from MDP in the field 'Link to Master Deployment Plan Activity Set:'", ()=>{
    cy.log('**Set an activity set on MDP**')
    .get('.x-tab-top').first().click({force:true}) // filter to all
    .get(deploymentPageModel.liveSearch).clear()
    .get(deploymentPageModel.dPContainer).should('have.length.greaterThan', 2)
    .get(deploymentPageModel.liveSearch).type(mdPName)
    .get(deploymentPageModel.dPContainer).should('have.length', 1)
    .get(deploymentPageModel.mdPName).should('have.text', mdPName).click({force:true})
    .get(deploymentPageModel.dPWindow).should('be.visible')
    .get(deploymentPageModel.dPLeftTab).eq(3).click()
    .get(deploymentPageModel.activitySetNameInput).type('activity set- ' + today)
    .saveClose().loading();

    cy.log('**Set activity in child DP to activity set in MDP**')
    .searchDP(dPName)
    .get(deploymentPageModel.dPLeftTab).eq(2).click()
    .get(deploymentPageModel.gridBtn).click({force:true})
    .get(deploymentPageModel.activityName).first().click()
    .get(deploymentPageModel.activityWindow).should('be.visible')
    .get(deploymentPageModel.activitySetInActivity).click().loading()
    .get('.x-boundlist-item-over').click()
    .closeActivityWindow() // close activity window
    .saveClose().loading();  
  });
  it('Update activity responsible and set to execution', ()=>{
    cy.searchDP(dPName);

    cy.log('**Bulk Update: Responsible**')
    .get(deploymentPageModel.dPLeftTab).eq(2).click()
    .get(deploymentPageModel.gridBtn).click({force:true})
    .get(deploymentPageModel.dPCheckAllBox).first().click()
    .findByTextThenClick('Bulk Update')
    .get('#responsibleCheckboxId').click()
    .get('#responsibleComboId').click()
    .get('.x-boundlist-item').contains(username).click()
    .get('.save-btn').click().loading();

    cy.log('**Update: Draft > Approved**')
    .get(deploymentPageModel.dPLeftTab).eq(0).click().loading()
    .updateMode('Approve').saveClose().loading()
    .get('.x-tab-top').first().click({force:true}); // filter to all

    cy.get(deploymentPageModel.dPContainer).find(deploymentPageModel.dPName).contains(dPName).click({force:true});

    cy.log('**Update: Approved > Execution**')
    .updateMode('Execute')
    .saveClose().loading();
  });
  it('DP real-time update changing statuses NotStarted/InProgress/Issue/Failed/Completed and set revised dates', ()=>{
    cy.searchDP(dPName)
    .get(deploymentPageModel.dPLeftTab).eq(2).click()
    .get(deploymentPageModel.gridBtn).click({force:true})
    .get(deploymentPageModel.activityName).first().click()
    .get(deploymentPageModel.activityWindow).should('be.visible');
    
    cy.log('**Update activity status: not started > in progress**')
    .get(deploymentPageModel.activityWindow).find('.in_progress').click()
    .closeActivityWindow(); // close activity window

    cy.log('**Update activity status: in progress > issue**')
    .get(deploymentPageModel.activityName).first().click()
    .get(deploymentPageModel.activityWindow).should('be.visible')
    .get(deploymentPageModel.activityWindow).find('.issue').click().loading()
    .closeActivityWindow(); // close activity window

    cy.log('**Update activity status: issue > failed**')
    .get(deploymentPageModel.activityName).first().click()
    .get(deploymentPageModel.activityWindow).should('be.visible')
    .get(deploymentPageModel.activityWindow).find('.failed').click().loading()
    .closeActivityWindow(); // close activity window

    cy.log('**Update activity status: failed > complete**')
    .get(deploymentPageModel.activityName).first().click()
    .get(deploymentPageModel.activityWindow).should('be.visible')
    .get(deploymentPageModel.activityWindow).find('.complete').click().loading();

    cy.log('**Set revised time**')
    .get(deploymentPageModel.revisedStartDateInput).click()
    .get('.x-datepicker-inner').find(`[aria-label="${dayjs().format('MMMM DD')}"]`).click()
    .get(deploymentPageModel.applySelectedDateBtn).click()
    .get(deploymentPageModel.revisedEndDateInput).click()
    .get('.x-datepicker-inner:last').find(`[aria-label="${dayjs().endOf('month').format('MMMM DD')}"]`).click()
    .get(deploymentPageModel.applySelectedDateBtn).last().click()
    .closeActivityWindow() // close activity window
    .saveClose().loading();
  });
  it('Set an activity as milestone, optional and cause downtime', ()=>{
    cy.searchDP(dPName)
    .get(deploymentPageModel.dPLeftTab).eq(2).click()
    .get(deploymentPageModel.gridBtn).click() // grid section
    .get('.white-button').eq(0).click() // create 2 activities
    .get(deploymentPageModel.activityName).last().click()
    .get(deploymentPageModel.activityWindow).should('be.visible')
    .get(deploymentPageModel.responsibleInput).type(username).type('{enter}')
    .get('li').contains(username).click()
    .get('.activity-slide-panel-time').scrollIntoView();

    cy.log('**Set activity as milestone**')
    .get('.activity-yes-no-switch').eq(0).click({force:true});

    cy.log('**Set activity as optional**')
    .get('.activity-yes-no-switch').eq(2).click({force:true});

    cy.log('**Set activity to cause downtime**')
    .get('.activity-yes-no-switch').eq(4).click({force:true})
    .get(deploymentPageModel.startDateDownTime).type(dayjs().add(1, 'day').format('DD/MM/YYYY HH:mm')).type('{enter}') // input start date down time
    .get(deploymentPageModel.applySelectedDateBtn).first().click()
    .get(deploymentPageModel.endDateDownTime).click() // input end date down time
    .get('.x-datepicker-inner:last').find(`[aria-label="${dayjs().endOf('month').format('MMMM DD')}"]`).click()
    .get(deploymentPageModel.applySelectedDateBtn).last().click()
    .closeActivityWindow() // close activity window
    .saveClose().loading();
  });
  it('Activity tab: planned and actual time', ()=>{
    cy.searchDP(dPName)
    .get(deploymentPageModel.dPLeftTab).eq(2).click()
    .get(deploymentPageModel.gridBtn).click({force:true})
    .log('**Confirm planned start time** ⭐').get('table:nth-child(1) > tbody > .x-grid-row > .x-grid-cell-DeploymentPlanActivityGrid-planned-start-date>div').contains(dayjs().add(1, 'days').format('DD/MM/YYYY'))
    .log('**Confirm planned end time** ⭐').get('table:nth-child(1) > tbody > .x-grid-row > .x-grid-cell-DeploymentPlanActivityGrid-planned-end-date>div').contains(dayjs().add(1, 'month').format('01/MM/YYYY'))
    .log('**Confirm actual start time** ⭐').get('table:nth-child(1) > tbody > .x-grid-row > .x-grid-cell-DeploymentPlanActivityGrid-actual-start-date>div').contains(dayjs().format('DD/MM/YYYY'))
    .log('**Confirm actual end time** ⭐').get('table:nth-child(1) > tbody > .x-grid-row > .x-grid-cell-DeploymentPlanActivityGrid-actual-end-date>div').contains(dayjs().format('DD/MM/YYYY'))
    .saveClose().loading();
  });
  it('Bulk delete', ()=>{
    cy.searchDP(dPName)
    .get(deploymentPageModel.dPLeftTab).eq(2).click()
    .get('.x-column-header-text-wrapper').first().click() // get all activity
    .get('.white-button').eq(1).click()
    .get('.bulk-delete').should('be.visible')
    .get('.bulk-delete').find('.btn-danger').click().loading()
    .saveClose().loading();
  });
  it('Overview: Activity Summary', ()=>{
    cy.searchDP(dPName)
    .get(deploymentPageModel.dPLeftTab).eq(2).click()
    .get(deploymentPageModel.gridBtn).click({force:true});

    cy.log('**Create new activity and set start & end date**')
    .get('.white-button').eq(0).click() 
    .get('.x-grid-item-container').first().find('table').should('have.length', 1)
    .get(deploymentPageModel.activityName).first().click()
    .get(deploymentPageModel.activityWindow).should('be.visible')
    .get(deploymentPageModel.responsibleInput).type(username).type('{enter}') // set responsible
    .get('li').contains(username).click()
    .get(deploymentPageModel.startDateTimePlanned).click() // set start date
    .get('.x-datepicker-inner').find(`[aria-label="${dayjs().format('MMMM DD')}"]`).click()
    .get(deploymentPageModel.applySelectedDateBtn).first().click()
    .get(deploymentPageModel.endDateTimePlanned).click() // set end date
    .get('.x-datepicker-inner:last').find(`[aria-label="${dayjs().endOf('month').format('MMMM DD')}"]`).click()
    .get(deploymentPageModel.applySelectedDateBtn).last().click()
    .closeActivityWindow() // close activity window
    .get(deploymentPageModel.saveBtn).first().click({force:true}).loading();

    cy.log('**Confirm the dates on activity tab and on information tab**')
    .get('.x-grid-item-container:first>table').then(()=>{
      const totalActivities = Cypress.$('.x-grid-item-container:first>table').length;
      const totalCompleteActivities = Cypress.$('[class="activityStatusIcon complete"]').length;
      const totalOverdueActivities = Cypress.$('.overdue-activity').length;
      const endDate = dayjs(Cypress.$(`table:nth-child(1) > tbody > .x-grid-row > .x-grid-cell-DeploymentPlanActivityGrid-planned-end-date>div`).text(), 'DD/MM/YYYYHH:mm').format('YYYY/MM/DD HH:mm:ss');
      const duration = Cypress.$('table:nth-child(1) > tbody > .x-grid-row > .x-grid-cell-DeploymentPlanActivityGrid-planned-duration>div').text().substring(0, 2);
     
      cy.get(deploymentPageModel.dPLeftTab).eq(0).click().loading()
      .log('**Confirm total activity** ⭐').get('.topText:contains(Total # Activities)').siblings('.valueText').contains(totalActivities)
      .log('**Confirm overdue activity** ⭐').get('.topText:contains(# Overdue Activities)').siblings('.valueText').contains(totalOverdueActivities)
      .log('**Confirm completed activity** ⭐').get('.topText:contains(# Completed Activities)').siblings('.valueText').contains(totalCompleteActivities)
      .log('**Confirm next activity** ⭐').get('.topText:contains(Next Activity due in)').siblings('.valueText').contains(timeDiffCalc(new Date(endDate), new Date(dayjs().format('YYYY/MM/DD HH:mm:ss'))))
      .log('**Confirm remaining duration** ⭐').get('.summaryBlockBox:last>.valueText').contains(timeDiffCalc(new Date(endDate), new Date(dayjs().format('YYYY/MM/DD HH:mm:ss'))))
      .log('**Confirm planned duration** ⭐').get('label:contains(Planned)').siblings('div:first').contains(duration)
      .log('**Confirm actual duration** ⭐').get('label:contains(Actual)').siblings('div:first').contains(duration)
      .saveClose().loading();
    });
  });
  it('Attach document to the activity', ()=>{
    cy.searchDP(dPName)
    .get(deploymentPageModel.dPLeftTab).eq(2).click()
    .get(deploymentPageModel.gridBtn).click({force:true})
    .get(deploymentPageModel.activityName).first().click()
    .get(deploymentPageModel.activityWindow).should('be.visible')
    .get('.iconTab:last').click()
    .get('.attachmentLabel').siblings('a').click()
    .get('.attachmentsMenuButton:last').click()
    .get('input[type="file"]').attachFile(image)
    .get('.fileUpdater').should('be.visible') // to confirm the file was saved
    .closeActivityWindow() // close activity window
    .saveClose().loading();
  });
  it('Comment the activity', ()=>{
    cy.searchDP(dPName)
    .get(deploymentPageModel.dPLeftTab).eq(2).click()
    .get(deploymentPageModel.gridBtn).click({force:true})
    .get(deploymentPageModel.activityName).first().click()
    .get(deploymentPageModel.activityWindow).should('be.visible')
    .get('.iconTab:first').click()
    .get('.fr-box > .fr-wrapper >.fr-element > p').should('be.visible')
    .get(deploymentPageModel.commentInput).type(dPName).wait(1000) // need wait, otherwise it won't post the comment
    .get('.pull-right').click()
    .get('.comment-body').should('have.length', 1)
    .closeActivityWindow() // close activity window
    .saveClose().loading();
  });
  it('Export to xls', ()=>{
    cy.searchDP(dPName)
    .get(deploymentPageModel.dPLeftTab).eq(2).click()
    .get(deploymentPageModel.exportToXLSBtn).click()
    .wait(3000); // envt is slow. need to wait to downloaded file

    cy.log("**Confirm downloaded file**")
    .task("readDirectory", downloadsFolder).then((value) => {
        expect(value).to.eq(true);
    });

    cy.log('**Remove download folder**')
    .task('deleteFolder', downloadsFolder)
    .saveClose().loading();
  });
  it('Import from XLS -> Download Template', ()=>{
    cy.searchDP(dPName)
    .get(deploymentPageModel.dPLeftTab).eq(2).click()
    .findByTextThenClick('Bulk Import')
    .get('.bulkImportsWindow').find('.steps-container').should('be.visible')
    .get('a:contains("download the template file")').click()
    .wait(3000); // envt is slow. need to wait to downloaded file

    cy.log("**Confirm downloaded file**")
    .task("readDirectory", downloadsFolder).then((value) => {
        expect(value).to.eq(true);
    });

    cy.log('**Remove download folder**')
    .task('deleteFolder', downloadsFolder)
    .get('.bulkImportsWindow').find('.x-tool-after-title').click()
    .saveClose().loading();
  });
  it('Import from XLS -> Upload File', ()=>{
    cy.searchDP(dPName)
    .get(deploymentPageModel.dPLeftTab).eq(2).click()
    .findByTextThenClick('Bulk Import')
    .get('.bulkImportsWindow').find('.steps-container').should('be.visible')
    .findByTextThenClick('Browse Local Computer')
    .get('input[type="file"]:last').attachFile(importActivities)
    .get('.selected-files:last>.file-item').should('have.length', 1)
    .get('.pull-right:last').click()
    .get('.copy:contains("Generating preview, please wait.")').should('not.be.visible')
    .findByTextThenClick('Auto Mapping')
    .get('.modal-content').should('be.visible')
    .get('.modal-content').find('button:last').click()
    .get('.pull-right:last').click()
    .get('button:contains("Ignore and Import")').click()
    .get('div:contains(" Your records have been imported into Plutora.")').should('be.visible')
    .get('button:contains("Close")').click().loading()
    .get('.x-grid-item-container').first().find('table').should('have.length', 2)
    .saveClose().loading();
  });
});
