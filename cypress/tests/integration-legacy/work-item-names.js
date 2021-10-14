import {v4 as uuidv4} from 'uuid';

let token = '';
let data = [];
let count = 0;

before(() => { // token is generated and written to fixtures/data.json before any run-time via support/index.js
  cy.fixture('data').should((data) => {
    token = data.token;
  });
});

describe(['settings'], 'Integration: Work item names', ()=> {
  it('Admin - Retrieve Work item names for Gates', () => {
    cy.log('**Call Work item names API with correct token** 🔥');
    data = {
      'token': token
    };
    cy.workitemnames('GET', '/Gates', data).should((resp) => {
      expect(resp.status).to.eq(200); // assert status code
      expect(resp.headers).to.have.property('content-type', 'application/json; charset=utf-8'); // assert properties
      expect(resp.body[0].id).not.eq(null); // assert objects (there should always be data)
      expect(resp.body[0].name).not.eq(null);

      count = resp.body.length;
      for(let i=0; i<count; i++) { // iterate all fields
        cy.log(`The record '${resp.body[i].id}' with name '${resp.body[i].name}' successfully retrieved.`);
      }
      cy.log(`A total of '${resp.body.length}' records successfully retrieved.`);
    });

    cy.log('**Call Work item names API with incorrect token** 🔥');
    cy.workitemnames('GET', '/Gates', {'token': ''}).should((resp) => {
      expect(resp.status).to.eq(401);
      cy.log(`Error is '${resp.body.message}'.`);
    });
  });


  it('Admin - Retrieve Work item names for Phases', () => {
    cy.log('**Call Work item names API with correct token** 🔥');
    data = {
      'token': token
    };
    cy.workitemnames('GET', '/Phases', data).should((resp) => {
      expect(resp.status).to.eq(200); // assert status code
      expect(resp.headers).to.have.property('content-type', 'application/json; charset=utf-8'); // assert properties
      expect(resp.body[0].id).not.eq(null); // assert objects (there should always be data)
      expect(resp.body[0].name).not.eq(null);

      count = resp.body.length;
      for(let i=0; i<count; i++) { // iterate all fields
        cy.log(`The record '${resp.body[i].id}' with name '${resp.body[i].name}' successfully retrieved.`);
      }
      cy.log(`A total of '${resp.body.length}' records successfully retrieved.`);
    });

    cy.log('**Call Work item names API with incorrect token** 🔥');
    cy.workitemnames('GET', '/Phases', {'token': ''}).should((resp) => {
      expect(resp.status).to.eq(401);
      cy.log(`Error is '${resp.body.message}'.`);
    });
  });
});