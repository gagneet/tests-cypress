import faker from 'faker/locale/en_AU'; // https://www.npmjs.com/package/faker
import { environmentGroupPageModel, environmentMapPageModel } from '../../../pages/environment-page';
import dataProviderLegacy from '../../../services/data-provider-legacy';

let token = '';
let data = [];
let connectivityBody = [];

const dayjs = require('dayjs');
const today = dayjs().format('DD-MM-YYYYHH:mm:ss');

const username = Cypress.env().users['admin'].username;
const organizationId = Cypress.env().users['admin'].organizationId;
const systemName = 'system-' + faker.address.countryCode() + ' ' + today;
const environmentGroupAPIModel = dataProviderLegacy.getLegacyModel();

let systemId = '';
let environmentId1 = '';
let environmentId2 = '';
let environmentName1= '';
let environmentName2= '';
let environmentGroupId1 = '';
let environmentGroupName1 = '';

before('Preconditions: token generation and look up fields',() => {
  cy.fixture('data').should((data) => {
    token = data.token;
  }).then(() => {
    //test data which will be used across all tests is created here
    dataProviderLegacy.setToken(token);
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

describe('End-to-end: Environment Map', () => {
  beforeEach(() => {
    // create system
    data = {
      'token': token,
      'name': systemName,
      'vendor': username,
      'status': 'Active',
      'organizationId': organizationId,
      'description': systemName,
    };
    cy.systems('POST', '', data).then((resp) => {
      systemId = resp.body.id;
      cy.log(`system '${systemId}' successfully set`);
      // create environments
     data = {
       'token': token,
       'payload': [{
         'token': token,
         'name': 'env-' + faker.address.countryCode() + ' ' + today,
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
          'name': 'env-' + faker.address.countryCode() + ' ' + today,
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
      cy.environmentsbulk('POST', data).should((resp) => {
        environmentId1 = resp.body[0].id;
        environmentId2 = resp.body[1].id;
        environmentName1 = resp.body[0].name;
        environmentName2 = resp.body[1].name;
        cy.log(`Environments '${environmentId1}' and '${environmentId2}' successfully created.`);

        // create an environment group with linked environment
        data = {
          'token': token,
          'name': 'eg1-' + ' ' + today,
          'color': faker.internet.color(),
          'vendor': faker.company.companyName(),
          'usageWorkItemId': environmentGroupAPIModel.usedForWorkItem,
          'organizationId': organizationId,
          'environmentIDs': [environmentId1,environmentId2],
        };
        cy.environmentgroups('POST', '', data).should((resp) => {
          environmentGroupId1 = resp.body.id;
          environmentGroupName1 = resp.body.name;
          cy.log(`Environment Group '${environmentGroupId1}' successfully created.`);

          // create an environment connectivity between the 2 environments
          // connectivityBody = {
          //   'environmentGroupId': environmentGroupId1,
          //   'sourceId': environmentId1,
          //   'targetId': environmentId2,
          //   'connectivityTypeId': environmentGroupAPIModel.environmentMapConnectivityTypeId,
          //   'direction': 'Out'
          // };
          data = {
            'token': token,
            // 'body': connectivityBody
            'environmentGroupId': environmentGroupId1,
            'sourceId': environmentId1,
            'targetId': environmentId2,
            'connectivityTypeId': environmentGroupAPIModel.environmentMapConnectivityTypeId,
            'direction': 'Out'
          };
          cy.log(environmentGroupId1);
          cy.connectivities('POST', '', data);
        });
      });
    });
  });

  it('Navigate through the Environment Map 🗺️', () => {
    cy.log('**Search Environment Group**');
    cy.visit(environmentMapPageModel.url, {
      onBeforeLoad(win) {
        cy.stub(win.console, 'log').as('consoleLog'); // stubbing for the 'view full screen' expected console error
        cy.stub(win.console, 'error').as('consoleError');
      }
    }).loading().closeTimeZoneModal();

    cy.log('**Clear Search field then click View to see message on panel**')
    .get(environmentMapPageModel.searchInput).clear();
    cy.findByTextThenClick('View')
    .get(environmentMapPageModel.emptyMap)
    .contains('There is no Environment connectivity setup to display. To setup this Environment map goto the Connectivity tab in the Manage Groups popup.');

    cy.log('**Enter new Environment Group in Search field then click View to see connections**')
    .get(environmentMapPageModel.searchInput).clear()
    .type(environmentGroupName1).click();
    cy.findByTextThenClick('View');

    cy.log('**Expand right panel and check that no environment has been selected**')
    .get(environmentMapPageModel.expandCollapseButton).click() // click arrow button to expand right panel
    .get(environmentMapPageModel.emptyRightPanel)
    .should('have.text', 'Select an Environment to show its Technical Specs and Configuration');

    cy.log('**Click an environment image and check that environment details**')
    .get(environmentMapPageModel.environmentMapButton).contains(environmentName1).click(); // draggable image
    // TODO: These are now hidden in re-skin:
    // .get(environmentMapPageModel.rightPanelNameText).eq(1) // environment name
    // .should('have.text', environmentName1)
    // .get(environmentMapPageModel.rightPanelNameText).eq(2) // system name
    // .should('have.text', systemName);
    // .get(environmentMapPageModel.rightPanelNameText).eq(2) // build name TODO: include this when available
    // .should('have.text', buildName);

    cy.log('**Change icon and copy to clipboard then collapse right panel**')
    .get(environmentMapPageModel.rightPanelIconList).click()
    .get(environmentMapPageModel.rightPanelIconSelect).contains('Admin Terminal').click()
    .get(environmentMapPageModel.rightPanelClipboardButton).click();
    cy.contains('Technical Specs and Configuration were copied to the clipboard') // status appears
    .get(environmentMapPageModel.expandCollapseButton).click();

    // TODO: Drag and drop does not seem to work
    cy.log('**Drag and drop then reset position**');
    // const dataTransfer = new DataTransfer();
    // cy.get('image.mapItems').contains(environmentName1) //drag and drop
    // .trigger("dragstart", {dataTransfer});
    // cy.get('image.mapItems').contains(environmentName1).trigger("dragover");
    // cy.get('image.mapItems').contains(environmentName1).trigger("drop", {dataTransfer});
    // cy.get('image.mapItems').contains(environmentName1).trigger("dragend");

    cy.get(environmentMapPageModel.environmentMapButton).contains(environmentName1) //drag and drop
    .trigger('mousedown', { which: 1 })
    .trigger('mousemove', { which: 1, pageX: 300, pageY: 300 })
    .trigger('mouseup', { which: 1 });
    // .trigger('mousedown', { which: 1 })
    // .trigger('mousemove', {clientX: 10, clientY: 10, force:true})
    // .trigger('mouseup', {force: true}).loading();
    // cy.get('image.mapItems').contains(environmentName1).then(el => { // drag and drop start
    //   const draggable = el[0];  // pick up this
    //   cy.get('svg').eq(0).then(el => {
    //     const droppable = el[0];  // drop over this
    //     const coords = droppable.getBoundingClientRect();
    //     draggable.dispatchEvent(new MouseEvent('mousemove'));
    //     draggable.dispatchEvent(new MouseEvent('mousedown'));
    //     draggable.dispatchEvent(new MouseEvent('mousemove', {clientX: 100, clientY: 100}));
    //     draggable.dispatchEvent(new MouseEvent('mousemove', {clientX: coords.x+100, clientY: coords.y+100}));
    //     cy.get(el).scrollIntoView();
    //     draggable.dispatchEvent(new MouseEvent('mouseup', {force: true}));
    //   });
    // });
    cy.get(environmentMapPageModel.resetPositionButton).click();

    // note: full screen does not work with Cypress due to the Cypress dashboard limitation
    // this is just to confirm the button is clickable and returns an expected error
    cy.findByTextThenClick('View Full Screen'); // returns (uncaught exception) TypeError: fullscreen error
    Cypress.on('uncaught:exception', (err, runnable) => {
      expect(err.message).to.include('fullscreen error'); // asserting that the correct error is captured
      return false;
    });
  });
});