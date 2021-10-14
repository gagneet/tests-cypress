import { insightPageModel } from '../../../pages/dashboard-page';

let token = '';

beforeEach(() => {
  cy.fixture('data').should((data) => {
    token = data.token;
  });
});

beforeEach(() => {
  cy.login(token)
  .visit(insightPageModel.url).loading().closeTimeZoneModal();
});

describe('End-to-end: Insights', () => {
  it('Check grid view loads properly 📈', () => {
    cy.get('.management-split-button').click()
    .get('label').contains("I'm a Stakeholder for").parents('.x-menu-item-cmp>div>div>div') // “I’m a stakeholder for” is on Hide
    .children('div').last().within((el)=>{
      cy.get(el).children('div').children('div').children('a').then((ele)=>{
        if (ele.hasClass('x-btn-pressed')) {
          cy.get(ele).click({force: true});
        }
      });
    })
    .get('label').contains('Completed Releases').parents('.x-menu-item-cmp>div>div>div') // “Completed Releases” is on Show
    .children('div').last().within((el)=>{
      cy.get(el).children('div').children('div').children('a').then((ele)=>{
        if (!ele.hasClass('x-btn-pressed')) {
          cy.get(ele).click({force: true});
        }
      });
    })
    .get('#tags').click()
    .get('.x-tagfield-singleselect').click()
    .get('.x-list-plain>li').contains('Project').click()
    .findByTextThenClick('Apply')
    .get('.x-form-arrow-trigger-default').eq(0).click()
    .get('.x-mask-loading').should('not.be.visible')
    .get('.insights-filter-dropdown').should('be.visible')
    .loading();
  });
});