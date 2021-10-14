import {v4 as uuidv4} from 'uuid';

let token = '';
let data = [];
let count = 0;

function checkResponseBody(resp) { // re-usable function to check response
  expect(resp.status).to.eq(200); // assert status code
  expect(resp.headers).to.have.property('content-type', 'application/json; charset=utf-8'); // assert properties
  if(resp.body.length != 0){ // there could be no data
    expect(resp.body[0].id).not.eq(null); // assert objects
    // expect(resp.body[0].value).not.eq(null); // this seems to be optional (e.g. Milestones, Phase)
    expect(resp.body[0].sortOrder).not.eq(null);
    expect(resp.body[0].type).not.eq(null);
  }
  cy.log(`A total of '${resp.body.length}' records successfully retrieved.`);
}

before(() => { // token is generated and written to fixtures/data.json before any run-time via support/index.js
  cy.fixture('data').should((data) => {
    token = data.token;
  });
});

describe(['customization'], 'Integration: Lookup fields', ()=> {
  it('Admin - Retrieve Lookup fields', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '', data).should((resp) => {
      expect(resp.status).to.eq(200); // assert status code
      expect(resp.headers).to.have.property('content-type', 'application/json; charset=utf-8'); // assert properties
      expect(resp.body[0].name).not.eq(null); // assert objects (there should always be data)
      expect(resp.body[0].description).not.eq(null);

      count = resp.body.length;
      for(let i=0; i<count; i++) { // iterate all fields
        cy.log(`The record '${resp.body[i].name}' with description '${resp.body[i].description}' successfully retrieved.`);
      }
      cy.log(`A total of '${resp.body.length}' records successfully retrieved.`);
    });

    cy.log('**Call Lookup fields API with incorrect token** 🔥');
    data = {
      "token": ''
    };
    cy.lookupFields('GET', '', data).should((resp) => {
      expect(resp.status).to.eq(401);
      cy.log(`Error is '${resp.body.message}'.`);
    });
  });

  it('Admin - Retrieve Lookup fields - Action Type', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/ActionType', data).should((resp) => {
      checkResponseBody(resp);

      count = resp.body.length;
      for(let i=0; i<count; i++) { // iterate all fields
        cy.log(`The record '${resp.body[i].value}' successfully retrieved.`);
      }
    });

    cy.log('**Call Lookup fields API with incorrect token** 🔥');
    data = {
      "token": uuidv4()
    };
    cy.lookupFields('GET', '/ActionType', data).should((resp) => {
      expect(resp.status).to.eq(401);
      cy.log(`Error is '${resp.body.message}'.`);
    });
  });

  it('Admin - Retrieve Lookup fields - Action Status', () => { // no need to test error status codes as this can be checked with one endpoint since they share same logic
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/ActionStatus', data).should((resp) => {
      checkResponseBody(resp);
      // count = resp.body.length // this may not be necessary as done on a similar endpoint and its just prolonging the run-time
      // for(let i=0; i<count; i++) { // iterate all fields
      //   cy.log(`The record '${resp.body[i].value}' successfully retrieved.`)
      // }
    });
  });

  it.skip('Admin - Retrieve Lookup fields - Actions By Type', () => { // TODO: Check with team/devs if this is needed as response is same with ActionType #eliminatewaste
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/ActionsByType', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - Actions Priority', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/ActionsPriority', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - Blockout Period Type', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/BlockoutPeriodType', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - Booking Request Status', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/BookingRequestStatus', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - Booking Request Type', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/BookingRequestType', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - Calendar Event Portfolio', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/CalendarEventPortfolio', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - Calendar Event Status', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/CalendarEventStatus', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - Calendar Event Type', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/CalendarEventType', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - Change Delivery Risk', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/ChangeDeliveryRisk', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - Change Priority', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/ChangePriority', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - Change Request Status', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/ChangeRequestStatus', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - Change Request Type', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/ChangeRequestType', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - Change Status', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/ChangeStatus', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - Change Theme', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/ChangeTheme', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - Change Type', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/ChangeType', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - Defect Priority', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/DefectPriority', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - Defect Status', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/DefectStatus', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - Defect Type', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/DefectType', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - Deployment Plan Group Name', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/DeploymentPlanGroupName', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - Deployment To (Systems)', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/DeploymentTo', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - Deployment Type (Systems)', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/DeploymentType', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - Environment Map Connectivity Type', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/EnvironmentMapConnectivityType', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - Environment Status', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/EnvironmentStatus', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - Escaping Defects By Change Type', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/EscapingDefectsByChangeType', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - External Change Type', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/ExternalChangeType', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - External System', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/ExternalSystem', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - Impact Type', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/ImpactType', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - KPI Metric Type', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/KPIMetricType', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - Milestone Lookup Field', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/MilestoneLookupField', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - Phase Lookup Field', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/PhaseLookupField', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - PIR Category', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/PIRCategory', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - PIR Item Status', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/PIRItemStatus', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - PIR Item Sub Category', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/PIRItemSubCategory', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - PIR Item Type', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/PIRItemType', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - PIR Status', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/PIRStatus', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - PIR Theme', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/PIRTheme', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - PIR Type', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/PIRType', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - PM Status', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/PMStatus', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - PM Type', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/PMType', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - Release Approval Workflow Status', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/ReleaseApprovalWorkflowStatus', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - Release Capacity Type', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/ReleaseCapacityType', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - Release Package', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/ReleasePackage', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - Release Risk Level', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/ReleaseRiskLevel', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - Release Status Type', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/ReleaseStatusType', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - Release Type', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/ReleaseType', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - Requirement Status', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/RequirementStatus', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - Root Cause Status', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/RootCauseStatus', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - Root Cause Type', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/RootCauseType', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - Stack Layer', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/StackLayer', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - Stakeholder Role', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/StakeholderRole', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - System Dependency Impact', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/SystemDependencyImpact', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - System Deployment Type', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/SystemDeploymentType', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - System Role Dependency Type', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/SystemRoleDependencyType', data).should((resp) => {
      checkResponseBody(resp);
    });
  });

  it('Admin - Retrieve Lookup fields - Used For Work Item', () => {
    cy.log('**Call Lookup fields API with correct token** 🔥');
    data = {
      "token": token
    };
    cy.lookupFields('GET', '/UsedForWorkItem', data).should((resp) => {
      checkResponseBody(resp);
    });
  });
});