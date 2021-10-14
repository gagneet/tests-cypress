let token = null;

const prefix = Cypress.env('host').replace(/\./g, '');
const convertToLocalStorageKey = (name) => {
    return `${prefix}_${name}`;
};

/*
 * comment Cypress.LocalStorage.clear out on ->support->index if you want to clean local storage on every test run
 */

const getLegacyLookupFieldBookingRequestStatus = () => {
    cy.log('**Get BookingRequestStatus Lookup Field** 🔥');
    if(localStorage[convertToLocalStorageKey('bookingRequestStatusId')]) {
        model.bookingRequestStatusId = localStorage[convertToLocalStorageKey('bookingRequestStatusId')];
        model.bookingRequestStatusName = localStorage[convertToLocalStorageKey('bookingRequestStatusName')];
        return;
    }

    cy.lookupFields('GET', '/BookingRequestStatus', { token }).then((resp) => { // Get CFs for TEBR creation
        model.bookingRequestStatusId = resp.body[0].id;
        model.bookingRequestStatusName = resp.body[0].value;
        localStorage[convertToLocalStorageKey('bookingRequestStatusId')] = model.bookingRequestStatusId;
        localStorage[convertToLocalStorageKey('bookingRequestStatusName')] = model.bookingRequestStatusName;
    });
};

const getLegacyLookupFieldBookingRequestType = () => {
    cy.log('**Get BookingRequestType Lookup Field** 🔥');
    if(localStorage[convertToLocalStorageKey('bookingRequestTypeId')]) {
        model.bookingRequestTypeId = localStorage[convertToLocalStorageKey('bookingRequestTypeId')];
        model.bookingRequestTypeName = localStorage[convertToLocalStorageKey('bookingRequestTypeName')];
        return;
    }

    cy.lookupFields('GET', '/BookingRequestType', { token }).then((resp) => { // Get CFs for TEBR creation
        model.bookingRequestTypeId = resp.body[0].id;
        model.bookingRequestTypeName = resp.body[0].value;
        localStorage[convertToLocalStorageKey('bookingRequestTypeId')] = model.bookingRequestTypeId;
        localStorage[convertToLocalStorageKey('bookingRequestTypeName')] = model.bookingRequestTypeName;
    });
};

const getLegacyLookupFieldChangeDeliveryRisk = () => {
    cy.log('**Get ChangeDeliveryRisk Lookup Field** 🔥');
    if(localStorage[convertToLocalStorageKey('changeDeliveryRiskId')]) {
        model.changeDeliveryRiskId = localStorage[convertToLocalStorageKey('changeDeliveryRiskId')];
        model.changeDeliveryRiskName = localStorage[convertToLocalStorageKey('changeDeliveryRiskName')];
        return;
    }

    cy.lookupFields('GET', '/ChangeDeliveryRisk', { token }).then((resp) => { // Get CFs for Change creation
        model.changeDeliveryRiskId = resp.body[0].id;
        model.changeDeliveryRiskName = resp.body[0].value;
        localStorage[convertToLocalStorageKey('changeDeliveryRiskId')] = model.changeDeliveryRiskId;
        localStorage[convertToLocalStorageKey('changeDeliveryRiskName')] = model.changeDeliveryRiskName;
    });
};

const getLegacyLookupFieldChangePriority = () => {
    cy.log('**Get ChangePriority Lookup Field** 🔥');
    if(localStorage[convertToLocalStorageKey('changePriorityId')]) {
        model.changePriorityId = localStorage[convertToLocalStorageKey('changePriorityId')];
        model.changePriorityName = localStorage[convertToLocalStorageKey('changePriorityName')];
        return;
    }

    cy.lookupFields('GET', '/ChangePriority', { token }).then((resp) => { // Get CFs for Change creation
        model.changePriorityId = resp.body[0].id;
        model.changePriorityName = resp.body[0].value;
        localStorage[convertToLocalStorageKey('changePriorityId')] = model.changePriorityId;
        localStorage[convertToLocalStorageKey('changePriorityName')] = model.changePriorityName;
    });
};

