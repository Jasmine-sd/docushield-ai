import { en } from './translations/en';
import { hi } from './translations/hi';
import { pa } from './translations/pa';
import { te } from './translations/te';
import { ta } from './translations/ta';
import { kn } from './translations/kn';
import { ml } from './translations/ml';
import { bn } from './translations/bn';
import { mr } from './translations/mr';
import { gu } from './translations/gu';
import { or } from './translations/or';
import { ur } from './translations/ur';
import { ar } from './translations/ar';
import { fr } from './translations/fr';
import { es } from './translations/es';
import { de } from './translations/de';
import { ja } from './translations/ja';
import { ko } from './translations/ko';
import { zh } from './translations/zh';
import { LanguageCode } from './languages';

export type TranslationType = typeof en;

export const translations: Record<LanguageCode, TranslationType> = {
  en,
  hi,
  pa,
  te,
  ta,
  kn,
  ml,
  bn,
  mr,
  gu,
  or,
  ur,
  ar,
  fr,
  es,
  de,
  ja,
  ko,
  zh,
};

export { SUPPORTED_LANGUAGES, type Language, type LanguageCode } from './languages';
