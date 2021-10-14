import faker from 'faker/locale/en_AU'; // https://www.npmjs.com/package/faker
import { deploymentPageModel } from "../../../pages/deployment-page";
import dataProvider from "../../../services/data-provider";

let token = '';
let data = [];
let planID = '';

const dayjs = require('dayjs');
const today = dayjs().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');

const mdPName = 'mdp-' + faker.random.word() + ' ' + today;

const planningModel = dataProvider.getPlanningModel();

before("Preconditions: token generation and look up fields", () => {
  cy.fixture("data")
  .should((data) => {
    token = data.token;
  })
  .then(() => {
    dataProvider.setToken(token);
    dataProvider.getLegacyLookupFields();
  });
});

beforeEach(() => {
  cy.login(token)
  .visit(deploymentPageModel.url).loading().closeTimeZoneModal()
});

describe("End-to-end: Deployment Activity by Status", () => {
  before(() => {
    cy.log('**Create deployment plan** 🌳');
    data = { // create deployment plan
      "token": token,
      "name": 'dp-' + faker.random.word() + ' ' + today,
      "description": 'dp-' + faker.random.word() + ' ' + today,
      "externalIdentifier": 'external-id-' + faker.random.number(),
      "organizationId": planningModel.organizationId,
      "SystemIDs": null,
    };
    cy.deploymentPlans('POST', '/Create', data).then((resp)=>{
      planID = resp.body.data.ID;
      expect(resp.status).to.eq(200);
      cy.log(`**Deployment plan successfully created**`);

      cy.log('**Create master deployment plan** 🌳');
      data = { // create mdp
        "token": token,
        'name': mdPName,
        'deploymentPlanIds': planID,
        'OrganizationID': planningModel.organizationId
      };
      cy.masterDeploymentPlans('POST', '/Create', data).then((resp)=>{
        expect(resp.status).to.eq(200);
        cy.log(`**Master deployment plan '${mdPName}'successfully created**`);
      });
    });
  });
  it('Create, rename & delete activity set', ()=>{
    cy.get('.x-tab-top').first().click({force:true}) // filter to all
    .get(deploymentPageModel.liveSearch).clear()
    .get(deploymentPageModel.dPContainer).should('have.length.greaterThan', 2)
    .get(deploymentPageModel.liveSearch).type(mdPName)
    .get(deploymentPageModel.dPContainer).should('have.length', 1)
    .get(deploymentPageModel.mdPName).should('have.text', mdPName).click({force:true})
    .get(deploymentPageModel.dPWindow).should('be.visible')

    cy.log('**Create activity set**')
    .get(deploymentPageModel.dPLeftTab).eq(3).click()
    .get(deploymentPageModel.activitySetNameInput).type('activity set- '+ faker.random.word()  + ' ' + today)
    .get(deploymentPageModel.saveBtn).first().click({force:true}).loading();

    cy.log('**Rename activity set**')
    .get('.actSet-editBtn:last').click()
    .get('[name^="textfield"]').first().clear().type('activity set- '+ faker.random.word()  + ' ' + today)
    .get(deploymentPageModel.saveBtn).first().click({force:true}).loading();

    cy.log('**Delete activity set**') // TODO: un-comment once RESKIN-681 is released


  });
});
