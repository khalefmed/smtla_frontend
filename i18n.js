import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';


// const languages = ['fr', 'ar'];



import fr from './locales/fr.json';
import ar from './locales/ar.json';

i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    ar: { translation: ar },
  },
  lng: "fr", // Default Value
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
