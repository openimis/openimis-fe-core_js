export const defaultMenus = [
  {
    position: 1,
    id: "insuree.MainMenu",
    text: "Client Registry",
    icon: "AssignmentInd",
    submenus: [
      { id: "policyHolders", route: "policyHolders" },
      { id: "policy/policies", route: "policy/policies" },
      { id: "payment/payments", route: "payment/payments" },
      { id: "insuree/family", route: "insuree/family" },
      { id: "insuree/families", route: "insuree/families" },
      { id: "insuree/insurees", route: "insuree/insurees" },
      { id: "contribution/contributions", route: "contribution/contributions" }
    ]
  },
  {
    position: 2,
    id: "claim.MainMenu",
    text: "Claims",
    icon: "ScreenShare",
    submenus: [
      { id: "claim_batch", route: "claim_batch" },
      { id: "claim/healthFacilities", route: "claim/healthFacilities" },
      { id: "claim/reviews", route: "claim/reviews" }
    ]
  },
  {
    position: 3,
    id: "admin.MainMenu",
    text: "Admin",
    icon: "LocationCity",
    submenus: [
      { id: "location/locations", route: "location/locations" },
      { id: "location/healthFacilities", route: "location/healthFacilities" },
      { id: "tasks/groups", route: "tasks/groups" },
      { id: "contributionPlans", route: "contributionPlans" },
      { id: "contributionPlanBundles", route: "contributionPlanBundles" },
      { id: "policyHolderUsers", route: "policyHolderUsers" },
      { id: "payer/payers", route: "payer/payers" },
      { id: "admin/products", route: "admin/products" },
      { id: "roles", route: "roles" },
      { id: "admin/users", route: "admin/users" },
      { id: "medical/medicalServices", route: "medical/medicalServices" },
      { id: "medical/medicalItems", route: "medical/medicalItems" },
      { id: "medical/pricelists/services", route: "medical/pricelists/services" },
      { id: "medical/pricelists/items", route: "medical/pricelists/items" }
    ]
  },
  {
    position: 4,
    id: "invoice.MainMenu",
    text: "Legal & Finance",
    icon: "BalanceIcon",
    submenus: [
      { id: "invoices", route: "invoices" },
      { id: "bills", route: "bills" },
      { id: "paymentPlans", route: "paymentPlans" },
      { id: "paymentPoints", route: "paymentPoints" },
      { id: "payrolls", route: "payrolls" },
      { id: "payrollsPending", route: "payrollsPending" },
      { id: "payrollsApproved", route: "payrollsApproved" },
      { id: "payrollsReconciled", route: "payrollsReconciled" },
      { id: "payment/paymentsInvoice", route: "payment/paymentsInvoice" },
      { id: "contracts", route: "contracts" },
      { id: "paymentCycles", route: "paymentCycles" }
    ]
  },
  {
    position: 5,
    id: "socialProtection.MainMenu",
    text: "Social Protection",
    icon: "Diversity2Icon",
    submenus: [
      { id: "individuals", route: "individuals" },
      { id: "groups", route: "groups" },
      { id: "imports", route: "imports" },
      { id: "individuals/enrollment", route: "individuals/enrollment" },
      { id: "groups/enrollment", route: "groups/enrollment" },
      { id: "benefitPlans", route: "benefitPlans" }
    ]
  },
  {
    position: 6,
    id: "tasksManagement.MainMenu",
    text: "Tasks Management",
    icon: "Assignment",
    submenus: [
      { id: "tasks", route: "tasks" },
      { id: "allTasks", route: "allTasks" }
    ]
  },
  {
    position: 7,
    id: "OpenSearch.MainMenu",
    text: "Open Search Reports",
    icon: "DashboardIcon",
    submenus: [
      { id: "individualReports", route: "individualReports" },
      { id: "groupReports", route: "groupReports" },
      { id: "beneficiaryReports", route: "beneficiaryReports" },
      { id: "invoiceReports", route: "invoiceReports" },
      { id: "paymentReports", route: "paymentReports" },
      { id: "grievanceReports", route: "grievanceReports" },
      { id: "dataUpdatesReports", route: "dataUpdatesReports" },
      { id: "dashboardConfiguration", route: "dashboardConfiguration" }
    ]
  },
  {
    position: 8,
    id: "profile.MainMenu",
    text: "Profile",
    icon: "AccountCircle",
    submenus: [
      { id: "profile/myProfile", route: "profile/myProfile" },
      { id: "profile/changePassword", route: "profile/changePassword" }
    ]
  },
  {
    position: 9,
    id: "tools.MainMenu",
    text: "Tools",
    icon: "Settings",
    submenus: [
      { id: "tools/registers", route: "tools/registers" },
      { id: "tools/extracts", route: "tools/extracts" },
      { id: "tools/reports", route: "tools/reports" }
    ]
  },
  {
    position: 10,
    id: "grievance.MainMenu",
    text: "Grievance",
    icon: "ReportProblem"
  }
];
