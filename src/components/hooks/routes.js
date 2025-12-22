const affiliation = [
  {
    parent: "insuree.mainMenu",
    path: "/insuree/families",
    title: "insuree.menu.familiesOrGroups",
    subtitle: "core.routes.affiliation.families.subtitle",
  },
  {
    parent: "insuree.mainMenu",
    path: "/insuree/insurees",
    title: "insuree.menu.insurees",
    subtitle: "core.routes.affiliation.insurees.subtitle",
  },
  {
    parent: "insuree.mainMenu",
    path: "/policy/policies",
    title: "policy.menu.policies",
    subtitle: "core.routes.affiliation.policies.subtitle",
  },
  {
    parent: "insuree.mainMenu",
    title: "core.routes.affiliation.assignment.title",
    path: "/insuree/insurees/PendingApprovalAssignemnt",
    subtitle: "core.routes.affiliation.assignment.subtitle",
  },
];

const administration = [
  {
    parent: "admin.mainMenu",
    path: "/admin/users",
    title: "admin.menu.users",
    subtitle: "core.routes.administration.users.subtitle",
  },
  {
    parent: "admin.mainMenu",
    path: "/admin/bank",
    title: "core.routes.administration.bank.title",
    subtitle: "core.routes.administration.bank.subtitle",
  },
  {
    parent: "admin.mainMenu",
    path: "/admin/fosaConfiguration",
    title: "core.routes.administration.fosaCategories.title",
    subtitle: "core.routes.administration.fosaCategories.subtitle",
  },
  {
    parent: "admin.mainMenu",
    path: "/admin/operation",
    title: "core.routes.administration.operations.title",
    subtitle: "core.routes.administration.operations.subtitle",
  },
  {
    parent: "admin.mainMenu",
    path: "/admin/serviceActs",
    title: "core.routes.administration.medicalServices.title",
    subtitle: "core.routes.administration.medicalServices.subtitle",
  },
  {
    parent: "admin.mainMenu",
    path: "/location/locations",
    title: "admin.menu.locations",
    subtitle: "core.routes.administration.locations.subtitle",
  },
  {
    parent: "admin.mainMenu",
    path: "/location/centers",
    title: "core.routes.administration.centers.title",
    subtitle: "core.routes.administration.centers.subtitle",
  },
  {
    parent: "admin.mainMenu",
    path: "/roles",
    title: "core.routes.administration.roles.title",
    subtitle: "core.routes.administration.roles.subtitle",
  },
  {
    parent: "admin.mainMenu",
    path: "/policyHolderUsers",
    title: "core.routes.administration.policyholderAdmins.title",
    subtitle: "core.routes.administration.policyholderAdmins.subtitle",
  },
  {
    parent: "admin.mainMenu",
    path: "/admin/dashboard",
    title: "core.routes.administration.dashboard.title",
    subtitle: "core.routes.administration.dashboard.subtitle",
  },
  {
    parent: "admin.mainMenu",
    path: "/admin/fosa/users",
    title: "core.routes.administration.fosaUsers.title",
    subtitle: "core.routes.administration.fosaUsers.subtitle",
  },
  {
    parent: "admin.mainMenu",
    path: "/admin/policyholder/users",
    title: "core.routes.administration.policyholderUsers.title",
    subtitle: "core.routes.administration.policyholderUsers.subtitle",
  },
  {
    parent: "admin.mainMenu",
    path: "/admin/fosa/user-functionalities",
    title: "core.routes.administration.fosaUserFunctionalities.title",
    subtitle: "core.routes.administration.fosaUserFunctionalities.subtitle",
  },
  {
    parent: "admin.mainMenu",
    path: "/admin/fosa/user-specialties",
    title: "core.routes.administration.fosaUserSpecialties.title",
    subtitle: "core.routes.administration.fosaUserSpecialties.subtitle",
  },
];

const demandePayement = [
  {
    parent: "claim.mainMenu",
    path: "/claim/reviews",
    title: "claim.menu.reviews",
    subtitle: "core.routes.payment.reviews.subtitle",
  },
  {
    parent: "claim.mainMenu",
    path: "/claim_batch",
    title: "claim_batch.menu.claim_batch",
    subtitle: "core.routes.payment.batch.subtitle",
  },
  {
    parent: "claim.mainMenu",
    path: "/claim/healthFacilities",
    title: "claim.menu.healthFacilityClaims",
    subtitle: "core.routes.payment.requests.subtitle",
  },
  {
    parent: "claim.mainMenu",
    path: "/claim/invoiceApproval",
    title: "core.routes.payment.invoices.title",
    subtitle: "core.routes.payment.invoices.subtitle",
  },
];

