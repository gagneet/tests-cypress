/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

// switching between environments: https://docs.cypress.io/api/plugins/configuration-api.html#Switch-between-multiple-configuration-files
// let percyHealthCheck = require('@percy/cypress/task'); // TODO: visual tests not yet needed
// const { lighthouse, pa11y, prepareAudit } = require('cypress-audit'); // TODO: accesibility tests not yet needed

const tagify = require('cypress-tags')
const preprocessor = require('@cypress/browserify-preprocessor')
const pathmodify = require('pathmodify')
const cucumber = require('cypress-cucumber-preprocessor').default
const cypressTypeScriptPreprocessor = require('./cy-ts-preprocessor');

/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
// plugins file
module.exports = (on, config) => {
  on('file:preprocessor', cypressTypeScriptPreprocessor);
  // cucumber plugin for BDD feature files addition
  on('file:preprocessor', cucumber());

  on('before:browser:launch', (browser = {}, launchOptions) => {
    // prepareAudit(launchOptions); // TODO: accesibility tests not yet needed
    if (browser.name === 'chrome' || browser.name === 'edge') {
      // launchOptions.args.push('--auto-open-devtools-for-tabs') // automatically open DevTools
      launchOptions.args.push('--disable-features=SameSiteByDefaultCookies'); // remove 401 unauthorised access on chrome
      // launchOptions.args.push('--disable-features=CrossSiteDocumentBlockingIfIsolating,CrossSiteDocumentBlockingAlways,IsolateOrigins,site-per-process');
      return launchOptions;
    }
  });

  // this section is for XLS download
  const fs = require('fs');
  const hasFiles = (downloadsFolder) => {
    const data = fs.readdirSync(downloadsFolder, 'utf-8');
    return data.length > 0;
  };
  on('task', {
    readDirectory(downloadsFolder) {
      return Boolean(hasFiles(downloadsFolder));
    },
  });

  // this section is for delete downloads folder
  // `on` is used to hook into various events Cypress emits
  on('task', {
    deleteFolder(folderName) {
      console.log('deleting folder %s', folderName);

      return new Promise((resolve, reject) => {
        fs.rmdir(folderName, { maxRetries: 10, recursive: true }, (err) => {
          if (err) {
            console.error(err);

            return reject(err);
          }

          resolve(null);
        });
      });
    },
  });

  // Removing need for multilevel relative paths by making root folder as the entry point
  // ie. no more '../../../../file_i_want.js
  // -----------------------------------------------------------------------------
  // (1) resolve paths relative to project root
  // -----------------------------------------------------------------------------
  const browserifyOptions = preprocessor.defaultOptions.browserifyOptions

  browserifyOptions.paths = [
    // the process.cwd() depends on the cypress process being started from
    //  the project root. You can also use an absolute path here.
    require('path').resolve(process.cwd())
  ]

  // -----------------------------------------------------------------------------
  // (2) regard paths starting with `/` as project-relative paths
  // -----------------------------------------------------------------------------

  browserifyOptions.plugin = browserifyOptions.plugin || []
  browserifyOptions.plugin.unshift([
    pathmodify,
    {
      mods: [
        // strip leading `/` when resolving paths
        pathmodify.mod.re(/^\//, '')
      ]
    }
  ])

  // -----------------------------------------------------------------------------
  // (3) compile spec files when they're run
  // -----------------------------------------------------------------------------

  const compileFile = preprocessor(preprocessor.defaultOptions)

  on('file:preprocessor', (file) => {
    tagify(config) // this section is for tagging tests
    return compileFile(file)
  })

  // -----------------------------------------------------------------------------
  // END -- Path preprocessor
  // -----------------------------------------------------------------------------

  // TODO: visual tests not yet needed
  // on('task', percyHealthCheck); // visual tests

  const version = config.env.version || 'qa-white-demo.plutora.org'; // if version is not defined, default to this stable environment
  config.env = require(`../../config/${version}.env.json`); // load env from json
  config.baseUrl = config.env.baseUrl;

  // change baseUrl
  // config.baseUrl = config.env.baseUrl // <- this is not used on our config files but just for reference
  // code coverage (use this only when cypress is same repo as your app src)
  // require('@cypress/code-coverage/task')(on, config)
  // on('file:preprocessor', require('@cypress/code-coverage/use-babelrc')) // instrumenting code

  // TODO: accessibility tests not yet needed
  // on('task', { // check application performances and accessibility status
  //     // lighthouse: lighthouse(), // calling the function is important
  //     // pa11y: pa11y(), // calling the function is important
  //     lighthouse: lighthouse((lighthouseReport) => {
  //         console.log(lighthouseReport); // raw lighthouse reports
  //       }),
  //       pa11y: pa11y((pa11yReport) => {
  //         console.log(pa11yReport); // raw pa11y reports
  //     })
  // });
  
  // `config` is the resolved Cypress config
  return config;
};
