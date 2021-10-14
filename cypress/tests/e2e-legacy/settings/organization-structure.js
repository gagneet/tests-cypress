import faker from 'faker/locale/en_AU'; // https://www.npmjs.com/package/faker
import { orgStructurePageModel } from '../../../pages/settings-page';

let token = '';

const orgName = faker.company.companyName();
const newOrgName = faker.company.companyName();

const username = Cypress.env().users['admin'].uiusername;

before('Preconditions: token generation and look up fields', () => {
  cy.fixture('data').should((data) => {
    token = data.token;
  })
});

beforeEach(() => {
  cy.login(token)
  .visit(orgStructurePageModel.url).loading().closeTimeZoneModal(); //close time zone popup
});

describe('End-to-end: Organization Structure', () => {
  it('Create a new organization', () => {
    cy.log('**Visit site and click Add**')
    .get(orgStructurePageModel.orgText).eq(0).click();
    cy.findAllByText('Add').click();

    cy.log('**Add a new org**')
    .get(orgStructurePageModel.orgNameInput).clear().type(orgName)
    .get(orgStructurePageModel.directorInput).click().type(`${username}{enter}`)
    .saveClose().loading();
  });

  it('Edit new created organization name', () => {
    cy.log('**Visit site, click on organisation**')
    .get(orgStructurePageModel.orgText).contains(orgName).click();
    cy.findAllByText('Edit').click();

    cy.log('**Edits existing names**')
    .get(orgStructurePageModel.orgNameInput).clear().type(newOrgName)
    .saveClose().loading();
  });

  it('Delete new created organisation', () => {
    cy.log('**Deletes created organisation**')
    .findAllByText(newOrgName).click(); // selects org by name just created
    cy.findAllByText('Delete').eq(0).click(); // delete button gets highlighted with selected organisation
    cy.get(orgStructurePageModel.deleteButton).eq(4).click();
  });
});