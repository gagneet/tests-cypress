const pirUrl = Cypress.env().baseUrl + '/pir';
// e.g. https://qa-orange-demo.plutora.org/pir

export const pIRManagerPageModel = {
  url: pirUrl, // e.g. https://qa-orange-demo.plutora.org/pir
  pirSummaryLink: '[data-columnid="summary"]'
};

export const pirModalModel = { // PIR modal
  summaryInput: '[name="Summary"]',
  descriptionInput: '[name="Description"]',
  typeList: '[name="TypeID"]',
  statusList: '[name="StatusID"]',
  saveBtn: '.x-btn-inner-default-small:contains(Save):first',
  pirWindow: '.pirItemWindow'
};