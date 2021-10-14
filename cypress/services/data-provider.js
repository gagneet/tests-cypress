import faker from 'faker/locale/en_AU'; // https://www.npmjs.com/package/faker
import * as customField from '../fixtures/custom-field-type'; // default values for fixed fields

const userName = Cypress.env().users['admin'].username;
const organizationId = Cypress.env().users['admin'].organizationId;

const date = new Date();
const dateNow = date.toISOString();
let token = null;

// this file is for preconditions where we are creating data for the future reference

// TODO: Move to some common utils
const prefix = Cypress.env('host').replace(/\./g, '');
const convertToLocalStorageKey = (name) => {
    return `${prefix}_${name}`;
};

/*
 * comment Cypress.LocalStorage.clear out on ->support->index if you want to clean local storage on every test run
 */

const createProject = () => {
    cy.log('**Create Project** 🔥');

    let data = {
        'token': token,
        'projectName': 'identifier-' + faker.random.word() + ' ' + dateNow
    };

    if(localStorage[convertToLocalStorageKey('projectId')]) {
        model.projectId = localStorage[convertToLocalStorageKey('projectId')];
        model.assigneeId = localStorage[convertToLocalStorageKey('assigneeId')];
        return;
    }

    cy.projects('POST', '', data).then((resp) => { // create new project for the future reference
        model.projectId = resp.body.data.id;
        model.assigneeId = resp.body.data.createdById;
        localStorage[convertToLocalStorageKey('projectId')] = model.projectId;
        localStorage[convertToLocalStorageKey('assigneeId')] = model.assigneeId;
        cy.log(`project '${model.projectId}' successfully set`);
    });
};

const createCustomField = (id, category, waitingActive, modelName, modelId, label) => {
    if(localStorage[convertToLocalStorageKey(modelName)]) {
        model[modelName] = localStorage[convertToLocalStorageKey(modelName)];
        model[modelId] = localStorage[convertToLocalStorageKey(modelId)];
        return;
    }

    let name = 'custom-field-' + faker.random.word() + ' ' + dateNow;
    let data = {
        'token': token,
        'sortOrder': 1,
        'id': id,
        'name': name,
        'category': category,
        'waitingActive': waitingActive
    };
    cy.customFieldOptions('POST', `/${id}/options`, data).should((resp) => {
        model[modelName] = resp.body.data.name;
        model[modelId] = resp.body.data.id;
        localStorage[convertToLocalStorageKey(modelName)] = model[modelName];
        localStorage[convertToLocalStorageKey(modelId)] = model[modelId];
        cy.log(`${label} '${model[modelName]}' successfully created`);
    });
};

const createCustomFieldsResponseHandler = (resp) => { // get list of default custom fields
    // this method can fail only in a case where we run API first time on new environment...
    // in this case run GET api/settings/customfields/SetupInitialFields first.
    localStorage[convertToLocalStorageKey('defaultFields')] = JSON.stringify(resp);
    for (const [key] of Object.entries(resp.body.data)) { // retrieve the ID's for the default custom fields
        if (resp.body.data[key].name == 'Priority') {
            model.priorityId = resp.body.data[key].id;
            cy.log('Priority ID is ' + resp.body.data[key].id);
        }

        if (resp.body.data[key].name == 'Status') {
            model.statusId = resp.body.data[key].id;
            cy.log('Status ID is ' + resp.body.data[key].id);
        }

        if (resp.body.data[key].name == 'Type') {
            model.typeId = resp.body.data[key].id;
            cy.log('Type ID is ' + resp.body.data[key].id);
        }
    }
    cy.log('**Create Story Priority Name** 🔥');
    // Second parameter is not defined for Priority
    createCustomField(model.priorityId,
        undefined, undefined, 'priorityName', 'priorityOptionId', 'priority');

    cy.log('**Create Story Status Names** 🔥');
    // Second parameter is category which set WorkFlow group
    createCustomField(model.statusId,
        8, 2, // WorkFlow group = 8 =  Execution, // State = 2 = Active
        'statusNameInProgress', 'statusOptionInProgressId', 'status Name');

    // Second parameter is category which set WorkFlow group
    createCustomField(model.statusId,
        32, 2, // WorkFlow group = 32 = Completed, // State = 2 = Active
        'statusNameCompleted', 'statusOptionCompletedId', 'status Name');

    cy.log('**Create Story Type Name** 🔥');
    // Set value 2 for the future ref.
    createCustomField(model.typeId,
        undefined, undefined, 'typeName', 'typeOptionId', 'type Name');
};

