import { Language } from "@/types/types.js";
import { tr } from "@/utils/translations/tr/index.js";
import { en } from "@/utils/translations/en/index.js";

export const translations = {
  tr,
  en,
};

export function getTranslation(lang: Language): Record<string, string> {
  const handler = {
    get(target: Record<string, string>, prop: string) {
      if (prop in target) {
        return target[prop];
      }
      if (prop in translations.en) {
        return (translations.en as Record<string, string>)[prop];
      }
      return prop;
    },
  };
  const activeMap = translations[lang] || translations.en;
  return new Proxy(activeMap, handler) as Record<string, string>;
}
