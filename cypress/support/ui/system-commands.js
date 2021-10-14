import { environmentSystemsPageModel } from '../../pages/environment-page';

const orgName = Cypress.env().users['admin'].organizationName;

Cypress.Commands.add('createSystem', (name) => {
    cy.contains('New System').click()
    .get(environmentSystemsPageModel.name).type(name)
    .get(environmentSystemsPageModel.vendorName).type(name)
    .get(environmentSystemsPageModel.portfolioAssociation).click()
    .get(`[title="${orgName}"]`).click();
    cy.saveClose();
    cy.contains('Your changes have been saved').should('exist');
});

Cypress.Commands.add('systemGridSearch', (name) => {
    cy.get(environmentSystemsPageModel.searchFilter).first().clear().type('{enter}')
    .get(environmentSystemsPageModel.gridCell).should('have.length.greaterThan', 2)
    .get(environmentSystemsPageModel.searchFilter).first().type(name).type('{enter}').trigger('input')
    .get(environmentSystemsPageModel.gridCell).contains(name)
});

Cypress.Commands.add('editSystem', (name) => {
    cy.findByText(name).click();
    cy.get(environmentSystemsPageModel.editName).contains(name).click().clear().type('updated-' + name);
    cy.get(environmentSystemsPageModel.checkBox).click();

    cy.saveClose();
    cy.contains('Your changes have been saved').should('exist');
});

Cypress.Commands.add('duplicateSystem', () => {
    cy.get(environmentSystemsPageModel.checkBox).first().click();
    cy.contains('Action').click();
    cy.contains('Duplicate').click();
    cy.closeTimeZoneModal();

    cy.get(environmentSystemsPageModel.innerButton).contains('Duplicate').click();
    cy.contains('System has been successfully duplicated').should('exist');
});

Cypress.Commands.add('deleteSystem', () => {
    cy.get(environmentSystemsPageModel.checkBox).click({multiple:true});
    cy.contains('Action').click();
    cy.contains('Delete').click();
    cy.get(environmentSystemsPageModel.popUpDeleteButton).click()
    .get('.plt__grid__nodatarow').should('be.visible')
});

Cypress.Commands.add('exportSystems', () => {
    cy.log('**Export system to XLS**');
    cy.get(environmentSystemsPageModel.checkBox).first().click();
    cy.contains('Action').click();
    cy.contains('Export XLS').click();
    cy.wait(3000);

    const downloadsFolder = Cypress.config('downloadsFolder');

    cy.log('**Confirm downloaded file**');
    cy.task('readDirectory', downloadsFolder).then((value) => {
        expect(value).to.eq(true);
    });
    cy.wait(3000);
    cy.log('**Delete file in download folder**');
    cy.exec('rm cypress/downloads/*', { log: true, failOnNonZeroExit: false });
});

Cypress.Commands.add('bulkUpdateSystems', (name) => {
    cy.log('**Bulk Update**');
    cy.get(environmentSystemsPageModel.checkBox).first().click();
    cy.contains('Action').click();
    cy.contains('Bulk Update').click();
    cy.get(environmentSystemsPageModel.bulkName).type('updated-' + name);
    cy.saveClose();
});