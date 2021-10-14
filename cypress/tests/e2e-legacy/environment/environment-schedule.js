import faker from 'faker/locale/en_AU'; // https://www.npmjs.com/package/faker
import { environmentManagerPageModel, environmentModalModel, environmentSchedulePageModel, tebrPageModel } from '../../../pages/environment-page';
import { blockoutPageModel } from '../../../pages/release-page';
import dataProviderLegacy from '../../../services/data-provider-legacy';

let token = '';
let data = [];
let systemId = '';
let tebrBody = [];

const dayjs = require('dayjs');
const today = dayjs().format('DD-MM-YYYYHH:mm:ss');

const userId = Cypress.env().users['admin'].userId;
const organizationId = Cypress.env().users['admin'].organizationId;
const systemName = 'system-' + faker.random.word() + ' ' + today;
const environmentName = 'env-' + faker.random.word() + ' ' + today; // name should be small as live search cant filter by long name
const environmentGroupName = 'envGroup-' + faker.random.word() + ' ' + today; // name should be small as live search cant filter by long name
const tebrEnvName = 'tebr-' + faker.random.word() + ' ' + today; // name should be small as live search cant filter by long name
const environmentAPIModel = dataProviderLegacy.getLegacyModel();
const vendor = faker.company.companyName();
const blockoutName = "shofi blockout PLS DON'T REMOVE";

before('Preconditions: token generation and look up fields', () => {
  cy.fixture('data').should((data) => {
    token = data.token;
  }).then(() => {
    // test data which will be used across all tests is created here
    dataProviderLegacy.setToken(token);
    dataProviderLegacy.getLegacyLookupFieldReleaseRiskLevel();
    dataProviderLegacy.getLegacyLookupFieldReleaseStatusType();
    dataProviderLegacy.getLegacyLookupFieldReleaseType();
    dataProviderLegacy.getLegacyLookupUsedForWorkItem();
    dataProviderLegacy.getLegacyLookupEnvironmentStatus();
    dataProviderLegacy.getLegacyLookupFieldBookingRequestType();
    dataProviderLegacy.getLegacyLookupFieldBookingRequestStatus();
    dataProviderLegacy.getLegacyLookupSystemRoleDependencyType();
  });
});

beforeEach(() => {
  cy.login(token)
  .visit(`${environmentManagerPageModel.url}/schedule`).loading().closeTimeZoneModal();
});

