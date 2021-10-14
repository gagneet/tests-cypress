# Contributing to Plutora's automation framework

Thanks for taking the time to contribute! 🤩

**Once you learn how to use this [framework](./README.md), you can contribute in many ways:**

- Join the [#qa-team Slack channel](https://plutora.slack.com/archives/G3CGMNZCK) where we provide a safe space for anyone to ask questions.
- Visit the [QA / Testing Confluence space](https://plutora.atlassian.net/wiki/spaces/TECHNOLOGY/pages/37355555/QA+Testing) and you might be interested on our ways of working.
- Check external resources such as [this](https://testautomationu.applitools.com/cypress-tutorial/) and [this](https://testautomationu.applitools.com/cypress-tutorial/) to learn more about Javascript and Cypress.
- Read the comprehensive [Cypress documentation](https://docs.cypress.io/) most especially their [best practices](https://docs.cypress.io/guides/references/best-practices.html#article).
- Refer to [Cheat sheets](https://cheatography.com/aiqbal/cheat-sheets/cypress-io/) and don't be ashamed to use Stackoverflow if the team is unable to help you.
- Tweet [Cypress team](https://twitter.com/Cypress_io) or send queries on [Gitter](https://gitter.im/cypress-io/cypress) if in really desperate mode as engineers such as [@bahmutov](https://twitter.com/bahmutov) is quite active on those sites.

**Want to dive deeper into how automation works? There are several ways you can help with the development of of this framework:**

- [Report bugs](https://bitbucket.org/plutora/tests-functional/jira) by opening an issue.
- [Please thoroughly read our writing code guide](#writing-code) to address issues or improve the structure.

## Table of Contents

- [Folder structure](#folder-structure)
- [IDE](#ide)
- [Development approach](#development-approach)
- [Writing code guide](#writing-code-guide)
- [Attribute selectors](#attribute-selectors)
- [Plugins](#plugins)
- [Dependencies](#dependencies)
- [Data-provider](#data-provider)
- [Branching model](#branching-model)
- [Pull requests & Push to master](#pull-requests-and-push-to-master)
- [CI pipeline](#ci-pipeline)

### Folder structure
We like clean code with less complexity and try to mirror as much as possible to the default [Cypress framework](https://docs.cypress.io/guides/core-concepts/writing-and-organizing-tests.html#Folder-Structure) so new starters have easier learning curve.
```
.
├── cypress
|   ├── fixtures
|   ├── pages
|   ├── plugins
|   ├── support
|   └── tests
|       └── e2e
|       └── integration
|       └── visual
└── config
```
- `fixtures`: static data that can be used globally.
- `pages`: page object models.
- `plugins`: enables modification or extension of cypress' internal behaviour.
- `support`: custom command helpers (adding a new javascript class requires importing into `index.js`).
- `tests/e2e`: executable scripts for end-to-end tests (user flow).
- `tests/integration`: executable scripts for integration / service tests (api's).
- `tests/visual`: executable scripts for visual regression tests (user interface).
- `config`: environment variables (e.g. domain names, test users, etc.).

### IDE
*WIP* VS Code plugins https://docs.cypress.io/guides/tooling/IDE-integration.html#File-Opener-Preference

### Development approach
A Dev approach in test automation??? 😳 Yes, we do and why not since it builds up good practices. Although its mostly used for `unit tests`, we still recommend **Test-driven development** (TDD) when writing test scripts. Here's a detailed [write-up](https://blog.cleancoder.com/uncle-bob/2014/12/17/TheCyclesOfTDD.html) from Uncle Bob. **TL;DR**: Write a failing test until it passes, and then, *re-factor* (this last step is very important to make the code cleaner, readable, and re-usable).

### Writing code guide
*WIP* eslint, code-coverage, etc., DRY, DAMP, YAGNI, Include TODO
Javascript code should follow the [Airbnb style guide](https://github.com/airbnb/javascript)

Suggested Test script naming:
Non-API: <region (optional)>-<role>-<action in present tense>
API: <region (optional)>-<role>-<endpoint>

Bypass UI authentication via auth token if you are not testing the login (usage of `cy.login(token)`)
Bypass UI navigation by visiting the specific URL sub-domain and/or sub-directory (e.g. https://home.plutora.org/environments/tecr/new)

Following DRY principles, custom (global) commands have been created and ready for re-use (e.g. `cy.findByTextThenClick`, `cy.selectByText`, `cy.saveAndClose`). Ensure that you search if the command exists before creating a new one to avoid duplication.

Include tagging where possible so there is more flexiblity in running specific tests or test suite (e.g. `describe(['release'], 'Integration: Releases (Enterprise)'` ; `it(['smoke'], 'Create Release'`)

### Attribute selectors
*WIP* use of `data-testid`
via source code (Devtools), chrome cypress plugin, cypress runner selector playground

### Plugins
While we have attempted to install the necessary plugins to make our framework robust, Cypress team has recommended a set of (plugins)[https://docs.cypress.io/plugins/index.html] for use. Since it runs on NodeJS, nothing is stopping anyone to install additional [NodeJS packages](https://www.npmjs.com/) to make coding much easier.

Note: Run `npm audit` to ensure that there are no security vulnerabilities introduced by the installed plugins.

### Dependencies
We are planning to use [renovatebot](https://github.com/renovatebot/renovate) to automate this process. However, since this bot runs on a schedule, check outdated plugins by running the command `npm outdated` then feel free to upgrade versions by simply installing the plugin again (Don't forget to include `--save-dev`)

### Data-provider
We can use data-provider to decrease running test time. Information from data-provider can be used across all tests. Please go to [README](./README.md)

### Branching model
*WIP* Scaled trunk-based development with minimal long-lived `master` branch. There is still a Pull requests for peer review but it should be done in **small batches** for the reasons below:
- **Fast feedback**. The faster you get feedback on the correctness of your work, the less time you’ll spend reworking any mistakes. The further you go down a wrong path, the more painful it will be to adjust later–and those adjustments might be incorrect too.
- **Less risk**. The smaller the batch, the smaller the blast radius. Ideally, if something breaks, you want it to be the only thing that is deployed in that batch. That makes debugging much easier–often trivial–because there are no potential interactions with unrelated changes. It’s also much easier to roll back the change.

### Pull requests and Push to master
Before making a PR or even before making a commit locally, it is advisable to run all tests (`npm cypress run`) to ensure nothing was broken.
Don't forget to update the documentations such as [README](./README.md) and this if required!
We use [Semantic Commit Messages](https://medium.com/dev-genius/make-a-meaningful-git-commit-message-with-semantic-commit-message-b39a79b13aa3)

Format: `<type>(<scope>): <subject>`

`<scope>` is optional (e.g. JIRA ticket no.)

Example
```
feat (GCT-1575): add hat wobble
^--^ ^--------^  ^------------^
|                |
|                +-> Summary in present tense.
|
+-------> Type: chore, docs, feat, fix, refactor, style, or test.
```

More examples:

- `feat`: (new feature for the user, not a new feature for build script)
- `fix`: (bug fix for the user, not a fix to a build script)
- `docs`: (changes to the documentation)
- `style`: (formatting, missing semi colons, etc; no production code change)
- `refactor`: (refactoring production code, eg. renaming a variable)
- `test`: (adding missing tests, refactoring tests; no production code change)
- `chore`: (updating grunt tasks etc; no production code change)