import faker from 'faker/locale/en_AU'; // https://www.npmjs.com/package/faker
import { environmentSystemsPageModel } from '../../../pages/environment-page';
import dataProviderLegacy from '../../../services/data-provider-legacy';
import {releasePageModel} from '../../../pages/release-page';
import {homePageModel} from '../../../pages/home-page';
import {myActivitiesPageModel} from '../../../pages/settings-page';

let token = '';
let data = [];
let systemId = '';
let releaseId = '';
let releaseIdParent = '';
let changeId = '';
let changeBody ='';
let countNotStarted = '';
let countInProgress = '';

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);
const today = dayjs().format('DD-MM-YYYYHH:mm:ss');
const todayUTC = dayjs().utc().format(); // convert local time to UTC time
const endDateUTC = dayjs().add(1, 'month').utc().format();

const userId = Cypress.env().users['admin'].userId;
const organizationId = Cypress.env().users['admin'].organizationId;
const changeName = 'change-' + faker.random.word() + ' ' + today;
const projectReleaseName = 'pr-' + faker.random.word() + ' ' + today;
const aPIModel = dataProviderLegacy.getLegacyModel();
const vendor = faker.company.companyName();
const systemName = 'system-' + faker.random.word() + ' ' + today;

before('Preconditions: token generation and look up fields', () => {
  cy.fixture('data').should((data) => {
    token = data.token;
  }).then(() => {
    // test data which will be used across all tests is created here
    dataProviderLegacy.setToken(token);
    dataProviderLegacy.getLegacyLookupFieldReleaseRiskLevel(); // look up field for releases
    dataProviderLegacy.getLegacyLookupFieldReleaseStatusType();
    dataProviderLegacy.getLegacyLookupFieldReleaseType();
    dataProviderLegacy.getLegacyLookupSystemRoleDependencyType();
    dataProviderLegacy.getLegacyWorkItemNameGate();
    dataProviderLegacy.getLegacyWorkItemNamePhase();
    dataProviderLegacy.getLegacyLookupStakeholderRole();
  });
});

beforeEach(() => {
  cy.login(token)
  .visit(homePageModel.url).loading().closeTimeZoneModal(); //close time zone popup
});

