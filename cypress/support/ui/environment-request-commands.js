const {
  environmentRequestsPageModel
} = require('../../pages/environment-page');
const { CustomCommands } = require('../command-enum');

Cypress.Commands.add(
  CustomCommands.UI.environmentRequest.createEnvironmentRequest,
  (modelApi, objInput) => {
    cy.get('[name="Title"]').type(objInput.tecrTitle);
    cy.get('[name="CRType_ID"]')
      .click()
      .loading()
      .selectByTextThenClick(modelApi.changeRequestTypeName);
    cy.get('[name="ReguestStatus_ID"]').click();
    cy.get('.x-boundlist-item-over').click();
    cy.get('[name="StartDate"]').click();
    cy.get('.facelift-date-time-picker')
      .find('.facelift-date-time-picker-doneButton')
      .click();
    cy.get('div.x-datepicker-next.x-datepicker-arrow:nth-child(3)')
      .eq(1)
      .click();
    // .find(`.x-datepicker-active:contains(${objInput.endDate})`)

    cy.get('.facelift-date-time-picker:last')
      .find('.facelift-date-time-picker-doneButton')
      .click();
    cy.get('[name="UserID"]').click().loading();
    cy.get('[name="UserID"]').type(objInput.username);
    cy.get('.x-boundlist-floating')
      .last()
      .find('.x-boundlist-item')
      .should('have.length', 1);
    cy.get('.x-boundlist-item-over')
      .contains(objInput.username)
      .click({ force: true });
  }
);

Cypress.Commands.add(
  CustomCommands.UI.environmentRequest.clearQueryBuilder,
  () => {
    cy.get('.query-builder-button').click(); // clear query
    cy.get('.x-window-header-default').should('be.visible');
    cy.get('.x-btn-inner-default-small')
      .contains('Clear Query')
      .click()
      .loading();
  }
);

Cypress.Commands.add(
  CustomCommands.UI.environmentRequest.clearDataSearch,
  () => {
    cy.get(environmentRequestsPageModel.actionBtn).click();
    cy.get(environmentRequestsPageModel.clearGridFilterBtn)
      .click({ force: true })
      .loading();
  }
);