describe('End-to-end: Environment Manager', () => {
  before(() => {
    cy.log('**Pre-condition: Create System** 🌳');
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

      cy.log('**Create Environment**🌳');
      data = {// create environment
        'token': token,
        'name': environmentName,
        'vendor': vendor,
        'linkedSystemId': systemId,
        'usageWorkItemId': environmentAPIModel.usedForWorkItem,
        'environmentStatusId': environmentAPIModel.environmentStatus,
        'environmentStatus': 'Active',
        'color': faker.internet.color(),
        'isSharedEnvironment': false,
        'hosts': []
      };
      cy.environments('POST', '', data).should((resp) => {
        expect(resp.status).to.eq(201); // assert status code
        cy.log(`**Environments '${environmentName}' successfully created.** 🔥`);
      });

      cy.log('**Create Environment Group**🌳');
      data = { // create environment group
        'token': token,
        'name': environmentGroupName,
        'description': 'desc' + environmentGroupName,
        'color': faker.internet.color(),
        'usageWorkItemId': environmentAPIModel.usedForWorkItem,
        'organizationId': organizationId,
        'vendor': vendor,
        "isAutoApproved": false,
        "displayBookingAlert": false,
      };
      cy.environmentgroups('POST', '', data).should((resp) => {
        expect(resp.status).to.eq(201); // assert status code
        cy.log(`**Environments Group '${environmentGroupName}' successfully created.** 🔥`);
      });

      cy.log('**Create TEBR**🌳');
      tebrBody = { // create a tebr with env only
        'title': tebrEnvName,
        'releaseID': null,
        'phaseID': null,
        'startDate': dayjs().format('YYYY-MM-DDTHH:mm:ss'),
        'endDate': dayjs().add(5, 'day').format('YYYY-MM-DDTHH:mm:ss'),
        'assignedToID': userId,
        'requestorID': userId,
        'description': 'desc-' + faker.random.word() + ' ' + today,
        'statusID': environmentAPIModel.bookingRequestStatusId,
        'typeID': environmentAPIModel.bookingRequestTypeId,
        'systems':[
          {
            "systemId": systemId,
            "systemRoleDependencyTypeId": environmentAPIModel.systemRoleDependencyTypeId
          }
        ]
      };
      data = {
        'token': token,
        'body': tebrBody
      };
      cy.tebrs('POST', '', data).should(() => {
        expect(resp.status).to.eq(201); // assert status code
        cy.log(`**TEBR '${tebrEnvName}' successfully created.** 🔥`);
      });
    });
  });

  it('Set the environment group to environment', ()=>{
    cy.search(environmentName)
    .get('.environmentWindowCls').should('be.visible')
    .get('.x-tab-default-top:first').click()
    .get(environmentModalModel.environmentGroupInput).click({ force: true})
    .get('.x-list-plain').should('be.visible')
    .get(environmentModalModel.environmentGroupInput).type(environmentGroupName)
    .selectByTextThenClick(environmentGroupName)
    .saveClose().loading();
  });

  it('Set the environment group to blockout', ()=>{
    cy.visit(blockoutPageModel.url).loading().closeTimeZoneModal()
    .get('[readonly="readonly"]').first().click()
    .selectByTextThenClick('2021').loading() // make sure it's 2021
    .scrollToElement('.x-grid-with-row-lines:nth-child(1)', `.fakeLink:contains(${blockoutName})`)
    .get('.fakeLink').contains(blockoutName).click()
    .get(blockoutPageModel.envGroupNameInput).click()
    .get('.x-mask-msg-text').should('not.be.visible')
    .get('.x-list-plain').should('be.visible')
    .get(blockoutPageModel.envGroupNameInput).type(environmentGroupName, {force:true})
    .selectByTextThenClick(environmentGroupName)
    .get(blockoutPageModel.startDateInput).clear().type(dayjs().format('DD/MM/YYYY HH:mm'))
    .get(blockoutPageModel.endDateInput).clear().type(dayjs().add(5, 'day').format('DD/MM/YYYY HH:mm'))
    .saveClose().loading();
  });

  it('Check the blockout in env schedule', ()=>{
    cy.get(environmentSchedulePageModel.environmentScheduleWindow).should('be.visible') // view environmnet group
    .get(environmentSchedulePageModel.schedulerView).eq(3).click()
    .selectByTextThenClick('Environment Group')
    .get(environmentSchedulePageModel.schedulerDatePicker).first().click() // filter date
    .get(environmentSchedulePageModel.startDateContainer).within(()=>{
      cy.get('.x-datepicker-active>.x-datepicker-date').contains('1').click({force:true});
    })
    .get(environmentSchedulePageModel.startDateContainer).siblings().within(()=>{
      cy.get('.x-datepicker-active>.x-datepicker-date').contains('29').click({force: true});
    })
    .findByTextThenClickForce('Submit').loading()
    .get(environmentSchedulePageModel.schedulerFilter).click() // filter button
    .get('label').contains('Booking Blockout Period').parents('.x-checkboxgroup-form-item').then((el)=>{ // make sure “Booking Blockout Period” is ticked
      if(!el.hasClass('x-form-cb-checked')){
        cy.get(el).click();
      }
    })
    .get('label').contains('By Environment or Group').click({force:true}).loading() // set quick filter for the environemnt Group EG
    .get(environmentSchedulePageModel.environmentFilterWindow).should('be.visible')
    .get('.phase-target').then((el)=>{ // to make sure there's no env group
      if(el.children().length > 0){
        cy.get('.environments-label-button').click();
      }
    })
    .get(environmentSchedulePageModel.environmentFilterWindow).within(()=>{
      cy.get('label').contains('Environment Group').parents('.x-form-type-radio').then((el)=>{
        if(!el.hasClass('x-form-cb-checked')){
          cy.get(el).find('input').click({force:true});
        }
      })
      .get('.drag-image').contains(environmentGroupName).as('drag')
      .get('@drag').scrollIntoView()
      .get('.phase-target').as('drop')
      .dragDrop('@drag','@drop')
      .saveClose();
    })
    .findByTextThenClick('Apply').loading()
    .get('.x-grid-item-container').first().children('table').should('have.length', 1).then((el)=>{
      cy.get(el).find('.groupName').should('have.text', environmentGroupName);
    })
    .get('.x-grid-item-container').eq(1).children('table').should('have.length', 1).then((el)=>{
      cy.get(el).find('.event').should('have.text', blockoutName);
    });
  });

  it('Set the environment group to tebr', ()=>{
    cy.search(tebrEnvName)
    .get(tebrPageModel.environmentGroupHeader).contains(`Environment Group: ${environmentGroupName}`).as('drag')
    .get('.x-grid-view-default').eq(2).as('drop')
    .get('@drop').scrollIntoView()
    .dragDrop('@drag', '@drop').loading()
    .saveClose().loading();
  });

  it('Check the TEBR in env schedule', ()=>{
    cy.get(environmentSchedulePageModel.environmentScheduleWindow).should('be.visible')
    .get('.x-grid-item-container').eq(1).children('table').then((el)=>{
      cy.get(el).find('.summary').should('have.text', tebrEnvName)
      .get(el).find('.event').should('have.text', blockoutName);
    });
  });
});