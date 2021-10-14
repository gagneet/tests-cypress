import faker from 'faker/locale/en_AU'; // https://www.npmjs.com/package/faker
import { userManagementPageModel } from '../../../pages/settings-page';

let token = '';

const firstName = faker.name.firstName();
const lastName = faker.name.lastName();

const mailosaurServerId = Cypress.env().mailosaurServerId;
const dayjs = require('dayjs');
const expiryDate = dayjs().add(1, 'year').format('DD-MM-YYYY');

beforeEach(() => {
  cy.fixture('data').should((data) => {
    token = data.token;
  });
});

beforeEach(() => {
  cy.login(token)
  .visit(userManagementPageModel.url).loading().closeTimeZoneModal();
});

describe('End-to-end: User management', () => {
  it('Create a new user with active status and check activation email', () => {
    cy.log('**Create new user** 👨‍💼')
    .addNewUser(firstName, lastName, expiryDate) // TODO: When API to create user is available, use that instead
    .saveClose();

    cy.log('**Check email** 📬')
    .log(`${firstName}.${lastName}@${mailosaurServerId}.mailosaur.net`)
    .mailosaurGetMessage(mailosaurServerId, {
      sentTo: `${firstName}.${lastName}@${mailosaurServerId}.mailosaur.net`
    }, { timeout: 30000}).then(email => {
      expect(email.subject).to.equal('Activation');
      expect(email.html.body).to.contains(`Welcome to Plutora  ${firstName}`);
    });
  });

  it.skip('Create a new user with inactive status', () => { // TODO:
  });

  it.skip('Create a new user with valid until today', () => { // TODO:
  });

  it('Update a user', () => {
    cy.log('**Update new user**')
    .get(userManagementPageModel.searchFieldInput).first().type(`${firstName} ${expiryDate}`)
    .get('.x-btn-inner-default-toolbar-small').contains('Search').click()
    .get('table').should('have.length', 1)
    .get('.x-grid-cell-last').find('a:first').click()

    cy.log('**Edit last name** ✏️')
    .get(userManagementPageModel.lastNameInput).clear().type(`${lastName}-${faker.name.lastName()}`)
    .saveClose().loading();
  });

  it('Delete a user', () => {
    cy.log('**Search user** 🔍')
    .get(userManagementPageModel.searchFieldInput).first().type(`${firstName} ${expiryDate}`)
    .get('.x-btn-inner-default-toolbar-small').contains('Search').click()
    .get('table').should('have.length', 1);

    cy.log('**Delete user** 🗑️')
    .get('.x-grid-cell-last').find('a:last').click()
    .get('.x-message-box').find('.x-btn-inner-default-small:contains(Yes)').click().loading()
  });
});