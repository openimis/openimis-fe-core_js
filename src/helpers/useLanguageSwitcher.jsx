import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import SelectDialog from "../components/dialogs/SelectDialog";
import { changeUserLanguage, fetchLanguages } from "../actions";
import { getLanguageNameByCode } from "./utils";

// Shared language-switching logic for LanguageQuickPicker and LanguageMenuItems:
// available/current language, lazy fetch, and the confirm-then-reload flow (incl.
// the confirmation dialog element). Only the trigger UI differs between callers.
export default function useLanguageSwitcher() {
  const dispatch = useDispatch();
  const [chosenLanguage, setChosenLanguage] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { user, languages, fetchingLanguages, fetchedLanguages } = useSelector((state) => state.core);
  const userLanguage = user?.i_user?.language;

  useEffect(() => {
    if (!fetchingLanguages && !fetchedLanguages) {
      dispatch(fetchLanguages());
    }
  }, [dispatch, fetchingLanguages, fetchedLanguages]);

  const choose = (code) => {
    setChosenLanguage(code);
    setConfirmOpen(true);
  };

  const confirm = () => {
    try {
      dispatch(changeUserLanguage(chosenLanguage, "Change User Language"));
      window.location.reload();
    } finally {
      setConfirmOpen(false);
    }
  };

  const confirmDialog = (
    <SelectDialog
      confirmState={confirmOpen}
      onConfirm={confirm}
      onClose={() => setConfirmOpen(false)}
      module="core"
      confirmTitle="core.LanguageQuickPicker.dialog.title"
      confirmMessageWithValues="core.LanguageQuickPicker.dialog.message"
      translationVariables={{ language: getLanguageNameByCode(languages ?? [], chosenLanguage) }}
      confirmationButton="core.LanguageQuickPicker.dialog.confirm"
      rejectionButton="core.LanguageQuickPicker.dialog.cancel"
    />
  );

  return {
    languages: languages ?? [],
    userLanguage,
    hasChoices: (languages?.length ?? 0) > 1,
    fetchingLanguages,
    choose,
    confirmDialog,
  };
}
