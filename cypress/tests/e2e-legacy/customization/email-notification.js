import faker from 'faker/locale/en_AU'; // https://www.npmjs.com/package/faker
import { customizationPageModel, emailNotificationPageModel } from '/cypress/pages/settings-page';
import { today } from '/cypress/support/utils/common';
import dataProviderLegacy from '/cypress/services/data-provider-legacy';
import releasesApi from '/cypress/support/api/legacy-release-calls';

const mailosaurServerId = Cypress.env().mailosaurServerId;
const emailUser = Cypress.env().users['admin'].username;
const apIModel = dataProviderLegacy.getLegacyModel();
const username = Cypress.env().users['admin'].uiusername;

describe('End-to-end: Customization - Email notification', () => {
    let emailTemplateName = '';
    let subject = '';
    let releaseName = '';

    const typeInsideIframe = (text) => {
        cy.get('[data-ref="iframeEl"]:last').then(($iframe) => {
            const $body = $iframe.contents().find('body');
            cy.wrap($body).type(text);
        });
    };

    const deleteEmailTemplate = (emailName) => {
        cy.get('.contentPanel').should('be.visible');
        cy.get(`td:contains(${emailName})`).siblings('td:last').find('.x-button-delete-large').click();
        cy.findByText('Yes').click();
        cy.loading();
        cy.findByText('Submit').click();
        cy.loading();
    };

    before(() => {
        cy.login();

        releasesApi.setupReleaseData();
    });

    beforeEach(() => {
        cy.visit(customizationPageModel.url).loading().closeTimeZoneModal();
        cy.findByText('Email Template Wizard').click();
    });

    it('Release - Created', () => {
        emailTemplateName = 'release-created-' + today;
        subject = 'Release - Created ' + today;
        releaseName = 'er-' + faker.random.word() + ' ' + today;
        cy.findByText('Add').click();

        cy.log('**Filling email details** 📧');
        cy.get(emailNotificationPageModel.nameInput).type(emailTemplateName);
        cy.get(emailNotificationPageModel.descriptionInput).type(emailTemplateName);
        cy.get(emailNotificationPageModel.statusList).click();
        cy.selectByTextThenClick('Active');
        cy.findByTextThenClickForce(emailNotificationPageModel.nextButton);

        cy.log('**Enter entity and triggers** ✏️');
        cy.get(emailNotificationPageModel.entityList).click();
        cy.selectByTextThenClick('Release');
        cy.get(emailNotificationPageModel.triggerList).click();
        cy.selectByTextThenClick('Created');
        cy.findByTextThenClickForce(emailNotificationPageModel.nextButton);

        cy.log('**Enter email template** ✏️');
        cy.get(emailNotificationPageModel.subjectInput).type(subject);
        cy.get(emailNotificationPageModel.aliasInput).type('QE - Plutora');
        typeInsideIframe('[[Release_Name]]');
        cy.findByTextThenClickForce(emailNotificationPageModel.nextButton); // skip preview - assertions can done via unit test
        cy.findByTextThenClickForce(emailNotificationPageModel.nextButton);

        cy.log('**Select email recipients** ☑️');
        cy.get(emailNotificationPageModel.sendToSpecifiedRecipientsInput).click();
        cy.selectByTextThenClick(username);
        cy.saveClose();

        cy.log('**Create release from navigation menu**');
        cy.get('.plt__navbar__nav__panel__container__menu__primary:last').click();
        cy.get('.plt__navbar__nav__panel__container__menu__submenu__secondary:first').click();
        cy.get('#nav__0__9__0__0').click();
        cy.createRelease(releaseName, apIModel);
        cy.saveClose().loading();

        cy.log('**Check email**');
        cy.wait(120000); //without wait it is trying to find the last email
        cy.mailosaurGetMessage(
            mailosaurServerId,
            {
                sentTo: emailUser
            },
            { timeout: 60000 }
        ).then((email) => {
            expect(email.subject).to.contain(subject);
            expect(email.html.body).to.contain(releaseName);
        });
        cy.log('**Delete the new email template**');
        cy.findByText('Email Template Wizard').click();
        deleteEmailTemplate(emailTemplateName);
    });

    it('Release - Status Updated', () => {
        const newStatus = 'In Progress';
        let releaseId = '';
        emailTemplateName = 'release-activity-status-updated-' + today;
        subject = 'Release activity- Status updated ' + today;
        releaseName = 'ir-' + faker.random.word() + ' ' + today;
        cy.findByText('Add').click();

        cy.log('**Filling email details** 📧');
        cy.get(emailNotificationPageModel.nameInput).type(emailTemplateName);
        cy.get(emailNotificationPageModel.descriptionInput).type(emailTemplateName);
        cy.get(emailNotificationPageModel.statusList).click();
        cy.selectByTextThenClick('Active');
        cy.findByTextThenClickForce(emailNotificationPageModel.nextButton);

        cy.log('**Enter entity and triggers** ✏️');
        cy.get(emailNotificationPageModel.entityList).click();
        cy.selectByTextThenClick('Release Activities');
        cy.get(emailNotificationPageModel.triggerList).click();
        cy.selectByTextThenClick('Status updated');
        cy.findByTextThenClickForce(emailNotificationPageModel.nextButton);

        cy.log('**Enter email template** ✏️');
        cy.get(emailNotificationPageModel.subjectInput).type(subject);
        cy.get(emailNotificationPageModel.aliasInput).type('QE - Plutora');
        typeInsideIframe('[[Release_Name]] {enter} [[Activity/Criteria_Status]]');
        cy.findByTextThenClickForce(emailNotificationPageModel.nextButton); // skip preview - assertions can done via unit test
        cy.findByTextThenClickForce(emailNotificationPageModel.nextButton);

        cy.log('**Select email recipients** ☑️');
        cy.get(emailNotificationPageModel.sendToSpecifiedRecipientsInput).click();
        cy.selectByTextThenClick(username);
        cy.saveClose();

        cy.log('**Create release from API**');
        releasesApi
            .setupReleaseData()
            .then(() => {
                return releasesApi.createReleaseViaApi({
                    identifier: releaseName,
                    name: releaseName
                });
            })
            .then((resp) => {
                releaseId = resp.body.id;
                cy.log('**Set a stakeholder**');
                return releasesApi.addStakeholdersToRelease(releaseId);
            })
            .then(() => {
                cy.log('**Set a phase**');
                return releasesApi.addPhaseToRelease(releaseId);
            })
            .then((resp) => {
                cy.log('**Set an activity**');
                return releasesApi.addActivityToRelease(releaseId, {
                    assignedWorkItemID: resp.body.id
                });
            });

        cy.log('**Update status activity**');
        cy.search(releaseName);
        cy.findByText('Activities').click();
        cy.get('.x-grid-cell-activityStatusColumn').click();
        cy.findByText(newStatus).click();
        cy.saveClose();

        cy.log('**Check email**');
        cy.wait(120000); //without wait it is trying to find the last email
        cy.mailosaurGetMessage(
            mailosaurServerId,
            {
                sentTo: emailUser
            },
            { timeout: 60000 }
        ).then((email) => {
            expect(email.subject).to.contain(subject);
            expect(email.html.body).to.contain(releaseName);
            expect(email.html.body).to.contain(newStatus.replace(/\s+/g, '')); // replace function used to remove space between string
        });

        cy.log('**Delete new email template**');
        cy.findByText('Email Template Wizard').click();
        deleteEmailTemplate(emailTemplateName);
    });
});
