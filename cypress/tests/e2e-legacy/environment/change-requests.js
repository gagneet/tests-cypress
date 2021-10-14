import faker from 'faker/locale/en_AU'; // https://www.npmjs.com/package/faker
import { environmentRequestsPageModel } from '../../../pages/environment-page';
import dataProviderLegacy from '../../../services/data-provider-legacy';
import { customizationPageModel } from '../../../pages/settings-page';

let token = '';
let systemId = '';
let data = [];

const apIModel = dataProviderLegacy.getLegacyModel();
const downloadsFolder = Cypress.config('downloadsFolder');

const dayjs = require('dayjs');
const today = dayjs().format('DD-MM-YYYYHH:mm:ss');
const todayDate = dayjs().format('DD/MM/YYYY');

const tecrTitle = 'tecr-' + faker.random.word() + ' ' + today;
const username = Cypress.env().users['admin'].uiusername;
const filepath = 'ERP_displayed.png';

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
      cy.environments('POST', '', data).should((resp) => {
        expect(resp.status).to.eq(201); // assert status code
        cy.log(
          `**Environments '${environmentName}' successfully created.** 🔥`
        );
      });
    });
  });

  it('Create TECR from navigation menu ☑️', () => {
    cy.log('**Create TECR from navigation menu** 🎇');
    cy.get('.plt__navbar__nav__panel__container__menu__primary:last').click();
    cy.get(
      '.plt__navbar__nav__panel__container__menu__submenu__secondary:nth-child(2'
    ).click();
    cy.get('#nav__0__9__1__0').click();
    cy.get('.changeRequestWin').should('be.visible');
    cy.get('.ecrDetailsTabHeader').click();
    cy.get('[name="Title"]').type(tecrTitle);
    cy.get('[name="CRType_ID"]')
      .click()
      .loading()
      .selectByTextThenClick(apIModel.changeRequestTypeName);
    cy.get('[name="ReguestStatus_ID"]').click();
    cy.get('.x-boundlist-item-over').click();
    cy.get('[name="StartDate"]').click();
    cy.get('.facelift-date-time-picker')
      .find('.facelift-date-time-picker-doneButton')
      .click();
    cy.get('.facelift-date-time-picker:last')
      .find(
        `.x-datepicker-active:contains(${dayjs().endOf('month').format('D')})`
      )
      .click();
    cy.get('.facelift-date-time-picker:last')
      .find('.facelift-date-time-picker-doneButton')
      .click();
    cy.get('[name="UserID"]').click().loading();
    cy.get('[name="UserID"]').type(username);
    cy.get('.x-boundlist-floating')
      .last()
      .find('.x-boundlist-item')
      .should('have.length', 1);
    cy.get('.x-boundlist-item-over')
      .contains(username)
      .click({ force: true })
      .saveClose()
      .loading();
  });
  it('Export to XLS 🏗️', () => {
    cy.log('**Clear filter and query builder**');
    cy.get('.query-builder-button').click(); // clear query
    cy.get('.x-window-header-default').should('be.visible');
    cy.get('.x-btn-inner-default-small')
      .contains('Clear Query')
      .click()
      .loading();
    cy.get('[name="liveFilterChangeRequest-inputEl"]')
      .clear()
      .findByTextThenClick('Action');
    cy.get('.environmentRequestsClearGridColumnFilteringAction')
      .click({ force: true })
      .loading(); // clear grid filter

    cy.log('**Search TECR**');
    cy.get('#columnTitle')
      .find('input')
      .type(tecrTitle)
      .type('{enter}')
      .loading();
    cy.get('table').should('have.length', 1);
    cy.get('.x-column-header-checkbox').click();

    cy.log('**Action drop down menu**');
    cy.findByTextThenClick('Action');
    cy.get('.environmentRequestsExportToXlsAction')
      .click({ force: true })
      .wait(3000); // envt is slow. need to wait to downloaded file

    cy.log('**Confirm downloaded file**');
    cy.task('readDirectory', downloadsFolder).then((value) => {
      expect(value).to.eq(true);
    });

    cy.log('**Remove download folder**');
    cy.task('deleteFolder', downloadsFolder);
  });
  it.skip('Environment Request ->  TECR window -> Details tab -> Releases bring down the environments 🏗️', () => {
    // RESKIN issue : unable to to bring down releases in TECR modal
    //tecr creation
    // cy.log('**Create new TECR**');
    // tecrTitle = 'tecr-' + ' ' + getCurrentDate();
    // data = {
    //   "token": token,
    //   "title": tecrTitle,
    //   "description": tecrTitle,
    //   "startDate": dateNow,
    //   "dueDate": dateNow,
    //   "userId": userId,
    //   "crStatusID": tecrModel.changeRequestStatusId,
    //   "crTypeID": tecrModel.changeRequestTypeId,
    //   "color": faker.internet.color(),
    //   "environments": [environmentId],
    // };
    // cy.tecrs('POST', '', data).then((resp) => { // create TEBR
    //   tecrId = resp.body.id;
    //   cy.log(`tecr without release'${tecrId}' successfully set.`);
    //   // open tecr via link + Id
    //   cy.visit(environmentRequestsPageModel.url + `/tecr/${tecrId}`).loading();
    //   // select release
    //   cy.get('.releaseNameField').click().loading()
    //     cy.get('.releaseNameField input').type(releaseName)
    //     cy.get('.x-grid-cell-inner.x-grid-cell-inner-treecolumn').contains(releaseName).click({ force: true });
    //   cy.contains('Save & Close').click();
    //   cy.loading();
    //   // open tecr via link + Id
    //   cy.visit(environmentRequestsPageModel.url + `/tecr/${tecrId}`).loading();
    //   // assertion
    //   cy.get('.releaseNameField input').should('have.value', `${releaseName}`);
    //   // remove release via cross button
    //   cy.get('.ecrReleaseNameField .ext-ux-clearbutton.ext-ux-clearbutton-on').click();
    //   cy.contains('Save & Close').click();
    //   cy.loading();
    //   // open tecr via link + Id
    //   cy.visit(environmentRequestsPageModel.url + `/tecr/${tecrId}`).loading();
    //   // assertion
    //   cy.get('.releaseNameField input').should('be.empty');
    //   cy.log('**Release successfully added/removed from TECR.**');
    // });
  });
  it('Set outage to a TECR', () => {
    cy.log('**Clear filter and query builder**');
    cy.get('.query-builder-button').click(); // clear query
    cy.get('.x-window-header-default').should('be.visible');
    cy.get('.x-btn-inner-default-small')
      .contains('Clear Query')
      .click()
      .loading();
    cy.get('[name="liveFilterChangeRequest-inputEl"]')
      .clear()
      .findByTextThenClick('Action');
    cy.get('.environmentRequestsClearGridColumnFilteringAction')
      .click({ force: true })
      .loading(); // clear grid filter

    cy.log('**Search TECR**');
    cy.get('#columnTitle')
      .find('input')
      .type(tecrTitle)
      .type('{enter}')
      .loading();
    cy.get('table').should('have.length', 1);
    cy.get('.fakeLink').contains(tecrTitle).click({ force: true }).loading();
    cy.get('.changeRequestWin').should('be.visible');

    cy.log('**Set Outage**');
    cy.get('[role="radio"]').first().click({ force: true });
    cy.get('[name="OutageStartDate"]').click();
    cy.get('.facelift-date-time-picker-doneButton').click();
    cy.get('.facelift-date-time-picker:last')
      .find(
        `.x-datepicker-active:contains(${dayjs()
          .endOf('month')
          .subtract(1, 'day')
          .format('D')})`
      )
      .click();
    cy.get('.facelift-date-time-picker:last')
      .find('.facelift-date-time-picker-doneButton')
      .click()
      .saveClose()
      .loading();
  });
  it('Delete TECR via Action button on grid ❌', () => {
    cy.log('**Clear filter and query builder**');
    cy.get('.query-builder-button').click(); // clear query
    cy.get('.x-window-header-default').should('be.visible');
    cy.get('.x-btn-inner-default-small')
      .contains('Clear Query')
      .click()
      .loading();
    cy.get('[name="liveFilterChangeRequest-inputEl"]')
      .clear()
      .findByTextThenClick('Action');
    cy.get('.environmentRequestsClearGridColumnFilteringAction')
      .click({ force: true })
      .loading(); // clear grid filter

    cy.log('**Search TECR**');
    cy.get('#columnTitle')
      .find('input')
      .type(tecrTitle)
      .type('{enter}')
      .loading();
    cy.get('table').should('have.length', 1);
    cy.get('.x-column-header-checkbox').click();

    cy.log('**Action drop down menu**');
    cy.findByTextThenClick('Action');
    cy.get('.x-menu-item-text-default')
      .contains('Delete')
      .click({ force: true });
    cy.get('.bulk-delete').should('be.visible');
    cy.get('.bulk-delete')
      .find('.x-btn-inner-default-small:contains(Delete)')
      .click()
      .loading();
    cy.get('.x-grid-empty').should('be.visible');
  });

  it('Uses Grid Column Filtering and Clears all the filters with Grid Column Filtering', () => {
    cy.log('**Clear results with Grid Column Filtering**');
    cy.findByTextThenClick('Action');
    cy.get('.environmentRequestsClearGridColumnFilteringAction')
      .click({ force: true })
      .loading(); // clear grid filter

    cy.log('**Gfid Column Filtering - Filter by Title and Type**');
    cy.get('.x-form-text-field-body').eq(3).click(); // choosing Type selector dropdown menu
    cy.get('.x-form-trigger-focus').eq(0).click();
    cy.get('.x-boundlist-item').contains('Default').click(); // drop down option Default
    cy.get('.x-boundlist-item').contains('New').click(); // drop down option New

    cy.get('#columnTitle')
      .find('input')
      .type(tecrTitle)
      .type('{enter}')
      .loading(); // type in TECR Title

    cy.log('**Clear all filters with Grid Column Filtering**');
    cy.findByTextThenClick('Action');
    cy.get('.environmentRequestsClearGridColumnFilteringAction').click({
      force: true
    }); // clear grid filter
  });

  it('Performs Bulk Update in TECR tab grid', () => {
    cy.log('**Clear results with Grid Column Filtering**');
    cy.findByTextThenClick('Action');
    cy.get('.environmentRequestsClearGridColumnFilteringAction').click({
      force: true
    }); // clear grid filter

    cy.log('**Clarifying that table is available**');
    cy.get('table').should('have.length.greaterThan', 1);
    cy.get('.x-grid-row-checker').eq(1).click({ multiple: true, force: true }); //need to click on 2nd listing in order to select multiple
    cy.get('.x-grid-row-checker').eq(0).click({ multiple: true, force: true }); //selecting second listing
    cy.get('.x-grid-row-checker')
      .eq(1)
      .click({ multiple: true, force: true }) //selecting second listing

      .findByTextThenClick('Action')
      .findByTextThenClickForce('Bulk Update'); // selecting bulk update button

    cy.log('**Updates two top listings status to "In Progress"**');
    cy.get('.x-window-default-closable').should('be.visible');
    cy.get('.x-form-arrow-trigger-default').eq(6).click();
    cy.get('.x-boundlist-item').contains('Test Type TECR 2').click();
    cy.get('.x-form-arrow-trigger.x-form-arrow-trigger-default:nth-child(2)')
      .eq(8)
      .click();
    cy.get('.x-boundlist-item-over')
      .contains('Completed')
      .click({ force: true })
      .findByTextThenClick('Update')
      .loading();

    cy.log('**Confirms that the Type has been updated"**');
    cy.get(
      'table:nth-child(2) > tbody > .x-grid-row > .x-grid-cell-columnCRType > .x-grid-cell-inner'
    ).should('contain', 'Test Type TECR 2');
  });

  it('Performs Bulk Update in TECR tab grid when (when TECR Workflow is enabled)', () => {
    cy.log('**Enable TECR Workflow*');
    cy.visit(customizationPageModel.url).loading().closeTimeZoneModal();
    cy.get(customizationPageModel.navigationTab).findByTextThenClick(
      'TECR Status'
    );

    cy.get(customizationPageModel.checkboxUnchecked)
      .eq(0)
      .then((el) => {
        // checkbox is ticked if it hasn't been ticked before
        if (!el.hasClass(customizationPageModel.checkboxChecked)) {
          cy.get(el).click({ force: true });
        }
      });
    cy.findAllByText('Submit').click({ force: true });

    cy.log('**Clear results with Grid Column Filtering**');
    cy.visit(environmentRequestsPageModel.url)
      .loading()
      .closeTimeZoneModal()
      .findByTextThenClick('Action');
    cy.get('.environmentRequestsClearGridColumnFilteringAction')
      .click({ force: true })
      .loading(); // clear grid filter

    cy.log(
      '**Clarifying that table is available and finding bulk update button**'
    );
    cy.visit(environmentRequestsPageModel.url).loading().closeTimeZoneModal();
    cy.get('table').should('have.length.greaterThan', 1);
    cy.get('.x-grid-row-checker').eq(0).click({ multiple: true, force: true }); //selecting first listing
    cy.get('.x-grid-row-checker')
      .eq(1)
      .click({ multiple: true, force: true }) //selecting second listing

      .findByTextThenClick('Action')
      .findByTextThenClickForce('Bulk Update'); // selecting bulk update button

    cy.log('**Updates two top listings status to "In Progress"**');
    cy.get('.x-window-default-closable').should('be.visible');
    cy.get('.x-form-arrow-trigger-default').eq(6).click();
    cy.get('.x-boundlist-item')
      .contains('Type 5_Regression')
      .click()
      .findByTextThenClick('Update')
      .loading();

    cy.log('**Confirms that the Type has been updated"**');
    cy.get(
      'table:nth-child(2) > tbody > .x-grid-row > .x-grid-cell-columnCRType > .x-grid-cell-inner'
    ).should('contain', 'Type 5_Regression');
  });

  it('Duplicates Request in Environment Requests (TECR tab grid))', () => {
    cy.log('**Clear results with Grid Column Filtering**');
    cy.findByTextThenClick('Action');
    cy.get('.environmentRequestsClearGridColumnFilteringAction').click({
      force: true
    }); // clear grid filter

    cy.log('**Clarifying that table is available**');
    cy.get('table').should('have.length.greaterThan', 1);
    cy.get('.x-grid-row-checker').eq(0).click({ multiple: true, force: true }); //selecting first listing
    cy.get('.x-grid-row-checker').eq(1).click({ multiple: true, force: true }); //selecting first listing

    cy.log('**Finding and clicking on Duplicate Request button**');
    cy.findByTextThenClick('Action').findByTextThenClickForce(
      'Duplicate Request'
    ); // selecting Duplicate request button

    cy.log('**Confirms Requests Title name with Copy at the beginning**');
    cy.get('[class="main-title facelift-main-title"]')
      .contains('Duplicate TECR')
      .should('be.visible');
    cy.get('[class="x-btn-inner x-btn-inner-default-small"]')
      .contains('Duplicate')
      .click({ force: true }); // selecting Button Duplicate

    cy.log('**Confirms that the Type has been updated"**');
    cy.get('table').should('have.length.greaterThan', 1);
    cy.get(
      'table:nth-child(1)> tbody > tr > .x-grid-cell-columnTitle> div > .fakeLink'
    ).should('contain', '(Copy)');
  });

  it('Uses Grid Column Selector (GCS)', () => {
    cy.log('**Clear results with Grid Column Filtering**');
    cy.findByTextThenClick('Action');
    cy.get('.environmentRequestsClearGridColumnFilteringAction').click({
      force: true
    }); // clear grid filter

    cy.log(
      '**Clarifying that table is available and selecting Grid Column Selector**'
    );
    cy.get('table')
      .should('have.length.greaterThan', 1)
      .findByTextThenClick('Action')
      .findByTextThenClickForce('Grid Column Selector')
      .loading(); // selecting Grid Column Selector

    cy.log('**Drag and drop to add addtional columns**');
    cy.get('.x-window-header-title')
      .contains('Select Additional Columns')
      .should('be.visible');
    cy.get('.x-window-default-closable').find('table');
    cy.get('.draggable').first().as('drag');
    cy.get('.x-grid-view-default').last().as('drop');
    cy.get('@drag') //drag n drop
      .trigger('mousedown', { which: 1, force: true });
    cy.get('@drop')
      .trigger('mousemove')
      .trigger('mousemove', { clientX: 10, clientY: 10, force: true })
      .trigger('mouseup', { force: true })
      .saveClose();

    cy.log('**Finds added column and types today date**');
    cy.get('.x-column-header-last')
      .should('contain', 'TECR')
      .find('input')
      .clear()
      .type(todayDate)
      .type('{enter}');
    // results will return 0 as it sorts all the fields by newly added field with today's date
    cy.get('table').should('have.length', 1);

    cy.log('**Deletes added column**');
    cy.findByTextThenClick('Action')
      .findByTextThenClickForce('Grid Column Selector')
      .loading() // selecting Grid Column Selector
      .findByTextThenClickForce('Clear')
      .loading()
      .saveClose();
  });

  it('Query Builder (QB) + Quick Access menu', () => {
    cy.log('**Clear Queries and filter**');
    cy.get('.query-builder-button').click();
    cy.get('.x-window-default-closable')
      .should('be.visible')
      .findByTextThenClick('Clear Query')
      .loading(); // clear query

    cy.log('**Clear results with Grid Column Filtering**');
    cy.findByTextThenClick('Action');
    cy.get('.environmentRequestsClearGridColumnFilteringAction').click({
      force: true
    }); // clear grid column filter

    cy.log('**Build a new query**');
    cy.get('.query-builder-button').click();
    cy.get('.x-window-default-closable').should('be.visible');
    cy.get('.x-form-arrow-trigger-default:first').click({ force: true });
    cy.get('.x-boundlist-item')
      .contains('Status')
      .click({ force: true })
      .selectByTextThenClick('contains');
    cy.get('.x-form-arrow-trigger-default:first').click({ force: true });
    cy.get('.x-boundlist-item')
      .contains('Completed')
      .click({ force: true })
      .findByTextThenClick('Save Query');

    cy.log('**Save the query modal window**');
    cy.get('.x-window-header-title')
      .contains('Save Query')
      .should('be.visible');
    cy.get('.x-form-arrow-trigger-default:last').click({ force: true });
    cy.get('.x-boundlist-item').contains('Private').click({ force: true });
    cy.get('[class="x-form-text-wrap x-form-text-wrap-default"]')
      .last()
      .find('input')
      .type('Completed')
      .saveClose()
      .findByTextThenClick('Run')
      .loading(); // run the query
    cy.get('.x-grid-item-container>table').should('have.length.greaterThan', 1);
    cy.get('.x-grid-cell-columnStatus').eq(1).should('contain', 'Completed');

    cy.log('**Deletes the saved query**');
    cy.get('.query-builder-button').click();
    cy.get('.x-window-default-closable').should('be.visible');
    cy.get('table')
      .eq(2)
      .find(
        'tbody > .x-grid-tree-node-leaf > .x-grid-cell > .x-grid-cell-inner > .x-tree-node-text'
      )
      .should('contain', 'Completed')
      .click()
      .findByTextThenClick('Delete Saved Query');
    cy.get('.x-tool-close').click();
  });

  it.skip('Create TECR, add and show environment schedule in details', () => {
    // tests needs to be completed
    cy.log('**Clear results with Grid Column Filtering**');
    cy.findByTextThenClick('Action');
    cy.get('.environmentRequestsClearGridColumnFilteringAction').click({
      force: true
    }); // clear grid filter

    cy.log('**Create new TECR**');
    cy.get('.btn-secondary:first').click().loading();
    cy.get('.changeRequestWin').should('be.visible');
    cy.get('.ecrDetailsTabHeader').click();
    cy.get('[name="Title"]').type(tecrTitle);
    cy.get('[name="CRType_ID"]')
      .click()
      .loading()
      .selectByTextThenClick(apIModel.changeRequestTypeName);
    cy.get('[name="ReguestStatus_ID"]').click();
    cy.get('.x-boundlist-item').contains('New').click();
    cy.get('[name="StartDate"]').click();
    cy.get('.facelift-date-time-picker')
      .type(dayjs().format('DD/MM/YYYY'), 'enter')
      .find('.facelift-date-time-picker-doneButton')
      .click();
    cy.get('.facelift-date-time-picker:last').type(
      dayjs().add(5, 'day').format('DD/MM/YYYY'),
      'enter'
    );
    cy.get('.facelift-date-time-picker:last')
      .find('.facelift-date-time-picker-doneButton')
      .click();
    cy.get('[name="UserID"]').click().loading();
    cy.get('[name="UserID"]').type(username);
    cy.get('.x-boundlist-floating')
      .last()
      .find('.x-boundlist-item')
      .should('have.length', 1);
    cy.get('.x-boundlist-item-over').contains(username).click();
    cy.get('.x-form-checkbox-default').first().click({ force: true }); // enabling showing in environment schedule

    cy.log('**Add environment in TECR details**');
    cy.findByTextThenClick('Add Environment');
    cy.get('.x-form-arrow-trigger-default').eq(4).click().loading();
    // cy.get('.x-boundlist-item-over').click({force: true});
    cy.get('[name="addEnvironmentID"]').type(environmentName).type('{enter}'); // needs refactoring as current test doesn't select the actual environment name even though it shows it in the list
    cy.get('.x-boundlist-item').eq(0).click({ force: true });
    cy.get('.x-border-box')
      .find('.x-btn-inner-default-small:contains(Save & Close)')
      .last()
      .click({ force: true });
    cy.get('.dragCursor').should('contain', '(Copy)').saveClose();

    cy.log('**Search TECR**');
    cy.get('#columnTitle')
      .find('input')
      .type(tecrTitle)
      .type('{enter}')
      .loading();
    cy.get('table').should('have.length', 1);

    // navigates to environment schedule
    cy.visit(`${environmentManagerPageModel.url}/schedule`)
      .loading()
      .closeTimeZoneModal();
    cy.search(environmentName);
    // searches/filters by environment name
    // shows TECR for that envirornment
    //verifies that the dates for TECR show on a schedule
  });

  it('Create TECR and add attachment in TECR window/details', () => {
    cy.log('**Clear results with Grid Column Filtering**');
    cy.findByTextThenClick('Action');
    cy.get('.environmentRequestsClearGridColumnFilteringAction').click({
      force: true
    }); // clear grid filter

    cy.log('**Create TECR from navigation menu**');
    cy.get('.plt__navbar__nav__panel__container__menu__primary:last').click();
    cy.get(
      '.plt__navbar__nav__panel__container__menu__submenu__secondary:nth-child(2'
    ).click();
    cy.get('#nav__0__9__1__0').click();
    cy.get('.changeRequestWin').should('be.visible');
    cy.get('.ecrDetailsTabHeader').click();
    cy.get('[name="Title"]').type(tecrTitle);
    cy.get('[name="CRType_ID"]')
      .click()
      .loading()
      .selectByTextThenClick(apIModel.changeRequestTypeName);
    cy.get('[name="ReguestStatus_ID"]').click();
    cy.get('.x-boundlist-item').contains('New').click({ force: true });
    cy.get('[name="StartDate"]').click();
    cy.get('.facelift-date-time-picker')
      .find('.facelift-date-time-picker-doneButton')
      .click();
    cy.get('.facelift-date-time-picker:last')
      .find(
        `.x-datepicker-active:contains(${dayjs().endOf('month').format('D')})`
      )
      .click();
    cy.get('.facelift-date-time-picker:last')
      .find('.facelift-date-time-picker-doneButton')
      .click();
    cy.get('[name="UserID"]').click().loading();
    cy.get('[name="UserID"]').type(username);
    cy.get('.x-boundlist-floating')
      .last()
      .find('.x-boundlist-item')
      .should('have.length', 1);
    cy.get('.x-boundlist-item-over')
      .contains(username)
      .click()
      .findByTextThenClick('Save')
      .loading();

    cy.log('**Adding an attachment and verifying it was successfull**');
    cy.get('[id="addAttachmentLink"]').click().loading();
    cy.get('.x-window-default-focus').should('be.visible');
    cy.get('.x-btn-default-toolbar-small')
      .last()
      .contains('+ New')
      .click({ force: true });
    cy.get('[data-ref="btnInnerEl"]')
      .last()
      .contains('Add File')
      .click({ force: true });
    cy.get('input[type="file"]').attachFile(filepath);
    cy.get('.fileDescription').should('contain', 'ERP_displayed.png');
    cy.get('.x-tool-default').last().click();
    cy.get('[id="addAttachmentLink"]').should('contain', 1);
  });
});
