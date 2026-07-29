import { Language } from "@/types/types.js";
import { tr } from "@/utils/translations/tr.js";
import { en } from "@/utils/translations/en.js";

export const translations = {
  tr,
  en,
};

export function applyI18n(
  lang: Language,
  todoInput: HTMLInputElement,
  _langToggleBtn: HTMLButtonElement,
): void {
  const elementsWithText = document.querySelectorAll("[data-i18n]");
  elementsWithText.forEach((el) => {
    const key = el.getAttribute("data-i18n") as keyof typeof translations.tr;
    if (translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });

  const elementsWithPlaceholder = document.querySelectorAll(
    "[data-i18n-placeholder]",
  );
  elementsWithPlaceholder.forEach((el) => {
    const key = el.getAttribute(
      "data-i18n-placeholder",
    ) as keyof typeof translations.tr;
    if (translations[lang][key]) {
      (el as HTMLInputElement).placeholder = translations[lang][key];
    }
  });

  todoInput.placeholder = translations[lang].todo_placeholder;
}

export function getTranslation(lang: Language): Record<string, string> {
  const handler = {
    get(target: any, prop: string) {
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