const createCustomFields = () => {
    cy.log('**Get Story Priority, Status, Type IDs** 🔥');

    if (localStorage[convertToLocalStorageKey('defaultFields')]) {
        return createCustomFieldsResponseHandler(JSON.parse(localStorage[convertToLocalStorageKey('defaultFields')]));
    }

    cy.customFields('GET', '/Story/GetDefaultFields', { token }).should(createCustomFieldsResponseHandler);
};

const createSystem = () => {
    cy.log('**Create new System** 🔥');
    if(localStorage[convertToLocalStorageKey('systemId')]) {
        model.systemId = localStorage[convertToLocalStorageKey('systemId')];
        model.systemName = localStorage[convertToLocalStorageKey('systemName')];
        return;
    }

    let data = {
        'token': token,
        'name': 'system-' + faker.random.word() + ' ' + dateNow,
        'vendor': userName,
        'status': 'Active',
        'organizationId': organizationId, // model.organizationId,
        'description': 'description-' + faker.random.word() + ' ' + dateNow,
    };
    cy.systems('POST', '', data).then((resp) => {
        model.systemId = resp.body.id;
        model.systemName = resp.body.name;
        localStorage[convertToLocalStorageKey('systemId')] = model.systemId;
        localStorage[convertToLocalStorageKey('systemName')] = model.systemName;
        cy.log(`system '${model.systemId}' successfully set`);
    });
};

const createSystemsBulk = () => {
    cy.log('**Create new 3 Systems** 🔥');

    if(localStorage[convertToLocalStorageKey('systemBulkId1')]) {
        model.systemBulkId1 = localStorage[convertToLocalStorageKey('systemBulkId1')];
        model.systemBulkName1 = localStorage[convertToLocalStorageKey('systemBulkName1')];
        model.systemBulkId2 = localStorage[convertToLocalStorageKey('systemBulkId2')];
        model.systemBulkName2 = localStorage[convertToLocalStorageKey('systemBulkName2')];
        model.systemBulkId3 = localStorage[convertToLocalStorageKey('systemBulkId3')];
        model.systemBulkName3 = localStorage[convertToLocalStorageKey('systemBulkName3')];
        return;
    }

    let systemBulkName1 = 'system-1-' + faker.random.word() + ' ' + dateNow;
    let systemBulkName2 = 'system-2-' + faker.random.word() + ' ' + dateNow;
    let systemBulkName3 = 'system-3-' + faker.random.word() + ' ' + dateNow;
    let data = {
        'token': token,
        'payload': [{
            'name': systemBulkName1,
            'vendor': userName,
            'status': 'Active',
            'organizationId': organizationId, // model.organizationId,
            'description': 'description-' + faker.random.word() + ' ' + dateNow,
        },
        {
            'name': systemBulkName2,
            'vendor': userName,
            'status': 'Active',
            'organizationId': organizationId, // model.organizationId,
            'description': 'description-' + faker.random.word() + ' ' + dateNow,
        },
        {
            'name': systemBulkName3,
            'vendor': userName,
            'status': 'Active',
            'organizationId': organizationId, // model.organizationId,
            'description': 'description-' + faker.random.word() + ' ' + dateNow,
        }]
    };
    // create 3 systems
    cy.systems('POST', '/bulk', data).then(() => {
        // since bulk update doesnt not return system ids in responce, we need to get all systems separately
        cy.log(`systems successfully created`); // sin
        // get system id 1
        cy.systems('GET', `?filter=\`name\` equals \`${systemBulkName1}\``, data).then((resp) => {
            model.systemBulkId1 = resp.body[0].id;
            model.systemBulkName1 = resp.body[0].name;
            localStorage[convertToLocalStorageKey('systemBulkId1')] = model.systemBulkId1;
            localStorage[convertToLocalStorageKey('systemBulkName1')] = model.systemBulkName1;
        });
        // get system id 2
        cy.systems('GET', `?filter=\`name\` equals \`${systemBulkName2}\``, data).then((resp) => {
            model.systemBulkId2 = resp.body[0].id;
            model.systemBulkName2 = resp.body[0].name;
            localStorage[convertToLocalStorageKey('systemBulkId2')] = model.systemBulkId2;
            localStorage[convertToLocalStorageKey('systemBulkName2')] = model.systemBulkName2;
        });
        // get system id 3
        cy.systems('GET', `?filter=\`name\` equals \`${systemBulkName3}\``, data).then((resp) => {
            model.systemBulkId3 = resp.body[0].id;
            model.systemBulkName3 = resp.body[0].name;
            localStorage[convertToLocalStorageKey('systemBulkId3')] = model.systemBulkId3;
            localStorage[convertToLocalStorageKey('systemBulkName3')] = model.systemBulkName3;
        });
    });
};

