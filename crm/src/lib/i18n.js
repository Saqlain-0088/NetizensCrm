import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import commonEn from '@/locales/en/common.json';
import commonHi from '@/locales/hi/common.json';
import commonMr from '@/locales/mr/common.json';
import commonGu from '@/locales/gu/common.json';
import commonBn from '@/locales/bn/common.json';
import commonTa from '@/locales/ta/common.json';

// the translations
const resources = {
    en: {
        translation: commonEn
    },
    hi: {
        translation: commonHi
    },
    mr: {
        translation: commonMr
    },
    gu: {
        translation: commonGu
    },
    bn: {
        translation: commonBn
    },
    ta: {
        translation: commonTa
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
        resources,
        fallbackLng: 'en',
        detection: {
            // order and from where user language should be detected
            order: ['localStorage', 'cookie', 'navigator'],
            // keys or params to lookup language from
            lookupLocalStorage: 'i18nextLng',
            lookupCookie: 'i18next',
            // cache user language on
            caches: ['localStorage', 'cookie'],
        },
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;
