// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

/// <reference types='cypress-tags' />

// Import commands.js using ES2015 syntax:
import './commands';
import './api/legacy-commands';
import './api/planning-commands';
import './ui/deployment-commands';
import './ui/login-commands';
import './ui/release-commands';
import './ui/settings-commands';
import './ui/system-commands';
import './ui/environment-request-commands';
// npm packages / plugins
import '@bahmutov/cy-api/support';
// import '@cypress/code-coverage/support' // (use this only when cypress is same repo as your app src)
import '@percy/cypress';
import '@testing-library/cypress/add-commands';
import 'cypress-audit/commands';
import 'cypress-axe';
import 'cypress-file-upload';
import 'cypress-localstorage-commands';
import 'cypress-mailosaur';
import 'cypress-wait-until';

const dayjs = require('dayjs');
Cypress.dayjs = dayjs;

// Allow cookies to be preserved between test
Cypress.Cookies.defaults({
  preserve: 'AuthenticationToken'
});

// Alternatively you can use CommonJS syntax:
// require('./commands')

Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  return false;
});

// Cypress.LocalStorage.clear = () => {
//     // override default implementation in order to improve testing timing
//     // comment it out if you want to clean local storage on every test run
// };

before(() => {
  // run this to generate data for the entire suite
  cy.auth().should((resp) => {
    cy.writeFile('cypress/fixtures/data.json', {
      token: resp.body.access_token
    }); // https://docs.cypress.io/api/commands/writefile#JSON
  });
});
