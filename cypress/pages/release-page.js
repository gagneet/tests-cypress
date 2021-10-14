const releaseUrl = Cypress.env().baseUrl + '/release';
// e.g. https://qa-orange-demo.plutora.org/release
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

export const releasePageModel = {
  url: releaseUrl, // e.g. https://qa-orange-demo.plutora.org/release
  nameInput: '[name=Name]',
  identifierInput: '[name="Identifier"]',
  releaseTypeInput: '[name="ReleaseTypeID"]',
  riskLevelInput: '[name="RiskLevelID"]',
  impDateInput: '[name="ImplementationDate"]',
  newReleaseBtn: '.release-add-new-btn',
  addReleaseBtn: '.menu-item-right',
  releaseWindow: '.facelift-window',
  queryBuilderBtn: '.query-builder-button',
  actionBtn: '.release-action-btn',
  clearGridFilterBtn: '.release-clear-grid-filter-btn',
  selectAllRelease: '.x-column-header-checkbox',
  duplicateBtn: '.release-duplicate-release-btn',
  duplicateWindow: '.duplicate-release-window',
  deleteBtn: '.release-delete-btn',
  deleteWindow: '.bulk-delete',
  releaseNameLink: '.release-name-column-item > .fakeLink',
  selectItem: '[class="release-name-column-item"]',
  favBtn: '.facelift-window-action-btn:last',
  saveClose: 'Save & Close',
  validateSave: 'Your changes have been saved',
  tabButtons: {
    baseTab: '.release-detail-tab-btn',
    analytics: '.release-analytics-tab-btn',
  },
};

export const releaseModalModel = {
  typeList: '[name="ReleaseTypeID"]',
};

export const changePageModel = {
  url: releaseUrl + '/changes',
  changeNameColumn: '.x-grid-cell-ChangeNameColumn',
  searchInput: '[placeholder="Live Search"]',
  nameInput: '[name=Name]',
  themeInput: '.changeWindowtopPanelThemeID',
  deliveryRiskInput: '[name="DeliveryRiskID"]',
  priorityInput: '[name="PriorityID"]',
  duplicateWindow: '.duplicate-change-window',
};

export const changeModalModel = {
  changeTab: '[class="change-tab-title"]',
  nameInput: '[name=Name]',
  descriptionInput: '[class="x-htmleditor-iframe"]',
  newAttachmentButton:
    '[class="x-btn-icon-el x-btn-icon-el-default-toolbar-small attachmentsMenuIcon "]',
  newAttachmentList: '[class="x-btn-inner x-btn-inner-default-small"]',
  addURLButton: '[name="addURL"]',
  addFileButton: '[name="uploadfile"]',
};

export const blockoutPageModel = {
  url: releaseUrl + '/blockouts',
  name: '[name="Name"]',
  envNameInput: '[name="EnvironmentIds"]',
  startDateInput: '[name="StartDate"]',
  startPlaceholder: '[placeholder="Select Start Date"]',
  endDateInput: '[placeholder="Select End Date"]',
  envGroupNameInput: '[name="EnvironmentGroupIds"]',
  columnIdName: '[data-columnid="BlockoutName"]',
  calendar: '.facelift-date-time-picker',
  calendarDoneBtn: '.facelift-date-time-picker-doneButton',
  addAttachmentBtn: '#addAttachmentLink',
  attachmentWindow: '.attachments-window',
  attachmentMenuBtn: '.attachmentsMenuButton',
};

// export const releaseManagerPageModel = {
//   url: environmentUrl, // e.g. https://qa-orange-demo.plutora.org/environment
//   releaseNameLink: '[data-columnid="columnReleaseName"]',
//   dateRangeStartDateInput: '[name="dateRangeStartDate"]',
//   dateRangeEndDateInput: '[name="dateRangeEndDate"]'
// };

// const environmentUrl = Cypress.env().baseUrl + '/environment';
// // e.g. https://qa-orange-demo.plutora.org/environment

// export const environmentGroupPageModel = {
//   url: environmentUrl + '/groups', // e.g. https://qa-orange-demo.plutora.org/environment/groups
// };

