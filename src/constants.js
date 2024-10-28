export const DEFAULT_DEBOUNCE_TIME = 500;
export const DEFAULT_PAGE_SIZE = 10;
export const ROWS_PER_PAGE_OPTIONS = [10, 20, 50, 100];
export const CONTAINS_LOOKUP = "Icontains";
export const LANGUAGE_EN = "en";
export const QUERY_STRING_DUPLICATE = "duplicate";
export const RIGHT_ROLE_SEARCH = 122001;
export const RIGHT_ROLE_CREATE = 122002;
export const RIGHT_ROLE_UPDATE = 122003;
export const RIGHT_ROLE_DELETE = 122004;
export const RIGHT_ROLE_DUPLICATE = 122005;
export const MODULE_NAME = "core";

export const USER_ACTIVITY_REPORT_ACTION_INSERT = "I";
export const USER_ACTIVITY_REPORT_ACTION_UPDATE = "U";
export const USER_ACTIVITY_REPORT_ACTION_DELETE = "D";
export const USER_ACTIVITY_REPORT_ACTIONS = [
  USER_ACTIVITY_REPORT_ACTION_INSERT,
  USER_ACTIVITY_REPORT_ACTION_UPDATE,
  USER_ACTIVITY_REPORT_ACTION_DELETE
];

export const USER_ACTIVITY_REPORT_ENTITY_CLAIM = "Claim";
export const USER_ACTIVITY_REPORT_ENTITY_BATCH_RUN = "BatchRun";
export const USER_ACTIVITY_REPORT_ENTITY_CLAIM_ADMIN = "ClaimAdmin";
export const USER_ACTIVITY_REPORT_ENTITY_LOCATION = "Location";
export const USER_ACTIVITY_REPORT_ENTITY_EXTRACT = "Extract";
export const USER_ACTIVITY_REPORT_ENTITY_FAMILY = "Family";
export const USER_ACTIVITY_REPORT_ENTITY_FEEDBACK = "Feedback";
export const USER_ACTIVITY_REPORT_ENTITY_LOC_HF = "HealthFacility";
export const USER_ACTIVITY_REPORT_ENTITY_INSUREE = "Insuree";
export const USER_ACTIVITY_REPORT_ENTITY_ITEM = "Item";
export const USER_ACTIVITY_REPORT_ENTITY_OFFICER = "Officer";
export const USER_ACTIVITY_REPORT_ENTITY_PAYER = "Payer";
export const USER_ACTIVITY_REPORT_ENTITY_PHOTO = "InsureePhoto";
export const USER_ACTIVITY_REPORT_ENTITY_PL_ITEM = "ItemsPricelist";
export const USER_ACTIVITY_REPORT_ENTITY_PL_SERVICE = "ServicesPricelist";
export const USER_ACTIVITY_REPORT_ENTITY_PL_ITEM_DETAILS = "ItemsPricelistDetail";
export const USER_ACTIVITY_REPORT_ENTITY_PL_SERVICE_DETAILS = "ServicesPricelistDetail";
export const USER_ACTIVITY_REPORT_ENTITY_POLICY = "Policy";
export const USER_ACTIVITY_REPORT_ENTITY_PREMIUM = "Premium";
export const USER_ACTIVITY_REPORT_ENTITY_PRODUCT = "Product";
export const USER_ACTIVITY_REPORT_ENTITY_PRODUCT_ITEM = "ProductItem";
export const USER_ACTIVITY_REPORT_ENTITY_PRODUCT_SERVICE = "ProductService";
export const USER_ACTIVITY_REPORT_ENTITY_RELATIVE_DISTRIBUTION = "RelativeDistribution";
export const USER_ACTIVITY_REPORT_ENTITY_SERVICE = "Service";
export const USER_ACTIVITY_REPORT_ENTITY_USER = "InteractiveUser";
export const USER_ACTIVITY_REPORT_ENTITY_USER_DISTRICT = "UserDistrict";

export const STORAGE_KEY_SECONDARY_CALENDAR = "isSecondaryCalendarEnabled";
export const DEFAULT_SETTINGS = {
  SECOND_CALENDAR_FORMAT: "DD-MM-YYYY",
  SECOND_CALENDAR_LANG: "en",
  };

