import { translations } from './i18n.js';
export function updateTime(clockElement, dateElement, currentLang) {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    clockElement.textContent = `${hours}:${minutes}`;
    const locale = currentLang === 'tr' ? 'tr-TR' : 'en-US';
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    dateElement.textContent = now.toLocaleDateString(locale, options);
}
export function setRandomQuote(quoteElement, currentLang) {
    const quoteKeys = ['quote_1', 'quote_2', 'quote_3', 'quote_4', 'quote_5', 'quote_6', 'quote_7'];
    const randomKey = quoteKeys[Math.floor(Math.random() * quoteKeys.length)];
    quoteElement.textContent = translations[currentLang][randomKey];
}
export function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
}
