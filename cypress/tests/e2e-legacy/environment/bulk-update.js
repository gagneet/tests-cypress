import faker from 'faker/locale/en_AU'; // https://www.npmjs.com/package/faker
import dataProviderLegacy from '../../../services/data-provider-legacy';
import { environmentRequestsPageModel } from '../../../pages/environment-page';
import { userManagementPageModel } from '../../../pages/settings-page';
import { blockoutPageModel } from '../../../pages/release-page';

let data = [];
let token = '';
let phaseId = '';
let systemId = '';
let releaseId = '';
let environmentId = '';
let workItemNamePhaseId = '';

const dayjs = require('dayjs');
const today = dayjs().format('DD-MM-YYYYHH:mm:ss');
const date = new Date();
const dateNow = date.toISOString();
const message = 'You are not the Environment Booking Approver of one or more of the selected items.';
const endDateWarning = 'End Date cannot be less than Start Date';

const organizationId = Cypress.env().users['admin'].organizationId;
const systemName = 'system-' + faker.random.word() + ' ' + today;
const environmentName = 'env-' + faker.random.word() + ' ' + today; // name should be small as live search cant filter by long name
const releaseName = 'release-' + faker.random.word() + ' ' + today; // name should be small as live search cant filter by long name
const environmentAPIModel = dataProviderLegacy.getLegacyModel();
const vendor = faker.company.companyName();
const otherUser = 'Shofiya Kurniawati';
const currentUser = 'Quality Admin';
const blockoutName = "shofi blockout PLS DON'T REMOVE";

before('Preconditions: token generation and look up fields', () => {
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
    dataProviderLegacy.getLegacyLookupSystemRoleDependencyType();
  });
});

beforeEach(() => {
  cy.login(token)
   //close time zone popup
  .visit(blockoutPageModel.url).loading().closeTimeZoneModal();
});

