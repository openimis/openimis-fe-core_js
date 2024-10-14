import React from "react";

import ErrorPage from "./ErrorPage";
import { useTranslations } from "../helpers/i18n";
import { MODULE_NAME } from "../constants";

const ForbiddenPage = (props) => {
  const { formatMessage } = useTranslations(MODULE_NAME);

  return (
    <ErrorPage
      status={401}
      title={formatMessage("core.ForbiddenPage.title")}
      description={formatMessage("core.ForbiddenPage.description")}
      back={formatMessage("core.ErrorPage.back")}
      {...props}
    />
  );
};

export default ForbiddenPage;
