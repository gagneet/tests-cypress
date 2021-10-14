import faker from 'faker/locale/en_AU' // https://www.npmjs.com/package/faker
import dataProviderLegacy from '../../../services/data-provider-legacy'
import { releasePageModel } from '../../../pages/release-page'

let token = ''

const dayjs = require('dayjs')
const today = dayjs().format('DD-MM-YYYYHH:mm:ss')

const enterpriseReleaseName = 'er-' + faker.random.word() + ' ' + today
const independentReleaseName = 'ir-' + faker.random.word() + ' ' + today
const enterpriseParentReleaseName =
  'parent er-' + faker.random.word() + ' ' + today
const projectReleaseName = 'pr-' + faker.random.word() + ' ' + today
const apIModel = dataProviderLegacy.getLegacyModel()

before('Preconditions: token generation and look up fields', () => {
  cy.fixture('data')
    .should((data) => {
      token = data.token
    })
    .then(() => {
      // test data which will be used across all tests is created here
      dataProviderLegacy.setToken(token)
      dataProviderLegacy.getLegacyLookupFieldReleaseRiskLevel() // look up field for releases
      dataProviderLegacy.getLegacyLookupFieldReleaseStatusType()
      dataProviderLegacy.getLegacyLookupFieldReleaseType()
    })
})

