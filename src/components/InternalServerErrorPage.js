import React from "react";
import ErrorPage from "./ErrorPage";
import { useTranslations } from "../helpers/i18n";
import { MODULE_NAME } from "../constants";

const InternalServerErrorPage = (props) => {
  const { formatMessage } = useTranslations(MODULE_NAME);

  return (
    <ErrorPage
      status={500}
      title={formatMessage("core.InternalServerErrorPage.title")}
      description={formatMessage("core.InternalServerErrorPage.description")}
      {...props}
    />
  );
};

export default InternalServerErrorPage;
