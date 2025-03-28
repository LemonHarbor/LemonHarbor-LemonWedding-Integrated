import { createI18n } from 'react-simple-i18n';
import { translations } from './translations';

export const i18n = createI18n({
  translations,
  defaultLanguage: 'en',
});

export function useLanguage() {
  return {
    t: i18n.t,
    changeLanguage: i18n.changeLanguage,
    currentLanguage: i18n.currentLanguage,
  };
}
