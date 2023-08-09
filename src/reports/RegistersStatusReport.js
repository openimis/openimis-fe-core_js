import { Grid } from "@material-ui/core";
import { PublishedComponent, useModulesManager, useTranslations } from "@openimis/fe-core";
import React from "react";

const RegistersStatusReport = (props) => {
  const { values, setValues } = props;
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("core", modulesManager);

  return (
    <Grid container direction="column" spacing={1}>
      <Grid item>
        <PublishedComponent
          pubRef="location.LocationPicker"
          onChange={(region) =>
            setValues({
                ...values,
                region,
                district:null,
          })}
          value={values.region}
          locationLevel={0}
          label={formatMessage("RegistersStatusReport.region")}
        />
      </Grid>
      <Grid item>
        <PublishedComponent
          pubRef="location.LocationPicker"
          onChange={(district) =>
            setValues({
                ...values,
                district,
          })}
          value={values.district}
          parentLocation={values.region}
          locationLevel={1}
          label={formatMessage("RegistersStatusReport.district")}
        />
      </Grid>
    </Grid>
  );
};

export default RegistersStatusReport;
