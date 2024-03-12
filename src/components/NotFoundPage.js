import React from "react";

import { useTranslations } from "../helpers/i18n";
import ErrorPage from "./ErrorPage";
import { MODULE_NAME } from "../constants";

const NotFoundPage = (props) => {
  const { formatMessage } = useTranslations(MODULE_NAME);

  return (
    <ErrorPage
      status={404}
      title={formatMessage("core.NotFoundPage.title")}
      description={formatMessage("core.NotFoundPage.description")}
      back={formatMessage("core.ErrorPage.back")}
      {...props}
    />
  );
};

export default NotFoundPage;
