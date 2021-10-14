import faker from 'faker/locale/en_AU'; // https://www.npmjs.com/package/faker
import { environmentGroupPageModel } from '../../../pages/environment-page';
import { commonPageModel } from '../../../pages/home-page';
import dataProviderLegacy from '../../../services/data-provider-legacy';
import { blockoutPageModel } from '../../../pages/release-page';

let token = '';
let data = [];
const userName = Cypress.env().users['admin'].username;
const environmentGroupAPIModel = dataProviderLegacy.getLegacyModel();

//const date = new Date();
//const dateNow = date.toISOString();
const getCurrentDate = () =>{
  return new Date().toISOString();
};

let systemId = '';
let environmentId1 = '';
let environmentId2 = '';
let environmentName1 = '';
let environmentName2 = '';
let environmentGroupId1 = '';
let environmentGroupName1 = '';
let environmentGroupId2 = '';
let environmentGroupName2 = '';

before('Preconditions: token generation, Lookup Fields, Organization',() => { // run this once to generate a token before the entire test suite
  cy.fixture('data').should((data) => {
    token = data.token;
    cy.login(data.token);
  }).then(() => {
    //test data which will be used across all tests is created here
    dataProviderLegacy.setToken(token);
    dataProviderLegacy.getOrganization();
    dataProviderLegacy.getLegacyLookupFieldReleaseRiskLevel();
    dataProviderLegacy.getLegacyLookupFieldReleaseStatusType();
    dataProviderLegacy.getLegacyLookupFieldReleaseType();
    dataProviderLegacy.getLegacyLookupUsedForWorkItem();
    dataProviderLegacy.getLegacyLookupEnvironmentStatus();
    dataProviderLegacy.getLegacyLookupEnvironmentMapConnectivityType();
  });
});

beforeEach(() => {
  cy.login(token);
  cy.visit(environmentGroupPageModel.url).closeTimeZoneModal();
});