const getLegacyLookupFieldChangeRequestStatus = () => {
    cy.log('**Get ChangeRequestStatus Lookup Field** 🔥');
    if(localStorage[convertToLocalStorageKey('changeRequestStatusId')]) {
        model.changeRequestStatusId = localStorage[convertToLocalStorageKey('changeRequestStatusId')];
        model.changeRequestStatusName = localStorage[convertToLocalStorageKey('changeRequestStatusName')];
        return;
    }

    cy.lookupFields('GET', '/ChangeRequestStatus', { token }).then((resp) => { // Get CFs for Change creation
        model.changeRequestStatusId = resp.body[0].id;
        model.changeRequestStatusName = resp.body[0].value;
        localStorage[convertToLocalStorageKey('changeRequestStatusId')] = model.changeRequestStatusId;
        localStorage[convertToLocalStorageKey('changeRequestStatusName')] = model.changeRequestStatusName;
    });
};

const getLegacyLookupFieldChangeRequestType = () => {
    cy.log('**Get ChangeRequestType Lookup Field** 🔥');
    if(localStorage[convertToLocalStorageKey('changeRequestTypeId')]) {
        model.changeRequestTypeId = localStorage[convertToLocalStorageKey('changeRequestTypeId')];
        model.changeRequestTypeName = localStorage[convertToLocalStorageKey('changeRequestTypeName')];
        return;
    }

    cy.lookupFields('GET', '/ChangeRequestType', { token }).then((resp) => { // Get CFs for Change creation
        model.changeRequestTypeId = resp.body[0].id;
        model.changeRequestTypeName = resp.body[0].value;
        localStorage[convertToLocalStorageKey('changeRequestTypeId')] = model.changeRequestTypeId;
        localStorage[convertToLocalStorageKey('changeRequestTypeName')] = model.changeRequestTypeName;
    });
};

const getLegacyLookupFieldChangeStatus = () => {
    cy.log('**Get ChangeStatus Lookup Field** 🔥');
    if(localStorage[convertToLocalStorageKey('changeStatusId')]) {
        model.changeStatusId = localStorage[convertToLocalStorageKey('changeStatusId')];
        model.changeStatusName = localStorage[convertToLocalStorageKey('changeStatusName')];
        return;
    }

    cy.lookupFields('GET', '/ChangeStatus', { token }).then((resp) => { // Get CFs for Change creation
        model.changeStatusId = resp.body[0].id;
        model.changeStatusName = resp.body[0].value;
        localStorage[convertToLocalStorageKey('changeStatusId')] = model.changeStatusId;
        localStorage[convertToLocalStorageKey('changeStatusName')] = model.changeStatusName;
    });
};

const getLegacyLookupFieldChangeTheme = () => {
    cy.log('**Get ChangeTheme Lookup Field** 🔥');
    if(localStorage[convertToLocalStorageKey('changeThemeId')]) {
        model.changeThemeId = localStorage[convertToLocalStorageKey('changeThemeId')];
        model.changeThemeName = localStorage[convertToLocalStorageKey('changeThemeName')];
        return;
    }

    cy.lookupFields('GET', '/ChangeTheme', { token }).then((resp) => { // Get CFs for Change creation
        model.changeThemeId = resp.body[0].id;
        model.changeThemeName = resp.body[0].value;
        localStorage[convertToLocalStorageKey('changeThemeId')] = model.changeThemeId;
        localStorage[convertToLocalStorageKey('changeThemeName')] = model.changeThemeName;
    });
};

