import { blockoutPageModel, releasePageModel } from '/cypress/pages/release-page';
import { CustomCommands } from '../command-enum';
const dayjs = require('dayjs');

Cypress.Commands.add(CustomCommands.UI.createRelease, (enterpriseReleaseName, apIModel) => {
    cy.get(releasePageModel.releaseWindow).should('be.visible');
    cy.get(releasePageModel.identifierInput).type(enterpriseReleaseName);
    cy.get(releasePageModel.nameInput).type(enterpriseReleaseName);
    cy.get(releasePageModel.releaseTypeInput).click();
    cy.loading();
    cy.get('.x-boundlist-item:first').click();
    cy.get(releasePageModel.riskLevelInput).click();
    cy.loading();
    cy.get('.x-boundlist-item').contains(apIModel.releaseRiskLevelName).click();
    cy.get(releasePageModel.impDateInput).click();
    cy.get('.x-datepicker-active').contains(dayjs().endOf('month').format('D')).click();
});

Cypress.Commands.add(CustomCommands.UI.deleteRelease, () => {
    cy.get(releasePageModel.selectAllRelease)
        .click()
        .get(releasePageModel.actionBtn)
        .click()
        .get(releasePageModel.deleteBtn)
        .click({ force: true })
        .get(releasePageModel.deleteWindow)
        .should('be.visible')
        .get(releasePageModel.deleteWindow)
        .find('.btn-danger')
        .click()
        .loading()
        .get('.x-grid-empty');
});

Cypress.Commands.add(CustomCommands.UI.duplicateRelease, (enterpriseReleaseName) => {
    cy.get('.gridHeaderEditor')
        .eq(1)
        .type(enterpriseReleaseName)
        .type('{enter}')
        .loading()
        .get('table')
        .should('have.length', 1)
        .get(releasePageModel.selectAllRelease)
        .click()
        .get(releasePageModel.actionBtn)
        .click()
        .get('.x-box-scroller-body-vertical')
        .should('be.visible')
        .get(releasePageModel.duplicateBtn)
        .click({ force: true })
        .get(releasePageModel.duplicateWindow)
        .should('be.visible')
        .get(releasePageModel.duplicateWindow)
        .find('.x-btn-inner-default-small')
        .contains('Duplicate')
        .click()
        .loading()
        .get('table')
        .should('have.length', 2);
});

Cypress.Commands.add('clearFilterAndQueryBuilder', () => {
    cy.get(releasePageModel.queryBuilderBtn)
        .click() // clear query
        .get('.x-window-header-default')
        .should('be.visible')
        .get('.x-btn-inner-default-small')
        .contains('Clear Query')
        .click()
        .loading()
        .get(releasePageModel.actionBtn)
        .click()
        .get(releasePageModel.clearGridFilterBtn)
        .click({ force: true })
        .loading() // clear grid filter
        .get('.x-form-type-checkbox')
        .each((el) => {
            // clear plutora release type filter
            if (el.hasClass('x-form-cb-checked')) {
                cy.get(el).click().loading();
            }
        })
        .get('.x-form-text-field-body')
        .first()
        .click() // clear ownership
        .get('.x-boundlist-item')
        .contains('All')
        .click();
});

// Blockout
Cypress.Commands.add('createBlockout', (blockoutName) => {
    cy.log('**Fill out form**')
        .get(blockoutPageModel.name)
        .type(blockoutName)
        .get(blockoutPageModel.startPlaceholder)
        .click()
        .get(blockoutPageModel.calendar)
        .first()
        .find(`[aria-label="${dayjs().format('MMMM DD')}"]`)
        .click()
        .get(blockoutPageModel.calendarDoneBtn)
        .first()
        .click()
        .get(blockoutPageModel.endDateInput)
        .click()
        .get(blockoutPageModel.calendar)
        .last()
        .find(`[aria-label="${dayjs().add(5, 'day').format('MMMM DD')}"]`)
        .click()
        .get(blockoutPageModel.calendarDoneBtn)
        .last()
        .click()
        .saveClose()
        .loading();
});

Cypress.Commands.add('duplicateBlockout', (blockoutName) => {
    cy.log('**Duplicate Blockout**')
        .scrollToElement('.x-grid-with-row-lines:nth-child(1)', `.fakeLink:contains(${blockoutName})`)
        .get(blockoutPageModel.columnIdName)
        .contains(blockoutName)
        .click()
        .get('.x-btn-wrap')
        .contains('Action')
        .click()
        .get('.x-menu-item-text')
        .contains('Duplicate Blockout Period')
        .click({ force: true })
        .get('.x-btn-inner')
        .contains('Duplicate')
        .click()
        .loading();
});

Cypress.Commands.add('editBlockout', (blockoutName) => {
    cy.log('**Update Blockout**')
        .scrollToElement('.x-grid-with-row-lines:nth-child(1)', `.fakeLink:contains(${blockoutName})`)
        .get('.fakeLink')
        .contains(blockoutName)
        .click({ force: true })
        .get(blockoutPageModel.name)
        .clear()
        .type('Edited-' + blockoutName)
        .saveClose()
        .loading();
});

Cypress.Commands.add('deleteBlockout', (blockoutName) => {
    cy.log('**Delete Blockout**')
        .scrollToElement('.x-grid-with-row-lines:nth-child(1)', `.fakeLink:contains(${blockoutName})`)
        .get('.fakeLink')
        .contains(blockoutName)
        .click({ force: true })
        .get('.delete-btn')
        .click()
        .get('.x-message-box')
        .find('.btn-danger')
        .click()
        .loading();
});
