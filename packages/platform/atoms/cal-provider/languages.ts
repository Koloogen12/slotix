import type enTranslations from "@calcom/i18n/locales/en/common.json";
import type ruTranslations from "@calcom/i18n/locales/ru/common.json";

export type enTranslationKeys = keyof typeof enTranslations;
export type ruTranslationKeys = keyof typeof ruTranslations;
export type translationKeys = enTranslationKeys | ruTranslationKeys;

export const EN = "en";
export const RU = "ru";

const CAL_PROVIDER_LANGUAGES = [EN, RU] as const;
export type CalProviderLanguagesType = (typeof CAL_PROVIDER_LANGUAGES)[number];

type i18nEnProps = {
  labels?: Partial<Record<enTranslationKeys, string>>;
  language?: "en";
};

type i18nRuProps = {
  labels?: Partial<Record<ruTranslationKeys, string>>;
  language?: "ru";
};

export type i18nProps = i18nEnProps | i18nRuProps;
