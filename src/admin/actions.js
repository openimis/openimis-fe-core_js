import {
  graphql,
  formatPageQuery,
  formatPageQueryWithCount,
  formatMutation,
  decodeId,
  prepareMutation,
  graphqlWithVariables,
  fetchMutation,
} from "../actions";
import { mapUserValuesToInput } from "./utils";

const USER_SUMMARY_PROJECTION_BASE = [
  "id",
  "username",
  "officer{id,dob,phone,lastName,otherNames,email}",
  "iUser{id,phone,lastName,otherNames,email,roles{id,name}}",
  "clientMutationId",
];
const USER_SUMMARY_PROJECTION = (mm) => {
  const includeClaimAdmin = mm.getConf("fe-admin", "enableClaimAdminFields", false);
  return includeClaimAdmin
    ? [...USER_SUMMARY_PROJECTION_BASE, "claimAdmin{id,phone,lastName,otherNames,emailId,dob}"]
    : USER_SUMMARY_PROJECTION_BASE;
};
const DISTRICT_DATA_FETCH_PARAMS = "id, uuid, code, name, parent { id, uuid, name, code }";

export const USER_PICKER_PROJECTION = ["id", "username", "iUser{id otherNames lastName}"];

export function fetchUsers(mm, filters = [], restrictHealthFacility = true) {
  return (dispatch, getState) => {
    if (restrictHealthFacility) {
      const state = getState();
      const hf = state.loc.userHealthFacilityFullPath;
      if (hf) {
        filters.push(`healthFacilityId: ${decodeId(hf.id)}`);
      }
    }

    const payload = formatPageQuery("users", filters, mm.getRef("admin.UserPicker.projection"));
    return dispatch(graphql(payload, "ADMIN_USERS", filters));
  };
}
export function fetchUsersSummaries(mm, filters) {
  const payload = formatPageQueryWithCount("users", filters, USER_SUMMARY_PROJECTION(mm));
  return graphql(payload, "ADMIN_USERS_SUMMARIES");
}

export function fetchEnrolmentOfficers(mm, variables) {
  return graphqlWithVariables(
    `
      query ($searchString: String, $first: Int) {
        enrolmentOfficers(str: $searchString, first: $first) {
          edges {
            node {
              id
              code
              lastName
              otherNames

            }
          }
          pageInfo {
            hasNextPage
          }
        }
      }
    `,
    variables,
    "ADMIN_ENROLMENT_OFFICERS",
  );
}

export function fetchSubstitutionEnrolmentOfficers(mm, variables) {
  return graphqlWithVariables(
    `
      query SubstitutionEnrolmentOfficers ($str: String, $villagesUuids: [String!], $officerUuid: String) {
        substitutionEnrolmentOfficers(str: $str, villagesUuids: $villagesUuids, officerUuid: $officerUuid) {
          edges {
            node {
              id
              uuid
              code
              lastName
              otherNames
            }
          }
        }
      }
    `,
    variables,
    "ADMIN_SUBSTITUTION_ENROLMENT_OFFICERS",
  );
}

export function createUser(mm, user, clientMutationLabel) {
  const mutation = prepareMutation(
    `
    mutation ($input: CreateUserMutationInput!) {
      createUser(input: $input) {
        clientMutationId
        internalId
      }
    }
  `,
    mapUserValuesToInput(user),
    { clientMutationLabel },
  );

  // eslint-disable-next-line no-param-reassign
  user.clientMutationId = mutation.clientMutationId;

  return graphqlWithVariables(
    mutation.operation,
    mutation.variables,
    ["ADMIN_USER_MUTATION_REQ", "ADMIN_USER_CREATE_RESP", "ADMIN_USER_MUTATION_ERR"],
    { clientMutationId: mutation.clientMutationId, clientMutationLabel },
  );
}

export function updateUser(mm, user, clientMutationLabel) {
  const mutation = prepareMutation(
    `
    mutation ($input: UpdateUserMutationInput!) {
      updateUser(input: $input) {
        clientMutationId
        internalId
      }
    }
  `,
    mapUserValuesToInput(user),
    { clientMutationLabel },
  );

  // eslint-disable-next-line no-param-reassign
  user.clientMutationId = mutation.clientMutationId;

  return graphqlWithVariables(
    mutation.operation,
    mutation.variables,
    ["ADMIN_USER_MUTATION_REQ", "ADMIN_USER_UPDATE_RESP", "ADMIN_USER_MUTATION_ERR"],
    { clientMutationId: mutation.clientMutationId, clientMutationLabel, userId: user.id },
  );
}

export function deleteUser(mm, user, clientMutationLabel) {
  const mutation = formatMutation("deleteUser", `uuids: ["${decodeId(user.id)}"]`, clientMutationLabel);
  // eslint-disable-next-line no-param-reassign
  user.clientMutationId = mutation.clientMutationId;
  return (dispatch) => {
    dispatch(
      graphql(mutation.payload, ["ADMIN_USER_MUTATION_REQ", "ADMIN_USER_DELETE_RESP", "ADMIN_USER_MUTATION_ERR"], {
        clientMutationId: mutation.clientMutationId,
        clientMutationLabel,
        userId: user.id,
      }),
    );
    dispatch(fetchMutation(mutation.clientMutationId));
  };
}

