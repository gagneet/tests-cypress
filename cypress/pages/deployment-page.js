const deploymentUrl = Cypress.env().baseUrl + "/deployment";
// e.g. https://qa-orange-demo.plutora.org/release

export const deploymentPageModel = {
  url: deploymentUrl,
  liveSearch: '[name="liveFilterLibrary"]',
  updateStakeholderWindow: '.deploymentPlanWindow',
  addStakeholderBtn: '.secondary-btn',
  queryBuilderButton: '.query-builder-button',
  queryBuilderWindow: '.x-window-default-closable',
  queryConditionInput: '[class="x-form-field x-form-required-field x-form-text x-form-text-default  x-form-focus x-field-form-focus x-field-default-form-focus"]',
  dPContainer: '.x-grid-item',
  dPName: '.deploymentPlanLink',
  dPLeftTab: '.x-tab-left',
  dPWindow: '.planDetailWindow ',
  dPInput: '[placeholder="Search Deployment Plan"]',
  dPCheckBox: '.x-grid-row-checker',
  dPCheckAllBox: '.x-column-header-checkbox',
  dPExternalInput: '[name="ExternalIdentifier"]',
  nameInput: '[name="Name"]',
  stakeholderNameInput: '[name="UserID"]',
  systemInput: '[name="SystemIDs"]',
  systemListContainer: '.multiSelList',
  releaseInput: '[name="ReleaseID"]',
  newBtn: '.x-btn-inner-default-small:contains("New")',
  addDPBtn: '.lpAddMenuItem',
  saveBtn: '.x-btn-inner-default-small:contains("Save"):first',
  activityName: '.activity-link',
  activityWindow: '.activity-slide-panel',
  responsibleInput: '[name="ResponsibleID"]',
  broadcastSwitch: '.broadcast-switch',
  broadcastDurationInput: '[name="BroadcastDurationMinInput"]',
  broadcastSendBtn: '.broadcast-send-button',
  mdPWindow: '.masterDeploymentPlanWindow',
  mdPName: '.masterDeploymentPlanLink',
  portfolioInput: '[name="OrganizationID"]',
  auditBtn: '.audit-header-btn',
  auditWindow: '#auditHistoryWindow',
  filterSelect: '[class="x-field facelift-combobox x-form-item x-form-item-default x-form-type-text x-box-item x-field-default x-hbox-form-item x-form-item-no-label"]',
  messageBox: '.x-message-box',
  gridBtn: '.lftCorner',
  activitySetNameInput: '[placeholder="Enter new activity set name"]',
  activitySetInActivity: '[name="ActivitySetsIds"]',
  revisedStartDateInput: '[name="RevisedStartTime"]',
  revisedEndDateInput: '[name="ActualDateTimeCompleted"]',
  startDateDownTime: '[name="StartDateTimeDowntime"]',
  endDateDownTime: '[name="EndDateTimeDowntime"]',
  applySelectedDateBtn: '.facelift-date-time-picker-doneButton',
  startDateTimePlanned: '[name="StartDateTimePlanned"]',
  endDateTimePlanned: '[name="EndDateTimePlanned"]',
  exportToXLSBtn: '.pendo-deploymentPlanExportToXLSXButton',
  commentInput: '[contenteditable="true"]'
};

export const activityByStatusPageModel = {
  url: deploymentUrl + '/activitiesByStatus',
};