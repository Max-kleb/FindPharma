import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import des fichiers de traduction
import fr from './locales/fr.json';
import en from './locales/en.json';
import es from './locales/es.json';

const resources = {
  fr: { translation: fr },
  en: { translation: en },
  es: { translation: es }
};

i18n
  // Détection automatique de la langue du navigateur
  .use(LanguageDetector)
  // Intégration avec React
  .use(initReactI18next)
  // Configuration
  .init({
    resources,
    fallbackLng: 'fr', // Langue par défaut
    debug: process.env.NODE_ENV === 'development',
    
    // Important: permet de forcer le re-render des composants
    react: {
      useSuspense: false,
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
    },
    
    interpolation: {
      escapeValue: false, // React protège déjà contre les XSS
    },
    
    detection: {
      // Ordre de détection de la langue
      order: ['localStorage', 'navigator', 'htmlTag'],
      // Clé pour le stockage local
      lookupLocalStorage: 'i18nextLng',
      // Mettre en cache la langue détectée
      caches: ['localStorage'],
    },
  });

export default i18n;
