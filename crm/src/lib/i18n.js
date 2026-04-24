import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import commonEn from '@/locales/en/common.json';
import commonHi from '@/locales/hi/common.json';
import commonMr from '@/locales/mr/common.json';
import commonGu from '@/locales/gu/common.json';
import commonBn from '@/locales/bn/common.json';
import commonTa from '@/locales/ta/common.json';

const resources = {
    en: { translation: commonEn },
    hi: { translation: commonHi },
    mr: { translation: commonMr },
    gu: { translation: commonGu },
    bn: { translation: commonBn },
    ta: { translation: commonTa }
};

// Detect saved language safely (browser-only)
function getInitialLanguage() {
    if (typeof window === 'undefined') return 'en';
    try {
        return (
            localStorage.getItem('i18nextLng') ||
            document.cookie.match(/i18next=([^;]+)/)?.[1] ||
            navigator.language?.split('-')[0] ||
            'en'
        );
    } catch {
        return 'en';
    }
}

if (!i18n.isInitialized) {
    i18n
        .use(initReactI18next)
        .init({
            resources,
            lng: getInitialLanguage(),
            fallbackLng: 'en',
            interpolation: {
                escapeValue: false
            },
            react: {
                useSuspense: false
            }
        });
}

export default i18n;