const getLegacyLookupFieldChangeType = () => {
    cy.log('**Get ChangeType Lookup Field** 🔥');
    if(localStorage[convertToLocalStorageKey('changeTypeId')]) {
        model.changeTypeId = localStorage[convertToLocalStorageKey('changeTypeId')];
        model.changeTypeName = localStorage[convertToLocalStorageKey('changeTypeName')];
        return;
    }

    cy.lookupFields('GET', '/ChangeType', { token }).then((resp) => { // Get CFs for Change creation
        model.changeTypeId = resp.body[0].id;
        model.changeTypeName = resp.body[0].value;
        localStorage[convertToLocalStorageKey('changeTypeId')] = model.changeTypeId;
        localStorage[convertToLocalStorageKey('changeTypeName')] = model.changeTypeName;
    });
};

const getLegacyLookupFieldReleaseRiskLevel = () => {
    cy.log('**Get ReleaseRiskLevel Lookup Field** 🔥');
    if(localStorage[convertToLocalStorageKey('releaseRiskLevelId')]) {
        model.releaseRiskLevelId = localStorage[convertToLocalStorageKey('releaseRiskLevelId')];
        model.releaseRiskLevelName = localStorage[convertToLocalStorageKey('releaseRiskLevelName')];
        return;
    }

    cy.lookupFields('GET', '/ReleaseRiskLevel', { token }).then((resp) => { // Get CFs for Release creation
        model.releaseRiskLevelId = resp.body[0].id;
        model.releaseRiskLevelName = resp.body[0].value;
        localStorage[convertToLocalStorageKey('releaseRiskLevelId')] = model.releaseRiskLevelId;
        localStorage[convertToLocalStorageKey('releaseRiskLevelName')] = model.releaseRiskLevelName;
    });
};

const getLegacyLookupFieldReleaseStatusType = () => {
    cy.log('**Get ReleaseStatusType Lookup Field** 🔥');
    if(localStorage[convertToLocalStorageKey('releaseStatusTypeId')]) {
        model.releaseStatusTypeId = localStorage[convertToLocalStorageKey('releaseStatusTypeId')];
        model.releaseStatusTypeName = localStorage[convertToLocalStorageKey('releaseStatusTypeName')];
        return;
    }

    cy.lookupFields('GET', '/ReleaseStatusType', { token }).then((resp) => { // Get CFs for Release creation
        model.releaseStatusTypeId = resp.body[0].id;
        model.releaseStatusTypeName = resp.body[0].value;
        localStorage[convertToLocalStorageKey('releaseStatusTypeId')] = model.releaseStatusTypeId;
        localStorage[convertToLocalStorageKey('releaseStatusTypeName')] = model.releaseStatusTypeName;
    });
};

const getLegacyLookupFieldReleaseType = () => {
    cy.log('**Get ReleaseType Lookup Field** 🔥');
    if(localStorage[convertToLocalStorageKey('releaseTypeId')]) {
        model.releaseTypeId = localStorage[convertToLocalStorageKey('releaseTypeId')];
        model.releaseTypeName = localStorage[convertToLocalStorageKey('releaseTypeName')];
        return;
    }

    cy.lookupFields('GET', '/ReleaseType', { token }).then((resp) => { // Get CFs for Release creation
        model.releaseTypeId = resp.body[0].id;
        model.releaseTypeName = resp.body[0].value;
        localStorage[convertToLocalStorageKey('releaseTypeId')] = model.releaseTypeId;
        localStorage[convertToLocalStorageKey('releaseTypeName')] = model.releaseTypeName;
    });
};

const getLegacyLookupUsedForWorkItem = () => {
    cy.log('**Get UsedForWorkItem Lookup Field** 🔥');
    if(localStorage[convertToLocalStorageKey('usedForWorkItem')]) {
        model.usedForWorkItem = localStorage[convertToLocalStorageKey('usedForWorkItem')]; // TODO: re-name this to usedForWorkItemId
        model.usedForWorkItemName = localStorage[convertToLocalStorageKey('usedForWorkItemName')];
        return;
    }

    cy.lookupFields('GET', '/UsedForWorkItem', { token }).then((resp) => { // Get CFs for Release creation
        model.usedForWorkItem = resp.body[0].id; // TODO: re-name this to usedForWorkItemId
        model.usedForWorkItemName = resp.body[0].value;
        localStorage[convertToLocalStorageKey('usedForWorkItem')] = model.usedForWorkItem;
        localStorage[convertToLocalStorageKey('usedForWorkItemName')] = model.usedForWorkItemName;
    });
};

