# Plutora Functional Tests
Automated (UI + API) tests using Cypress 👌 🧪 🤖

[![Cypress.io tests](https://img.shields.io/badge/cypress.io-tests-green.svg?style=flat-square)](https://cypress.io)

## Pre-requisites / Assumptions
* [Node.js](https://nodejs.org/en/download/) has been installed on the machine / ci server
* Your favourite IDE has been installed on the machine if doing [contributions](./CONTRIBUTING.md) to the code
* Internet is accessible (no proxy!)
* Runs on [local cli](#running-on-local-machine) but requires configuration running on [ci](#running-on-ci) pipelines (e.g. Jenkins, Bitbucket Pipeline)
* Runs on Electron browser (pre-installed) but need to download specific browsers (e.g. Firefox, Edge, Chrome) if required
* Organization, User Group, and User specified in `cypress/<env>.env.json` exists (if not, just manually create - takes a minute!)

## Usage
### Running on local machine
* Open IDE (VS Code is highly recommended!) then open the forked / cloned `tests-functional` repository
* Navigate to Terminal then type `npm install cypress` to install Cypress and its core dependencies on the root directory
* Stay on Terminal then type `npx cypress open` or `npx cypress run` to execute the test suite and check test results stored on `cypress/videos`, `cypress/screenshots`, & `cypress/test-reports` (see [Gotchas](#known-issues-/-gotchas) if errors encountered)
* (*Optional*) Create a `local.env.json` under the `config` folder with same format as `qa-orange-demo.plutora.org.env.json` (or `demo.plutora.org.env.json`) and change the variables if there are sandbox or local sites where the test can run
* (*Optional*) Create a copy of `cypress.json` and re-name it to `cypress.env.json` under the same root directory with a sample format below (if secrets are used):
``` json
{
    "AWS_ACCESS_KEY_ID": "AKIAXWB5RURMCE66WOO7",
    "AWS_SESSION_TOKEN": "8Ea9jopxVmX92LL1cJi3zkfUq7ZPMOWiKa4oZiRC",
    "JIRA_API_USERNAME": "qe@plutora.com",
    "JIRA_API_PASSWORD": "Plut0r@R@"
}
```
* (*Optional*) Install other browsers such as **Firefox** and **Edge** (Not the drivers! Cypress will automatically detect these browsers) if you want to use the command `--browser firefox` (Check other [supported browsers](https://docs.cypress.io/guides/guides/launching-browsers.html#Browsers))
* (*Optional*) [Remove older versions of Cypress and clean up node](https://glebbahmutov.com/blog/cleaning-up-space/)

Detailed guide: https://docs.cypress.io/guides/getting-started/installing-cypress.html

### Tagging
Tagging has been included to allow easy selections of tests to run. This is achieved by including the `CYPRESS_INCLUDE_TAGS` on the command line and adding a tag on the `describe` and/or `it` title of the test / spec files (e.g. `describe(['release'], 'Integration: Releases (Enterprise)'` ; `it(['smoke'], 'Create Release'`)

This can be parameterised via Octopus or Bitbucket repository variables.
If the whole test suite needs to be executed then simply enter `CYPRESS_INCLUDE_TAGS=` without any tags.

The following tags are available so far:
<br>build
<br>change
<br>dp
<br>environment
<br>customization
<br>settings
<br>release
<br>system
<br>tebr
<br>tecr
<br>pir
<br>smoke
<br>*blank* (if whole test suite needs to be executed)

#### Execute specific environment, test suite & browser, tags
* Command to run on specific environment: `cypress_version=sit-us npx cypress run`
* Command to run specific test: `npx cypress run --spec "cypress/tests/api/admin-story.js"`
* Command to run on specific browser: `npx cypress run --browser chrome`
* Command to run tests with specific tags: `CYPRESS_INCLUDE_TAGS=smoke npx cypress run`

Note: Detailed guide: https://docs.cypress.io/api/plugins/configuration-api.html#Switch-between-multiple-configuration-files

### Running on CI
This repository uses *Bitbucket pipeline* as its CI tool via [bitbucket-pipelines.yml](bitbucket-pipelines.yml).
Note: The commands / scripts inside the `yml` file can still be applied to other CI pipelines such as Jenkins

Detailed guide: https://plutora.atlassian.net/wiki/spaces/TECHNOLOGY/pages/749961532/Running+automated+tests+on+CI+pipeline

## Environment variables
Environment variables are stored via config files (`../config/{env}.env.json`) - defaulted to `demo.plutora.org` (SIT) but can be configured in CLI command `cypress_version=qa-orange-demo.plutora.org'`. If the environment is not under `config` folder or on the list below, then it should be created (duplicate from existing environment) and creating a `quality.admin@7awdq3dr.mailosaur.net` account with admin credentials (this is one-off so it is ideal to do it manually instead of including in automation suite).

| Env | File |
| ----- | ----- |
| qa (mod) | qa-white-demo.plutora.org |
| qa (gct) | qa-orange-demo.plutora.org |
| qa (wao) | qa-red-demo.plutora.org|
| qa (cf) | qa-green-demo.plutora.org |
| sit | demo.plutora.org |
| uat au | demoau.plutora.net |
| prod au | demoau.plutora.com |
| prod eu | demoeu.plutora.com |
| prod uk | demouk.plutora.com |
| prod us | demous.plutora.com |

### Pre-conditions / Test data generation
Following the concept of [deterministic tests](https://martinfowler.com/articles/nonDeterminism.html#WhyNon-deterministicTestsAreAProblem), test data are created per run-time and environment. As such, the `before` hook has been included in the `cypress/support/index.js` folder with functions that write the auto-generated data into `cypress/fixtures/data.json` file. Each tests / spec files can then read the data from this file when required.
### Framework / Folder structure
```
.
+-- cypress
|   +-- fixtures # static data that can be used globally
|   +-- pages # page object models
|   +-- plugins # enables modification or extension of cypress' internal behaviour
|   +-- support # custom command helpers (adding a new .js class requires importing into index.js)
|   +-- tests # runnable test scripts
+-- config # environment variables (e.g. domain names, test users, etc.)
```

## Troubleshooting
The power of Cypress is the time travel capability to see which step actually caused an error.
Video recording and screenshots of test failures are captured automatically (no scripts required)
Detailed guide: https://docs.cypress.io/guides/core-concepts/test-runner.html#Command-Log

Debugger guide: https://docs.cypress.io/guides/guides/debugging.html#Debug-just-like-you-always-do

## Reporting
By default, the reporting tool under `cypress.json` is set to `junit` where it generates a `junit.xml` report whenever the `npx cypress run` command is executed (regardless if done on local machine or CI server). This is what the CI tool (Bitbucket) reads to display the no. of failures against the no. of total tests. However, you can change the report into a fancier one by using `mochawesome` (and its relevant report options) under `reporter.json` and overwrite the details into `cypress.json`. However, it is recommended to use this only on local machines.

## Components / Packages
### cypress core
javascript automation framework used for e2e tests with built-in smart waits and test results
### cy-api
HTTP API testing with server logs and rendering of request/response on the application frame
### cypress-axe
accessibility tests
### cypress-mailosaur
allows automation of email verification (content, subject, etc.)
### cypress-multi-reporters
allows generation of multiple test reports such as junit (`cypress-junit-reporter`) and html (`mochawesome`)
## cypress-testing-library
allows easier capture of DOM elements and usage of `cy.findByTestId` for selectors with the attribute `data-testid`
### faker
generates massive amounts of fake data with different categories
### percy
visual regression tests (https://percy.io/7682cceb/tests-planning)
### cypress-localstorage-command (usage via data-provider)
`data-provider` and `data-provider-legacy` are used to make run-time faster.
Create js file with name "data-provider" (the idea is to have separate files for every module).
Create methods in data-provider files which need to be executed as a preconditions in test suite in "before" hook.
Keep in mind that data provider can be used ```only in "before" hooks```. 
All methods will be run async so if you need to run it one by one (as a dependency),it is better to do as a chain or promise or put in several befores.
In data-provider there is a condition to check if something exists -> pick up value from storage and other part of test from data-provider will not be executed (e.g if project id exists no need to POST API request to create it again). 
If you want to use some data (like id parametr) from response please put it to the model in data-provider file.
If you want to clean local storage every test just comment ```Cypress.LocalStorage.clear``` out in index file.

## Known issues / Gotchas
* If a *missing package error* is encountered when running Cypress, install the specific package with command `npm i <package name> --save-dev` even if it is already included in `package.json` (e.g. `npm i fs-extra --save-dev`)
* `Chrome-error//chromewebdata` error might be encountered depending on the site (Open issue: https://github.com/cypress-io/cypress/issues/4220). Workaround is to use a different browser (or run headless)
* If you get `Your IP is blocked...` error message running the API tests, you need to go to the ***UI > Customization > API- IP Whitelisting*** then disable ALL IP entries OR add and enable your IP address
* Other script-related issues can be raised via Bitbucket > [Jira issues](https://bitbucket.org/plutora/tests-functional/jira)

## TODO / Tech debt
* Encrypt multiple data via Bitbucket Pipeline variables or AWS secrets manager
* Include in release / deployment of code pipelines
* Include `cypress-axe` for accessibility tests
* ~~Activate the `cypress-code-coverage`~~ (This is a separate repo from the app `src`)
* Integrate with ~~Slack~~, JIRA & XRAY (auto-create of test scripts)
* Include `renovatebot` to automate upgrading of npm dependencies
* Include different roles / permissions to access functionalities
* Review data cleanup from automated tests