// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// Place common functions here that are used across the app
// include { prevSubject: optional} to start a chain or use an existing chain

import { commonPageModel } from '../pages/home-page';

Cypress.Commands.add('searchRecordViaGrid', (recordName, pageModel) => {
  // re-usable function to search record via grid
  cy.log('**Search the record**')
    .get(commonPageModel.searchInput)
    .click()
    .clear()
    .type(recordName)
    .type('{enter}')
    .get(pageModel)
    .should('have.text', recordName); // to confirm the record exists
});

Cypress.Commands.add('findByTextThenClick', (text) => {
  // selects element using text (for some reason, it requires span class)
  cy.get('span').contains(text).click();
});

Cypress.Commands.add('findByTextThenClickForce', (text) => {
  // selects element using text (for some reason, it requires span class)
  cy.get('span').contains(text).click({ force: true });
});

Cypress.Commands.add('loading', () => {
  // add timeout
  cy.log('**Wait for loading to finish** 💭')
    .get('#loading')
    .should('be.visible')
    .get('#loading')
    .should('not.be.visible');
});

Cypress.Commands.add('login', (token) => {
  // login using cookies (bypasses the UI login)
  // if((Cypress.env().host === 'demoau.plutora.com')){ // TODO: Remove this once GCT-1868 is deployed into production
  //     token = Cypress.env().users['admin'].token;
  // };
  // In case we didn't get a token (cause this should be shared), get it from fixture
  cy.fixture('data')
    .then((data) => {
      token = token || data.token;
    })
    .then(() => {
      cy.setCookie('AuthenticationToken', token, {
        domain: Cypress.env().host
      });
      cy.getCookie('AuthenticationToken').should('exist'); // verifies the session is active
      cy.log(`Token ${token} generated. :key:`);
    });
});

Cypress.Commands.add('save', (buttonPosition = 1) => {
  //button position for a case where on footer is more than 2 buttons
  cy.log('**Save changes** 💾');
  cy.get(
    `.x-toolbar-footer .x-box-target a:nth-of-type(${buttonPosition}) .x-btn-inner:contains("Save")`
  ).click();
});

Cypress.Commands.add('saveClose', () => {
  // hit the "Save & Close" button
  cy.log('**Save changes and close modal** 💾');
  cy.contains('Save & Close').click();
});

Cypress.Commands.add('delete', () => {
  // hit the "Save & Close" button
  cy.log('**Delete entity and close modal** ❌');
  cy.get(
    `.x-toolbar-footer .x-box-target a:nth-of-type(1) .x-btn-inner:contains("Delete")`
  ).click();
});

Cypress.Commands.add('selectByTextThenClick', (text) => {
  // selects element using text (from the dropdown list - this is weird behaviour, tbh)
  cy.get('.x-list-plain > li').contains(text).click({ force: true });
});

Cypress.Commands.add('selectByInputThenClick', (text) => {
  // selects element using text (from the dropdown list - this is weird behaviour, tbh)
  cy.get('.plt_input_inner').contains(text).click({ force: true });
});

Cypress.Commands.add('isElementExist', (selector) => {
  cy.log('**Checking element for existence**');
  cy.get('body').then(($el) => {
    cy.wrap($el.has(selector).length > 0);
  });
});

Cypress.Commands.add('closeTimeZoneModal', () => {
  // close time zone popup window
  cy.wait(1000)
    .isElementExist('.timeZoneWarningModal', { timeout: 1000 })
    .then((exist) => {
      if (exist) {
        cy.get('[class^=x-btn-inner]:contains("OK")', {
          timeout: 1000
        }).click();
      }
    });
});

Cypress.Commands.add('search', (keyword) => {
  cy.log('**Search** 🔎')
    .get('.plt__l--Search')
    .click()
    .get('#plt__navbar__nav__panel__actions__search')
    .clear()
    .type(keyword)
    .type('{enter}')
    .get(
      '.plt__navbar__nav__panel__actions__search__menu__item>div>span:nth-child(2)'
    )
    .should('have.text', keyword)
    .click();
});

Cypress.Commands.add('customisationNotification', () => {
  cy.get('.customisation-notification').then((el) => {
    if (el.hasClass('x-btn-pressed')) {
      cy.get(el).click();
    }
  });
});

Cypress.Commands.add('selectStatusBulkUpdate', (element, status) => {
  cy.get(element)
    .contains(status)
    .parents('.x-form-cb-wrap-inner ')
    .children('input')
    .click({ force: true }); // choose approved
});

Cypress.Commands.add('dragDrop', (drag, drop) => {
  cy.get(drag) //drag n drop
    .trigger('mousedown', { which: 1, force: true })
    .get(drop)
    .trigger('mousemove')
    .trigger('mousemove', { clientX: 10, clientY: 10, force: true })
    .trigger('mouseup', { force: true });
});

Cypress.Commands.add('scrollToElement', (scrollHolder, selector) => {
  // add timeout
  const MAX_SCROLL_ATTEMPTS = 20;
  const retryScroll = (attempt = 0) => {
    if (attempt >= MAX_SCROLL_ATTEMPTS) {
      cy.wrap(null);
    }

    cy.isElementExist(selector).then((exist) => {
      if (exist) {
        cy.get(selector).then((item) => {
          cy.wrap(item);
        });
      } else {
        cy.get(scrollHolder).scrollTo('bottom').wait(500);

        retryScroll(++attempt);
      }
    });
  };

  retryScroll();
});
