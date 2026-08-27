/**
 * CommandSuggestionMenu.tsx
 * Quick autocomplete popover menu for "/" slash commands and "@" tool mentions.
 */

export interface SuggestionItem {
  key: string;
  prefix: "/" | "@";
  label: string;
  description: string;
  icon: string;
  insertText: string;
}

export const SLASH_COMMANDS: SuggestionItem[] = [
  {
    key: "form",
    prefix: "/",
    label: "/form",
    description: "Aktif sayfadaki formu hafızamdaki bilgilerle (memory.md) doldur",
    icon: "📋",
    insertText: "Aktif sayfadaki formu hafızamdaki (memory.md) bilgilerimle doldur.",
  },
  {
    key: "post",
    prefix: "/",
    label: "/post",
    description: "LinkedIn veya X/Twitter için gönderi oluştur ve editöre yazdır",
    icon: "✍️",
    insertText: "Aktif sayfada paylaşılmak üzere profesyonel bir gönderi oluştur ve sayfadaki editöre yazdır.",
  },
  {
    key: "web",
    prefix: "/",
    label: "/web",
    description: "Canlı Google internet aramasını kullanarak araştır",
    icon: "🌐",
    insertText: "/web ",
  },
  {
    key: "task",
    prefix: "/",
    label: "/task",
    description: "Yeni bir yapılacak görev / todo ekle",
    icon: "✅",
    insertText: "görev ekle: ",
  },
  {
    key: "note",
    prefix: "/",
    label: "/note",
    description: "Günlüğüme yeni not veya ders notu ekle",
    icon: "📝",
    insertText: "not ekle: ",
  },
  {
    key: "bist",
    prefix: "/",
    label: "/bist",
    description: "Borsa İstanbul hisse analizi ve canlı fiyat sor",
    icon: "📈",
    insertText: "THYAO analiz et ",
  },
  {
    key: "summarize",
    prefix: "/",
    label: "/summarize",
    description: "Aktif sayfayı veya ekli belgeyi özetle",
    icon: "📄",
    insertText: "Bu sayfadaki temel bilgileri özetle.",
  },
  {
    key: "export",
    prefix: "/",
    label: "/export",
    description: "Mevcut konuşmayı Markdown (.md) dosyası olarak indir",
    icon: "💾",
    insertText: "",
  },
  {
    key: "clear",
    prefix: "/",
    label: "/clear",
    description: "Sohbeti temizle ve yeni konuşma başlat",
    icon: "🔄",
    insertText: "",
  },
];

export const TOOL_MENTIONS: SuggestionItem[] = [
  {
    key: "browser",
    prefix: "@",
    label: "@browser",
    description: "Tarayıcı otomasyonu: sayfa butonlarına tıkla, form veya post editörünü doldur",
    icon: "🤖",
    insertText: "@browser ",
  },
  {
    key: "page",
    prefix: "@",
    label: "@page",
    description: "Aktif tarayıcı sekmesinin metnini ve formlarını bağlama ekle",
    icon: "📑",
    insertText: "@page ",
  },
  {
    key: "memory",
    prefix: "@",
    label: "@memory",
    description: "Kişisel hafıza notlarını (memory.md) bağlama dahil et",
    icon: "🧠",
    insertText: "@memory ",
  },
  {
    key: "bist",
    prefix: "@",
    label: "@bist",
    description: "BIST canlı borsa veri motorunu bağlama dahil et",
    icon: "📊",
    insertText: "@bist ",
  },
  {
    key: "web",
    prefix: "@",
    label: "@web",
    description: "Google canlı arama motorunu bağlama dahil et",
    icon: "🌍",
    insertText: "@web ",
  },
];

interface CommandSuggestionMenuProps {
  inputText: string;
  onSelect: (item: SuggestionItem) => void;
  onClose: () => void;
}

export function CommandSuggestionMenu({
  inputText,
  onSelect,
}: CommandSuggestionMenuProps) {
  const trimmed = inputText.trim();
  const isSlash = trimmed.startsWith("/");
  const isMention = trimmed.startsWith("@");

  if (!isSlash && !isMention) {
    return null;
  }

  const query = trimmed.slice(1).toLowerCase();
  const list = isSlash ? SLASH_COMMANDS : TOOL_MENTIONS;
  const filtered = list.filter(
    (item) =>
      item.key.toLowerCase().includes(query) ||
      item.label.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query),
  );

  if (filtered.length === 0) {
    return null;
  }

  return (
    <div className="command-suggestion-popover">
      <div className="command-suggestion-header">
        <span>{isSlash ? "Hızlı Komutlar (/)" : "Araç & Bağlam Bahsetmeleri (@)"}</span>
      </div>
      <div className="command-suggestion-list">
        {filtered.map((item) => (
          <button
            key={item.key}
            type="button"
            className="command-suggestion-item"
            onClick={() => onSelect(item)}
          >
            <span className="command-suggestion-icon">{item.icon}</span>
            <div className="command-suggestion-info">
              <span className="command-suggestion-label">{item.label}</span>
              <span className="command-suggestion-desc">{item.description}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
