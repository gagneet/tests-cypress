const username = Cypress.env().users["admin"].username;
const password = Cypress.env().users["admin"].password;
const clientId = Cypress.env().users["admin"].clientId;
const clientSecret = Cypress.env().users["admin"].clientSecret;
const grantType = Cypress.env().users["admin"].grantType;

let data = [];
let userGroupId = '';
let token = '';
let count = 0;
const date = new Date();
const dateNow = date.toISOString();
const startDate = dateNow;
const endDate = dateNow + 10;

before(() => { // token is generated and written to fixtures/data.json before any run-time via support/index.js
  cy.fixture('data').should((data) => {
    token = data.token;
  });
});

describe(['settings'], 'Integration: Users', ()=> {
  it('Admin - Retrieve Users', () => {
    cy.log('**Call Users API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.users('GET', '', data).should((resp) => {
      expect(resp.status).to.eq(200); // assert status code
      expect(resp.headers).to.have.property('content-type', 'application/json; charset=utf-8'); // assert properties
      if(resp.body.length != 0){ // there could be no data
        expect(resp.body[0].id).not.eq(null); // assert objects
        expect(resp.body[0].firstName).not.eq(null);
        expect(resp.body[0].lastName).not.eq(null);
        expect(resp.body[0].userName).not.eq(null);
        expect(resp.body[0].roles[0].id).not.eq(null);
        expect(resp.body[0].roles[0].name).not.eq(null);
        expect(resp.body[0].roles[0].description).not.eq(null);
        expect(resp.body[0].phoneNumber).not.eq(null);
      }

      count = resp.body.length;
      for(let i=0; i<count; i++) { // iterate all fields
        cy.log(`The record '${resp.body[i].userName}' with status '${resp.body[i].status}' successfully retrieved.`);
      }
      cy.log(`A total of '${resp.body.length}' records successfully retrieved.`);
    });

    cy.log('**Call Users API with filter** 🔥');
    data = {
      "token": token
    };
    cy.users('GET', `?filter=\`userName\` equals \`${username}\``, data).should((resp) => {
      expect(resp.status).to.eq(200); // assert status code
      expect(resp.body[0].userName).to.eq(username);

      cy.log(`User '${resp.body[0].userName}' successfully retrieved.`);
    });

    cy.log('**Call Users API with pagenation** 🔥');
    count = 10;
    data = {
      "token": token
    };
    cy.users('GET', `?pageNum=${count}&recordsPerPage=${count}`, data).should((resp) => {
      count = 10;
      expect(resp.status).to.eq(200); // assert status code
      expect(resp.body.resultSet.length).to.be.lte(resp.body.totalCount); // records should return <= total records
      expect(resp.body.resultSet.length).to.eq(count);
      expect(resp.body.recordsPerPage).to.eq(count);
      expect(resp.body.pageNum).to.eq(count);

      cy.log(`A total of '${resp.body.length}' records successfully retrieved.`);
    });

    cy.log('**Call Users API with invalid filter** 🔥');
    data = {
      "token": token
    };
    cy.users('GET', `/UserGroups?filter=\`invalidField\` equals \`invalid value\``, data).should((resp) => {
      expect(resp.status).to.eq(500);
      cy.log(`Error is '${resp.body.exceptionMessage}'`);
    });

    cy.log('**Call Users API with incorrect token** 🔥');
    data = {
      "token": ''
    };
    cy.users('GET', '', data).should((resp) => {
      expect(resp.status).to.eq(401);
      cy.log(`Error is '${resp.body.message}'.`);
    });
  });

  it('Admin - Retrieve Users - User Groups', () => {
    cy.log('**Call Users - User Groups API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.users('GET', '/UserGroups', data).should((resp) => {
      expect(resp.status).to.eq(200); // assert status code
      expect(resp.headers).to.have.property('content-type', 'application/json; charset=utf-8'); // assert properties
      if(resp.body.length != 0){ // there could be no data
        expect(resp.body[0].id).not.eq(null); // assert objects
        expect(resp.body[0].groupName).not.eq(null);
        // expect(resp.body[0].description).not.eq(null); // this is not mandatory so it could be null
      }

      count = resp.body.length;
      for(let i=0; i<count; i++) { // iterate all fields
        cy.log(`The record '${resp.body[i].groupName}' successfully retrieved.`);
      }
      cy.log(`A total of '${resp.body.length}' records successfully retrieved.`);

      userGroupId = resp.body[0].id;

      cy.log('**Call Users API with filter** 🔥');
      data = {
        "token": token
      };
      cy.users('GET', `?filter=\`id\` equals \`${userGroupId}\``, data).should((resp) => {
        expect(resp.status).to.eq(200); // assert status code
        // expect(resp.body[0].groupName).to.eq(groupName) // TODO: Check why this is not returning any data

        // cy.log(`User Group '${resp.body[0].userName}' successfully retrieved.`)
      });
    });

    cy.log('**Call Users - User Groups API with pagenation** 🔥');
    count = 10;
    data = {
      "token": token
    };
    cy.users('GET', `/UserGroups?pageNum=${count}&recordsPerPage=${count}`, data).should((resp) => {
      count = 10;
      expect(resp.status).to.eq(200); // assert status code
      expect(resp.body.resultSet.length).to.be.lte(resp.body.totalCount); // records should return <= total records
      // expect(resp.body.resultSet.length).to.eq(count) // TODO: Check why this is not returning any data
      expect(resp.body.recordsPerPage).to.eq(count);
      expect(resp.body.pageNum).to.eq(count);

      cy.log(`A total of '${resp.body.length}' records successfully retrieved.`);
    });

    cy.log('**Call Users - User Groups API with invalid filter** 🔥');
    data = {
      "token": token
    };
    cy.users('GET', `/UserGroups?filter=\`invalidField\` equals \`invalid value\``, data).should((resp) => {
      expect(resp.status).to.eq(500);
      cy.log(`Error is '${resp.body.exceptionMessage}'.`);
    });

    cy.log('**Call Users - User Groups API with incorrect token** 🔥');
    data = {
      "token": ''
    };
    cy.users('GET', '/UserGroups', data).should((resp) => {
      expect(resp.status).to.eq(401);
      cy.log(`Error is '${resp.body.message}'.`);
    });
  });

  it.skip('Admin - Generate Users Report', () => { // TODO: Still checking with #development if this is used
    cy.log('**Call Users API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.users('POST', `/GenerateReport/${startDate}/${endDate}`, data).should((resp) => {
      expect(resp.status).to.eq(200); // assert status code
      expect(resp.headers).to.have.property('content-type', 'application/json; charset=utf-8'); // assert properties
      if(resp.body.length != 0){ // there could be no data
        expect(resp.body[0].id).not.eq(null); // assert objects
        expect(resp.body[0].firstName).not.eq(null);
        expect(resp.body[0].lastName).not.eq(null);
        expect(resp.body[0].userName).not.eq(null);
        expect(resp.body[0].roles[0].id).not.eq(null);
        expect(resp.body[0].roles[0].name).not.eq(null);
        expect(resp.body[0].roles[0].description).not.eq(null);
        expect(resp.body[0].phoneNumber).not.eq(null);
      }

      count = resp.body.length;
      for(let i=0; i<count; i++) { // iterate all fields
        cy.log(`The record '${resp.body[i].userName}' with status '${resp.body[i].status}' successfully retrieved.`);
      }
      cy.log(`A total of '${resp.body.length}' records successfully retrieved.`);
    });

    cy.log('**Call Users API with filter** 🔥');
    data = {
      "token": token
    };
    cy.users('GET', `?filter=\`userName\` equals \`${username}\``, data).should((resp) => {
      expect(resp.status).to.eq(200); // assert status code
      expect(resp.body[0].userName).to.eq(username);

      cy.log(`User '${resp.body[0].userName}' successfully retrieved.`);
    });

    cy.log('**Call Users API with pagenation** 🔥');
    count = 10;
    data = {
      "token": token
    };
    cy.users('GET', `?pageNum=${count}&recordsPerPage=${count}`, data).should((resp) => {
      count = 10;
      expect(resp.status).to.eq(200); // assert status code
      expect(resp.body.resultSet.length).to.be.lte(resp.body.totalCount); // records should return <= total records
      expect(resp.body.resultSet.length).to.eq(count);
      expect(resp.body.recordsPerPage).to.eq(count);
      expect(resp.body.pageNum).to.eq(count);

      cy.log(`A total of '${resp.body.length}' records successfully retrieved.`);
    });

    cy.log('**Call Users API with invalid filter** 🔥');
    data = {
      "token": token
    };
    cy.users('GET', `/UserGroups?filter=\`invalidField\` equals \`invalid value\``, data).should((resp) => {
      expect(resp.status).to.eq(500);
      cy.log(`Error is '${resp.body.exceptionMessage}'`);
    });

    cy.log('**Call Users API with incorrect token** 🔥');
    data = {
      "token": ''
    };
    cy.users('GET', '', data).should((resp) => {
      expect(resp.status).to.eq(401);
      cy.log(`Error is '${resp.body.message}'.`);
    });
  });
});