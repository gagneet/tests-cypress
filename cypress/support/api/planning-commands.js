const apiUrl = Cypress.env().baseUrl + '/api';
const projectsUrl = apiUrl + '/settings/projects'; // e.g. https://qa-orange-demo.plutora.org/api/settings/projects
const storiesUrl = apiUrl + '/planning/stories'; // e.g. https://qa-orange-demo.plutora.org/api/planning/stories

const customFieldsUrl = apiUrl + '/settings/customfields'; // e.g. https://qa-orange-demo.plutora.org/api/settings/customfields
const customFieldOptionsUrl = apiUrl + '/settings/customfield'; // e.g. https://qa-orange-demo.plutora.org/api/settings/customfield

const vsfmsUrl = apiUrl + '/metrics/vsfm'; // e.g. https://qa-orange-demo.plutora.org/api/metrics/vsfm

const linkedItemsUrl = apiUrl + '/linkedItems'; // e.g. https://qa-orange-demo.plutora.org/api/linkeditems

Cypress.Commands.add('projects', (method, url, data) => { // api for projects
    let body = '';
    if(method != 'GET'){
      body = {
        'Name': data.projectName,
        'Code': data.projectName
      };
    }
    return cy.api({
        method: method,
        url: projectsUrl + url,
        auth: {
          bearer: data.token
        },
        headers: {
          'Content-Type': 'application/json'
        },
        body,
        failOnStatusCode: false // test all status codes
    });
});

Cypress.Commands.add('stories', (method, url, data) => { // api for stories
  let body = '';
  // if(!url.includes('filters')) { // GCT-1717: only endpoints with "filters" should contain [] body
  if(method != 'GET'|| !url.includes('filters')){
    body = {
      'Name': data.storyName,
      'ProjectId': data.projectId,
      'ExternalId': data.externalId,
      'Description': data.description,
      'ValuePoints': data.valuePoint,
      'EffortPoints': data.effortPoint,
      'AssigneeId': data.assigneeId,
      'AssigneeType': data.assigneeType,
      'Status': data.status,
      'Type': data.type,
      'Priority': data.priority,
      'WorkType': data.workType,
      'OrganisationId': data.organisationId,
      'ReleaseDate': data.releaseDate,
      'Schedule': data.schedule,
      'TimeTracking': data.timeTracking,
      'Progress': data.progress
    };
  }
  return cy.api({
      method: method,
      url: storiesUrl + url,
      auth: {
        bearer: data.token
      },
      headers: {
        'Content-Type': 'application/json'
      },
      body,
      failOnStatusCode: false // test all status codes
  });
});

Cypress.Commands.add('customFields', (method, url, data) => { // api for custom fields
  let body = '';
  if(!url.includes('GetDefaultFields')){
    body = {
      'Type': data.type,
      'Name': data.name,
      'IsVisible': data.isVisible,
      'IsRequired': data.isRequired,
      'IsFixed': data.isFixed,
      'IsList': data.isList,
      'SortOrder': data.sortOrder,
      'DefaultValue': data.defaultValue,
      'Options': data.options // should return an array
    };
  }
  return cy.api({
      method: method,
      url: customFieldsUrl + url,
      auth: {
        bearer: data.token
      },
      body,
      failOnStatusCode: false // test all status codes
  });
});

Cypress.Commands.add('customFieldOptions', (method, url, data) => { // api for custom field options
  return cy.api({
      method: method,
      url: customFieldOptionsUrl + url,
      auth: {
        bearer: data.token
      },
      body: {
        'sortOrder': data.sortOrder,
        'customFieldId': data.id,
        'name': data.name,
        'category': data.category,
        'waitingActive': data.waitingActive
      },
      failOnStatusCode: false // test all status codes
  });
});

Cypress.Commands.add('linkedItems', (method, url, data) => { // api for linked items
  let body = '';
  if(method != 'GET'){
    body = {
      'Name': data.name,
      'EntityId': data.entityId,
      'EntityType': data.entityType,
      'LinkedEntityId': data.linkedEntityId,
      'LinkedEntityType': data.linkedEntityType,
      'LinkType': data.linkType
    };
  }
  return cy.api({
      method: method,
      url: linkedItemsUrl + url,
      auth: {
        bearer: data.token
      },
      body,
      failOnStatusCode: false // test all status codes
  });
});

Cypress.Commands.add('history', (method, url, data) => { // api for history
  let body = '';
  if (method != 'GET') {
    body = [];
    for(let item of data.payload) {
      body.push({
        'Author': item.author,
        'Changed': item.changed,
        'Changes': item.changes
      });
    }
  }
  return cy.api({
      method: method,
      url: storiesUrl + url,
      auth: {
        bearer: data.token
      },
      body,
      failOnStatusCode: false // test all status codes
  });
});

Cypress.Commands.add('vsfm', (method, url, data) => { // api for vsfm
  return cy.api({
    method: method,
    url: vsfmsUrl + url,
    auth: {
      bearer: data.token
    },
    failOnStatusCode: false // test all status codes
  });
});