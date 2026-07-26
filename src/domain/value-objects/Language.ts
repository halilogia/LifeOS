/**
 * Language Value Object
 * Represents the supported application languages.
 * Domain layer - no external dependencies.
 */

export type Language = "tr" | "en";

const VALID_LANGUAGES: Language[] = ["tr", "en"];

export function createLanguage(value: string): Language {
  if (!VALID_LANGUAGES.includes(value as Language)) {
    return "tr";
  }
  return value as Language;
}

export function isValidLanguage(value: string): boolean {
  return VALID_LANGUAGES.includes(value as Language);
}

export function toggleLanguage(current: Language): Language {
  return current === "tr" ? "en" : "tr";
}
