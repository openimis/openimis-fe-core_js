import { decodeId } from "../helpers/api";
import { fetchSubstitutionEnrolmentOfficers } from "./actions";
import { INTERACTIVE_USER_TYPE } from "./constants";

export const mapQueriesUserToStore = (u) => {
  // TODO: make this more generic
  u.hasLogin = false;
  u.userTypes = u.userTypes?.length ? [...u.userTypes] : [INTERACTIVE_USER_TYPE];
  if (u.iUser) {
    u.hasLogin = true;
    u.lastName = u.iUser.lastName;
    u.otherNames = u.iUser.otherNames;
    u.email = u.iUser.email;
    u.phoneNumber = u.iUser.phone;
    u.defaultRowsPerPage = u.iUser.defaultRowsPerPage;
    u.healthFacility = u.iUser.healthFacility;
    u.language = u.iUser.languageId;
    u.roles = u.iUser.roles;
    u.districts = u.iUser.districts.map((d) => d.location);
  }
  if (u.claimAdmin) {
    u.hasLogin = u.hasLogin || u.claimAdmin.hasLogin;
    u.lastName = u.claimAdmin.lastName;
    u.otherNames = u.claimAdmin.otherNames;
    u.email = u.email ?? u.claimAdmin.emailId;
    u.phoneNumber = u.claimAdmin.phone;
    u.birthDate = u.claimAdmin.dob;
    u.healthFacility = u.claimAdmin.healthFacility;
  }
  if (u.officer) {
    u.hasLogin = u.hasLogin || u.officer.hasLogin;
    u.lastName = u.officer.lastName;
    u.otherNames = u.officer.otherNames;
    u.email = u.email ?? u.officer.email;
    u.phoneNumber = u.officer.phone;
    u.birthDate = u.officer.dob;
    u.address = u.officer.address;
    u.substitutionOfficer = u.officer.substitutionOfficer;
    // substitutionOfficer is user.officer so it cannot be retrieved using the UserPicker
    u.worksTo = u.officer.worksTo;
    u.location = u.officer.location;
    u.officerVillages = u.officer.officerVillages.map((x) => x.location);
  }
  return u;
};

export const mapUserValuesToInput = (values) => {
  const input = {
    uuid: values.id ? decodeId(values.id) : null,
    username: values.username,
    userTypes: values.userTypes,
    lastName: values.lastName,
    otherNames: values.otherNames,
    phone: values.phoneNumber,
    email: values.email,
    password: values.password,
    healthFacilityId: values.healthFacility ? decodeId(values.healthFacility.id) : null,
    districts: values.districts.map((d) => decodeId(d.id)),
    locationId: values.location ? decodeId(values.location.id) : null,
    language: values.language,
    roles: values.roles.map((r) => decodeId(r.id)),
    birthDate: values.birthDate,
    address: values.address,
    substitutionOfficerId: values.substitutionOfficer?.id ? decodeId(values.substitutionOfficer.id) : null,
    worksTo: values.worksTo,
    villageIds: values.officerVillages?.map((location) => decodeId(location.id)),
    defaultRowsPerPage: Number.isInteger(values.defaultRowsPerPage) ? values.defaultRowsPerPage : null,
  };
  return input;
};

export const toggleUserRoles = (edited, data, isValid, isEnabled, hasRole, onEditedChanged, roleIsSystem) => {
  const roles = edited?.roles ?? [];

  if (isValid && isEnabled && !hasRole) {
    const role = data?.role?.edges?.[0]?.node;
    if (!role) return;
    roles.push(role);
    edited.roles = roles;
    onEditedChanged({ ...edited });
  } else if (isValid && !isEnabled) {
    const filteredRoles = roles.filter((tempRole) => tempRole.isSystem !== roleIsSystem);
    edited.roles = filteredRoles;
    onEditedChanged({ ...edited });
  }
};

export const setUserTypeEnabled = (user, type, enabled) => {
  const userTypes = user.userTypes ? [...user.userTypes] : [];
  const hasType = userTypes.includes(type);

  if (enabled && !hasType) {
    return { ...user, userTypes: [...userTypes, type] };
  }
  if (!enabled && hasType) {
    return { ...user, userTypes: userTypes.filter((x) => x !== type) };
  }
  return user;
};

export const toggleSwitchButton = (edited, hasRole, hasUserType, setIsEnabled) => {
  setIsEnabled(() => hasRole || hasUserType);
};

export const fetchSubstitutionEOs = (dispatch, mm, officerUuid, searchString, villages) => {
  dispatch(
    fetchSubstitutionEnrolmentOfficers(mm, {
      officerUuid,
      first: searchString ? undefined : 15,
      villagesUuids: villages?.map((village) => village.uuid),
      str: searchString,
    }),
  );
};
