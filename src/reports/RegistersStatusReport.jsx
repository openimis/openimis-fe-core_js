import { Grid } from "@mui/material";
import PublishedComponent from "../components/generics/PublishedComponent";
import withModulesManager, { useModulesManager } from "../helpers/modules";
import { useTranslations } from "../helpers/i18n";
import React from "react";

const RegistersStatusReport = (props) => {
  const { values, setValues } = props;
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("core", modulesManager);

  return (
    <Grid container direction="column" spacing={1}>
      <Grid>
        <PublishedComponent
          pubRef="location.LocationPicker"
          onChange={(region) =>
            setValues({
              ...values,
              region,
              district: null,
            })
          }
          value={values.region}
          locationLevel={0}
          label={formatMessage("RegistersStatusReport.region")}
        />
      </Grid>
      <Grid>
        <PublishedComponent
          pubRef="location.LocationPicker"
          onChange={(district) =>
            setValues({
              ...values,
              district,
            })
          }
          value={values.district}
          parentLocation={values.region}
          locationLevel={1}
          label={formatMessage("RegistersStatusReport.district")}
        />
      </Grid>
    </Grid>
  );
};

export { RegistersStatusReport };
export default RegistersStatusReport;
