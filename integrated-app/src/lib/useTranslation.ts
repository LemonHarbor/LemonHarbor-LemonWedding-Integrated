import { useCallback } from "react";
import { useLanguageStore } from "./i18n";
import { TranslationKey, getTranslation } from "./translations";

export function useTranslation() {
  const { language } = useLanguageStore();

  const t = useCallback(
    (key: TranslationKey) => {
      return getTranslation(language, key);
    },
    [language],
  );

  return { t };
}
