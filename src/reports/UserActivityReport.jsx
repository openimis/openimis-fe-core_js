import React from "react";
import { Grid } from "@mui/material";
import PublishedComponent from "../components/generics/PublishedComponent";
import ConstantBasedPicker from "../components/generics/ConstantBasedPicker";
import { useModulesManager } from "../helpers/modules";
import { useTranslations } from "../helpers/i18n";
import { USER_ACTIVITY_REPORT_ACTIONS, USER_ACTIVITY_REPORT_ENTITIES } from "../constants";

const UserActivityReport = (props) => {
  const { values, setValues } = props;
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("core", modulesManager);

  return (
    <Grid container direction="column" spacing={1}>
      <Grid>
        <PublishedComponent
          pubRef="core.DatePicker"
          value={values.dateFrom}
          module="core"
          required
          label="UserActivityReport.dateFrom"
          onChange={(dateFrom) => setValues({ ...values, dateFrom })}
        />
      </Grid>
      <Grid>
        <PublishedComponent
          pubRef="core.DatePicker"
          value={values.dateTo}
          module="core"
          required
          label="UserActivityReport.dateTo"
          onChange={(dateTo) => setValues({ ...values, dateTo })}
        />
      </Grid>
      <Grid>
        <PublishedComponent
          pubRef="admin.UserPicker"
          value={values.user}
          module="core"
          label={formatMessage("UserActivityReport.user")}
          onChange={(user) => setValues({ ...values, user })}
        />
      </Grid>
      <Grid>
        <ConstantBasedPicker
          module="core"
          value={values.action}
          label="UserActivityReport.action"
          constants={USER_ACTIVITY_REPORT_ACTIONS}
          onChange={(action) => setValues({ ...values, action })}
        />
      </Grid>
      <Grid>
        <ConstantBasedPicker
          module="core"
          value={values.entity}
          label="UserActivityReport.entity"
          constants={USER_ACTIVITY_REPORT_ENTITIES}
          onChange={(entity) => setValues({ ...values, entity })}
        />
      </Grid>
    </Grid>
  );
};

export default UserActivityReport;
