import { userManagementPageModel } from '../../pages/settings-page';
import {v4 as uuidv4} from 'uuid';
import dataProviderLegacy from '../../services/data-provider-legacy';

let token = '';
let userId = '';
let data = [];
let roleId = '';
let roleId2 = '';

const dayjs = require('dayjs');
const username = Cypress.env().users["admin"].uiusername;
const organization = Cypress.env().users["admin"].organizationId;
const email = Cypress.env().users["admin"].username;
const group = Cypress.env().users["admin"].userGroupdId;
const date = dayjs().add(2, 'year').format('MMM DD YYYY');
const aPIModel = dataProviderLegacy.getLegacyModel();

before('Preconditions: token generation and look up fields', () => {
  cy.fixture('data').should((data) => {
    token = data.token;
  }).then(() => {
    // test data which will be used across all tests is created here
    dataProviderLegacy.setToken(token);
    dataProviderLegacy.getOrganization();
  });
});

beforeEach(() => {
  cy.login(token);
});

function uncheckPermission(isUnCheck) {
  cy.log('**Un-check the permission ❌**')
  .visit(userManagementPageModel.url).loading()
  .get('[class="x-box-inner"]').contains('Manage Permissions').click().loading()
  .get('div').contains('Admin').click({force: true}).loading()
  .scrollToElement('.x-tree-view-default','.x-grid-cell-first:contains("Update Users")+td+td').within((item)=>{
    (isUnCheck?
      cy.get('.x-grid-checkcolumn').then((el)=>{
        if (el.hasClass('x-grid-checkcolumn-checked')) {
          cy.get(el).click({force: true});
        }
      })
      :
      cy.get('.x-grid-checkcolumn').then((el)=>{
        if (!el.hasClass('x-grid-checkcolumn-checked')) {
          cy.get(el).click({force: true});
        }
      })
    );
  })
  .saveClose().loading();
}

describe(['settings'], 'PATCH user/{id} test', ()=>{
  before(() => {
    cy.log('**Pre-condition: Get random Roles** 🐙')
    .users('GET', '', { 'token': token}).then((resp) => {
      roleId2 = resp.body[0].roles[0].id;
    });
  });

  it('Update user details without permission', ()=>{
    uncheckPermission(true);
    cy.log('**Update the user ✏️**')
    .users('GET', `?filter=\`userName\` equals \`${email}\``, { 'token': token}).then((resp)=>{
      userId = resp.body[0].id;
      roleId = resp.body[0].roles[0].id;
      data={
        'token': token,
        'ValidUntilDate': date,
      };
      cy.users('PATCH', `/${userId}`, data).then((resp)=>{
        expect(resp.status).to.eq(403); // assert status code
      });
    });
  });
  it('Update user details with permission', ()=>{
    uncheckPermission(false);
    cy.log('**Get user id 👨‍🦱**')
    .users('GET', `?filter=\`userName\` equals \`${email}\``, {"token": token}).then((resp)=>{
      userId = resp.body[0].id;

      cy.log('**Update user with correct body (user and user roles) ✏️**');
      data={
        'token': token,
        'Status':'Active',
        'ValidUntilDate': date,
        'Roles': [roleId],
        'Groups': group,
        'CanLogin':'true',
        'OrganizationID': organization,
        'CanReceiveEmailNotifications': 'false'
      };
      cy.users('PATCH', `/${userId}`, data).then((resp)=>{
        expect(resp.status).to.eq(204); // assert status code
      });

      cy.log('**Update user with correct body (user and multiple user roles) ✏️**');
      data={
        'token': token,
        'Status':'Active',
        'Roles': [roleId2, roleId],
        'CanLogin':'true',
        'CanReceiveEmailNotifications':'true'
      };
      cy.users('PATCH', `/${userId}`, data).then((resp)=>{
        expect(resp.status).to.eq(204); // assert status code
      });

      cy.log('**Update user with correct body (user and no user role) ✏️**');
      data={
        'token': token,
        'Status':'Active',
        'CanLogin':'true',
        'CanReceiveEmailNotifications':'false'
      };
      cy.users('PATCH', `/${userId}`, data).then((resp)=>{
        expect(resp.status).to.eq(204); // assert status code
      });

      cy.log('**Update user with invalid uuid ✏️**');
      data={
        'token': token,
        'Status':'Pending',
        'CanLogin':'false',
      };
      cy.users('PATCH', `/${uuidv4()}`, data).then((resp)=>{
        expect(resp.status).to.eq(417); // assert status code
      });

      cy.log('**Update user with invalid token ✏️**');
      data={
        'token': uuidv4(),
        'Status':'Pending',
        'CanLogin':'false',
      };
      cy.users('PATCH', `/${userId}`, data).then((resp)=>{
        expect(resp.status).to.eq(401); // assert status code
      });

      cy.log('**Remove all roles**');
      data={
        'token': token,
        "Roles":[]
      };
      cy.users('PATCH', `/${userId}`, data).then((resp)=>{
        expect(resp.status).to.eq(400); // assert status code
      });

      cy.log('**Remove all OrganizationID**');
      data={
        'token': token,
        'OrganizationID':[],
      };
      cy.users('PATCH', `/${userId}`, data).then((resp)=>{
        expect(resp.status).to.eq(204); // pass on API but fail in UI
      })
      .visit(userManagementPageModel.url).loading()
      .get('.x-panel').should('be.visible')
      .get('[name^="combobox"]').type(`${username}{enter}`)
      .get('.x-btn-inner').contains('Search').click()
      .get('table').should('have.length', 1)
      .get('.x-action-col-button-0').click().loading()
      .get('[name="OrganizationID"]').siblings('div').should('have.class', 'ext-ux-clearbutton-on'); // have.class = OrganizationID not empty

      cy.log('**Remove all groups**');
      data={
        'token': token,
        'Groups':[],
      };
      cy.users('PATCH', `/${userId}`, data).then((resp)=>{
        expect(resp.status).to.eq(204);
      });

      cy.log('**Ignore ValidUntilDate value if status is inactive**');
      data={
        'token': token,
        'Status':'InActive',
      };
      cy.users('PATCH', `/${userId}`, data).then((resp)=>{
        expect(resp.status).to.eq(204);
      });

      cy.log('**Set status to pending**'); // able to set status = pending via API, but not via UI
      data={
        'token': token,
        'Status':'Pending',
      };
      cy.users('PATCH', `/${userId}`, data).then((resp)=>{
        expect(resp.status).to.eq(204);
      });

      cy.log('**Set multiple orgs**');
      data={
        'token': token,
        'OrganizationID':[organization, aPIModel.organizationId],
      };
      cy.users('PATCH', `/${userId}`, data).then((resp)=>{
        expect(resp.status).to.eq(204); // pass on API but fail in UI, OrganizationID should have one value
      });

      cy.log('**Set the account to the original setup**');
      data={
        'token': token,
        'Status':'Active',
        'Roles': [roleId],
        'CanLogin':'true',
        'CanReceiveEmailNotifications':'true'
      };
      cy.users('PATCH', `/${userId}`, data).then((resp)=>{
        expect(resp.status).to.eq(204); // assert status code
      });
    });
  });
});