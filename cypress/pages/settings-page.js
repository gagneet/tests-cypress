const settingsUrl = Cypress.env().baseUrl + '/settings';
// e.g. https://qa-orange-demo.plutora.org/settings

export const userManagementPageModel = {
  url: settingsUrl + '/userManagement', // e.g. https://qa-orange-demo.plutora.org/settings/userManagement
  addNewUserButton: 'Add New User',
  firstNameInput: '[name="FirstName"]',
  lastNameInput: '[name="LastName"]',
  emailAddressInput: '[name="Username"]',
  phoneNumberInput: '[name="PhoneNumber"]',
  locationList: '[name="Location"]',
  rolesList: '[name="Roles"]',
  validUntilDateInput: '[name="ValidUntilDate"]',
  searchFieldInput: '[role="combobox"]'
};

export const orgStructurePageModel = {
  url: settingsUrl + '/organizationStructure', // e.g. https://qa-orange-demo.plutora.org/settings/organizationStructure
  orgText: '[class="x-grid-cell-inner x-grid-cell-inner-treecolumn"]',
  addButton: 'x-btn btn btn-default btn-small x-unselectable x-box-item x-toolbar-item x-btn-default-toolbar-small',
  orgNameInput: '[name="name"]',
  directorInput: '[name="directorUserId"]',
  deleteButton: '[class="x-btn-inner x-btn-inner-default-small"]'
};


export const customizationPageModel = {
  url: settingsUrl + "/customization", // e.g. https://qa-orange-demo.plutora.org/settings/customization
  navigationTab: '.x-grid-item-container > table:nth-child(135) > tbody > tr > td > div',
  formBuilderButton: 'Form Builder', // TODO: Decide if this needs to be here or per specs/tests (DAMP principle)

  checkboxUnchecked: '[class="x-form-field x-form-checkbox x-form-checkbox-default x-form-cb x-form-cb-default  "]',
  checkboxChecked: '[class="x-form-field x-form-checkbox x-form-checkbox-default x-form-cb x-form-cb-default  x-form-checkbox-focus x-field-form-checkbox-focus x-field-default-form-checkbox-focus"]'
};

export const emailNotificationPageModel = {
  nameInput: '[name="Name"]',
  descriptionInput: '[name="EmailDescription"]',
  statusList: '[name="Status"]',
  entityList: '[name="Entity"]',
  triggerList: '[name="Trigger"]',
  subjectInput: '[name="EmailSubjectLine"]',
  fromInput: '[name="SenderEmail"]',
  aliasInput: '[name="SenderAlias"]',
  bodyInput: '[name="EmailBody"]',
  sendToSpecifiedRecipientsInput: '[name="SendToSpecifiedRecipients"]',
  nextButton: 'Next >>',
  backButton: '<< Back'
};

export const iMFormBuilderPageModel = {
  formNameInput: '.form-name',
  newFormButton: '+ New Form',
  allowStatusCheckbox: '.form-allow-status',
  statusButton: '.form-statuses-selector-button',
  newStatusButton: '+ new',
  allowWorkflowCheckbox: '.form-allow-workflow',
  workflowButton: '.form-select-workflow-button',
  newWorkflowButton: '+ New Workflow',
};

export const iMMenuSetupPageModel = {
  newMenuInput: "[name='text']"
};

export const integrationHubPageModel = {
  jobName: "AutomationCypressScriptForStories",
  offToggleButton: "span.off",
  onToggleButton: "span.on",
};

export const myActivitiesPageModel = {  // e.g. https://help.plutora.com/knowledge-base/navigation-menu-features/ 
  myActivitiesIcon: '.plt__l--Activity',
  tab: '[class="x-tab-inner x-tab-inner-default"]',
};
