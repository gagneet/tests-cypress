const loginUrl = Cypress.env().baseUrl;
// e.g. https://qa-orange-demo.plutora.org

export const storiesPageModel = {
  url: loginUrl + '/planning/stories',
  searchInput: '[data-testid="stories-search"]',
  statusText: '[data-testid="status"]',
  priorityText: '[data-testid="priority"]',
  typeText: '[data-testid="type"]'
};

export const storyDetailsPageModel = {
  searchFieldInput: '[data-testid="custom-fields-search"]',
  customFieldTitleText: '[data-testid="Text"][class="css-16s8pjp"]',
  customFieldPriorityValueText: '[data-testid="custom-field-priority"]',
  customFieldTypeValueText: '[data-testid="custom-field-type"]',
  customFieldStatusValueText: '[data-testid="custom-field-status"]',
  linkedItemsTab: '[data-testid="tab-linked-items"]',
  linkedItemsTabOverallNumber: '[data-testid="overall-number-linked-items"]',
  linkedItemsReleasesOverallNumber: '[data-testid="release-number-linked-items"]',
  linkedItemsSystemsOverallNumber: '[data-testid="system-number-linked-items"]',
  linkedItemsLiveSearch: '[placeholder="Search by ID or Name"]',
  linkedItemsSystemLiveSearch: '[placeholder="Search by Name"]',
  linkedItemsEntitySummaryBox: '[data-testid="EntitySummary"]',
};