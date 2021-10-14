import { homePageModel } from '../../../pages/home-page';
import faker from 'faker/locale/en_AU';

let token = '';
const avatarImage = 'plutora-logo.png';

before('Preconditions: token generation and look up fields', () => {
  cy.fixture('data').should((data) => {
    token = data.token;
  });
});

beforeEach(() => {
  cy.login(token)
  .visit(homePageModel.url).loading().closeTimeZoneModal() //close time zone popup
});

describe('Update profile, click help & logout', () => {
  it('Checks if a user can change their avatar picture', () => {
    cy.get(homePageModel.avatarIcon).click() //click on avatar icon
    .get(homePageModel.profileButton).click() // click on profile button
    .get('input[type="file"]').attachFile(avatarImage).loading() //upload image from fixtures folder
    .saveClose().loading();
  });
  it('Checks if a user can update their contact details and save.', () => { //SUPPORT-61 update phone number bug
    cy.get(homePageModel.avatarIcon).click() //click on avatar icon
    .get(homePageModel.profileButton).click() // click on profile button
    .get(homePageModel.phoneNum).clear().type(faker.phone.phoneNumber()) // enters a dummy phone number
    .saveClose().loading();
  });
  it.skip('Checks if help page renders correctly', () => {
    cy.get(homePageModel.avatarIcon).click(); //click on avatar icon
    cy.get(homePageModel.helpButton).then(($el) => { //validates help button link
      expect($el).to.have.attr('href', 'https://support.plutora.com/s/');
    });
  });
  it('Tests logout functionality', () => {
      cy.get(homePageModel.avatarIcon).click() //click on avatar icon
      cy.contains(homePageModel.logout).click(); //clicks on logout button
      cy.clearCookies();
      cy.get(homePageModel.login).should('exist'); // validates page renders correctly
  });
});