const getLegacyLookupEnvironmentStatus = () => {
    cy.log('**Get EnvironmentStatus Lookup Field** 🔥');
    if(localStorage[convertToLocalStorageKey('environmentStatus')]) {
        model.environmentStatus = localStorage[convertToLocalStorageKey('environmentStatus')]; // TODO: re-name this to environmentStatusId
        model.environmentStatusName = localStorage[convertToLocalStorageKey('environmentStatusName')];
        return;
    }

    cy.lookupFields('GET', '/EnvironmentStatus', { token }).then((resp) => { // Get CFs for Environment creation
        model.environmentStatus = resp.body[0].id; // TODO: re-name this to environmentStatusId
        model.environmentStatusName = resp.body[0].value;
        localStorage[convertToLocalStorageKey('environmentStatus')] = model.environmentStatus;
        localStorage[convertToLocalStorageKey('environmentStatusName')] = model.environmentStatusName;
    });
};

const getLegacyLookupEnvironmentPhaseUsage = () => {
    cy.log('**Get EnvironmentPhaseUsage Lookup Field** 🔥');
    if(localStorage[convertToLocalStorageKey('environmentPhaseUsageId')]) {
        model.environmentPhaseUsageId = localStorage[convertToLocalStorageKey('environmentPhaseUsageId')]; 
        model.environmentPhaseUsageName = localStorage[convertToLocalStorageKey('environmentPhaseUsageName')];
        return;
    }

    cy.lookupFields('GET', '/UsedForWorkItem', { token }).then((resp) => { // Get CFs for Environment creation
        model.environmentPhaseUsageId = resp.body[0].id; 
        model.environmentPhaseUsageName = resp.body[0].value;
        localStorage[convertToLocalStorageKey('environmentPhaseUsageId')] = model.environmentPhaseUsageId;
        localStorage[convertToLocalStorageKey('environmentPhaseUsageName')] = model.environmentPhaseUsageName;
    });
};

const getLegacyLookupEnvironmentMapConnectivityType = () => {
    cy.log('**Get EnvironmentMapConnectivityType Lookup Field** 🔥');
    if(localStorage[convertToLocalStorageKey('environmentMapConnectivityTypeId')]) {
        model.environmentMapConnectivityTypeId = localStorage[convertToLocalStorageKey('environmentMapConnectivityTypeId')];
        model.environmentMapConnectivityTypeName = localStorage[convertToLocalStorageKey('environmentMapConnectivityTypeName')];
        return;
    }

    cy.lookupFields('GET', '/EnvironmentMapConnectivityType', { token }).then((resp) => { // Get CFs for Environment creation
        model.environmentMapConnectivityTypeId = resp.body[0].id;
        model.environmentMapConnectivityTypeName = resp.body[0].value;
        localStorage[convertToLocalStorageKey('environmentMapConnectivityTypeId')] = model.environmentMapConnectivityTypeId;
        localStorage[convertToLocalStorageKey('environmentMapConnectivityTypeName')] = model.environmentMapConnectivityTypeName;
    });
};