const category = [
  {
    parent: "admin.productMenu",
    title: "admin.menu.products",
    path: "/admin/products",
    subtitle: "core.routes.category.products.subtitle",
  },
  {
    parent: "admin.productMenu",
    title: "core.routes.category.contributions.title",
    path: "/contributionPlans",
    subtitle: "core.routes.category.contributions.subtitle",
  },
  {
    parent: "admin.productMenu",
    title: "core.routes.category.contributionBundles.title",
    path: "/contributionPlanBundles",
    subtitle: "core.routes.category.contributionBundles.subtitle",
  },
  {
    parent: "admin.productMenu",
    path: "/front/admin/products",
    title: "core.routes.category.adminProducts.title",
    subtitle: "core.routes.category.adminProducts.subtitle",
  },
  {
    parent: "admin.productMenu",
    path: "/admin/declarations-audit",
    title: "core.routes.category.declarationsAudit.title",
    subtitle: "core.routes.category.declarationsAudit.subtitle",
  },
];

const fosa = [
  {
    parent: "admin.fosaMenu",
    title: "admin.menu.healthFacilities",
    path: "/location/healthFacilities",
    subtitle: "core.routes.fosa.healthFacilities.subtitle",
  },
  {
    parent: "admin.fosaMenu",
    title: "admin.menu.medicalServicesPrices",
    path: "/medical/pricelists/services",
    subtitle: "core.routes.fosa.medicalServicesPrices.subtitle",
  },
  {
    parent: "admin.fosaMenu",
    title: "admin.menu.medicalItemsPrices",
    path: "/medical/pricelists/items",
    subtitle: "core.routes.fosa.medicalItemsPrices.subtitle",
  },
  {
    parent: "admin.fosaMenu",
    title: "admin.menu.medicalServices",
    path: "/medical/medicalServices",
    subtitle: "core.routes.fosa.medicalServices.subtitle",
  },
  {
    parent: "admin.fosaMenu",
    title: "admin.menu.medicalItems",
    path: "/medical/medicalItems",
    subtitle: "core.routes.fosa.medicalItems.subtitle",
  },
  {
    parent: "Fosa",
    title: "Gestion des Actes de Soins",
    path: "/healthServiceManagement",
  },
  {
    parent: "Fosa",
    title: "Verification",
    path: "/insuree/insurees/verifyinsuree",
    subtitle: "core.routes.fosa.verification.subtitle",
  },
  {
    parent: "admin.fosaMenu",
    title: "core.routes.fosa.userFunctionalities.title",
    path: "/fosa/user-functionalities",
    subtitle: "core.routes.fosa.userFunctionalities.subtitle",
  },
  {
    parent: "admin.fosaMenu",
    title: "core.routes.fosa.userSpecialties.title",
    path: "/fosa/user-specialties",
    subtitle: "core.routes.fosa.userSpecialties.subtitle",
  },
  {
    parent: "admin.fosaMenu",
    title: "admin.menu.mainDiagnoses",
    path: "/medical/medicalPathologies",
    subtitle: "core.routes.fosa.pathologies.subtitle",
  },
  {
    parent: "admin.fosaMenu",
    title: "core.routes.fosa.pathologiesBundle.title",
    path: "/medical/medicalPathologiesBundle",
    subtitle: "core.routes.fosa.pathologiesBundle.subtitle",
  },
  {
    parent: "admin.fosaMenu",
    title: "admin.menu.conventionnements",
    path: "/location/conventionnements",
    subtitle: "core.routes.fosa.conventionnements.subtitle",
  },
  {
    parent: "admin.fosaMenu",
    path: "/claim/preauthorization",
    title: "core.routes.fosa.preauthorization.title",
    subtitle: "core.routes.fosa.preauthorization.subtitle",
  },
  {
    parent: "admin.fosaMenu",
    path: "/claim/preauthorization/approval",
    title: "core.routes.fosa.preauthorizationApproval.title",
    subtitle: "core.routes.fosa.preauthorizationApproval.subtitle",
  },
];

const location = [
  {
    parent: "core.routes.location.mainMenu",
    title: "core.routes.location.title",
    path: "/location",
    subtitle: "core.routes.location.subtitle",
  },
];

const outils = [
  {
    parent: "tools.mainMenu",
    path: "/tools/registers",
    title: "tools.menu.registers",
    subtitle: "core.routes.tools.registers.subtitle",
  },
  {
    parent: "tools.mainMenu",
    path: "/tools/extracts",
    title: "tools.menu.extracts",
    subtitle: "core.routes.tools.extracts.subtitle",
  },
  {
    parent: "tools.mainMenu",
    path: "/tools/reports",
    title: "core.routes.tools.reports.title",
    subtitle: "core.routes.tools.reports.subtitle",
  },
  {
    parent: "tools.mainMenu",
    path: "/tools/manualSync",
    title: "core.routes.tools.manualSync.title",
    subtitle: "core.routes.tools.manualSync.subtitle",
  },
];

