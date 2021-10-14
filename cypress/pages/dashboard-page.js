const dashboardUrl = Cypress.env().baseUrl + '/dashboards';
// e.g. https://qa-orange-demo.plutora.org/dashboards

export const vsfmPageModel = {
  url: dashboardUrl + '/vsfm',
  datePickerDropDown: '[data-testid="Box"] > button:nth-last-child(2) svg',
  toDateInput: '[data-testid="toDate"]',
  throughputworkItemsCountText: '[data-testid="Work Items Completed"]:nth-of-type(2)',
  throughputRiskCountText: '[data-testid="Throughput_Feature"]:contains("Risk") b',
  throughputTechDebtCountText: '[data-testid="Throughput_Feature"]:contains("Tech Debt") b',
  throughputFeatureCountText: '[data-testid="Throughput_Feature"]:contains("Feature") b',
  riskCountText: '[data-testid="Risk"]',
  techDebtCountText: '[data-testid="Tech Debt"]',
  featureCountText: '[data-testid="Feature"]',
  workDistributionBox:'[data-testid="Work Breakdown"]',
  workDistributionFeatureCountText:'[data-testid="Features Ratio"]:nth-of-type(2)',
  workDistributionTechDebtCountText:' [data-testid="Tech Debt Ratio"] p:nth-of-type(2)',
  workDistributionRiskCountText:'[data-testid="Risk Ratio"]:nth-of-type(2)',
  workDistributionFeaturePercentage:'[data-testid="Flex_Feature"] [data-testid="Features Percentage"]',
  workDistributionTechDebtPercentage:'[data-testid="Flex_Tech Debt"] [data-testid="Features Percentage"]',
  workDistributionRiskPercentage:'[data-testid="Flex_Risk"] [data-testid="Features Percentage"]',
  leadTimeAverageCountText:'[data-testid="Avg. Lead Time"]:only-child > p:nth-child(2)',
  cycleTimeAverageCountText:'[data-testid="Avg. Cycle Time"]:only-child > p:nth-child(2)',
  flowEfficiencyAveragePercentage:'[data-testid="Avg. Flow Efficiency"]:only-child > p:nth-child(2)',
  widgetLeadTimeAverageCountText:'[data-testid="avgLeadTime"]',
  widgetCycleTimeAverageCountText:'[data-testid="avgCycleTime"]',
  widgetFlowEfficiencyAveragePercentage:'[data-testid="avgFlowEfficiency"]',
  completedDistributionLongestLeadTimeCountText:'[data-testid="Longest Lead Time"] > p:nth-child(2)',
  workItemsCumulativeFlowCountText: '[data-testid="workItemCumulativeFlows_Box"] [data-testid="Avg. Work in Progress"] p:nth-child(2)',
};

const dashboardLegacyUrl = Cypress.env().baseUrl + '/dashboard';
// e.g. https://qa-orange-demo.plutora.org/dashboard

export const insightPageModel = {
  url: dashboardLegacyUrl + '/insights',
};