describe('End-to-end: Environment Group 📟', () => {
  before(() => {
    cy.log(JSON.stringify(environmentGroupAPIModel));
  });

  beforeEach(() => {
    // Create System
    data = {
      'token': token,
      'name': 'system-' + faker.random.word() + ' ' + getCurrentDate(),
      'vendor': userName,
      'status': 'Active',
      'organizationId': environmentGroupAPIModel.organizationId,
      'description': 'description-' + faker.random.word() + ' ' + getCurrentDate(),
    };
    cy.systems('POST', '', data).then((resp) => { // Create System
      systemId = resp.body.id;
      cy.log(`system '${systemId}' successfully set`);
      // Create Envts
     data = {
       'token': token,
       'payload': [{
         'token': token,
         'name': 'env1-' + faker.random.word() + ' ' + getCurrentDate(), // using env1,2,3 because rundom word and eve time are the same sometimes
         'vendor': faker.company.companyName(),
         'linkedSystemId': systemId,
         'usageWorkItemId': environmentGroupAPIModel.usedForWorkItem,
         'environmentStatusId': environmentGroupAPIModel.environmentStatus,
         'environmentStatus': 'Active',
         'color': faker.internet.color(),
         'isSharedEnvironment': true,
         'hosts': []
        },
        {
          'token': token,
          'name': 'env2-' + faker.random.word() + ' ' + getCurrentDate(),
          'vendor': faker.company.companyName(),
          'linkedSystemId': systemId,
          'usageWorkItemId': environmentGroupAPIModel.usedForWorkItem,
          'environmentStatusId': environmentGroupAPIModel.environmentStatus,
          'environmentStatus': 'Active',
          'color': faker.internet.color(),
          'isSharedEnvironment': true,
          'hosts': []
        }]
      };
      cy.environmentsbulk('POST', data).should((resp) => { // Create an Envt
        environmentId1 = resp.body[0].id;
        environmentId2 = resp.body[1].id;
        environmentName1 = resp.body[0].name;
        environmentName2 = resp.body[1].name;
        cy.log(`Environments '${environmentId1}','${environmentId2}' successfully created.`);
        //Create an Envt Group 1 with added envts

        data = {
          'token': token,
          'name': 'EG1-' + ' ' + getCurrentDate(), //name should be small as live search cant filter by long name
          'color': faker.internet.color(),
          'vendor': faker.company.companyName(),
          'usageWorkItemId': environmentGroupAPIModel.usedForWorkItem,
          'organizationId': environmentGroupAPIModel.organizationId,
          'environmentIDs': [environmentId1,environmentId2],
        };
        cy.environmentgroups('POST', '', data).should((resp) => {  // Create an Envt Group
          environmentGroupId1 = resp.body.id;
          environmentGroupName1 = resp.body.name;
          cy.log(`Environment Group '${environmentGroupId1}' with Envts successfully created.`);
        });
        //Create an Envt Group 2 with envt
        data = {
          'token': token,
          'name': 'EG2-' + ' ' + getCurrentDate(), //name should be small as live search cant filter by long name
          'color': faker.internet.color(),
          'vendor': faker.company.companyName(),
          'usageWorkItemId': environmentGroupAPIModel.usedForWorkItem,
          'organizationId': environmentGroupAPIModel.organizationId,
          'environmentIDs': [environmentId1,environmentId2],
        };
        cy.environmentgroups('POST', '', data).should((resp) => {  // Create an Envt Group
          environmentGroupId2 = resp.body.id;
          environmentGroupName2 = resp.body.name;
          cy.log(`Environment Group '${environmentGroupId2}' without Envts successfully created.`);

          //close time zone popup window
          cy.visit(environmentGroupPageModel.url).loading().closeTimeZoneModal();
        });
      });
    });
  });

  it('Check Environment Group - Connectivity Tab - Batch Add 🔁', () => {
    cy.log('**Check Environment Group - Connectivity Tab - Batch Add** 🔁');
    cy.visit(environmentGroupPageModel.url).loading().closeTimeZoneModal()
    // Live search
    .get(commonPageModel.searchInput).eq(0).click().clear().type(environmentGroupName1).loading()
    .wait(3000) // need wait when grid is slow
    .get('[id^="groupGrid"] td:nth-child(2)').click({force: true})
    .get('.x-tab-inner.x-tab-inner-default:contains("Group Members")').click() // we need to go to members tab otherwise it will not get list of envts
    // Navigate Connectivity tab
    .get('.x-tab-inner.x-tab-inner-default').eq(1).click()
    .get('[id^="groupGrid"] td:nth-child(2)').click()// we need to click on a envt group grid to see envts
    .wait(1000)
    // Select source
    .get('.manageConnectivity .x-field label:contains("Source")').click()
    .get('.x-boundlist:eq(0) .x-boundlist-item').contains(environmentName1).click()
    // click source down arrow to enable bath add button (otherwise Batch Add button will be disabled)
    .get('.manageConnectivity .x-field label:contains("Source")').click()
    .get('.manageConnectivity .x-field label:contains("Source")').click()
    // Select direction
    .get('.manageConnectivity .x-field label:contains("Direction")').click()
    .get('.x-boundlist:eq(1) .x-boundlist-item > div.directionRight').click()
    // Select target
    .get('.manageConnectivity .x-field label:contains("Target")').click()
    .get('.x-boundlist:eq(2) .x-boundlist-item').contains(environmentName2).click()
    // Select type
    .get('.manageConnectivity .x-field label:contains("Type")').click()
    .get('.x-boundlist:eq(3) .x-boundlist-item').contains(environmentGroupAPIModel.environmentMapConnectivityTypeName).click()
    .wait(1000);
    // Click Batch Add button
    cy.findAllByText('Batch Add').click({force: true})
    // .get('.manageConnectivity .x-btn-inner-default-small').click({force: true}) // there is an issue in cypress that button is disabled->click source down arrow to enable bath add button (otherwise Batch Add button will be disabled)
    .save();
    // .loading();

    // Verification on connectivity grid after adding
    cy.get('[id^="connectivityGrid-"].x-panel-body-default tr td:nth-of-type(2) div').contains(environmentName1);
    cy.get('[id^="connectivityGrid-"].x-panel-body-default tr td:nth-of-type(3)').should('have.class', 'directionRight');
    cy.get('[id^="connectivityGrid-"].x-panel-body-default tr td:nth-of-type(4) div').contains(environmentName2);
    cy.get('[id^="connectivityGrid-"].x-panel-body-default tr td:nth-of-type(5) div').contains(environmentGroupAPIModel.environmentMapConnectivityTypeName);
    cy.log('**Connection via Batch Add was verified.**');
  });

  it('Check Environment Group - Connectivity Tab - Add/Delete Connection 🔁', ()=>{
    cy.log('**Check Environment Group - Connectivity Tab - Add/Delete Connection** 🔁');
    cy.visit(environmentGroupPageModel.url).loading().closeTimeZoneModal()
    // Live search
    .get(commonPageModel.searchInput).eq(0).click().clear().type(environmentGroupName1).loading()
    .wait(3000)// need wait when grid is slow
    .get('[id^="groupGrid"] td:nth-child(2)').click({force: true})
    .get('.x-tab-inner.x-tab-inner-default:contains("Group Members")').click()//we need to go to members tab otherwise it will not get list of envts
    // Navigate Connectivity tab
    .get('.x-tab-inner.x-tab-inner-default').eq(1).click()
    .get('[id^="groupGrid"] td:nth-child(2)').click({force: true})//we need to click on a grid to see envts
    .wait(1000);
    // Add Connection
    cy.findAllByText('Add Connection').click()
    // Select source
    .get('[id^="connectivityGrid-"].x-panel-body-default tr td:nth-of-type(2)').click()
    .get('.x-editor .x-form-trigger:eq(0)').click()
    .get('.x-boundlist:eq(0) .x-list-plain > li').contains(environmentName1).click()
    // Select direction
    .get('[id^="connectivityGrid-"].x-panel-body-default tr td:nth-of-type(3)').click()
    .get('.x-editor .x-form-trigger:eq(1)').click()
    .get('li .directionRight').click()
    // Select target
    .get('[id^="connectivityGrid-"].x-panel-body-default tr td:nth-of-type(4)').click()
    .get('.x-editor .x-form-trigger:eq(2)').click()
    .get('.x-boundlist:eq(2) .x-list-plain > li').contains(environmentName2).click()
    // Select type
    .get('[id^="connectivityGrid-"].x-panel-body-default tr td:nth-of-type(5)').click()
    .get('.x-editor .x-form-trigger:eq(3)').click()
    .get('.x-boundlist:eq(3) .x-list-plain > li').contains(environmentGroupAPIModel.environmentMapConnectivityTypeName).click()
    .save().loading();

    // Verification on connectivity grid after adding
    cy.get('[id^="connectivityGrid-"].x-panel-body-default tr td:nth-of-type(2) div').contains(environmentName1);
    cy.get('[id^="connectivityGrid-"].x-panel-body-default tr td:nth-of-type(3)').should('have.class', 'directionRight');
    cy.get('[id^="connectivityGrid-"].x-panel-body-default tr td:nth-of-type(4) div').contains(environmentName2);
    cy.get('[id^="connectivityGrid-"].x-panel-body-default tr td:nth-of-type(5) div').contains(environmentGroupAPIModel.environmentMapConnectivityTypeName);
    cy.log('**Added Connection via "Add Connection" button was verified.**');
    // Delete Connection
    cy.get('[id^="connectivityGrid-"].x-panel-body-default tr td:nth-of-type(1)').click();
    cy.findAllByText('Delete Connection').click()
    .save();
    // Verification on connectivity grid after removing
    cy.get('[id^="connectivityGrid"] .x-grid-item-container > table').should('not.exist');
    cy.log('**Removed Connection via "Delete Connection" button was verified.**');
  });

  it('Check Environment Group - Connectivity Tab - Move Connection 🔁', ()=>{
    cy.log('**Check Environment Group - Connectivity Tab - Move Connection ** 🔁');
    cy.visit(environmentGroupPageModel.url).closeTimeZoneModal()
    // Live search
    .get(commonPageModel.searchInput).eq(0).click().clear().type(environmentGroupName1)
    .wait(3000)// need wait when grid is slow
    .get('[id^="groupGrid"] td:nth-child(2)').click({force: true})
    .get('.x-tab-inner.x-tab-inner-default:contains("Group Members")').click()//we need to go to members tab otherwise it will not get list of envts
    // Navigate Connectivity tab
    .get('.x-tab-inner.x-tab-inner-default').eq(1).click()
    .get('[id^="groupGrid"] td:nth-child(2)').click({force: true})//we need to click on a grid to see envts
    .wait(1000);
    // Add Connection
    cy.findAllByText('Add Connection').click()
    // Select source
    .get('[id^="connectivityGrid-"].x-panel-body-default tr td:nth-of-type(2)').click()
    .get('.x-editor .x-form-trigger:eq(0)').click()
    .get('.x-boundlist:eq(0) .x-list-plain > li').contains(environmentName1).click()
    // Select direction
    .get('[id^="connectivityGrid-"].x-panel-body-default tr td:nth-of-type(3)').click()
    .get('.x-editor .x-form-trigger:eq(1)').click()
    .get('li .directionRight').click()
    // Select target
    .get('[id^="connectivityGrid-"].x-panel-body-default tr td:nth-of-type(4)').click()
    .get('.x-editor .x-form-trigger:eq(2)').click()
    .get('.x-boundlist:eq(2) .x-list-plain > li').contains(environmentName2).click()
    // Select type
    .get('[id^="connectivityGrid-"].x-panel-body-default tr td:nth-of-type(5)').click()
    .get('.x-editor .x-form-trigger:eq(3)').click()
    .get('.x-boundlist:eq(3) .x-list-plain > li').contains(environmentGroupAPIModel.environmentMapConnectivityTypeName).click()
    .save().loading();

    // Move Connection
    cy.get('[id^="connectivityGrid-"].x-panel-body-default tr td:first').click({force: true});
    cy.findAllByText('Move Connection/s').click({force: true});

    // Search for new Group
    cy.get('[id^=comboBoxWithLocalSearch] .x-form-required-field').click().type(environmentGroupName2).type('{enter}')
    //Click on Save&Close button inside moveConnectionsWindow
    .get('.moveConnectionsWindow .x-btn-inner.x-btn-inner-default-small').click().loading()
    .save().loading();
    // make sure that connection dissappeared
    // Live search
    cy.get(commonPageModel.searchInput).eq(0).click().clear().type(environmentGroupName2).type('{enter}').loading()
    // .wait(1000)// need wait when grid is slow
    .get('[id^="groupGrid"] td:nth-child(2)').click({force: true})
    .get('.x-tab-inner.x-tab-inner-default:contains("Group Members")').click()//we need to go to members tab otherwise it will not get list of envts
    // Navigate Connectivity tab
    .get('.x-tab-inner.x-tab-inner-default').eq(1).click();
    // cy.findAllByText('Connectivity').click()
    // .wait(1000);
    // Verification on connectivity grid after move
    cy.get('[id^="connectivityGrid-"].x-panel-body-default tr td:nth-of-type(2) div').contains(environmentName1);
    cy.get('[id^="connectivityGrid-"].x-panel-body-default tr td:nth-of-type(3)').should('have.class', 'directionRight');
    cy.get('[id^="connectivityGrid-"].x-panel-body-default tr td:nth-of-type(4) div').contains(environmentName2);
    cy.get('[id^="connectivityGrid-"].x-panel-body-default tr td:nth-of-type(5) div').contains(environmentGroupAPIModel.environmentMapConnectivityTypeName);
    cy.log('**Connection was moved to new Group and verified.**');
  });
  it('Check Environment Group - Connectivity Tab - Ability to change settings in existing connection 🔁', ()=>{ // TODO: no existing connection appears
    cy.log('**Check Environment Group - Connectivity Tab - Ability to change settings in existing connection** 🔁');
    cy.visit(environmentGroupPageModel.url).loading().closeTimeZoneModal()
    // Live search
    .get(commonPageModel.searchInput).eq(0).click().clear().type(environmentGroupName1).type('{enter}')
    // .wait(3000)// need wait when grid is slow
    .get('[id^="groupGrid"] td:nth-child(2)').click({force: true});
    cy.findAllByText('Group Members').eq(0).click()//we need to go to members tab otherwise it will not get list of envts
    // Navigate Connectivity tab
    .get('[class="x-tab-inner x-tab-inner-default"]').eq(1).click()
    .get('[id^="groupGrid"] td:nth-child(2)').click({force: true})//we need to click on a grid to see envts
    .wait(1000);
    // Add Connection
    cy.findAllByText('Connectivity').click()
    // Select source
    .get('.manageConnectivity .x-field label:contains("Source")').click()
    .get('.x-boundlist:eq(0) .x-boundlist-item').contains(environmentName1).click()
    // click source down arrow to enable bath add button (otherwise Batch Add button will be disabled)
    .get('.manageConnectivity .x-field label:contains("Source")').click()
    .get('.manageConnectivity .x-field label:contains("Source")').click()
    // Select direction
    .get('.manageConnectivity .x-field label:contains("Direction")').click()
    .get('.x-boundlist:eq(1) .x-boundlist-item > div.directionRight').click()
    // Select target
    .get('.manageConnectivity .x-field label:contains("Target")').click()
    .get('.x-boundlist:eq(2) .x-boundlist-item').contains(environmentName2).click()
    // Select type
    .get('.manageConnectivity .x-field label:contains("Type")').click()
    .get('.x-boundlist:eq(3) .x-boundlist-item').contains(environmentGroupAPIModel.environmentMapConnectivityTypeName).click()
    .wait(1000);
    // Click Batch Add button
    cy.findAllByText('Batch Add').click({force: true})
      // .get('.manageConnectivity .x-btn-inner-default-small').click({force: true}) // there is an issue in cypress that button is disabled->click source down arrow to enable bath add button (otherwise Batch Add button will be disabled)
      .save().loading();
    // Change direction
    cy.get('[id^="connectivityGrid-"].x-panel-body-default tr td:nth-of-type(3)').click({force: true})
    
    .get('.x-editor .x-form-trigger:eq(0)').click({force: true})
    .get('li .directionLeftandRight:eq(1)').click({force:true})
    .save();
    // Verification on connectivity grid after removing
    cy.get('[id^="connectivityGrid-"].x-panel-body-default tr td:nth-of-type(3)').should('have.class', 'directionLeftandRight');
    cy.log('**Connection dirrection was changed and verified.**');
  });
});