// export const environmentSystemsPageModel = {
//   url: environmentUrl + '/systems', // e.g. https://qa-orange-demo.plutora.org/environment/systems
// };

// export const environmentMapPageModel = {
//   url: environmentUrl + '/map', // e.g. https://qa-orange-demo.plutora.org/environment/map
//   searchInput: '[name="EnvironmentMapGroupIDs"]',
//   expandButton: '[class="x-tool-img x-tool-expand-left"]',
//   collapseButton: '[class="x-tool-img x-tool-collapse-right"]',
//   emptyMap: '[id="environmentGroupIsEmpty"]',
//   environmentMapButton: 'image.mapItems',
//   emptyRightPanel: '[class="environment-map-right-panel-placeholder"]',
//   rightPanelEnvNameText: '[class="x-panel environmentMapDetailValue environmentMapName x-box-item x-panel-default"]',
//   rightPanelSystemBuildText: '[class="x-panel environmentMapDetailValue x-box-item x-panel-default"]',
//   rightPanelIconList: '[name="Icon"]',
//   rightPanelIconSelect: '[class="environment-icon"]',
//   rightPanelClipboardButton: '[class="x-tool-img x-tool-copy"]',
//   resetPositionButton: '[data-qtip="Reset Position"]'
// };

// export const environmentModalModel = { // Environment modal
//   nameInput: '[name="Name"]',
//   descriptionInput: '[name="Description"]',
//   systemList: '[placeholder="Select System"]',
//   buildList: '[name="BuildId"]',
//   integratedWithList: '',
//   urlInput: '[name="URL"]',
//   usedForPhaseList: '[placeholder="Select Phase"]',
//   schedulerDisplayList: '[name="Color"]',
//   vendorInput: '[name="Vendor"]',
//   statusList: '[placeholder="Select Status"]',
//   iconList: '[name="Icon"]',
//   environmentList: '[data-ref="itemList"]',
//   sharedEnvironmentCheckbox: '[class="x-form-field x-form-checkbox x-form-checkbox-default x-form-cb x-form-cb-default  "]',
//   automaticallyApprovedCheckbox: '[class="x-form-field x-form-checkbox x-form-checkbox-default x-form-cb x-form-cb-default  "]',
//   displayBookingAlertCheckbox: '[class="x-form-field x-form-checkbox x-form-checkbox-default x-form-cb x-form-cb-default  "]',
//   messageInput: '[name="BookingAlertMessage"]',
//   addHostButton: '',
//   addLayerButton: '',
//   addComponentButton: '',
//   updateOnBuildButton: '',
//   viewStackButton: '',
//   contactStakeholdersButton: '',
//   addStakeHolderButton: '',
//   removeButton: '',
//   environmentGroupInput: '[name="GroupIDs"]'
// };

// export const environmentRequestsPageModel = {
//   url: environmentUrl + '/requests', // e.g. https://qa-orange-demo.plutora.org/environment/requests
//   metricsUpButton: '[class="x-tool-img x-tool-collapse-top"]',
//   metricsDownButton: '[class="x-tool-img x-tool-expand-bottom"]',
//   searchInput: '[name="liveFilterAllocationRequest-inputEl"]',
//   bookingTab: '.x-tab-bar-body>div:nth-child(2)>div>a:nth-child(3)',
//   envApproversList: '.plt__dropdown__menuitem__label',
//   selectAllEnv: '.x-column-header-inner-empty',
//   selectNewStartDates: '[placeholder="Select new start date"]',
//   selectNewEndDates: '[placeholder="Select new end date"]',
//   bulkUpdateBtn: '.environmentRequestsBulkUpdateAction',
//   warningText: '.helperText',
// };

// export const environmentSchedulePageModel = {
//   environmentScheduleWindow: '.environmentScheduler',
//   schedulerView: '[id^="viewAsSchedulerView"]',
//   schedulerDatePicker: '[id^="dateRangePicker"]',
//   startDateContainer: '.startDateContainer',
//   schedulerFilter: '.filter-button',
//   environmentFilterWindow: '.windowEnvironmentFilterCls'
// };
