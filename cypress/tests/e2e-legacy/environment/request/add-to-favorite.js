/// <reference types='cypress-tags' />

import { environmentRequestsPageModel } from '../../../../pages/environment-page';
import tecrApi from '../../../../support/api/legacy-tecr-calls';

let tecrName = '';

before('Preconditions: token generation and look up fields', () => {
  tecrApi
    .setupTecrData()
    .then(() => {
      cy.log('**Pre-condition: Create Tecr Via Api** 🌳');
      tecrApi.createTecrViaApi();
    })
    .then((res) => {
      tecrName = res.body.title;
      cy.log(res, 'result api');
    });
});

beforeEach(() => {
  cy.login()
    .visit(environmentRequestsPageModel.url)
    .loading()
    .closeTimeZoneModal();
});

describe('End-to-end: Environment Request Add To Favorite', () => {
  it('Add To Favorite', () => {
    cy.log('==== Clear Data Search');
    cy.clearDataSearch();
    cy.log('==== Look For Data ====');
    cy.get('.x-form-text-default:eq(2)')
      .type(tecrName)
      .should('have.value', tecrName)
      .type('{enter}')
      .loading();

    cy.get('.fakeLink:eq(1)').click().loading();

    cy.get('.x-btn.facelift-window-action-btn:last').click();
    cy.get('div.ui-pnotify-text:nth-child(4)').should(
      'have.text',
      'Successfully added to favorites'
    );

    cy.get('.x-btn.btn.btn-secondary').contains('Save & Close').click();
  });
});
