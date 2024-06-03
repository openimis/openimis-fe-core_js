import React from "react";
import ErrorPage from "../ErrorPage";
import { useTranslations } from "../../helpers/i18n";
import { MODULE_NAME } from "../../constants";

const FatalErrorPage = (props) => {
  const { formatMessage } = useTranslations(MODULE_NAME);
  const { error } = props;

  let title, description;

  if (error && error.code === 429) {
    title = formatMessage("core.FatalError.RateLimitExceeded.title");
    description = formatMessage("core.FatalError.RateLimitExceeded.description");
  } else {
    title = formatMessage("core.FatalError.GenericError.title");
    description = (error && error.message) || formatMessage("core.FatalError.GenericError.description");
  }

  return (
    <ErrorPage
      status={error?.code || "Unknown"}
      title={title}
      description={description}
      {...props}
    />
  );
};

export default FatalErrorPage;
