// This is an object for setting the override Cypress command names
// ie. cypress.Commands.add(CustomCommands.createRelease, xxxxx)
// Please use an extension like SonarLint which will identify duplicate names for you

export const CustomCommands = Object.freeze({
  UI: {
    createRelease: 'createRelease',
    deleteRelease: 'deleteRelease',
    duplicateRelease: 'duplicateRelease',
    environmentRequest: {
      createEnvironmentRequest: 'createEnvironmentRequest',
      clearQueryBuilder: 'clearQueryBuilder',
      clearDataSearch: 'clearDataSearch'
    }
  },
  API: {
    createStandardRelease: 'createStandardRelease'
  }
});
