const environmentUrl = Cypress.env().baseUrl + '/environment';
// e.g. https://qa-orange-demo.plutora.org/environment

export const environmentGroupPageModel = {
  url: environmentUrl + '/groups' // e.g. https://qa-orange-demo.plutora.org/environment/groups
};

export const environmentBuildsPageModel = {
  url: environmentUrl + '/builds', // e.g. https://qa-orange-demo.plutora.org/environment/builds
  buildNumberInput: '[placeholder="Enter build number"]',
  newBuildBtn: '.plt__button--secondary',
  buildWindow: '.plt__modal__background',
  manualBtn: '.plt__togglebutton:first'
};

export const environmentSystemsPageModel = {
  url: environmentUrl + '/systems', // e.g. https://qa-orange-demo.plutora.org/environment/systems
  name: '[placeholder="Enter name"]',
  bulkName: '[name="Name"]',
  editName:
    '[class="plt__breadcrumb__title__inner__content truncate-ellipsis"]',
  systemLink: '[class="plt__grid__cell__clickable"]',
  vendorName: '[placeholder="Enter vendor name"]',
  aliasInput: '[placeholder="Add new alias and press enter"]',
  checkBox: '[type="checkbox"]',
  innerButton: '.x-btn-inner',
  popUpDeleteButton: '[id="yes"]',
  portfolioAssociation: '[placeholder="Search"]',
  duplicateSystemNameInput: '[name="oldSystemName"]',
  searchFilter: '[placeholder="Filter"]',
  gridCell: '.plt__grid__cell__clickable',
  bulkUpdate:
    '[class="plt__icon plt__l--Bulk_Update plt__icon--medium plt__demo__grid__abovebar__iconmargin"]'
};

export const environmentManagerPageModel = {
  url: environmentUrl, // e.g. https://qa-orange-demo.plutora.org/environment
  environmentNameLink: '.fakeLink',
  dateRangeStartDateInput: '[name="dateRangeStartDate"]',
  dateRangeEndDateInput: '[name="dateRangeEndDate"]',
  filterSelect:
    '[class="x-field facelift-combobox x-form-item x-form-item-default x-form-type-text x-box-item x-toolbar-item x-field-default x-hbox-form-item x-form-item-no-label"]',
  queryColumn: '.x-form-arrow-trigger-default:first',
  queryCondition: '.x-form-arrow-trigger-default',
  queryValueInput:
    '[class="x-form-field x-form-required-field x-form-text x-form-text-default  x-form-focus x-field-form-focus x-field-default-form-focus"]'
};

export const environmentMapPageModel = {
  url: environmentUrl + '/map', // e.g. https://qa-orange-demo.plutora.org/environment/map
  searchInput: '[name="EnvironmentMapGroupIDs"]',
  // expandButton: '[class="x-tool-img x-tool-expand-left"]',
  // collapseButton: '[class="x-tool-img x-tool-collapse-right"]',
  expandCollapseButton:
    '[class="x-btn collapse-btn x-unselectable x-box-item x-btn-default-small x-btn-before-title"]',
  emptyMap: '[id="environmentGroupIsEmpty"]',
  environmentMapButton: 'image.mapItems',
  emptyRightPanel: '[class="environment-map-right-panel-placeholder"]',
  rightPanelNameText:
    '[class="x-form-field x-form-text x-form-text-default  "]',
  rightPanelEnvNameText:
    '[class="x-panel environmentMapDetailValue environmentMapName x-box-item x-panel-default"]',
  rightPanelSystemBuildText:
    '[class="x-panel environmentMapDetailValue x-box-item x-panel-default"]',
  rightPanelIconList: '[name="Icon"]',
  rightPanelIconSelect: '[class="environment-icon"]',
  rightPanelClipboardButton:
    '[class="x-img leftPanelCopyTreeButton x-box-item x-img-default x-img-after-title"]',
  resetPositionButton: '[data-qtip="Reset Position"]'
};

