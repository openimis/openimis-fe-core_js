import React, { createContext, useContext, useEffect, useState } from "react";

import { useModulesManager } from "./modules";
import { PUBLIC_PAGE_LANGUAGE_COOKIE_KEY, DEFAULT } from "../constants";
import { getCookie, setCookie } from "./cookies";

const PublicPageLanguageContext = createContext();

export const PublicPageLanguageProvider = ({ children }) => {
  const modulesManager = useModulesManager();
  const enablePublicPage = modulesManager.getConf("fe-core", "App.enablePublicPage", DEFAULT.ENABLE_PUBLIC_PAGE);

  const [publicPageLang, setPublicPageLang] = useState(() => getCookie(PUBLIC_PAGE_LANGUAGE_COOKIE_KEY) ?? "en");

  useEffect(() => {
    if (publicPageLang) {
      setCookie(PUBLIC_PAGE_LANGUAGE_COOKIE_KEY, publicPageLang);
    }
  }, [publicPageLang]);

  const onPublicPageLangChange = (lang) => {
    setPublicPageLang(lang);
  };

  const memoizedValue = React.useMemo(() => ({ publicPageLang, onPublicPageLangChange }), [publicPageLang]);

  if (!enablePublicPage) {
    return <> {children} </>;
  }

  return <PublicPageLanguageContext.Provider value={memoizedValue}>{children}</PublicPageLanguageContext.Provider>;
};

export const usePublicPageLanguage = () => {
  const context = useContext(PublicPageLanguageContext);
  if (!context) {
    throw new Error("usePublicPageLanguage must be used within a PublicPageLanguageProvider");
  }
  return context;
};
