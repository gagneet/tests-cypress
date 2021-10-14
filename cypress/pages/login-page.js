const loginUrl = Cypress.env().baseUrl;
// e.g. https://qa-orange-demo.plutora.org

export const loginPageModel = {
  url: loginUrl,
  userInput: '[id="username"]',
  passwordInput: '[id="password"]',
  loginSso: 'a.btn.btn-primary.ng-scope',
  login: '[value="Login"]'
};