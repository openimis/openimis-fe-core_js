/* eslint-disable no-shadow */
import React, { useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";

import { useTheme, styled } from "@mui/material/styles";
import { Grid, Divider, Typography, Button, InputAdornment, IconButton, Box } from "@mui/material";
import GetIconComponent from "../../helpers/icons";

const VisibilityIcon = GetIconComponent("Visibility");
const VisibilityOffIcon = GetIconComponent("VisibilityOff");

import {
  withModulesManager,
  useTranslations,
  TextInput,
  SelectInput,
  PublishedComponent,
  ValidatedTextInput,
  passwordGenerator,
  validatePassword,
  ROWS_PER_PAGE_OPTIONS
} from "@openimis/fe-core";
import {
  CLAIM_ADMIN_USER_TYPE,
  ENROLMENT_OFFICER_USER_TYPE,
  EMAIL_REGEX_PATTERN,
  DEFAULT,
  RIGHT_HEALTHFACILITIES,
} from "../constants";
import {
  usernameValidationCheck,
  usernameValidationClear,
  setUsernameValid,
  userEmailValidationCheck,
  userEmailValidationClear,
  setUserEmailValid,
  saveEmailFormatValidity,
  fetchPasswordPolicy,
} from "../actions";

const StyledGrid = styled(Grid)(({ theme }) => ({
  "& .item": theme.paper?.item ?? {},
  "& .sectionHeader": {
    ...(theme.paper?.item ?? {}),
    paddingBottom: 0,
  },
  "& .sectionTitle": theme.typography?.title ?? {},
  "& .passwordFeedback": {
    // Add password feedback styles if needed
  },
}));

const UserMasterPanel = (props) => {
  const {
    edited,
    readOnly,
    onEditedChanged,
    modulesManager,
    obligatoryUserFields,
    obligatoryEOFields,
    isUsernameValid,
    isUsernameValidating,
    usernameValidationError,
    isUserEmailValid,
    isUserEmailValidating,
    isUserEmailFormatInvalid,
    emailValidationError,
    savedUsername,
    savedUserEmail,
    usernameLength,
    passwordPolicy,
    rights,
  } = props;
  const { formatMessage, formatMessageWithValues } = useTranslations("admin", modulesManager);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchPasswordPolicy());
  }, [dispatch]);

  const renderLastNameFirst = modulesManager.getConf(
    "fe-insuree",
    "renderLastNameFirst",
    DEFAULT.RENDER_LAST_NAME_FIRST,
  );

  const shouldValidateUsername = (inputValue) => {
    const shouldBeValidated = inputValue !== savedUsername;
    return shouldBeValidated;
  };

  const shouldValidateEmail = (inputValue) => {
    const shouldBeValidated = inputValue !== savedUserEmail;
    return shouldBeValidated;
  };

  const checkEmailFormatValidity = (emailInput) => {
    if (!emailInput) return false;

    const isEmailInvalid = !EMAIL_REGEX_PATTERN.test(emailInput);

    return isEmailInvalid;
  };

  const handleEmailChange = (email) => {
    const isFormatValid = checkEmailFormatValidity(email);
    dispatch(saveEmailFormatValidity(isFormatValid));

    onEditedChanged({ ...edited, email });
  };

  useEffect(() => {
    handleEmailChange(edited?.email);
  }, []);

  const [passwordFeedback, setPasswordFeedback] = useState("");
  const [passwordScore, setPasswordScore] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const REQUIRED_SECURITY_LEVEL = 2;
  let IS_PASSWORD_SECURED = passwordScore >= REQUIRED_SECURITY_LEVEL;
  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handlePasswordChange = (password) => {
    const { feedback, score } = validatePassword(password, passwordPolicy, formatMessage, formatMessageWithValues);
    setPasswordFeedback(feedback);
    setPasswordScore(score);
    IS_PASSWORD_SECURED = score >= REQUIRED_SECURITY_LEVEL;
    onEditedChanged({ ...edited, password, isPasswordValid: IS_PASSWORD_SECURED });
  };

  const generatePassword = () => {
    const passwordGeneratorOptions = modulesManager.getConf("fe-admin", "passwordGeneratorOptions", {
      length: 12,
      isNumberRequired: true,
      isLowerCaseRequired: true,
      isUpperCaseRequired: true,
      isSpecialSymbolRequired: true,
    });
    const generatedPassword = passwordGenerator(passwordGeneratorOptions);
    IS_PASSWORD_SECURED = true;
    onEditedChanged({
      ...edited,
      password: generatedPassword,
      confirmPassword: generatedPassword,
      isPasswordValid: IS_PASSWORD_SECURED,
    });
  };

  const renderLastNameField = (edited, readOnly) => (
    <Grid size={4} className="item">
      <TextInput
        module="admin"
        label="user.lastName"
        maxLengthKey="admin.user.lastName"
        required
        readOnly={readOnly}
        value={edited?.lastName ?? ""}
        onChange={(lastName) => onEditedChanged({ ...edited, lastName })}
      />
    </Grid>
  );

  const renderGivenNameField = (edited, readOnly) => (
    <Grid size={4} className="item">
      <TextInput
        module="admin"
        label="user.givenNames"
        maxLengthKey="admin.user.otherNames"
        required
        readOnly={readOnly}
        value={edited?.otherNames ?? ""}
        onChange={(otherNames) => onEditedChanged({ ...edited, otherNames })}
      />
    </Grid>
  );

  return (
    <StyledGrid container direction="row">
      <Grid size={4} className="item">
        <ValidatedTextInput
          itemQueryIdentifier="username"
          shouldValidate={shouldValidateUsername}
          isValid={isUsernameValid}
          isValidating={isUsernameValidating}
          validationError={usernameValidationError}
          action={usernameValidationCheck}
          clearAction={usernameValidationClear}
          setValidAction={setUsernameValid}
          module="admin"
          label="user.username"
          maxLengthKey="admin.user.username"
          codeTakenLabel="user.usernameAlreadyTaken"
          required={true}
          value={edited?.username ?? ""}
          readOnly={readOnly}
          onChange={(username) => onEditedChanged({ ...edited, username })}
          inputProps={{
            "maxLength": usernameLength,
          }}
        />
      </Grid>
      {renderLastNameFirst ? (
        <>
          {renderLastNameField(edited, readOnly)}
          {renderGivenNameField(edited, readOnly)}
        </>
      ) : (
        <>
          {renderGivenNameField(edited, readOnly)}
          {renderLastNameField(edited, readOnly)}
        </>
      )}
      {!(
        obligatoryUserFields?.email == "H" ||
        (edited.userTypes?.includes(ENROLMENT_OFFICER_USER_TYPE) && obligatoryEOFields?.email == "H")
      ) && (
        <Grid size={4} className="item">
          <ValidatedTextInput
            itemQueryIdentifier="userEmail"
            shouldValidate={shouldValidateEmail}
            isValid={isUserEmailValid}
            isValidating={isUserEmailValidating}
            validationError={emailValidationError}
            invalidValueFormat={isUserEmailFormatInvalid}
            action={userEmailValidationCheck}
            clearAction={userEmailValidationClear}
            setValidAction={setUserEmailValid}
            readOnly={readOnly}
            module="admin"
            label="user.email"
            maxLengthKey="admin.user.email"
            type="email"
            codeTakenLabel="user.emailAlreadyTaken"
            required={true}
            value={edited?.email ?? ""}
            onChange={(email) => handleEmailChange(email)}
          />
        </Grid>
      )}
      {!(
        obligatoryUserFields?.phone == "H" ||
        (edited.userTypes?.includes(ENROLMENT_OFFICER_USER_TYPE) && obligatoryEOFields?.phone == "H")
      ) && (
        <Grid size={4} className="item">
          <TextInput
            module="admin"
            type="phone"
            label="user.phone"
            maxLengthKey="admin.user.phone"
            required={
              obligatoryUserFields?.phone == "M" ||
              (edited.userTypes?.includes(ENROLMENT_OFFICER_USER_TYPE) && obligatoryEOFields?.phone == "M")
            }
            readOnly={readOnly}
            value={edited?.phoneNumber ?? ""}
            onChange={(phoneNumber) => onEditedChanged({ ...edited, phoneNumber })}
          />
        </Grid>
      )}
      {rights.includes(RIGHT_HEALTHFACILITIES) && (
        <Grid size={4} className="item">
          <PublishedComponent
            pubRef="location.HealthFacilityPicker"
            value={edited?.healthFacility}
            district={edited.districts}
            module="admin"
            readOnly={readOnly}
            required={edited.userTypes.includes(CLAIM_ADMIN_USER_TYPE)}
            onChange={(healthFacility) => onEditedChanged({ ...edited, healthFacility })}
          />
        </Grid>
      )}
      <Grid size={6} className="item">
        <PublishedComponent
          pubRef="admin.UserRolesPicker"
          required
          value={edited?.roles ?? []}
          module="admin"
          readOnly={readOnly}
          onChange={(roles) => onEditedChanged({ ...edited, roles })}
        />
      </Grid>
      <Grid size={2} className="item">
        <PublishedComponent
          pubRef="location.LocationPicker"
          locationLevel={0}
          value={edited.region}
          onChange={(region) => onEditedChanged({ ...edited, region })}
          readOnly={readOnly}
          multiple
          withLabel
          label={formatMessage("user.regions")}
          restrictedOptions
        />
      </Grid>
      <Grid size={4} className="item">
        <PublishedComponent
          pubRef="location.LocationPicker"
          locationLevel={1}
          value={edited?.districts ?? []}
          onChange={(districts) => onEditedChanged({ ...edited, districts })}
          readOnly={readOnly}
          required
          multiple
          withLabel
          label={formatMessage("user.districts")}
          restrictedOptions
        />
      </Grid>

      <Grid size={12} className="sectionHeader">
        <Typography className="sectionTitle">{formatMessage("UserMasterPanel.preferencesTitle")}</Typography>
        <Divider variant="fullWidth" />
      </Grid>
      <Grid size={4} className="item">
        <PublishedComponent
          pubRef="core.LanguagePicker"
          module="admin"
          label="user.language"
          readOnly={readOnly}
          required
          withNull={false}
          nullLabel={formatMessage("UserMasterPanel.language.null")}
          value={edited.language ?? ""}
          onChange={(language) => onEditedChanged({ ...edited, language })}
        />
      </Grid>
      <Grid size={4} className="item">
        <SelectInput
          module="admin"
          label="user.defaultRowsPerPage"
          readOnly={readOnly}
          required
          options={ROWS_PER_PAGE_OPTIONS.map((option) => ({ value: option, label: option }))}
          value={edited?.defaultRowsPerPage ?? ""}
          onChange={(defaultRowsPerPage) => onEditedChanged({ ...edited, defaultRowsPerPage })}
        />
      </Grid>

      <Grid size={12} className="sectionHeader">
        <Typography className="sectionTitle">{formatMessage("UserMasterPanel.loginDetailsTitle")}</Typography>
        <Divider variant="fullWidth" />
      </Grid>
      <Grid size={4} className="item">
        <TextInput
          module="admin"
          type={showPassword ? "text" : "password"}
          label="user.newPassword"
          readOnly={readOnly}
          value={edited.password}
          onChange={(password) => {
            handlePasswordChange(password);
          }}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
                edge="end"
              >
                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </InputAdornment>
          }
        />
        <Typography color={IS_PASSWORD_SECURED ? "primary" : "error"} className="passwordFeedback">
          {passwordFeedback}
        </Typography>
      </Grid>
      <Grid size={4} className="item">
        <TextInput
          module="admin"
          type={showPassword ? "text" : "password"}
          label="user.confirmNewPassword"
          required={edited.password}
          readOnly={readOnly}
          value={edited.confirmPassword}
          onChange={(confirmPassword) => onEditedChanged({ ...edited, confirmPassword })}
          error={edited?.password !== edited?.confirmPassword}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
                edge="end"
              >
                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </InputAdornment>
          }
        />
      </Grid>
      <Grid size={4} className="item">
        <Button disabled={readOnly} variant="contained" onClick={generatePassword}>
          {formatMessage("user.generatePassword")}
        </Button>
      </Grid>
    </StyledGrid>
  );
};

const mapStateToProps = (state) => ({
  rights: state.core?.user?.i_user?.rights ?? [],
  isUsernameValid: state.admin.validationFields?.username?.isValid,
  isUsernameValidating: state.admin.validationFields?.username?.isValidating,
  usernameValidationError: state.admin.validationFields?.username?.validationError,
  savedUsername: state.admin?.user?.username,
  isUserEmailValid: state.admin.validationFields?.userEmail?.isValid,
  isUserEmailValidating: state.admin.validationFields?.userEmail?.isValidating,
  emailValidationError: state.admin.validationFields?.userEmail?.validationError,
  savedUserEmail: state.admin?.user?.email,
  isUserEmailFormatInvalid: state.admin.validationFields?.userEmailFormat?.isInvalid,
});

export { StyledGrid };
export default withModulesManager(connect(mapStateToProps)(UserMasterPanel));