const createEnterpriseRelease = () => {
    cy.log('**Create new Enterprise Release** 🔥');
    if(localStorage[convertToLocalStorageKey('releaseEnterpriseId')]) {
        model.releaseEnterpriseId = localStorage[convertToLocalStorageKey('releaseEnterpriseId')];
        model.releaseEnterpriseName = localStorage[convertToLocalStorageKey('releaseEnterpriseName')];
        model.releaseEnterpriseIdentifier = localStorage[convertToLocalStorageKey('releaseEnterpriseIdentifier')];
        return;
    }

    let data = { // data to be passed to the api; can use fixtures to test all permutation too
        'token': token,
        'identifier': 'release-' + faker.random.word() + ' ' + dateNow,
        'name': 'release-name' + faker.random.word() + ' ' + dateNow,
        'summary': 'summary' + faker.random.word() + ' ' + dateNow,
        'releaseTypeId': model.releaseTypeId,
        'location': 'location' + faker.random.word() + ' ' + dateNow,
        'releaseStatusTypeId': model.releaseStatusTypeId,
        'releaseRiskLevelId': model.releaseRiskLevelId,
        'implementationDate': dateNow,
        'displayColor': 'green',
        'organizationId': organizationId, // model.organizationId,
        'managerId': '',
        'parentReleaseId': null,
        'parentRelease': null,
        'plutoraReleaseType': 'Enterprise',
        'releaseProjectType': 'None'
    };

    cy.releases('POST', '', data).then((resp) => { // create release
        model.releaseEnterpriseId = resp.body.id;
        model.releaseEnterpriseName = resp.body.name;
        model.releaseEnterpriseIdentifier = resp.body.identifier;
        localStorage[convertToLocalStorageKey('releaseEnterpriseId')] = model.releaseEnterpriseId;
        localStorage[convertToLocalStorageKey('releaseEnterpriseName')] = model.releaseEnterpriseName;
        localStorage[convertToLocalStorageKey('releaseEnterpriseIdentifier')] = model.releaseEnterpriseIdentifier;
        cy.log(`releases '${model.releaseEnterpriseId}' successfully set.`);
    });
};

const getLegacyLookupField = (id, value, url) => {
    if(localStorage[convertToLocalStorageKey(id)]) {
        model[id] = localStorage[convertToLocalStorageKey(id)];
        model[value] = localStorage[convertToLocalStorageKey(value)];
        return;
    }

    cy.lookupFields('GET', url, { token }).then((resp) => { // Get CFs for Release creation
        model[id] = resp.body[0].id;
        model[value] = resp.body[0].value;
        localStorage[convertToLocalStorageKey(id)] = model[id];
        localStorage[convertToLocalStorageKey(value)] = model[value];
        cy.log(`${id} '${model.releaseRiskLevelId}' successfully set`);
    });
};

const getLegacyLookupFields = () => {
    cy.log('**Get Lookup Fields** 🔥');

    getLegacyLookupField('releaseRiskLevelId', 'releaseRiskLevelName', '/ReleaseRiskLevel');
    getLegacyLookupField('releaseStatusTypeId', 'releaseStatusTypeName', '/ReleaseStatusType');
    getLegacyLookupField('releaseTypeId', 'releaseTypeName', '/ReleaseType');

    if(localStorage[convertToLocalStorageKey('organizationId')]) {
        model.organizationId = localStorage[convertToLocalStorageKey('organizationId')];
        model.organizationName = localStorage[convertToLocalStorageKey('organizationName')];
        return;
    }

    cy.organizations('GET', '/tree', { token }).then((resp) => { // Get organization for Release/System creation
        model.organizationId = resp.body.id;
        model.organizationName = resp.body.name;
        localStorage[convertToLocalStorageKey('organizationId')] = model.organizationId;
        localStorage[convertToLocalStorageKey('organizationName')] = model.organizationName;
        cy.log(`organization '${model.organizationId}' successfully set`);
    });
};

const getLegacyLookupStakeholderRole = () => {
    cy.log('**Get StakeholderRole Lookup Field** 🔥');
    if(localStorage[convertToLocalStorageKey('stakeholderRoleId')]) {
        model.stakeholderRoleId = localStorage[convertToLocalStorageKey('stakeholderRoleId')];
        return;
    }

    cy.lookupFields('GET', '/StakeholderRole', { token }).then((resp) => { // Get CFs for System creation
        model.stakeholderRoleId = resp.body[0].id;
        localStorage[convertToLocalStorageKey('stakeholderRoleId')] = model.stakeholderRoleId;
    });
};

