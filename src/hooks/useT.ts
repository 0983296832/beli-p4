import { useTranslation } from 'react-i18next';
import vi from '@i18n/vi.json';

// Xác định kiểu dữ liệu giữ nguyên giá trị
const viTranslations = vi satisfies Record<string, string>;

type TranslationKeys = keyof typeof viTranslations;
type TranslationValues = { [K in TranslationKeys]: (typeof viTranslations)[K] };
type TranslationParams = Record<string, string | number>;

export function useT() {
  const { t } = useTranslation();

  return {
    t: (key: TranslationKeys, data?: TranslationParams) => t(key, data) as TranslationValues[typeof key]
  };
}
