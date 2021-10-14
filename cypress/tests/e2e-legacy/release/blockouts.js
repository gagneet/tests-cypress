import faker from 'faker/locale/en_AU'; // https://www.npmjs.com/package/faker
import { blockoutPageModel } from '../../../pages/release-page';

let token = '';

const image = 'plutora-logo.png';
const dayjs = require('dayjs');
const today = dayjs().format('DD-MM-YYYYHH:mm:ss');
const blockoutName = 'Blk-' + faker.random.word() + ' ' + today;

before('Preconditions: token generation and look up fields', () => {
  cy.fixture('data').should((data) => {
    token = data.token;
  });
});

beforeEach(() => {
  cy.login(token)
  .visit(blockoutPageModel.url).loading().closeTimeZoneModal() //close time zone popup
  .get('.x-grid-item-container').find('table')
  .get('.x-grid-item-container').scrollTo('top', { ensureScrollable: false })
});

describe('End-to-end: Blockout Manager', () => {
  it('Create a blockout  🏗️', () => {
    cy.get('.x-btn-inner').contains('New Blockout').click().loading()
    .createBlockout(blockoutName);
  });
  it('Update a blockout 🏗️', () => {
    cy.editBlockout(blockoutName);
  });
  it('Duplicate a blockout 🏗️', () => {
    cy.duplicateBlockout(blockoutName);
  });
  it('Add attachment on blockout from grid', () => {
    cy.log('**Add attachment**')
    .scrollToElement('.x-grid-with-row-lines:nth-child(1)', `.fakeLink:contains(${blockoutName})`)
    .get('.fakeLink').contains(blockoutName).click({force:true})
    .get('.delete-btn').should('be.visible') // to confirm the blockout modal open completely
    .get(blockoutPageModel.addAttachmentBtn).click()
    .get(blockoutPageModel.attachmentWindow).should('be.visible')
    .findByTextThenClick('+ New')
    .get(blockoutPageModel.attachmentMenuBtn).last().click({force:true})
    .get('input[type="file"]').attachFile(image)
    .get('.fileUpdater').should('be.visible') // to confirm the file was saved
  });
  it('Delete a blockout 🏗️', () => {
    cy.deleteBlockout(blockoutName);
  });
});