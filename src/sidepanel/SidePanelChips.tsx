import { PageContext } from "@/content/agent/domAgentEngine.js";

type ChipType =
  | "summarize"
  | "key_takeaways"
  | "ask"
  | "extract"
  | "yt_summarize"
  | "yt_quiz";

interface SidePanelChipsProps {
  t: Record<string, string>;
  pageContext: PageContext | null;
  isYoutube: boolean;
  onChipClick: (type: ChipType) => void;
  onAutofill: () => void;
  onCustomPrompt?: (prompt: string) => void;
}

/**
 * Robustly detects whether the active page contains personal registration/application form fields.
 */
function isPersonalFormPage(context: PageContext | null): boolean {
  if (
    !context ||
    !context.interactiveElements ||
    context.interactiveElements.length === 0
  ) {
    return false;
  }

  // Keywords indicative of personal registration, application, or profile forms
  const personalKeywords = [
    "ad",
    "soyad",
    "name",
    "email",
    "e-posta",
    "mail",
    "tel",
    "phone",
    "telefon",
    "doğum",
    "birth",
    "tarih",
    "date",
    "adres",
    "address",
    "meslek",
    "job",
    "tckn",
    "tc",
    "şifre",
    "password",
    "kayıt",
    "register",
    "signup",
    "başvuru",
    "apply",
    "biyografi",
    "bio",
    "şehir",
    "city",
    "ülke",
    "country",
  ];

  const matchingFormInputs = context.interactiveElements.filter((el) => {
    if (el.tag !== "input" && el.tag !== "textarea" && el.tag !== "select") {
      return false;
    }

    const type = (el.type || "").toLowerCase();
    if (
      type === "hidden" ||
      type === "checkbox" ||
      type === "radio" ||
      type === "submit" ||
      type === "button" ||
      type === "search"
    ) {
      return false;
    }

    const identifier =
      `${el.text || ""} ${el.label || ""} ${el.placeholder || ""} ${el.id || ""} ${el.className || ""}`.toLowerCase();

    // Ignore Wikipedia search bar, Google Search input, etc.
    if (identifier.includes("search") || identifier.includes("wiki")) {
      return false;
    }

    // Check if element label/placeholder/name matches any personal form field keyword
    return personalKeywords.some((kw) => identifier.includes(kw));
  });

  return matchingFormInputs.length >= 1;
}

export function SidePanelChips({
  t,
  pageContext,
  isYoutube,
  onChipClick,
  onAutofill,
  onCustomPrompt,
}: SidePanelChipsProps) {
  return (
    <div className="sidepanel-chips">
      {isYoutube && (
        <>
          <button
            className="sidepanel-chip"
            onClick={() => onChipClick("yt_summarize")}
            style={{
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
              color: "#ffffff",
              borderColor: "#8b5cf6",
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="23 7 16 12 23 17 23 7"></polygon>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            </svg>
            <span>{t.summarize_video}</span>
          </button>
          <button
            className="sidepanel-chip"
            onClick={() => onChipClick("yt_quiz")}
            style={{
              background: "rgba(139, 92, 246, 0.15)",
              color: "#c084fc",
              borderColor: "rgba(139, 92, 246, 0.4)",
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="9 11 12 14 22 4"></polyline>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
            <span>{t.video_quiz}</span>
          </button>
        </>
      )}

      {pageContext?.domain?.includes("linkedin.com") && (
        <button
          className="sidepanel-chip"
          style={{
            background: "linear-gradient(135deg, rgba(10, 102, 194, 0.35), rgba(0, 65, 130, 0.35))",
            color: "#60a5fa",
            borderColor: "#0a66c2",
            fontWeight: 600,
          }}
          onClick={() =>
            onCustomPrompt?.(
              "LinkedIn için sayfadaki veya ekli belgedeki bilgileri kullanarak profesyonel, etkili ve dikkat çekici bir gönderi (post) hazırla, ardından 'Gönderi başlat' alanına tıkla ve editöre yazdır.",
            )
          }
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
            <rect x="2" y="9" width="4" height="12" />
            <circle cx="4" cy="4" r="2" />
          </svg>
          <span>LinkedIn Postu Hazırla</span>
        </button>
      )}

      {(pageContext?.domain?.includes("x.com") ||
        pageContext?.domain?.includes("twitter.com")) && (
        <button
          className="sidepanel-chip"
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            color: "#ffffff",
            borderColor: "rgba(255, 255, 255, 0.2)",
            fontWeight: 600,
          }}
          onClick={() =>
            onCustomPrompt?.(
              "Bu sayfa veya konu hakkında dikkat çekici bir Tweet hazırla ve tweet metin alanına yazdır.",
            )
          }
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
          </svg>
          <span>Tweet Hazırla</span>
        </button>
      )}

      {isPersonalFormPage(pageContext) && (
        <button
          className="sidepanel-chip"
          style={{
            background:
              "linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(16, 185, 129, 0.25))",
            borderColor: "rgba(139, 92, 246, 0.4)",
            color: "#34d399",
            fontWeight: 600,
          }}
          onClick={onAutofill}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
          <span>{t.autofill_form}</span>
        </button>
      )}

      <button
        className="sidepanel-chip"
        onClick={() => onChipClick("summarize")}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>
        <span>{t.chip_summarize}</span>
      </button>

      <button
        className="sidepanel-chip"
        onClick={() => onChipClick("key_takeaways")}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 16v-4"></path>
          <path d="M12 8h.01"></path>
        </svg>
        <span>{t.chip_takeaways}</span>
      </button>

      <button className="sidepanel-chip" onClick={() => onChipClick("extract")}>
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
        <span>{t.chip_extract}</span>
      </button>

      <button className="sidepanel-chip" onClick={() => onChipClick("ask")}>
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        <span>{t.chip_ask}</span>
      </button>
    </div>
  );
}
