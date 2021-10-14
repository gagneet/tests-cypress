import faker from 'faker/locale/en_AU'; // https://www.npmjs.com/package/faker
import { environmentManagerPageModel, environmentModalModel } from '../../../pages/environment-page';
import { commonPageModel } from '../../../pages/home-page';
import dataProviderLegacy from '../../../services/data-provider-legacy';

let token = '';
let data = [];
let systemId = '';

const downloadsFolder = Cypress.config('downloadsFolder');
const dayjs = require('dayjs');
const today = dayjs().format('DD-MM-YYYYHH:mm:ss');
const resultEmpty = 'No Matching Records';

const organizationId = Cypress.env().users['admin'].organizationId;
const systemName = 'system-' + faker.address.countryCode() + ' ' + today;
const environmentNameUI = 'env-' + faker.address.countryCode() + ' ' + today; // name should be small as live search cant filter by long name
const environmentNameParent = 'env-' + faker.address.countryCode() + ' ' + today;
const environmentNameChild = 'env-' + faker.address.countryCode() + ' ' + today;
const environmentAPIModel = dataProviderLegacy.getLegacyModel();

before('Preconditions: token generation and look up fields', () => {
  cy.fixture('data').should((data) => {
    token = data.token;
  }).then(() => {
    // test data which will be used across all tests is created here
    dataProviderLegacy.setToken(token);
    dataProviderLegacy.getLegacyLookupUsedForWorkItem();
    dataProviderLegacy.getLegacyLookupEnvironmentStatus();
  });
});

beforeEach(() => {
  cy.login(token)
  .visit(environmentManagerPageModel.url).loading().closeTimeZoneModal();
});

