import faker from 'faker/locale/en_AU'; // https://www.npmjs.com/package/faker
import { customizationPageModel, iMFormBuilderPageModel, iMMenuSetupPageModel } from '../../../pages/settings-page';

let token = '';

const dayjs = require('dayjs');
const today = dayjs().add(30, 'days').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');

const formName = 'im-form-' + faker.random.word() + ' ' + today;
const menuName = 'im-menu-' + faker.random.word() + ' ' + today;
const statusName = 'im-status-' + faker.random.word() + ' ' + today;
const workflowName = 'im-workflow-' + faker.random.word() + ' ' + today;

beforeEach(() => {
  cy.fixture('data').should((data) => {
    token = data.token;
  });
});

beforeEach(() => {
  cy.login(token)
  .visit(customizationPageModel.url).loading().closeTimeZoneModal();
});

describe('End-to-end: Customization - Initiative management (IM)', () => {
  it('Create a new IM form', () => {
    cy.get('.contentPanel').should('be.visible')
    .get('.x-tree-node-text:contains(Form Builder)').click()
    .get('button').contains(iMFormBuilderPageModel.newFormButton).click()
    .get('.right-img').click()
    .log('**Input Form Name** ✏️').get(iMFormBuilderPageModel.formNameInput).type(formName)
    .log('**Select allow status & workflow** ☑️').get(iMFormBuilderPageModel.allowStatusCheckbox).click() // allow status
    .get(iMFormBuilderPageModel.statusButton).click() // add status
    .findByTextThenClick(iMFormBuilderPageModel.newStatusButton).type(statusName)
    .get('.status-delete').first().click()
    .findByTextThenClick('Yes')
    .saveClose()//.loading()
    .get(iMFormBuilderPageModel.allowWorkflowCheckbox).click() // allow workflow
    .get(iMFormBuilderPageModel.workflowButton).click() // add workflow
    .findByTextThenClick(iMFormBuilderPageModel.newWorkflowButton)
    .get('[name="Name"]').type(workflowName)
    .findByTextThenClick('Update')
    .findByTextThenClick('Close')
    .get(iMFormBuilderPageModel.workflowButton).click() // close > open workflow again to edit otherwise it'll get error
    .get('.workflow-edit').click().loading()
    .get('.item-status:first-child').then(el => { // drag and drop start
      const draggable = el[0];  // pick up this
      cy.get('.ui-droppable').then(el => {
        const droppable = el[0];  // drop over this
        const coords = droppable.getBoundingClientRect();
        draggable.dispatchEvent(new MouseEvent('mousemove'));
        draggable.dispatchEvent(new MouseEvent('mousedown'));
        draggable.dispatchEvent(new MouseEvent('mousemove', {clientX: 10, clientY: 10}));
        draggable.dispatchEvent(new MouseEvent('mousemove', {clientX: coords.x+10, clientY: coords.y+10}));
        cy.get(el).scrollIntoView();
        draggable.dispatchEvent(new MouseEvent('mouseup', {force: true}));
      });
    })
    .click({force: true})
    .get('.initial-status').click({force: true})
    .get('[data-qtip="Order priority"]').type('1')
    .get('div').contains('Save').click().loading()
    .get('img.x-tool-img.x-tool-close').click({multiple: true, force: true})
    .get('.right-img').click()
    .log('**Edit section** ✏️').get('.fb-icon-more').click() // edit tab
    .get('.fb-icon-pencils').last().click();
    cy.findAllByText('Button').click()
    .findByTextThenClick('Checkbox')
    .get('button').contains('Save').click()
    .get('div').should('contain.text', 'Saved')
    .get('.fb-icon-xclosew').click()
    .get('.fb-icon-closew').click().loading();

    cy.contains(formName);
  });
  it('Create a new IM menu', ()=>{
    cy.get('.contentPanel').should('be.visible')
    .get('table:contains(Initiative Management (IM))').siblings('table:contains(Menu Setup)').last().click()
    .findByTextThenClick('+ New Menu')
    .get(iMMenuSetupPageModel.newMenuInput).type(menuName)
    .get('.x-form-trigger').first().click()
    .get('.x-list-plain>li').contains(formName).click({force: true})
    .saveClose()
    .findByTextThenClick('Submit').loading();

    cy.reload().loading().closeTimeZoneModal()
    .get('div').contains('Initiative').click();

    cy.findAllByText(menuName).click()
    .get('.caret').first().click()
    .get('.dropdown-menu').first().should('be.visible');

    cy.contains(statusName).click();
  });
  it('Remove IM form and IM menu', ()=>{
    cy.log('**Remove the IM menu**')
    .get('.contentPanel').should('be.visible')
    .get('table:contains(Initiative Management (IM))').siblings('table:contains(Menu Setup)').last().click()
    .get('.initiativeSetupTree').find(`td:contains(${menuName})`).siblings('td:last').find('.removeInitiativeMenuButton').invoke('show').click({force:true})
    .get('.x-btn-inner-default-small').contains('Submit').click().loading()

    cy.log('**Remove the IM menu**')
    .get('.x-tree-node-text:contains(Form Builder)').click()
    .get('#formsPanel-innerCt').find(`td:contains(${formName})`).siblings('td:first').click({force:true})
    .get('.btn-danger').click()
    .get('.ui-dialog').find('.ui-button-text').contains('Yes').click().loading()
  })
});