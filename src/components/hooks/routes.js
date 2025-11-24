const affiliation = [
  {
    parent: "Affiliation",
    path: "/insuree/families",
    title: "Liste des familles",
  },
  {
    parent: "Affiliation",
    path: "/insuree/insurees",
    title: "Liste des assurés",
  },
  {
    parent: "Affiliation",
    path: "/policy/policies",
    title: "Polices",
  },
  {
    parent: "Affiliation",
    title: "Affectation d'un utilisateur",
    path: "insuree/insurees/PendingApprovalAssignemnt",
  },
];

const administration = [
  {
    parent: "Administration",
    path: "/admin/users",
    title: "Utilisateurs",
  },
  {
    parent: "Administration",
    path: "/admin/bank",
    title: "Bank",
  },
  {
    parent: "Administration",
    path: "/admin/fosaConfiguration",
    title: "Catégories des Fosa",
  },
  {
    parent: "Administration",
    path: "/admin/operation",
    title: "Opération Management",
  },
  {
    parent: "Administration",
    path: "/admin/serviceActs",
    title: "Medical services category management",
  },
  {
    parent: "Administration",
    path: "/location/locations",
    title: "Localisations geographiques",
  },
  {
    parent: "Administration",
    path: "/location/centers",
    title: "Centres",
  },
  {
    parent: "Administration",
    path: "/roles",
    title: "Gestion des roles",
  },
  {
    parent: "Administration",
    path: "/policyHolderUsers",
    title: "Administrateurs souscripteurs",
  },
  {
    parent: "Administration",
    path: "/admin/dashboard",
    title: "Dashboard",
  },
  {
    parent: "Administration",
    path: "/admin/fosa/users",
    title: "Utilisateurs Fosa",
  },
  {
    parent: "Administration",
    path: "/admin/policyholder/users",
    title: "Utilisateurs souscripteurs",
  },
];

const demandePayement = [
  {
    parent: "Demande de paiement",
    path: "/claim/reviews",
    title: "Controle et paiement des factures",
  },
  {
    parent: "Demande de paiement",
    path: "/claim_batch",
    title: "Evaluation par lots",
  },
  {
    parent: "Demande de paiement",
    path: "/claim/healthFacilities",
    title: "Demande de paiement",
  },
  {
    parent: "Demande de paiement",
    path: "/claim/invoiceApproval",
    title: "Invoices",
  },
];

const category = [
  {
    parent: "Category des assurés",
    title: "Category des assurés",
    path: "/admin/products",
  },
  {
    parent: "Category des assurés",
    title: "Cotisations",
    path: "/contributionPlans",
  },
  {
    parent: "Category des assurés",
    title: "Taux/forfait cotisations",
    path: "/contributionPlanBundles",
  },
];

const fosa = [
  {
    parent: "Fosa",
    title: "Formation sanitaire",
    path: "/location/healthFacilities",
  },
  {
    parent: "Fosa",
    title: "Paquet de soins : actes des soins",
    path: "/medical/pricelists/services",
  },
  {
    parent: "Fosa",
    title: "Paquet de soins: produits medicaux",
    path: "/medical/pricelists/items",
  },
  {
    parent: "Fosa",
    title: "Actes des soins",
    path: "/medical/medicalServices",
  },
  {
    parent: "Fosa",
    title: "Produits medicaux",
    path: "/medical/medicalItems",
  },
  {
    parent: "Fosa",
    title: "Verification",
    path: "/insuree/insurees/verifyinsuree",
  },
];

const outils = [
  {
    parent: "Outils",
    path: "/tools/registers",
    title: "Registres",
  },
  {
    parent: "Outils",
    path: "/tools/extracts",
    title: "Extraits",
  },
  {
    parent: "Outils",
    path: "/tools/reports",
    title: "Rapports",
  },
  {
    parent: "Outils",
    path: "/tools/manualSync",
    title: "Manuels Synchronisation",
  },
];

const profile = [
  {
    parent: "Profil",
    path: "/profile/myProfile",
    title: "Information",
  },
  {
    parent: "Profil",
    path: "/profile/changePassword",
    title: "Changer mot de passe",
  },
];

const souscripteurs = [
  {
    parent: "Souscripteurs",
    path: "/contribution/contributions",
    title: "Contributions",
  },
  {
    parent: "Souscripteurs",
    path: "/policyHolders",
    title: "Immatriculation",
  },
  {
    parent: "Souscripteurs",
    path: "/contribution/contributions",
    title: "Contributions",
  },
  {
    parent: "Souscripteurs",
    path: "/payment/payments",
    title: "Recouvrements",
  },
  {
    parent: "Souscripteurs",
    path: "/paymentApproval",
    title: "Paiement par approbation",
  },
  {
    parent: "Souscripteurs",
    path: "/contracts",
    title: "Déclaration",
  },
  {
    parent: "Souscripteurs",
    path: "/declaration",
    title: "Rapport de déclaration",
  },
  {
    parent: "Souscripteurs",
    path: "/policyholderRequest",
    title: "Nouveau souscripteur demandes",
  },
];

const juridique = [
  {
    parent: "Juridique et financier",
    path: "/invoices",
    title: "Factures",
  },
  {
    parent: "Juridique et financier",
    path: "/bills",
    title: "Factures",
  },
  {
    parent: "Juridique et financier",
    path: "/paymentPlans",
    title: "Plans de paiement",
  },
  {
    parent: "Juridique et financier",
    path: "/payment/paymentpenalty",
    title: "Pénalité de sanction",
  },
];

const exceptions = [
  {
    parent: "Exceptions",
    path: "/exception",
    title: "Exception pour les assurés",
  },
  {
    parent: "Exceptions",
    path: "/exception/policyholder",
    title: "Exception pour les souscripteurs",
  },
  {
    parent: "Exceptions",
    path: "/exception/pendingapproval",
    title: "En attente d'approbation",
  },
];

export const routePages = [
  {
    "path": "home",
    "title": "",
    "parent": "",
  },
  ...affiliation,
  ...demandePayement,
  ...administration,
  ...category,
  ...fosa,
  ...outils,
  ...profile,
  ...souscripteurs,
  ...juridique,
  ...exceptions,
];
