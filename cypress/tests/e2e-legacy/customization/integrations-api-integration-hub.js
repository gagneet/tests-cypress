import faker from 'faker/locale/en_AU'; // https://www.npmjs.com/package/faker
import { customizationPageModel, emailNotificationPageModel } from '../../../pages/settings-page';

let token = '';
const scriptFile = 'script.js';

const date = new Date();
const dateNow = date.toISOString();
const jobName = 'job-' + dateNow;

beforeEach(() => {
  cy.fixture('data').should((data) => {
    token = data.token;
    cy.login(data.token)
    .visit(customizationPageModel.url).loading().closeTimeZoneModal();
  });
});

describe('End-to-end: Customization - Integration - API - Integration Hub', () => {
  it.skip('Create a new job - Created then verify job', () => {
    cy.get(customizationPageModel.navigationTab).findByTextThenClick('API - Integration Hub');
    cy.log('**Add Job** ✏️')
    .get('[id="integrationhub_newjob"]').click()
    .get('[placeholder="Job Name"]').clear().type(jobName)
    .get('[class="btn btn-default btn-sm btn-upload"]').click({force: true})
    .attachFile(scriptFile);
    cy.contains('Run & Close').click();
    cy.contains('created successfully').should('exist');
  });
});