const profile = [
  {
    parent: "profile.mainMenu",
    path: "/profile",
    title: "core.routes.profile.main.title",
    subtitle: "core.routes.profile.main.subtitle",
  },
  {
    parent: "profile.mainMenu",
    path: "/profile/myProfile",
    title: "profile.menu.myProfile",
    subtitle: "core.routes.profile.myProfile.subtitle",
  },
  {
    parent: "profile.mainMenu",
    path: "/profile/changePassword",
    title: "profile.menu.changePassword",
    subtitle: "core.routes.profile.changePassword.subtitle",
  },
];

const souscripteursBase = [
  {
    parent: "core.routes.policyholder.mainMenu",
    path: "/souscripteurs",
    title: "core.routes.policyholder.title",
    subtitle: "core.routes.policyholder.subtitle",
  },
];

const souscripteurs = [
  {
    parent: "policyHolder.mainmenu",
    path: "/contribution/contributions",
    title: "policy.menu.contributions",
    subtitle: "core.routes.policyholder.contributions.subtitle",
  },
  {
    parent: "policyHolder.mainmenu",
    path: "/policyHolders",
    title: "core.routes.policyholder.registration.title",
    subtitle: "core.routes.policyholder.registration.subtitle",
  },
  {
    parent: "policyHolder.mainmenu",
    path: "/payment/payments",
    title: "payment.menu.payments",
    subtitle: "core.routes.policyholder.recoveries.subtitle",
  },
  {
    parent: "policyHolder.mainmenu",
    path: "/paymentApproval",
    title: "policyHolder.menu.paymentForApproval",
    subtitle: "core.routes.policyholder.paymentApproval.subtitle",
  },
  {
    parent: "policyHolder.mainmenu",
    path: "/contracts",
    title: "core.routes.policyholder.declaration.title",
    subtitle: "core.routes.policyholder.declaration.subtitle",
  },
  {
    parent: "policyHolder.mainmenu",
    path: "/declaration",
    title: "core.routes.policyholder.declarationReport.title",
    subtitle: "core.routes.policyholder.declarationReport.subtitle",
  },
  {
    parent: "policyHolder.mainmenu",
    path: "/policyholderRequest",
    title: "core.routes.policyholder.newRequests.title",
    subtitle: "core.routes.policyholder.newRequests.subtitle",
  },
];

const juridique = [
  {
    parent: "core.routes.legal.mainMenu",
    path: "/invoices",
    title: "core.routes.legal.invoices.title",
    subtitle: "core.routes.legal.invoices.subtitle",
  },
  {
    parent: "core.routes.legal.mainMenu",
    path: "/bills",
    title: "core.routes.legal.bills.title",
    subtitle: "core.routes.legal.bills.subtitle",
  },
  {
    parent: "core.routes.legal.mainMenu",
    path: "/paymentPlans",
    title: "core.routes.legal.paymentPlans.title",
    subtitle: "core.routes.legal.paymentPlans.subtitle",
  },
  {
    parent: "core.routes.legal.mainMenu",
    path: "/payment/paymentpenalty",
    title: "core.routes.legal.penalty.title",
    subtitle: "core.routes.legal.penalty.subtitle",
  },
];

const exceptions = [
  {
    parent: "core.routes.exceptions.mainMenu",
    path: "/exception",
    title: "core.routes.exceptions.insuree.title",
    subtitle: "core.routes.exceptions.insuree.subtitle",
  },
  {
    parent: "core.routes.exceptions.mainMenu",
    path: "/exception/policyholder",
    title: "core.routes.exceptions.policyholder.title",
    subtitle: "core.routes.exceptions.policyholder.subtitle",
  },
  {
    parent: "core.routes.exceptions.mainMenu",
    path: "/exception/pendingapproval",
    title: "core.routes.exceptions.pendingApproval.title",
    subtitle: "core.routes.exceptions.pendingApproval.subtitle",
  },
];

export const routePages = [
  {
    path: "/home",
    title: "core.routes.home.title",
    parent: "core.routes.home.parent",
    subtitle: "core.routes.home.subtitle",
  },
  ...affiliation,
  ...demandePayement,
  ...administration,
  ...category,
  ...fosa,
  ...location,
  ...outils,
  ...profile,
  ...souscripteursBase,
  ...souscripteurs,
  ...juridique,
  ...exceptions,
];
