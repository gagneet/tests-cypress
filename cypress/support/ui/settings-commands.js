import faker from 'faker/locale/en_AU'; // https://www.npmjs.com/package/faker
import { userManagementPageModel } from '../../pages/settings-page';

const mailosaurServerId = Cypress.env().mailosaurServerId;

Cypress.Commands.add('addNewUser', (firstName, lastName, expiryDate) => {
  cy.log('**Enter user details** ✏️');
  cy.contains(userManagementPageModel.addNewUserButton).click()
  .get(userManagementPageModel.firstNameInput).type(`${firstName} ${expiryDate}`)
  .get(userManagementPageModel.lastNameInput).type(`${lastName} ${expiryDate}`)
  .get(userManagementPageModel.emailAddressInput).type(`${firstName}.${lastName}@${mailosaurServerId}.mailosaur.net`) // integrate with mailosaur
  .get(userManagementPageModel.phoneNumberInput).type(faker.phone.phoneNumber())
  // .get(userManagementPageModel.locationList).click().contains(faker.address.country()).click() // TODO: doesn't work yet
  .get(userManagementPageModel.rolesList).parentsUntil('.x-form-trigger-wrap').last().siblings('.x-form-trigger').click() // TODO: refactor this
  .get('.x-list-plain>li:first-child').should('be.visible').click()
  // account status
  .get('.x-form-radio').first().click({ force: true })
  .get(userManagementPageModel.validUntilDateInput).type(expiryDate);
});