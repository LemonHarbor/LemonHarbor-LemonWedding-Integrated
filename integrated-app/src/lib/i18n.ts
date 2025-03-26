import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type LanguageCode = "en" | "de" | "fr" | "es";

type LanguageStore = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
};

export const useLanguageStore = create<LanguageStore>(
  persist(
    (set) => ({
      language: "en",
      setLanguage: (language) => set({ language }),
    }),
    {
      name: "language-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ language: state.language }),
    },
  ),
);

export const languageNames = {
  en: "English",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
};