const getLegacyLookupPIRCategory = () => {
    cy.log('**Get PIRCategory Lookup Field** 🔥');
    if(localStorage[convertToLocalStorageKey('pIRCategoryId')]) {
        model.pIRCategoryId = localStorage[convertToLocalStorageKey('pIRCategoryId')];
        model.pIRCategoryName = localStorage[convertToLocalStorageKey('pIRCategoryName')];
        return;
    }

    cy.lookupFields('GET', '/PIRCategory', { token }).then((resp) => { // Get CFs for PIR creation
        model.pIRCategoryId = resp.body[0].id;
        model.pIRCategoryName = resp.body[0].value;
        localStorage[convertToLocalStorageKey('pIRCategoryId')] = model.pIRCategoryId;
        localStorage[convertToLocalStorageKey('pIRCategoryName')] = model.pIRCategoryName;
    });
};

const getLegacyLookupPIRItemStatus = () => {
    cy.log('**Get PIRItemStatus Lookup Field** 🔥');
    if(localStorage[convertToLocalStorageKey('pIRItemStatusId')]) {
        model.pIRItemStatusId = localStorage[convertToLocalStorageKey('pIRItemStatusId')];
        model.pIRItemStatusName = localStorage[convertToLocalStorageKey('pIRItemStatusName')];
        return;
    }

    cy.lookupFields('GET', '/PIRItemStatus', { token }).then((resp) => { // Get CFs for PIR creation
        model.pIRItemStatusId = resp.body[0].id;
        model.pIRItemStatusName = resp.body[0].value;
        localStorage[convertToLocalStorageKey('pIRItemStatusId')] = model.pIRItemStatusId;
        localStorage[convertToLocalStorageKey('pIRItemStatusName')] = model.pIRItemStatusName;
    });
};

const getLegacyLookupPIRItemSubCategory = () => {
    cy.log('**Get PIRItemSubCategory Lookup Field** 🔥');
    if(localStorage[convertToLocalStorageKey('pIRItemSubCategoryId')]) {
        model.pIRItemSubCategoryId = localStorage[convertToLocalStorageKey('pIRItemSubCategoryId')];
        model.pIRItemSubCategoryName = localStorage[convertToLocalStorageKey('pIRItemSubCategoryName')];
        return;
    }

    cy.lookupFields('GET', '/PIRItemSubCategory', { token }).then((resp) => { // Get CFs for PIR creation
        model.pIRItemSubCategoryId = resp.body[0].id;
        model.pIRItemSubCategoryName = resp.body[0].value;
        localStorage[convertToLocalStorageKey('pIRItemSubCategoryId')] = model.pIRItemSubCategoryId;
        localStorage[convertToLocalStorageKey('pIRItemSubCategoryName')] = model.pIRItemSubCategoryName;
    });
};

const getLegacyLookupPIRItemType = () => {
    cy.log('**Get PIRItemType Lookup Field** 🔥');
    if(localStorage[convertToLocalStorageKey('pIRItemTypeId')]) {
        model.pIRItemTypeId = localStorage[convertToLocalStorageKey('pIRItemTypeId')];
        model.pIRItemTypeName = localStorage[convertToLocalStorageKey('pIRItemTypeName')];
        return;
    }

    cy.lookupFields('GET', '/PIRItemType', { token }).then((resp) => { // Get CFs for PIR creation
        model.pIRItemTypeId = resp.body[0].id;
        model.pIRItemTypeName = resp.body[0].value;
        localStorage[convertToLocalStorageKey('pIRItemTypeId')] = model.pIRItemTypeId;
        localStorage[convertToLocalStorageKey('pIRItemTypeName')] = model.pIRItemTypeName;
    });
};

const getLegacyLookupPIRTheme = () => {
    cy.log('**Get PIRTheme Lookup Field** 🔥');
    if(localStorage[convertToLocalStorageKey('pIRThemeId')]) {
        model.pIRThemeId = localStorage[convertToLocalStorageKey('pIRThemeId')];
        model.pIRThemeName = localStorage[convertToLocalStorageKey('pIRThemeName')];
        return;
    }

    cy.lookupFields('GET', '/PIRTheme', { token }).then((resp) => { // Get CFs for PIR creation
        model.pIRThemeId = resp.body[0].id;
        model.pIRThemeName = resp.body[0].value;
        localStorage[convertToLocalStorageKey('pIRThemeId')] = model.pIRThemeId;
        localStorage[convertToLocalStorageKey('pIRThemeName')] = model.pIRThemeName;
    });
};