export const environmentModalModel = {
  // Environment modal
  nameInput: '[name="Name"]',
  descriptionInput: '[name="Description"]',
  systemList: '[placeholder="Select System"]',
  buildList: '[name="BuildId"]',
  integratedWithList: '',
  urlInput: '[name="URL"]',
  usedForPhaseList: '[placeholder="Select Phase"]',
  schedulerDisplayList: '[name="Color"]',
  vendorInput: '[name="Vendor"]',
  statusList: '[placeholder="Select Status"]',
  iconList: '[name="Icon"]',
  environmentList: '[data-ref="itemList"]',
  sharedEnvironmentCheckbox:
    '[class^="x-form-field x-form-checkbox x-form-checkbox-default x-form-cb x-form-cb-default  "]',
  automaticallyApprovedCheckbox:
    '[class^="x-form-field x-form-checkbox x-form-checkbox-default x-form-cb x-form-cb-default  "]',
  displayBookingAlertCheckbox:
    '[class^="x-form-field x-form-checkbox x-form-checkbox-default x-form-cb x-form-cb-default  "]',
  messageInput: '[name="BookingAlertMessage"]',
  addHostButton: '',
  addLayerButton: '',
  addComponentButton: '',
  updateOnBuildButton: '',
  viewStackButton: '',
  contactStakeholdersButton: '',
  addStakeHolderButton: '',
  removeButton: '',
  environmentGroupInput: '[name="GroupIDs"]'
};

export const environmentRequestsPageModel = {
  url: environmentUrl + '/requests', // e.g. https://qa-orange-demo.plutora.org/environment/requests
  metricsUpButton: '[class="x-tool-img x-tool-collapse-top"]',
  metricsDownButton: '[class="x-tool-img x-tool-expand-bottom"]',
  searchInput: '[name="liveFilterAllocationRequest-inputEl"]',
  bookingTab: '.x-tab-bar-body>div:nth-child(2)>div>a:nth-child(3)',
  envApproversList: '.plt__dropdown__menuitem__label',
  selectAllEnv: '.x-column-header-inner-empty',
  selectNewStartDates: '[placeholder="Select new start date"]',
  selectNewEndDates: '[placeholder="Select new end date"]',
  bulkUpdateButton: '.environmentRequestsBulkUpdateAction',
  warningText: '.helperText',
  shiftDaysInput: '[name="ShiftDateValue"]',
  endDateError: '.x-status-error-list>ul>li>a',
  cancelButton: '.x-tool-close',
  columnName: '[data-columnid="columnAllocationReleaseName"]',
  auditButton: '.facelift-window-action-btn:nth-child(3)',
  modifiedBadge: '[class= "timeline-badge Modified"]',
  actionBtn: 'a.x-btn.btn.btn-default:nth-child(4)',
  clearGridFilterBtn:
    'div.x-menu-item.environmentRequestsClearGridColumnFilteringAction.x-menu-item-default.x-box-item:nth-child(5)'
};

export const environmentSchedulePageModel = {
  environmentScheduleWindow: '.environmentScheduler',
  schedulerView: '[id^="viewAsSchedulerView"]',
  schedulerDatePicker: '[id^="dateRangePicker"]',
  startDateContainer: '.startDateContainer',
  schedulerFilter: '.facelift-filter-btn',
  environmentFilterWindow: '.windowEnvironmentFilterCls'
};

export const tebrPageModel = {
  environmentLiveSearch: '[placeholder="Live Search"]',
  environmentGroupHeader: '.environmet-group-header',
  environmentDropzone: '.x-grid-item-container:nth-child(1)'
};

export const tecrPageModel = {
  titleInput: '#textfield-1085-inputEl',
  releaseNameSelect: '#customTreePicker-1086-inputEl',
  releaseNameSelectList: '#ext-element-8',
  typeSelect: '#combobox-1088-inputEl',
  typeSelectList: '#boundlist-1180-listEl',
  statusSelect: '#combobox-1089-inputEl',
  descriptionTextBox: '#htmleditor-1105-inputCmp',
  assigneeSelect: '#avatarSingleSelectComboWithLocalSearch-1025-inputWrap',
  addEnvironmentButton: '#button-1149-btnInnerEl',
  saveAndCloseButton: '#button-1167-btnInnerEl'
};

export const environmentHealthCheckPageModel = {
  url: `${environmentUrl}/healthCheckDashboard`,
  environmentName: '.environment-field-first',
  queryBuilderColumnDropdownSelector: '.x-form-type-text',
  queryBuilderDropdownOptionsSelector: '.x-boundlist-list-ct',
  queryBuilderValueSearchSelector:
    ".x-form-field.x-form-required-field[role='textbox'",
  legendPopoverSelector: 'body > section[id^="popover"]'
};