export const USER_ACTIVITY_REPORT_ENTITIES = [
  USER_ACTIVITY_REPORT_ENTITY_BATCH_RUN,
  USER_ACTIVITY_REPORT_ENTITY_CLAIM,
  USER_ACTIVITY_REPORT_ENTITY_CLAIM_ADMIN,
  USER_ACTIVITY_REPORT_ENTITY_EXTRACT,
  USER_ACTIVITY_REPORT_ENTITY_FAMILY,
  USER_ACTIVITY_REPORT_ENTITY_FEEDBACK,
  USER_ACTIVITY_REPORT_ENTITY_LOCATION,
  USER_ACTIVITY_REPORT_ENTITY_LOC_HF,
  USER_ACTIVITY_REPORT_ENTITY_INSUREE,
  USER_ACTIVITY_REPORT_ENTITY_ITEM,
  USER_ACTIVITY_REPORT_ENTITY_OFFICER,
  USER_ACTIVITY_REPORT_ENTITY_PAYER,
  USER_ACTIVITY_REPORT_ENTITY_PHOTO,
  USER_ACTIVITY_REPORT_ENTITY_PL_ITEM,
  USER_ACTIVITY_REPORT_ENTITY_PL_SERVICE,
  USER_ACTIVITY_REPORT_ENTITY_PL_ITEM_DETAILS,
  USER_ACTIVITY_REPORT_ENTITY_PL_SERVICE_DETAILS,
  USER_ACTIVITY_REPORT_ENTITY_POLICY,
  USER_ACTIVITY_REPORT_ENTITY_PREMIUM,
  USER_ACTIVITY_REPORT_ENTITY_PRODUCT,
  USER_ACTIVITY_REPORT_ENTITY_PRODUCT_ITEM,
  USER_ACTIVITY_REPORT_ENTITY_PRODUCT_SERVICE,
  USER_ACTIVITY_REPORT_ENTITY_RELATIVE_DISTRIBUTION,
  USER_ACTIVITY_REPORT_ENTITY_SERVICE,
  USER_ACTIVITY_REPORT_ENTITY_USER,
  USER_ACTIVITY_REPORT_ENTITY_USER_DISTRICT
];

// consts relate do custom filters
export const BOOL_OPTIONS = [
  { value: "True", label: "True" },
  { value: "False", label: "False" },
];
export const CLEARED_STATE_FILTER = { field: "", filter: "", type: "", value: "" }
export const BENEFIT_PLAN = "BenefitPlan";
export const CUSTOM_FILTERS = "customFilters"
export const INTEGER = "integer";
export const NUMBER = "number";
export const STRING = "string";
export const BOOLEAN = "boolean";
export const DATE = "date";
export const FIELD_TYPES = {
  INTEGER, NUMBER, STRING, BOOLEAN, DATE
}

export const WHITE_SPACE = " ";
export const DOUBLE_UNDERSCORE = "__";
export const GLOBAL_UNDERSCORE = /_/g;;
export const EQUALS_SIGN = "=";

export const CLAIM_STATS_ORDER = [
  "submitted",
  "checked",
  "processed",
  "valuated",
  "rejected",
  "items_passed",
  "items_rejected",
  "services_passed",
  "services_rejected"
]

export const CORE_MIS_CONFLUENCE_URL = "https://openimis.atlassian.net/wiki/spaces/OP/pages/3531407380/Project+2022.T3+CORE-MIS+Merger";
export const DEFAULT_URL = "https://docs.openimis.org/";

export const  SAML_LOGIN_PATH = "/msystems/saml/login/";
export const  SAML_LOGOUT_PATH = "/msystems/saml/logout/";

export const RIGHT_VIEW_EU_MODAL = 203000;

export const ENTER_KEY = "Enter";

export const PUBLIC_PAGE_LANGUAGE_COOKIE_KEY = "publicPageLanguage";

export const DEFAULT = {
  IS_WORKER: false,
  ENABLE_PUBLIC_PAGE: false,
  SHOW_JOURNAL_SIDEBAR: true,
}

export const EXPORT_FILE_FORMATS = {
  // By default, the export file format is CSV
  csv: "csv",
  // The other available export file format is XLSX.
  // It can be configured individually for each Searcher.
  xlsx: "xlsx",
};
