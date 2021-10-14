import { deploymentPageModel } from "../../pages/deployment-page";

Cypress.Commands.add('clearQuery', () => {
  cy.get(deploymentPageModel.queryBuilderButton).click()
  .get(".x-window-default-closable").should("be.visible")
  .findByTextThenClick('Clear Query').loading()
  .findByTextThenClick('All').loading() // filter All on top-left
  .get('.facelift-combobox').click() // filter All on top-right
  .get('.x-boundlist-item').contains("All").click();
});

Cypress.Commands.add('updateMode', (mode) => {
  cy.get('.chevron-inprogress').find('.x-btn-button-center').click({force:true})
  .get('.x-menu-item-indent-no-separator').contains(mode).click({force:true}).loading();
});

Cypress.Commands.add('addSystem', (system) => {
  cy.get('[name="SystemIDs"]').type(system, {force: true})
  .get('.multiSelList').find('.x-boundlist-item').should('have.length', 1).contains(system, {matchCase:true}).click();
});

Cypress.Commands.add('closeActivityWindow', () => {
  cy.get('.x-btn-inner-default-toolbar-small').last().click() // close activity window
});

Cypress.Commands.add('searchDP', (dPName) => {
  cy.get('.x-tab-top').first().click({force:true}) // filter to all
  .get(deploymentPageModel.liveSearch).clear()
  .get(deploymentPageModel.dPContainer).should('have.length.greaterThan', 2)
  .get(deploymentPageModel.liveSearch).type(dPName).type('{enter}')
  .get(deploymentPageModel.dPContainer).should('have.length', 1)
  .get(deploymentPageModel.dPName).should('have.text', dPName).click({force:true})
  .get(deploymentPageModel.dPWindow).should('be.visible')
});