describe("Bulk update bookings in booking request", ()=>{
  before(()=>{
    cy.log('**Create System** 🌳');
    data = { // create System
      'token': token,
      'name': systemName,
      'vendor': vendor,
      'status': 'Active',
      'organizationId': organizationId,
      'description': systemName,
    };
    cy.systems('POST', '', data).then((resp) => {
      expect(resp.status).to.eq(201); // assert status code
      systemId = resp.body.id;
      cy.log(`**System '${systemName}' successfully set.** 🔥`);

      cy.log('**Create Environment** 🌳');
      data = {// create Environments
        'token': token,
        'name': environmentName,
        "description": 'environment-' + faker.random.word() + ' ' + dateNow,
        'vendor': vendor,
        'linkedSystemId': systemId,
        'usageWorkItemId': environmentAPIModel.usedForWorkItem,
        'environmentStatusId': environmentAPIModel.environmentStatus,
        'environmentStatus': 'Active',
        'color': faker.internet.color(),
        'isSharedEnvironment': false,
      };
      cy.environments('POST', '', data).should((resp) => {
        expect(resp.status).to.eq(201); // assert status code
        environmentId = resp.body.id;
        cy.log(`**Environments '${environmentName}' successfully created.** 🔥`);

        cy.log('**Create Release** 🌳');
        data = { // create release
          'token': token,
          'identifier': releaseName,
          'name': releaseName,
          'summary': 'summary ' + faker.random.word() + ' ' + dateNow,
          'releaseTypeId': environmentAPIModel.releaseTypeId,
          'location': 'location' + faker.random.word() + ' ' + dateNow,
          'releaseStatusTypeId': environmentAPIModel.releaseStatusTypeId,
          'releaseRiskLevelId': environmentAPIModel.releaseRiskLevelId,
          'implementationDate': dateNow,
          'displayColor': faker.internet.color(),
          'organizationId': organizationId,
          'managerId': null,
          'parentReleaseId': null,
          'parentRelease': null,
          'plutoraReleaseType': "Independent",
          'releaseProjectType': "NotIsProject"
        };
        cy.releases('POST', '', data).then((resp) => { // Create release
          expect(resp.status).to.eq(201); // assert status code
          releaseId = resp.body.id;
          cy.log(`**Release '${releaseName}' successfully set.** 🔥`);

          cy.log('**Set a system on a release** 🌳');
          data = {
            'token': token,
            'systemId': systemId,
            'systemRoleDependencyTypeId': environmentAPIModel.systemRoleDependencyTypeId,
          };
          
          cy.releases('POST', `/${releaseId}/systems`, data).then((resp) => { // set system on a release
            expect(resp.status).to.eq(201); // assert status code
            cy.log(`**System '${systemName}' successfully set on '${releaseName}'** 🔥`);
          });

          cy.log('**Create first phase** 🌳')
          .workitemnames('GET', '/Phases', { token }).then((resp) => { // Get workItemNamePhaseId for release - phase
            workItemNamePhaseId = resp.body[0].id;
         
            data = {
              'token': token,
              'startDate': dayjs().format(),
              'endDate': dayjs().add(5, 'day').format(),
              'workItemNameID':workItemNamePhaseId,
            };
  
            cy.releases('POST', `/${releaseId}/phases`, data).then((resp) => {
              expect(resp.status).to.eq(201); // assert status code
              phaseId = resp.body.id;
              cy.log(`**Phase '${phaseId}' successfully set**🔥`);
  
              cy.log('**Set first phase to env** 📋').releases('POST', `/${releaseId}/phases/${phaseId}/environments/${environmentId}`, data).then((resp) => {
                expect(resp.status).to.eq(200); // assert status code
                cy.log(`**Phase '${phaseId}' has been set to env '${environmentId}'** 🔥`);
              });
            });
          });

          cy.log('**Create second phase** 🌳')
          .workitemnames('GET', '/Phases', { token }).then((resp) => { // Get workItemNamePhaseId for release - phase
            workItemNamePhaseId = resp.body[1].id;

            data = {
              'token': token,
              'startDate': dayjs().add(10, 'day').format(),
              'endDate': dayjs().add(15, 'day').format(),
              'workItemNameID':workItemNamePhaseId,
            };
  
            cy.releases('POST', `/${releaseId}/phases`, data).then((resp) => {
              expect(resp.status).to.eq(201); // assert status code
              phaseId = resp.body.id;
              cy.log(`**Phase '${phaseId}' successfully set.** 🔥`);
  
              cy.log('**Set second phase to env** 📋').releases('POST', `/${releaseId}/phases/${phaseId}/environments/${environmentId}`, data).then((resp) => {
                expect(resp.status).to.eq(200); // assert status code
                cy.log(`**Phase '${phaseId}' has been passed to env '${environmentId}'** 🔥`);
              }); 
            });
          });
        });
      });
    });
  });

  it('Get warning when current user is not a booking approvers', ()=>{
    cy.log('**Set the Environment Booking Approvals to other user**')
    .visit(environmentRequestsPageModel.url).closeTimeZoneModal()
    .search(systemName)
    .get('div').contains('Select approver(s)').click()
    .get(environmentRequestsPageModel.envApproversList)
    .get('div').contains('Select approver(s)').click()
    .next().children().children('input').type(otherUser, {force: true})
    .get(environmentRequestsPageModel.envApproversList).contains(otherUser).click()
    .saveClose().loading();

    cy.log('**Check bulk update warning on environment page**')
    .get(environmentRequestsPageModel.bookingTab).click()
    .customisationNotification()
    .get(environmentRequestsPageModel.searchInput).clear().type(releaseName).type('{enter}').loading()
    .get(environmentRequestsPageModel.selectAllEnv).click({force:true, multiple:true})
    .get('a.btn').eq(4).click({force: true}) // action button
    .get(environmentRequestsPageModel.bulkUpdateButton).click({force: true})
    .get(environmentRequestsPageModel.warningText).should('have.text', message);
  }); 
    
  it('Testing when current user is a booking approver or there is no booking approvers', ()=>{
    cy.log('**Set the Environment Booking Approvals to current user**')
    .search(systemName)
    .get('.plt__chip__label__inner__content').contains(otherUser).parents('[role="button"]').children('i').click()
    .get('div').contains('Select approver(s)').next().children().children('input').type(currentUser, {force: true})
    .get(environmentRequestsPageModel.envApproversList).contains(currentUser).click()
    .saveClose().loading();

    cy.log('**Start and end date forward 10 days** ➡️')
    .visit(environmentRequestsPageModel.url).loading().closeTimeZoneModal() // left this here otherwise the test fails
    .get(environmentRequestsPageModel.bookingTab).click()
    .customisationNotification()
    .get(environmentRequestsPageModel.searchInput).clear().type(releaseName).type('{enter}').loading()
    .get(environmentRequestsPageModel.selectAllEnv).click({force:true, multiple:true})
    .get('a.btn').eq(4).click({force: true}) // action button
    .get(environmentRequestsPageModel.bulkUpdateButton).click({force: true})
    .get(environmentRequestsPageModel.shiftDaysInput).type(10)
    .findByTextThenClickForce('Update').loading();

    cy.log('**End dates Forward 6 days** ➡️')
    .get(environmentRequestsPageModel.selectAllEnv).dblclick({force:true, multiple:true})
    .get('a.btn').eq(4).click({force: true}) // action button
    .get(environmentRequestsPageModel.bulkUpdateButton).click({force: true})
    .get('[readonly="readonly"]').first().click() // show the first dropdown
    .get('.x-list-plain>li').last().click()
    .get(environmentRequestsPageModel.shiftDaysInput).type(6) 
    .findByTextThenClickForce('Update').loading();

    cy.log('**End dates Backward 2 days** 🔙')
    .get(environmentRequestsPageModel.selectAllEnv).dblclick({force:true, multiple:true})
    .get('a.btn').eq(4).click({force: true}) // action button
    .get(environmentRequestsPageModel.bulkUpdateButton).click({force: true})
    .get('[readonly="readonly"]').first().click() // show the first dropdown
    .get('.x-list-plain>li').last().click()
    .get('[readonly="readonly"]').last().click() // show the second dropdown
    .selectByTextThenClick('backward')
    .get(environmentRequestsPageModel.shiftDaysInput).type(2) 
    .findByTextThenClickForce('Update').loading();
    
    cy.log('**Start and End Date Backward 3 days** 🔙')
    .get(environmentRequestsPageModel.selectAllEnv).dblclick({force:true, multiple:true})
    .get('a.btn').eq(4).click({force: true}) // action button
    .get(environmentRequestsPageModel.bulkUpdateButton).click({force: true})
    .get('[readonly="readonly"]').last().click() // show the second dropdown
    .selectByTextThenClick('backward')
    .get(environmentRequestsPageModel.shiftDaysInput).type(3) 
    .findByTextThenClickForce('Update').loading();

    cy.log('**Select days** 📅')
    .get(environmentRequestsPageModel.selectAllEnv).dblclick({force:true, multiple:true})
    .get('a.btn').eq(4).click({force: true}) // action button
    .get(environmentRequestsPageModel.bulkUpdateButton).click({force: true})
    .get('label').contains('New Dates:').parents('.x-form-cb-wrap-inner').children('input').click({force:true})
    .get(environmentRequestsPageModel.selectNewStartDates).type(dayjs().format('DD/MM/YYYY'))
    .get(environmentRequestsPageModel.selectNewEndDates).type(dayjs().add(5, 'day').format('DD/MM/YYYY'))
    .get('b').contains('Dates').click() // to close the calendar
    .findByTextThenClickForce('Update').loading();

    cy.log('**Negative scenario: manually entered end date less than start date** 🆘')
    .get(environmentRequestsPageModel.selectAllEnv).dblclick({force:true, multiple:true})
    .get('a.btn').eq(4).click({force: true}) // action button
    .get(environmentRequestsPageModel.bulkUpdateButton).click({force: true})
    .get('label').contains('New Dates:').parents('.x-form-cb-wrap-inner').children('input').click({force:true})
    .get(environmentRequestsPageModel.selectNewStartDates).type(dayjs().format('DD/MM/YYYY'))
    .get(environmentRequestsPageModel.selectNewEndDates).type(dayjs().subtract(5, 'day').format('DD/MM/YYYY'))
    .get('b').contains('Dates').click() // to close the calendar
    .findByTextThenClickForce('Update')
    .get(environmentRequestsPageModel.endDateError).should('have.text', endDateWarning) // get alert
    .get(environmentRequestsPageModel.cancelButton).click().loading();

    cy.log('**Negative scenario: end dates backward is going to make end date less than start date** 🆘')
    .get(environmentRequestsPageModel.selectAllEnv).dblclick({force:true, multiple:true})
    .get('a.btn').eq(4).click({force: true}) // action button
    .get(environmentRequestsPageModel.bulkUpdateButton).click({force: true})
    .get('[readonly="readonly"]').first().click() // show the first dropdown
    .get('.x-list-plain>li').last().click()
    .get('[readonly="readonly"]').last().click() // show the second dropdown
    .selectByTextThenClick('backward')
    .get(environmentRequestsPageModel.shiftDaysInput).type(10) 
    .findByTextThenClickForce('Update')
    .get(environmentRequestsPageModel.endDateError).last().should('have.text', endDateWarning) // get alert
    .get(environmentRequestsPageModel.cancelButton).click().loading();

    cy.log('**Update both scenario: status to rejected and backward end dates 2 days** ⛔')
    .get(environmentRequestsPageModel.selectAllEnv).dblclick({force:true, multiple:true})
    .get('a.btn').eq(4).click({force: true}) // action button
    .get(environmentRequestsPageModel.bulkUpdateButton).click({force: true})
    .get('[readonly="readonly"]').first().click() // show the first dropdown
    .get('.x-list-plain>li').last().click()
    .get('[readonly="readonly"]').last().click() // show the second dropdown
    .selectByTextThenClick('backward')
    .get(environmentRequestsPageModel.shiftDaysInput).type(2) 
    .selectStatusBulkUpdate('label','Rejected')
    .findByTextThenClickForce('Update').loading();

    cy.log('** Update Environments to Auto approved and forward dates 1 day, without select any Status** ✅')
    .search(environmentName).loading() // Update Environments to Auto approved
    .get('.x-tab-inner-default').contains('Details').click()
    .get('.environment-page-checkboxes').find('.x-form-type-checkbox:nth-child(2)').should('not.have.class', 'x-form-cb-checked').click()
    .saveClose()

    .get('.x-grid-cell-columnAllocationBookingRequestName').should('have.length', 2)
    .get(environmentRequestsPageModel.selectAllEnv).click({force:true, multiple:true});
    cy.findAllByText('Action').click({force: true}) 
    .get(environmentRequestsPageModel.bulkUpdateButton).click({force: true})
    .get(environmentRequestsPageModel.shiftDaysInput).type(1) 
    .findByTextThenClickForce('Update').loading()
    .search(environmentName).loading() // Update Environments to not Auto approved
    .get('.x-tab-inner-default').contains('Details').click()
    .get('.environment-page-checkboxes').find('.x-form-type-checkbox:nth-child(2)').should('have.class', 'x-form-cb-checked').click()
    .saveClose().loading();
  });

  it('Testing booking request during blockout (book environment during block out not checked)', ()=>{
    cy.log('**Block out screen itself ( must have the environment name we are going to update)**')
    .visit(blockoutPageModel.url).loading().closeTimeZoneModal();
    
    cy.get('[readonly="readonly"]').first().click()
    .selectByTextThenClick('2021').loading() // make sure it's 2021
    .scrollToElement('.x-grid-with-row-lines:nth-child(1)', `.fakeLink:contains(${blockoutName})`)
    .get('.fakeLink').contains(blockoutName).click()
    .get(blockoutPageModel.envNameInput).click()
    .get('.x-mask-msg-text').should('not.be.visible')
    .get('.x-list-plain').should('be.visible')
    .get(blockoutPageModel.envNameInput).type(environmentName, {force:true})
    .selectByTextThenClick(environmentName)
    .get(blockoutPageModel.startDateInput).clear().type(dayjs().format('DD/MM/YYYY HH:mm'))
    .get(blockoutPageModel.endDateInput).clear().type(dayjs().add(5, 'day').format('DD/MM/YYYY HH:mm'))
    .saveClose();

    cy.log('**Permission in User Management must be unselected**')
    .visit(userManagementPageModel.url).loading().closeTimeZoneModal()
    .get('.x-panel').last().should('be.visible')
    .findAllByText('Manage Permissions').click().loading()
    .get('div').contains('Admin').click({force: true}).loading()
    .get('span').contains('Book Environments during Blockout').parents('tr').children('td').last().within((el)=>{
      cy.get('.x-grid-checkcolumn').then((el)=>{
        if (el.hasClass('x-grid-checkcolumn-checked')) {
          cy.get(el).click({force: true});
        }
      });
    })
    .saveClose(); 

    cy.log('**Create booking**👌')
    .visit(environmentRequestsPageModel.url).loading().closeTimeZoneModal()
    .get(environmentRequestsPageModel.bookingTab).click()
    .customisationNotification()
    .get(environmentRequestsPageModel.searchInput).clear().type(releaseName).type('{enter}').loading()
    .get(environmentRequestsPageModel.selectAllEnv).click({force:true, multiple:true})
    .get('a.btn').eq(4).click({force: true}) // action button
    .get(environmentRequestsPageModel.bulkUpdateButton).click({force: true})
    .get('label').contains('New Dates:').parents('.x-form-cb-wrap-inner').children('input').click({force:true})
    .get(environmentRequestsPageModel.selectNewStartDates).type(dayjs().format('DD/MM/YYYY'))
    .get(environmentRequestsPageModel.selectNewEndDates).type(dayjs().add(5, 'day').format('DD/MM/YYYY'))
    .get('b').contains('Status').click() // to close the calendar
    .findByTextThenClickForce('Update').loading()
    .get('#x-err->a').should('contain', `${environmentName} is not available due to blockout period:${blockoutName}`);
  });

  it('Testing booking request during blockout (book environment during block out checked)', ()=>{
    cy.log('**Permission in User Management must be selected** ✅')
    .visit(userManagementPageModel.url).loading().closeTimeZoneModal()
    .get('.x-panel').last().should('be.visible')
    .findByTextThenClick('Manage Permissions').loading()
    .get('div').contains('Admin').click({force: true}).loading()
    .get('span').contains('Book Environments during Blockout').parents('tr').children('td').last().within((el)=>{
      cy.get('.x-grid-checkcolumn').then((el)=>{
        if (!el.hasClass('x-grid-checkcolumn-checked')) {
          cy.get(el).click({force: true});
        }
      });
    })
    .saveClose();

    cy.log('**Create booking** 👌')
    .visit(environmentRequestsPageModel.url).loading().closeTimeZoneModal()
    .get(environmentRequestsPageModel.bookingTab).click()
    .customisationNotification()
    .get(environmentRequestsPageModel.searchInput).clear().type(releaseName).type('{enter}').loading()
    .get(environmentRequestsPageModel.selectAllEnv).click({force:true, multiple:true})
    .get('a.btn').eq(4).click({force: true}) // action button
    .get(environmentRequestsPageModel.bulkUpdateButton).click({force:true})
    .get('label').contains('New Dates:').parents('.x-form-cb-wrap-inner').children('input').click({force:true})
    .get(environmentRequestsPageModel.selectNewStartDates).type(dayjs().format('DD/MM/YYYY'))
    .get(environmentRequestsPageModel.selectNewEndDates).type(dayjs().add(5, 'day').format('DD/MM/YYYY'))
    .get('b').contains('Status').click() // to close the calendar
    .findByTextThenClickForce('Update').loading();
  });
  
  it('See all updates made via the bulk update function in the audit history', ()=>{
    cy.visit(environmentRequestsPageModel.url).loading().closeTimeZoneModal()
    .get(environmentRequestsPageModel.bookingTab).click()
    .customisationNotification()
    .get(environmentRequestsPageModel.searchInput).clear().type(releaseName).type('{enter}').loading()
    .get(environmentRequestsPageModel.columnName).first().click()
    .get(environmentRequestsPageModel.auditButton).click()
    .get(environmentRequestsPageModel.modifiedBadge).should('have.length.greaterThan', 0);
  });
});