beforeEach(() => {
  cy.login(token).visit(releasePageModel.url).loading().closeTimeZoneModal()
})
describe('End-to-end: Release Manager', () => {
  it('Create, edit, duplicate and delete enterprise release 🏗️', () => {
    cy.log('**Create enterprise release**')
      .get(releasePageModel.newReleaseBtn)
      .click()
      .get(releasePageModel.addReleaseBtn)
      .first()
      .click({ force: true })
      .loading()
      .createRelease(enterpriseReleaseName, apIModel)
      .get('.x-btn-inner-default-small')
      .contains('Save')
      .click()
      .loading()

    cy.log('**Edit release**')
      .get(releasePageModel.nameInput)
      .clear()
      .type(`edit-${enterpriseReleaseName}`)
      .saveClose()
      .loading()
      .get('.x-grid-item-container')
      .should('be.visible')

    cy.log(
      '**Clear from filter and query builder**'
    ).clearFilterAndQueryBuilder()

    cy.log('**Duplicate release**').duplicateRelease(enterpriseReleaseName)

    cy.log('**Delete release**').deleteRelease()
  })
  it("Create, edit, duplicate and delete independent release ('Dependency'='Independent') 🏗️", () => {
    cy.log('**Create independent release**')
      .get(releasePageModel.newReleaseBtn)
      .click()
      .get(releasePageModel.addReleaseBtn)
      .last()
      .click({ force: true })
      .loading()
      .createRelease(independentReleaseName, apIModel)
      .get('.x-btn-inner-default-small')
      .contains('Save')
      .click()
      .loading()

    cy.log('**Edit release**')
      .get(releasePageModel.nameInput)
      .clear()
      .type(`edit-${independentReleaseName}`)
      .saveClose()
      .loading()
      .get('.x-grid-item-container')
      .should('be.visible')

    cy.log(
      '**Clear from filter and query builder**'
    ).clearFilterAndQueryBuilder()

    cy.log('**Duplicate release**').duplicateRelease(independentReleaseName)

    cy.log('**Delete release**').deleteRelease()
  })
  it('Create, edit, duplicate and delete independent release  🏗️', () => {
    cy.log('**Create independent parent release** 👴')
      .get(releasePageModel.newReleaseBtn)
      .click()
      .get(releasePageModel.addReleaseBtn)
      .first()
      .click({ force: true })
      .loading()
      .createRelease(enterpriseParentReleaseName, apIModel)
      .saveClose()
      .loading()

    cy.log('**Create independent child release** 🧒')
      .get(releasePageModel.newReleaseBtn)
      .click()
      .get(releasePageModel.addReleaseBtn)
      .last()
      .click({ force: true })
      .loading()
      .createRelease(independentReleaseName, apIModel)
      .get('[name="ParentID"]')
      .click()
      .loading()
      .get('[name="ParentID"]')
      .clear()
      .type(enterpriseParentReleaseName)
      .get('.x-boundlist-item')
      .contains(enterpriseParentReleaseName)
      .click({ force: true })
      .get('.migrationWindow')
      .find('.save-btn')
      .click()
      .loading()
      .get('.x-btn-inner-default-small')
      .contains('Save')
      .click()
      .loading()

    cy.log('**Edit release**')
      .get(releasePageModel.nameInput)
      .clear()
      .type(`edit-${independentReleaseName}`)
      .saveClose()
      .loading()
      .get('.x-grid-item-container')
      .should('be.visible')

    cy.log(
      '**Clear from filter and query builder**'
    ).clearFilterAndQueryBuilder()

    cy.log('**Duplicate release**').duplicateRelease(independentReleaseName)

    cy.log('**Delete releases**').deleteRelease()

    cy.log('**Delete parent release**')
      .get(releasePageModel.actionBtn)
      .click()
      .get(releasePageModel.clearGridFilterBtn)
      .click({ force: true })
      .loading() // clear grid filter
      .get('table')
      .should('have.length.greaterThan', 2)
      .get('.gridHeaderEditor')
      .eq(1)
      .type(enterpriseParentReleaseName)
      .type('{enter}')
      .loading()
      .get('table')
      .should('have.length', 1)
      .deleteRelease()
  })
  it("Create, edit, duplicate and delete project release ('Dependency'='Independent') 🏗️", () => {
    cy.log('**Create project release**')
      .get(releasePageModel.newReleaseBtn)
      .click()
      .get(releasePageModel.addReleaseBtn)
      .eq(1)
      .click({ force: true })
      .loading()
      .createRelease(projectReleaseName, apIModel)
      .get('.x-btn-inner-default-small')
      .contains('Save')
      .click()
      .loading()

    cy.log('**Edit release**')
      .get(releasePageModel.nameInput)
      .clear()
      .type(`edit-${projectReleaseName}`)
      .saveClose()
      .loading()
      .get('.x-grid-item-container')
      .should('be.visible')

    cy.log(
      '**Clear from filter and query builder**'
    ).clearFilterAndQueryBuilder()

    cy.log('**Duplicate release**').duplicateRelease(projectReleaseName)

    cy.log('**Delete release**').deleteRelease()
  })
  it('Create, edit, duplicate and delete project release  🏗️', () => {
    cy.log('**Create independent parent release** 👴')
      .get(releasePageModel.newReleaseBtn)
      .click()
      .get(releasePageModel.addReleaseBtn)
      .first()
      .click({ force: true })
      .loading()
      .createRelease(enterpriseParentReleaseName, apIModel)
      .saveClose()
      .loading()

    cy.log('**Create independent child release** 🧒')
      .get(releasePageModel.newReleaseBtn)
      .click()
      .get(releasePageModel.addReleaseBtn)
      .eq(1)
      .click({ force: true })
      .loading()
      .createRelease(projectReleaseName, apIModel)
      .get('[name="ParentID"]')
      .click()
      .loading()
      .get('[name="ParentID"]')
      .clear()
      .type(enterpriseParentReleaseName)
      .get('.x-boundlist-item')
      .contains(enterpriseParentReleaseName)
      .click({ force: true })
      .get('.migrationWindow')
      .find('.save-btn')
      .click()
      .loading()
      .get('.x-btn-inner-default-small')
      .contains('Save')
      .click()
      .loading()

    cy.log('**Edit release**')
      .get(releasePageModel.nameInput)
      .clear()
      .type(`edit-${projectReleaseName}`)
      .saveClose()
      .loading()
      .get('.x-grid-item-container')
      .should('be.visible')

    cy.log(
      '**Clear from filter and query builder**'
    ).clearFilterAndQueryBuilder()

    cy.log('**Duplicate release**').duplicateRelease(projectReleaseName)

    cy.log('**Delete releases**').deleteRelease()

    cy.log('**Delete parent release**')
      .get(releasePageModel.actionBtn)
      .click()
      .get(releasePageModel.clearGridFilterBtn)
      .click({ force: true })
      .loading() // clear grid filter
      .get('table')
      .should('have.length.greaterThan', 2)
      .get('.gridHeaderEditor')
      .eq(1)
      .type(enterpriseParentReleaseName)
      .type('{enter}')
      .loading()
      .get('table')
      .should('have.length', 1)
      .deleteRelease()
  })
})
