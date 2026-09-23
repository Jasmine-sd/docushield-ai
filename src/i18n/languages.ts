export type LanguageCode =
  | 'en'
  | 'hi'
  | 'pa'
  | 'te'
  | 'ta'
  | 'kn'
  | 'ml'
  | 'bn'
  | 'mr'
  | 'gu'
  | 'or'
  | 'ur'
  | 'fr'
  | 'es'
  | 'de'
  | 'ja'
  | 'ko'
  | 'zh'
  | 'ar';

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
  flag: string;
  region: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr', flag: '🇺🇸', region: 'Global / US' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr', flag: '🇮🇳', region: 'India' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', dir: 'ltr', flag: '🇮🇳', region: 'Punjab, India' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', dir: 'ltr', flag: '🇮🇳', region: 'Andhra / Telangana' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', dir: 'ltr', flag: '🇮🇳', region: 'Tamil Nadu / Sri Lanka' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', dir: 'ltr', flag: '🇮🇳', region: 'Karnataka' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', dir: 'ltr', flag: '🇮🇳', region: 'Kerala' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', dir: 'ltr', flag: '🇮🇳', region: 'Bengal / Bangladesh' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', dir: 'ltr', flag: '🇮🇳', region: 'Maharashtra' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', dir: 'ltr', flag: '🇮🇳', region: 'Gujarat' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', dir: 'ltr', flag: '🇮🇳', region: 'Odisha' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', dir: 'rtl', flag: '🇵🇰', region: 'South Asia' },
  { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr', flag: '🇫🇷', region: 'France / Global' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', dir: 'ltr', flag: '🇪🇸', region: 'Spain / Latin America' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', dir: 'ltr', flag: '🇩🇪', region: 'Germany / Austria' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', dir: 'ltr', flag: '🇯🇵', region: 'Japan' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', dir: 'ltr', flag: '🇰🇷', region: 'South Korea' },
  { code: 'zh', name: 'Chinese', nativeName: '简体中文', dir: 'ltr', flag: '🇨🇳', region: 'China / Global' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl', flag: '🇸🇦', region: 'Middle East' },
];

export const DEFAULT_LANGUAGE_CODE = 'en';

export function getLanguage(code: string): Language {
  return SUPPORTED_LANGUAGES.find((lang) => lang.code === code) || SUPPORTED_LANGUAGES[0];
}
