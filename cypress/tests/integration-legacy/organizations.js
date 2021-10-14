import dataProviderLegacy from '../../services/data-provider-legacy';

let data = [];
let token = '';

const organization = dataProviderLegacy.getLegacyModel();

before(() => { // token is generated and written to fixtures/data.json before any run-time via support/index.js
  cy.auth().should((resp) => {
    cy.log(`Access token '${resp.body.access_token}' successfully generated.`);
    token = resp.body.access_token;
  }).then(() => {
    //test data which will be used across all tests is created here
    dataProviderLegacy.setToken(token);
    dataProviderLegacy.getOrganization();
  });
});

describe(['settings'], 'Integration: Organizations', ()=> {
  before(() => {
    cy.log(JSON.stringify(organization));
  });

  it('Admin - Call Organization API with filter', () => {
    cy.log('**Call Organization API with valid filter equals** 🔥');
    data = {
      'token': token
    };
    cy.organizations('GET', `?filter=\`name\` equals \`${organization.organizationName}\``, data).should((resp) => {
      expect(resp.status).to.eq(200); // assert status code
      expect(resp.body[0].name).to.eq(organization.organizationName);

      cy.log(`Organization '${resp.body[0].name}' successfully retrieved.`);
    });

    cy.log('**Call Organization API with valid filter contains** 🔥');
    data = {
      'token': token
    };
    cy.organizations('GET', `?filter=\`name\` contains \`${organization.organizationName}\``, data).should((resp) => {
      expect(resp.status).to.eq(200); // assert status code
      expect(resp.body[0].name).to.eq(organization.organizationName);

      cy.log(`Organization '${resp.body[0].name}' successfully retrieved.`);
    });

    cy.log('**Call Organization API with invalid filter** 🔥');
    data = {
      'token': token
    };
    cy.organizations('GET', `?filter=\`invalidField\` equals \`invalid value\``, data).should((resp) => {
      expect(resp.status).to.eq(500);
      cy.log(`Error is '${resp.body.message}'`);
    });

    cy.log('**Call Users API with incorrect token** 🔥');
    data = {
      'token': ''
    };
    cy.organizations('GET', '', data).should((resp) => {
      expect(resp.status).to.eq(401);
      cy.log(`Error is '${resp.body.message}'.`);
    });
  });
});