describe('End-to-end: Environment Manager', () => {
  before(() => {
    cy.log('**Pre-condition: Create new System & Environments** 🌳');
    data = { // create System
      'token': token,
      'name': systemName,
      'vendor': faker.company.companyName(),
      'status': 'Active',
      'organizationId': organizationId,
      'description': systemName,
    };
    cy.systems('POST', '', data).then((resp) => {
      expect(resp.status).to.eq(201); // assert status code
      systemId = resp.body.id;
      cy.log(`**System '${systemName}' successfully set.** 🔥`);
      
      data = { // create environments
        'token': token,
        'payload': [{
          'token': token,
          'name': environmentNameParent,
          'vendor': faker.company.companyName(),
          'linkedSystemId': systemId,
          'usageWorkItemId': environmentAPIModel.usedForWorkItem,
          'environmentStatusId': environmentAPIModel.environmentStatus,
          'environmentStatus': 'Active',
          'color': faker.internet.color(),
          'isSharedEnvironment': true,
          'hosts': []
        },
        {
          'token': token,
          'name': environmentNameChild,
          'vendor': faker.company.companyName(),
          'linkedSystemId': systemId,
          'usageWorkItemId': environmentAPIModel.usedForWorkItem,
          'environmentStatusId': environmentAPIModel.environmentStatus,
          'environmentStatus': 'Active',
          'color': faker.internet.color(),
          'isSharedEnvironment': true,
          'hosts': []
        }]
      };
      cy.environmentsbulk('POST', data).should((resp) => {
        expect(resp.status).to.eq(200); // assert status code
        cy.log(`**Environments '${environmentNameParent}' and '${environmentNameChild}' successfully created.** 🔥`);
      });
    });
  });
  it('Create an environment 🏗️', () => {
    cy.get('.x-btn-inner-default-toolbar-small:last').click()
    .get('.environmentWindowCls').should('be.visible')
    .get('.x-tab-top:first').click();

    cy.log('**Fill the form**')
    .get(environmentModalModel.nameInput).type(environmentNameUI)
    .get(environmentModalModel.descriptionInput).type('this is the description for ' + environmentNameUI)
    .get(environmentModalModel.urlInput).type(faker.internet.url())
    .get(environmentModalModel.usedForPhaseList).click()
    .selectByTextThenClick(environmentAPIModel.usedForWorkItemName)
    .get(environmentModalModel.vendorInput).type(faker.company.companyName())
    .get(environmentModalModel.statusList).click().loading()
    .selectByTextThenClick(environmentAPIModel.environmentStatusName)
    .get(environmentModalModel.systemList).click().loading()
    .get(environmentModalModel.systemList).type(`${systemName}`)
    .get('.treepanelpopup').should('be.visible')
    .get('.x-grid-item-container:last').find(`.x-tree-node-text:contains(${systemName})`).click({force:true})
    .saveClose().loading();
  });
  it('Create and use Query Builder 👷', () => {
    cy.log('**Clear Queries and filter**')
    .get('.query-builder-button').click()
    .get(".x-window-default-closable").should("be.visible")
    .findByTextThenClick('Clear Query').loading()
    .get('.facelift-combobox:first').click() // filter All
    .get('.x-boundlist-floating:last').find('.x-boundlist-item:contains(All)').click()
    .get('[placeholder="Live Search"]').clear() // clear live search
    .get('.x-grid-item-container>table').should('have.length.greaterThan', 2);

    cy.log('**Build a new query**')
    .get('.query-builder-button').click()
    .get('.x-window-default-closable').should('be.visible')
    .get('.x-form-arrow-trigger-default:first').click({force:true})
    .get('.x-boundlist-item').contains('Environment Name').click({force:true})
    .selectByTextThenClick('equals')
    .get('[class="x-form-field x-form-required-field x-form-text x-form-text-default  x-form-focus x-field-form-focus x-field-default-form-focus"]').type(environmentNameUI)
    .findByTextThenClick('Run').loading()
    .get('.x-grid-item-container>table').should('have.length', 1)
    .get(environmentManagerPageModel.environmentNameLink).should('contain', environmentNameUI);
  });
  it('Update an environment 🛠️', () => {
    cy.log('**Clear Queries and filter**')
    .get('.query-builder-button').click()
    .get(".x-window-default-closable").should("be.visible")
    .findByTextThenClick('Clear Query').loading()
    .get('.facelift-combobox:first').click() // filter All
    .get('.x-boundlist-floating:last').find('.x-boundlist-item:contains(All)').click();

    cy.get('[placeholder="Live Search"]').clear() // clear live search
    .get('.x-grid-item-container>table').should('have.length.greaterThan', 2)
    .get('[placeholder="Live Search"]').type(environmentNameUI).type('{enter}').loading()
    .get('.x-grid-item-container>table').should('have.length', 1)
    .get(environmentManagerPageModel.environmentNameLink).click({force: true})
    .get('.environmentWindowCls').should('be.visible'); // to confirm the modal opens

    cy.log('**Enter details from the Details tab**')
    .get('.x-tab-top:first').click();
    // add parent environment
    cy.findAllByText('Add Environment').eq(0).click();
    cy.get(environmentModalModel.environmentList).eq(1).click();
    cy.findAllByText(environmentNameParent).click();
    cy.get(environmentModalModel.environmentList).eq(1).click();
    cy.findAllByText('Save & Close').eq(1).click().loading();

    // add child environment
    cy.findAllByText('Add Environment').eq(1).click();
    cy.get(environmentModalModel.environmentList).eq(1).click();
    cy.findAllByText(environmentNameChild).click();
    cy.get(environmentModalModel.environmentList).eq(1).click();
    cy.findAllByText('Save & Close').eq(1).click().loading();

    // tick boxes
    cy.get(environmentModalModel.sharedEnvironmentCheckbox).eq(2).click({force:true});
    cy.get(environmentModalModel.automaticallyApprovedCheckbox).eq(3).click({force: true});
    cy.get(environmentModalModel.displayBookingAlertCheckbox).eq(4).click({force: true});
    cy.get(environmentModalModel.messageInput).clear().type(faker.company.catchPhrase());
    cy.saveClose().loading();
  });
  it.skip('Search environments and View by Date 👀', () => { // TODO: Unsure what to assert here
    cy.get(environmentManagerPageModel.filterSelect).eq(0).click();
    cy.findByText('All').click()
    .get(commonPageModel.searchInput).clear()
    .findByTextThenClick('View by Date');

    // if(cy.get('[class="x-btn x-unselectable x-btn-default-small switch-smoll-on-icon"]').length > 0){
    //   cy.get('[class="x-btn x-unselectable x-btn-default-small switch-smoll-on-icon"]').click();
    // }

    cy.contains('Reset Default').click();//.then(()=> {
    //   expect(environmentManagerPageModel.dateRangeStartDateInput).to.have.text(today);
    //   expect(environmentManagerPageModel.dateRangeEndDateInput).to.have.text(today);
    // });
    cy.saveClose();

    // TODO: Add negative scenarios to check if outside date range
  });
  it('Search environments and View By System Name or Environment Group Name 👀', () => {
    cy.log('**Search non-existing environment**')
    .get(environmentManagerPageModel.filterSelect).eq(0).click();
    cy.findByText('All').click()
    .get(commonPageModel.searchInput).click().clear().type(faker.finance.bitcoinAddress()).type('{enter}').loading()
    .get('[class="x-grid-empty"]').should('have.text', resultEmpty);

    cy.log('**Search newly-created environment**')
    .get(commonPageModel.searchInput).click().clear().type(environmentNameParent).type('{enter}').loading()
    .log('**View by System Name')
    .get('[placeholder="Group By"]').click()
    .selectByTextThenClick('System Name')
    .get(`[data-groupname="${systemName}"]`).should('have.text', `System: ${systemName}`);

    cy.log('**View by Environment Name')
    .get('[placeholder="Group By"]').click()
    .selectByTextThenClick('Environment Group Name')
    .get('[data-groupname=" "]').should('have.text', 'Environment Group Name:  ') // blank since not associated with any env group
    .get(environmentManagerPageModel.environmentNameLink).should('have.text', environmentNameParent); // to confirm the record exists
  });
  it('Search environments and use Filter By I\'m a Stakeholder 👀', () => {
    cy.log('**Search an environment based on I\'m a Stakeholder**')
    .get(commonPageModel.searchInput).click().clear().type(environmentNameParent).type('{enter}').loading()
    .get(environmentManagerPageModel.filterSelect).eq(0).click();
    cy.findByText('I\'m a Stakeholder').click()
    .get(commonPageModel.gridEmtpyMap).should('have.text', resultEmpty); // blank since user not tagged as stakeholder
  });
  it('Search environments and use Filter By All 👀', () => {
    cy.log('**Search all environments**')
    .get(environmentManagerPageModel.filterSelect).eq(0).click();
    cy.findByText('All').click()
    .get(commonPageModel.searchInput).click().clear().loading()
    // .get('[class="message"]').should('contain.text', 'Environment records. Only 100 records are being displayed. Use the Query Builder to build more filters.')
    .get('[class="x-grid-item-container"]').should('have.length.greaterThan', 0); // returns all results

    cy.log('**Search an environment based on Filter by All**')
    .get(commonPageModel.searchInput).click().clear().type(environmentNameParent).type('{enter}').loading()
    .get(environmentManagerPageModel.environmentNameLink).should('have.text', environmentNameParent); // to confirm the record exists

    cy.log("**Filter by I'm a Stakeholder**")
    .get('.facelift-combobox:first').click() // filter All
    .get('.x-boundlist-floating:last').find(".x-boundlist-item:contains(I'm a Stakeholder)").click()
    .get(commonPageModel.gridEmtpyMap).should('have.text', resultEmpty); // blank since user not tagged as stakeholder

    cy.log('**Return filter to All**')
    .get('.facelift-combobox:first').click() // filter All
    .get('.x-boundlist-floating:last').find(".x-boundlist-item:contains(All)").click();
  });
  it('Export to XLS 📎', () => {
    cy.get('[placeholder="Live Search"]').clear() // clear live search
    .get('.x-grid-item-container>table').should('have.length.greaterThan', 2)
    .get('[placeholder="Live Search"]').type(environmentNameUI).type('{enter}').loading()
    .get('.x-grid-item-container>table').should('have.length', 1)
    .get(environmentManagerPageModel.environmentNameLink).should('contain', environmentNameUI)
    .get('.x-btn-default-toolbar-small').eq(3).click() // click action
    .get('.x-menu-item-default').eq(1).click() // click export
    .wait(4000); // envt is slow. need to wait to downloaded file

    cy.log("**Confirm downloaded file**")
    .task("readDirectory", downloadsFolder).then((value) => {
        expect(value).to.eq(true);
    });

    cy.log('**Remove download folder**')
    .task('deleteFolder', downloadsFolder);
  });
  it('Duplicate then delete environment 👬🏻 🗑️', () => {
    cy.get('[placeholder="Live Search"]').clear() // clear live search
    .get('.x-grid-item-container>table').should('have.length.greaterThan', 2)
    .get('[placeholder="Live Search"]').type(environmentNameUI).type('{enter}').loading()
    .get('.x-grid-item-container>table').should('have.length', 1)
    .get(environmentManagerPageModel.environmentNameLink).should('contain', environmentNameUI)
    .get(commonPageModel.gridCheckbox).click({force: true});

    cy.log('**Duplicate environment**')
    .get('.x-btn-default-toolbar-small').eq(3).click() // click action
    .get('.x-menu-item-default').eq(3).click({force: true}) // click export
    .get('.duplicate-environments-window').should('be.visible')
    .get('.duplicate-environments-window').find('.btn-secondary').click().loading()
    .get('.x-grid-item-container>table').should('have.length', 2);
    
    cy.log('**Delete environment**')
    .get(commonPageModel.gridCheckbox).click({force: true})
    .get('.x-btn-default-toolbar-small').eq(3).click() // click action
    .get('.x-menu-item-default:last').click({force: true}) // click delete
    .get('.x-message-box').should('be.visible')
    .get('.x-message-box').find('.btn-danger').click().loading()
    .get(commonPageModel.gridEmtpyMap).should('have.text', resultEmpty); // blank since environment was deleted
  });
});