const createStoriesInBulk = () => {
    let storyModels = {
        feature: {
            customFieldWorkType: customField.workType[0], // Feature
            storyId: null,
            linkedItemReleaseId: null,
            linkedItemSystemId: null
        },
        techDebt: {
            customFieldWorkType: customField.workType[1], // Tech Debt
            storyId: null,
            linkedItemReleaseId: null,
            linkedItemSystemId: null
        },
        risk: {
            customFieldWorkType: customField.workType[2], // Risk
            storyId: null,
            linkedItemReleaseId: null,
            linkedItemSystemId: null
        },
        default: {
            customFieldWorkType: undefined, // default type without worktype value
            storyId: null,
            linkedItemReleaseId: null,
            linkedItemSystemId: null
        }
    };

    cy.log('**Create Stories with/without worktypes and In Progress/Completed Status** 🔥');
    for (let storyModelKey in storyModels) {
        let storyModel = storyModels[storyModelKey]; // create 4 Stories
        let data = {
            'token': token,
            'storyName': 'story-' + faker.random.word() + ' ' + dateNow,
            'projectId': model.projectId,
            'valuePoint': faker.random.number({ 'min': 1, 'max': 13 }),
            'effortPoint': faker.random.number({ 'min': 1, 'max': 13 }),
            'workType': storyModel.customFieldWorkType,
            'type': model.typeName,
            'status': model.statusNameInProgress, // InProgress status Workflow
            'priority': model.priorityName,
            'progress': faker.random.number({ 'min': 0, 'max': 1000 }),
            'assigneeId': model.assigneeId,
            'assigneeType': 'User',
        };
        cy.stories('POST', '', data).then((resp) => {
            storyModel.storyId = resp.body.data.id; // Set story ID for the future reference GCT-2050
            cy.log(`Story '${storyModel.storyId}', Work type'${storyModel.customFieldWorkType}' successfully created.`);
        });
    }

    return storyModels;
};

const createStory = () => {
    cy.log('**Create Story with worktype and Status** 🔥');
    let data = {
        'token': token,
        'storyName': 'story-' + faker.random.word() + ' ' + dateNow,
        'projectId': model.projectId,
        'valuePoint': faker.random.number({ 'min': 1, 'max': 13 }),
        'effortPoint': faker.random.number({ 'min': 1, 'max': 13 }),
        'workType': customField.workType[0],// Feature
        'type': model.typeName,
        'status': model.statusNameCompleted, // Completed status Workflow
        'priority': model.priorityName,
        'progress': faker.random.number({ 'min': 0, 'max': 1000 }),
        'assigneeId': model.assigneeId,
        'assigneeType': 'User',
      };
      cy.stories('POST', '', data).then((resp) => {
        model.storyId = resp.body.data.id; // Set story ID for the future reference
        model.identifier = resp.body.data.identifier;
        model.storyName = resp.body.data.name;
        cy.log(`Story '${model.storyId}', Work type '${customField.workType[0]}' successfully created.`);
      });
};

const model = {
    projectId: null,
    assigneeId: null,
    priorityId: null,
    statusId: null,
    typeId: null,
    priorityName: null,
    priorityOptionId: null,
    statusNameInProgress: null,
    statusOptionInProgressId: null,
    statusNameCompleted: null,
    statusOptionCompletedId: null,
    typeName: null,
    typeOptionId: null,
    releaseRiskLevelId: null,
    releaseStatusTypeId: null,
    releaseStatusTypeName: null,
    releaseTypeId: null,
    organizationId: null,
    organizationName: null,
    systemId: null,
    systemName: null,
    systemBulkId1: null,
    systemBulkName1: null,
    systemBulkId2: null,
    systemBulkName2: null,
    systemBulkId3: null,
    systemBulkName3: null,
    releaseEnterpriseId: null,
    releaseEnterpriseName: null,
    releaseEnterpriseIdentifier: null,
    storyId: null, // individual story (not bulk)
    identifier: null, // individual story (not bulk)
    storyName: null, // individual story (not bulk)
    stakeholderRoleId: null,
};

const getPlanningModel = () => {
    return model;
};

const setToken = (inputToken) => {
    token = inputToken;
};

export default {
    setToken,
    getPlanningModel,
    createProject,
    createCustomFields,
    getLegacyLookupFields,
    createSystem,
    createEnterpriseRelease,
    createStoriesInBulk,
    createStory,
    getLegacyLookupStakeholderRole,
    createSystemsBulk
};