const getLegacyLookupStakeholderRole = () => {
    cy.log('**Get StakeholderRole Lookup Fields** 🔥');
    if(localStorage[convertToLocalStorageKey('stakeholderRoleId')]) {
        model.stakeholderRoleId = localStorage[convertToLocalStorageKey('stakeholderRoleId')];
        model.stakeholderRoleName = localStorage[convertToLocalStorageKey('stakeholderRoleName')];
        return;
    }

    cy.lookupFields('GET', '/StakeholderRole', { token }).then((resp) => { // Get CFs for Release creation
        model.stakeholderRoleId = resp.body[0].id;
        model.stakeholderRoleName = resp.body[0].value;
        localStorage[convertToLocalStorageKey('stakeholderRoleId')] = model.stakeholderRoleId;
        localStorage[convertToLocalStorageKey('stakeholderRoleName')] = model.stakeholderRoleName;
    });
};

const getLegacyLookupSystemRoleDependencyType = () => {
    cy.log('**Get SystemRoleDependencyType Lookup Field** 🔥');
    if(localStorage[convertToLocalStorageKey('systemRoleDependencyTypeId')]) {
        model.systemRoleDependencyTypeId = localStorage[convertToLocalStorageKey('systemRoleDependencyTypeId')];
        model.systemRoleDependencyTypeName = localStorage[convertToLocalStorageKey('systemRoleDependencyTypeName')];
        return;
    }

    cy.lookupFields('GET', '/SystemRoleDependencyType', { token }).then((resp) => { // Get CFs for System creation
        model.systemRoleDependencyTypeId = resp.body[0].id;
        model.systemRoleDependencyTypeName = resp.body[0].value;
        localStorage[convertToLocalStorageKey('systemRoleDependencyTypeId')] = model.systemRoleDependencyTypeId;
        localStorage[convertToLocalStorageKey('systemRoleDependencyTypeName')] = model.systemRoleDependencyTypeName;
    });
};

const getLegacyWorkItemNameGate = () => {
    cy.log('**Get Work Item Name - Gates** 🔥');
    if(localStorage[convertToLocalStorageKey('workItemNameGateId')]) {
        model.workItemNameGateId = localStorage[convertToLocalStorageKey('workItemNameGateId')];
        model.workItemNameGateName = localStorage[convertToLocalStorageKey('workItemNameGateName')];
        return;
    }

    cy.workitemnames('GET', '/Gates', { token }).then((resp) => { // Get CFs for Release - Gates
        model.workItemNameGateId = resp.body[0].id;
        model.workItemNameGateName = resp.body[0].name;
        localStorage[convertToLocalStorageKey('workItemNameGateId')] = model.workItemNameGateId;
        localStorage[convertToLocalStorageKey('workItemNameGateName')] = model.workItemNameGateName;
    });
};

const getLegacyWorkItemNamePhase = () => {
    cy.log('**Get Work Item Name - Phases** 🔥');
    if(localStorage[convertToLocalStorageKey('workItemNamePhaseId')]) {
        model.workItemNamePhaseId = localStorage[convertToLocalStorageKey('workItemNamePhaseId')];
        model.workItemNamePhaseName = localStorage[convertToLocalStorageKey('workItemNamePhaseName')];
        return;
    }

    cy.workitemnames('GET', '/Phases', { token }).then((resp) => { // Get CFs for Release - Phases
        model.workItemNamePhaseId = resp.body[0].id;
        model.workItemNamePhaseName = resp.body[0].name;
        localStorage[convertToLocalStorageKey('workItemNamePhaseId')] = model.workItemNamePhaseId;
        localStorage[convertToLocalStorageKey('workItemNamePhaseName')] = model.workItemNamePhaseName;
    });
};

