Cypress.Commands.add('clickRecaptcha', () => {
  cy.window().then(win => {
    win.document
      .querySelector('iframe[src*="recaptcha"]')
      .contentDocument.getElementById('recaptcha-anchor-label')
      .click();
  });
});