describe('End-to-end: My activities', () => {
  before(() => {
    cy.log('**Create System** 🌳');
    data = { // create System
      'token': token,
      'name': systemName,
      'vendor': vendor,
      'status': 'Active',
      'organizationId': organizationId,
      'description': systemName,
    };
    cy.systems('POST', '', data).then((resp) => {
      expect(resp.status).to.eq(201); // assert status code
      systemId = resp.body.id;
      cy.log(`**System '${systemName}' successfully set.** 🔥`);

      cy.log('**Create Release** 🌳');
      data = { // create Project Release
        'token': token,
        'identifier': projectReleaseName,
        'name': projectReleaseName,
        'summary': projectReleaseName,
        'releaseTypeId': aPIModel.releaseTypeId,
        'location': faker.address.country(),
        'releaseStatusTypeId': aPIModel.releaseStatusTypeId,
        'releaseRiskLevelId': aPIModel.releaseRiskLevelId,
        'implementationDate': endDateUTC,
        'displayColor': faker.internet.color(),
        'organizationId': organizationId,
        'parentReleaseId': null,
        'parentRelease': null,
        'plutoraReleaseType': 'Independent',
        'releaseProjectType': 'NotIsProject'
      };
      cy.releases('POST', '', data).then((resp) => {
        expect(resp.status).to.eq(201); // assert status code
        releaseId = resp.body.id;
        cy.log(`**Release '${projectReleaseName}' successfully set.** 🔥`);

        cy.log('**Set a system on a release** 🌳');
        data = { // link Release and System
          'token': token,
          'systemId': systemId,
          'systemRoleDependencyTypeId': aPIModel.systemRoleDependencyTypeId
        };
        cy.releases('POST', `/${releaseId}/systems`, data).then(() => {
          expect(resp.status).to.eq(201); // assert status code
          cy.log(`**System '${systemName}' successfully set on '${projectReleaseName}'** 🔥`);
        });
         
        cy.log('**Set a gate on a release** 🌳');
        data = {
          'token': token,
          'startDate': todayUTC,
          'endDate': endDateUTC,
          'isIgnore': false,
          'isIgnoreChild': false,
          'workItemNameID': aPIModel.workItemNameGateId
        };
        cy.releases('POST', `/${releaseId}/gates`, data).then((el)=>{
          expect(resp.status).to.eq(201); // assert status code
          cy.log(`**Gate successfully set on '${projectReleaseName}'** 🔥`);
        });

        cy.log('**Set a phase on a release** 🌳');
        data = {
          'token': token,
          'startDate': todayUTC,
          'endDate': endDateUTC,
          'isIgnore': false,
          'isIgnoreChild': false,
          'workItemNameID': aPIModel.workItemNamePhaseId
        };
        cy.releases('POST', `/${releaseId}/phases`, data).should((resp) => {
          expect(resp.status).to.eq(201); // assert status code
          cy.log(`**Phase successfully set on '${projectReleaseName}'** 🔥`);
          let phaseId = resp.body.id;

          cy.log('**Set a stakeholder on a release** 🔥');
          data = {
            'token': token,
            'userId': userId,
            'stakeholderRoleIds': [aPIModel.stakeholderRoleId],
            'responsible': true,
            'accountable': true,
            'informed': false,
            'consulted': false
          };
          cy.releases('POST', `/${releaseId}/stakeholders`, data).should((resp) => { // include stakeholder
            expect(resp.status).to.eq(201); // assert status code
            cy.log(`**Stakeholder successfully set on '${projectReleaseName}'** 🔥`);

            cy.log('**Set an activity (not started) on a release** 🔥');
            data = {
              'token': token,
              "identifier": faker.random.word(),
              "title": faker.random.word(),
              "status": "NotStarted",
              "description": faker.random.word(),
              "activityDependencyType": "None",
              "type": "Activity",
              "assignedToID": userId,
              "assignedWorkItemID": phaseId,
              "startDate": todayUTC,
              "endDate": endDateUTC,
              "forecastDate": endDateUTC
            };
            cy.releases('POST', `/${releaseId}/activities`, data).should((resp) => { // include activities that's not started
              countNotStarted = 1;
              expect(resp.status).to.eq(201); // assert status code
              cy.log(`**Activity (not started) successfully set on '${projectReleaseName}'** 🔥`);
            });

            cy.log('**Set an activity (in progress) on a release** 🔥');
            data = {
              'token': token,
              "identifier": faker.random.word(),
              "title": faker.random.word(),
              "status": "InProgress",
              "description": faker.random.word(),
              "activityDependencyType": "None",
              "type": "Activity",
              "assignedToID": userId,
              "assignedWorkItemID": phaseId,
              "startDate": todayUTC,
              "endDate": endDateUTC,
              "forecastDate": endDateUTC
            };
            cy.releases('POST', `/${releaseId}/activities`, data).should((resp) => { // include activities that's in progress
              countInProgress = 1;
              expect(resp.status).to.eq(201); // assert status code
              cy.log(`**Activity (in progress) successfully set on '${projectReleaseName}'** 🔥`);
            });
          });
        });
      });
    });
  });

  it('Tests Release Activities and performs bulk update', () => {
    cy.log('**Visit site and click My activities button**')
    .get(myActivitiesPageModel.myActivitiesIcon).click() // finds 'my activities' icon
    .get('.userActivitiesWindow').should('be.visible')
    .get('.activityLinkedItem').eq(1).find('input').type(projectReleaseName, '{enter}').loading()
    .get('.x-grid-cell-row-checker ').should('have.length', 2);


    cy.log('**In Release Activities find two top listings and perform Bulk Update on those**')
    .get('.x-grid-row-checker').click({ multiple:true, force:true }) //selecting first listing
    .findByTextThenClickForce('Bulk Update').loading(); // selecting bulk update button

    cy.log('**Updates two top listings status to "In Progress"**')
    .get('[name="Status"]').click()
    .get('.x-boundlist-item').contains('In Progress').click() //  selects In Progress from drop down menu
    .saveClose().loading();
    
    cy.log('**Both listings should be visible in a result table with In Progress status"**')
    .get('.activity-status').each((el)=>{
      cy.get(el).should('contain', 'In Progress'); // the status should have status "In Progress"
    });
  });

  it('Tests My PIR Activities', () => {
    cy.log('**Visit site and click My PIR activities button**')
    .get(myActivitiesPageModel.myActivitiesIcon).click(); // finds 'my activities' icon

    cy.log('**Visit My Activities tab and show all Open PIR actions**')
    .get(myActivitiesPageModel.tab).eq(1).click().loading() // clicks on My activities tab
    .get('.compactTag').then(($elem) => {
      cy.get($elem).find('li').first().then((el) => {
        if (el.text() !== 'Open'){
          cy.isElementExist('.x-tagfield-item-close').then((exist) => {
            if (exist) {
              cy.get('.x-tagfield-item-close').click()
              .get('.compactTag').click().get('.x-boundlist-item').contains('Open').click().loading(); //  selects Open from drop down menu
            }
            else {
              cy.get('.compactTag').click().get('.x-boundlist-item').contains('Open').click().loading(); //  selects Open from drop down menu
            }
          });
        } 
      });
    });
  });
});