const getOrganization= () => {
    cy.log('**Get an Organization** 🔥');

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
    });
};

/*
 * The model here represents an interface to describe data being used.
 * It is an equivalent of the interface which is a powerful way of defining a contract in TypeScript.
 * With this prototyping, developer would be able to leverage the intellisense provided by the IDE,
 * which will significantly enhance the readability and maintainability of the project.
 */
const model = {
    bookingRequestStatusId: null,
    bookingRequestStatusName: null,
    bookingRequestTypeId: null,
    bookingRequestTypeName: null,
    changeDeliveryRiskId: null,
    changeDeliveryRiskName: null,
    changePriorityId: null,
    changePriorityName: null,
    changeRequestStatusId: null,
    changeRequestStatusName: null,
    changeRequestTypeId: null,
    changeRequestTypeName: null,
    changeStatusId: null,
    changeStatusName: null,
    changeThemeId: null,
    changeThemeName: null,
    changeTypeId: null,
    changeTypeName: null,
    pIRCategoryId: null,
    pIRCategoryName: null,
    pIRItemStatusId: null,
    pIRItemStatusName: null,
    pIRItemSubCategoryId: null,
    pIRItemSubCategoryName: null,
    pIRItemTypeId: null,
    pIRItemTypeName: null,
    pIRThemeId: null,
    pIRThemeName: null,
    releaseRiskLevelId: null,
    releaseRiskLevelName: null,
    releaseStatusTypeId: null,
    releaseStatusTypeName: null,
    releaseTypeId: null,
    releaseTypeName: null,
    usedForWorkItem: null,
    usedForWorkItemName: null,
    environmentStatus: null,
    environmentStatusName: null,
    environmentPhaseUsageId: null,
    environmentPhaseUsageName: null,
    environmentMapConnectivityTypeId: null,
    environmentMapConnectivityTypeName: null,
    stakeholderRoleId: null,
    stakeholderRoleName: null,
    systemRoleDependencyTypeId: null,
    systemRoleDependencyTypeName: null,
    workItemNameGateId: null,
    workItemNameGateName: null,
    workItemNamePhaseId: null,
    workItemNamePhaseName: null,
    organizationId: null,
    organizationName: null
};

const getLegacyModel = () => {
    return model;
};

const setToken = (inputToken) => {
    token = inputToken;
};

const getToken = () => token;

export default {
    setToken,
    getToken,
    getLegacyModel,
    getLegacyLookupFieldBookingRequestStatus,
    getLegacyLookupFieldBookingRequestType,
    getLegacyLookupFieldChangeDeliveryRisk,
    getLegacyLookupFieldChangePriority,
    getLegacyLookupFieldChangeRequestStatus,
    getLegacyLookupFieldChangeRequestType,
    getLegacyLookupFieldChangeStatus,
    getLegacyLookupFieldChangeTheme,
    getLegacyLookupFieldChangeType,
    getLegacyLookupPIRCategory,
    getLegacyLookupPIRItemStatus,
    getLegacyLookupPIRItemSubCategory,
    getLegacyLookupPIRItemType,
    getLegacyLookupPIRTheme,
    getLegacyLookupFieldReleaseRiskLevel,
    getLegacyLookupFieldReleaseStatusType,
    getLegacyLookupFieldReleaseType,
    getLegacyLookupUsedForWorkItem,
    getLegacyLookupEnvironmentStatus,
    getLegacyLookupEnvironmentPhaseUsage,
    getLegacyLookupEnvironmentMapConnectivityType,
    getLegacyLookupStakeholderRole,
    getLegacyLookupSystemRoleDependencyType,
    getLegacyWorkItemNameGate,
    getLegacyWorkItemNamePhase,
    getOrganization
};