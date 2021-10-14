
import { customizationPageModel } from '../../../pages/settings-page';
import { getLocalIP } from '../../../support/utils/common-get-local-ip';

let token = '';

const date = new Date();
const dateNow = date.toISOString();

let ipDetails = null;
let data = [];

// TODO: Skipping before, after, and it as these tests is impacting the external api tests as the IP address doesn't get disabled

// before(() => { // TODO: Un-comment when skipping is removed (before.skip is not a valid function)
//   ipDetails = getLocalIP();
//   cy.fixture('data').should((data) => {
//     token = data.token;
//     cy.login(data.token);
//   });
//   cy.visit(customizationPageModel.url).loading().closeTimeZoneModal();

//   cy.get(customizationPageModel.navigationTab).findByTextThenClick('API - IP Whitelisting');
//   cy.wait(1000); // for data to load into the grid as no loading image
//   cy.isElementExist('[class^="range-name"]:contains("IncorrectIPAddressForCypressAutomation")')
//     .then((exist) => {
//       // check if specific IP adress is visible
//       if (!exist) {
//         cy.get('[class^="btn"]:contains("+ New")').click();
//         cy.get('input[name="From"]').click().type('1.1.1.1');
//         cy.get('input[name="To"]').click().type('1.1.1.1');
//         cy.get('textarea[name="description"]').click().type('IncorrectIPAddressForCypressAutomation');
//         cy.saveClose();
//       }
//     })
//     .wait(1000) // for data to load into the grid as no loading image
//     .isElementExist('[class^="range-name"]:contains("CorrectIPAddressForCypressAutomation")')
//     .then((exist) => {
//       // check if element is visible, if button is visible then it means that status is disabled and we want to enable it
//       if (!exist) {
//         cy.get('[class^="btn"]:contains("+ New")').click();
//         cy.get('input[name="From"]').click().type('1.1.1.1');
//         cy.get('input[name="To"]').click().type('1.1.1.1');
//         cy.get('textarea[name="description"]').click().type('CorrectIPAddressForCypressAutomation');
//         cy.saveClose();
//       }
//     });
// });

describe.skip('End-to-end: Customization - Integration - API - IP Whitelisting', () => {
  before(() => {
    //Turn on incorrect IP Address to emulate blacklist
    //ipDetails.ip;
    cy.visit(customizationPageModel.url)
      .get(customizationPageModel.navigationTab).findByTextThenClick('API - IP Whitelisting')
      .wait(1000) // for data to load into the grid as no loading image
      .get('[class^="range-name"]:contains("IncorrectIPAddressForCypressAutomation")').click(); //we are using hardcoded job Name
    cy.get('.off.ng-binding').then(($elem) => {
      // check if element is visible, if button is visible then it means that status is disabled and we want to enable it
      if ($elem.get(0).offsetParent != null) {
        cy.get($elem).click();
      } else {
        // skip enabling as it is already enabled
      }
    })
      .saveClose();
  });

  it('Check API Blacklist verification ⛔', () => {
    cy.log('**Check API Blacklist verification ** ⛔');
    cy.fixture('data').should((data) => {
      token = data.token;
    });

    cy.log('**Get Lookup Fields** 🔥');
    data = {
      'token': token
    };
    cy.lookupFields('GET', '/ReleaseRiskLevel', data).then((resp) => { // Get CFs
      expect(resp.status).to.eq(403); // assert status code
      cy.log('Response status code is 403'); //TODO WAO-2299 not working on SIT envt
    });
  });

  it('Check API Whitelist verification ✅', () => {
    cy.log('**Check API Whitelist verification ** ✅');
    cy.fixture('data').should((data) => {
      token = data.token;
      cy.login(data.token);
    });
    //Turn on correct IP Address to emulate whitelist
    cy.visit(customizationPageModel.url)
      .get(customizationPageModel.navigationTab).findByTextThenClick('API - IP Whitelisting')
      .wait(1000) // for data to load into the grid as no loading image
      .get('[class^="range-name"]:contains("CorrectIPAddressForCypressAutomation")').click() //we are using hardcoded Name
      .get('input[name="From"]').click().clear().type(ipDetails.ip)
      .get('input[name="To"]').click().clear().type(ipDetails.ip);
    cy.get('.off.ng-binding').then(($elem) => {
      // check if element is visible, if button is visible then it means that status is disabled and we want to enable it
      if ($elem.get(0).offsetParent != null) {
        cy.get($elem).click();
      } else {
        // skip enabling as it is already enabled
      }
    })
      .saveClose().then(() => {
        cy.log('**Check API Whitelist verification ** ✅');
        cy.auth().should((resp) => {
          cy.log(`Access token '${resp.body.access_token}' successfully generated.`);
          token = resp.body.access_token;
        });

        cy.log('**Get Lookup Fields** 🔥');
        data = {
          'token': token
        };
        cy.lookupFields('GET', '/ReleaseRiskLevel', data).then((resp) => { // Get CFs
          cy.log('ReleaseRiskLevel successfully set');
          expect(resp.status).to.eq(200); // assert status code
          cy.log('Response status code is 200');
        });
      });
  });
});

// after(() => { // TODO: Un-comment when skipping is removed (after.skip is not a valid function)
//   cy.fixture('data').should((data) => {
//     token = data.token;
//     cy.login(data.token);
//   });

//   cy.visit(customizationPageModel.url)
//       .get(customizationPageModel.navigationTab).findByTextThenClick('API - IP Whitelisting')
//       .wait(1000) // for data to load into the grid as no loading image
//       .get('[class^="range-name"]:contains("IncorrectIPAddressForCypressAutomation")').click(); //we are using hardcoded Name
//       cy.get('.on.ng-binding').then(($elem) => {
//       // check if element is visible, if button is visible then it means that status is enabled and we want to disabled it
//       if ($elem.get(0).offsetParent != null) {
//         cy.get($elem).click();
//       } else {
//         // skip enabling as it is already disabled
//       }
//       })
//       .saveClose()

//       .get(customizationPageModel.navigationTab).findByTextThenClick('API - IP Whitelisting')
//       .wait(1000) // for data to load into the grid as no loading image
//       .get('[class^="range-name"]:contains("CorrectIPAddressForCypressAutomation")').click(); //we are using hardcoded Name
//       cy.get('.on.ng-binding').then(($elem) => {
//       if ($elem.get(0).offsetParent != null) {
//         cy.get($elem).click();
//       } else {
//         // skip enabling as it is already disabled
//       }
//       })
//       .saveClose();
// });