export function fetchUser(mm, userId, clientMutationId) {
  const filters = [];
  if (userId) {
    filters.push(`id: "${decodeId(userId)}"`);
    filters.push("showDeleted: true");
  } else if (clientMutationId) {
    filters.push(`clientMutationId: "${clientMutationId}"`);
  }
  return graphql(
    `
    {
      users(${filters.join(" ")}) {
        pageInfo { hasNextPage, hasPreviousPage, startCursor, endCursor}
        edges {
          node {
            clientMutationId
            id
            username
            userTypes
            officer {
              id
              uuid
              hasLogin
              phone
              dob
              lastName
              otherNames
              address
              substitutionOfficer { id lastName otherNames code }
              worksTo
              officerVillages {
                id
                location {
                  id
                  name
                  code
                  uuid
                  parent {
                    id
                    name
                    code
                    uuid
                  }
                }
              }
              location {
                id
                name
                uuid
                code
                parent {
                  id
                  name
                  uuid
                  code
                }
              }
            }
            iUser {
              id
              phone
              languageId
              lastName
              otherNames
              defaultRowsPerPage
              roles { id name isSystem}
              healthFacility ${mm.getProjection("location.HealthFacilityPicker.projection")}
              email
              districts: userdistrictSet { location { id name code uuid parent { id code uuid name }}}
            }
            ${
              mm.getConf("fe-admin", "enableClaimAdminFields", false)
                ? `claimAdmin{ id hasLogin emailId phone dob lastName otherNames healthFacility ${mm.getProjection(
                    "location.HealthFacilityPicker.projection",
                  )} }`
                : ``
            }
          }
        }
      }
    }
  `,
    "ADMIN_USER_OVERVIEW",
  );
}

export function newUser() {
  return (dispatch) => {
    dispatch({ type: "ADMIN_USER_NEW" });
  };
}

export function fetchUserMutation(mm, clientMutationId) {
  const payload = formatPageQuery(
    "mutationLogs",
    [`clientMutationId:"${clientMutationId}"`],
    ["id", "status", "users{coreUser{id}}"],
  );
  return graphql(payload, "ADMIN_USER");
}

export function fetchRegionDistricts(parent) {
  const filters = [`type: "D"`];
  if (parent) {
    filters.push(`parent_Uuid: "${parent.uuid}"`);
  }
  const payload = formatPageQuery("locations", filters, [
    "id",
    "uuid",
    "type",
    "code",
    "name",
    "malePopulation",
    "femalePopulation",
    "otherPopulation",
    "families",
    "clientMutationId",
  ]);
  return graphql(payload, `LOCATION_REGION_DISTRICTS`);
}

export function fetchDataFromDistrict(districtUuids) {
  const filters = [];
  if (districtUuids) {
    filters.push(`parent_Uuid_In: ["${districtUuids.join('", "')}"]`);
  }
  const payload = formatPageQuery("locations", filters, [
    `${DISTRICT_DATA_FETCH_PARAMS}, children { edges {node {${DISTRICT_DATA_FETCH_PARAMS}}}}`,
  ]);
  return graphql(payload, `LOCATION_DISTRICT_DATA`);
}

export function fetchObligatoryUserFields() {
  const payload = "query userObligatoryFields {userObligatoryFields}";
  return graphql(payload, `OBLIGTORY_USER_FIELDS`);
}

export function fetchObligatoryEnrolmentOfficerFields() {
  const payload = "query userObligatoryFields {eoObligatoryFields}";
  return graphql(payload, `OBLIGTORY_EO_FIELDS`);
}

export function clearRegionDistricts() {
  return (dispatch) => {
    dispatch({ type: `LOCATION_REGION_DISTRICTS_CLEAR` });
  };
}
export function clearDistrictData() {
  return (dispatch) => {
    dispatch({ type: `LOCATION_DISTRICT_DATA_CLEAR` });
  };
}

export function usernameValidationCheck(mm, variables) {
  return graphqlWithVariables(
    `
    query ($username: String!) {
      isValid: validateUsername(username: $username)
    }
    `,
    variables,
    `USERNAME_FIELDS_VALIDATION`,
  );
}

export function fetchUsernameLength() {
  const payload = "query {usernameLength}";
  return graphql(payload, `USERNAME_LENGTH_FIELDS`);
}

export function fetchPasswordPolicy() {
  const payload = `query {
    passwordPolicy
  }`;
  return graphql(payload, "PASSWORD_POLICY_FIELDS");
}

export function usernameValidationClear() {
  return (dispatch) => {
    dispatch({ type: `USERNAME_FIELDS_VALIDATION_CLEAR` });
  };
}

export function setUsernameValid() {
  return (dispatch) => {
    dispatch({ type: "USERNAME_FIELDS_VALIDATION_SET_VALID" });
  };
}

export function clearUser() {
  return (dispatch) => {
    dispatch({ type: "ADMIN_USER_OVERVIEW_CLEAR" });
  };
}

export function userEmailValidationCheck(mm, variables) {
  return graphqlWithVariables(
    `
    query ($userEmail: String!) {
      isValid: validateUserEmail(userEmail: $userEmail)
    }
    `,
    variables,
    `USER_EMAIL_FIELDS_VALIDATION`,
  );
}

export function userEmailValidationClear() {
  return (dispatch) => {
    dispatch({ type: `USER_EMAIL_FIELDS_VALIDATION_CLEAR` });
  };
}

export function setUserEmailValid() {
  return (dispatch) => {
    dispatch({ type: "USER_EMAIL_FIELDS_VALIDATION_SET_VALID" });
  };
}

export function saveEmailFormatValidity(isFormatInvalid) {
  return (dispatch) => {
    dispatch({ type: "USER_EMAIL_FORMAT_VALIDATION_CHECK", payload: { data: { isFormatInvalid } } });
  };
}
