/**
 * KpssHelpModal.tsx
 * Presentational "KPSS Not Alma Rehberi" modal popup.
 * 5-section guide: hierarchy, short text, definition lines, wikilinks, auto-title.
 */

interface KpssHelpModalProps {
  t: Record<string, string>;
  onClose: () => void;
}

export function KpssHelpModal({ t, onClose }: KpssHelpModalProps) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#0f172a",
          border: "1px solid rgba(168, 85, 247, 0.4)",
          borderRadius: "14px",
          padding: "24px",
          maxWidth: "540px",
          width: "92%",
          maxHeight: "85vh",
          overflowY: "auto",
          boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
          color: "#f1f5f9",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            paddingBottom: "10px",
            marginBottom: "14px",
          }}
        >
          <h3
            style={{
              margin: 0,
              color: "#c084fc",
              fontSize: "1.05rem",
              fontWeight: 800,
            }}
          >
            {t.kpss_notes_help_title || "KPSS Not Alma Rehberi"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#94a3b8",
              fontSize: "1.2rem",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            fontSize: "0.84rem",
            lineHeight: 1.6,
          }}
        >
          <div>
            <strong style={{ color: "#c084fc" }}>
              1. Ana Başlık → Alt Başlık Yapısı:
            </strong>
            <p style={{ margin: "4px 0 0 0", color: "#cbd5e1" }}>
              Önce ana not oluştur (ör.{" "}
              <code style={{ color: "#a78bfa" }}>Büyük Selçuklu</code>).
              Notun üzerine gelip{" "}
              <code style={{ color: "#60a5fa" }}>+</code> butonuyla alt not
              ekle (ör. <code style={{ color: "#a78bfa" }}>Devlet Teşkilatı</code>).
              Alt notlara da <code style={{ color: "#60a5fa" }}>+</code> ile
              devam et — iç içe hiyerarşi oluşur.
            </p>
          </div>

          <div>
            <strong style={{ color: "#c084fc" }}>
              2. Kısa Metin, Net Bilgi:
            </strong>
            <p style={{ margin: "4px 0 0 0", color: "#cbd5e1" }}>
              Her alt başlığa 1-3 cümlelik özet yaz. KPSS'de ezber yerine
              kavram netliği önemli. Örnek:{" "}
              <em>
                "Vezir-i Azam: Büyük Selçuklu'da başkent yönetiminden sorumlu,
                Nizamülmülk en meşhur örneğidir."
              </em>
            </p>
          </div>

          <div>
            <strong style={{ color: "#c084fc" }}>
              3. Tanım Satırları (Bilgi Kutusu):
            </strong>
            <p style={{ margin: "4px 0 0 0", color: "#cbd5e1" }}>
              <code style={{ color: "#a78bfa" }}>Terim : Açıklama</code>{" "}
              formatında yazdığın satırlar notun sağındaki Bilgi Kutusu'na
              otomatik özet olarak çekilir.
            </p>
          </div>

          <div>
            <strong style={{ color: "#c084fc" }}>
              4. Notlar Arası Bağlantı (Wikilink):
            </strong>
            <p style={{ margin: "4px 0 0 0", color: "#cbd5e1" }}>
              <code style={{ color: "#a78bfa" }}>[[Not Adı]]</code> yazarsan
              tıklanabilir bağlantı olur. Ağaç butonuyla notlar arası grafik
              bağlantıları görürsün.
            </p>
          </div>

          <div>
            <strong style={{ color: "#c084fc" }}>
              5. Başlık Otomatik Doldurma:
            </strong>
            <p style={{ margin: "4px 0 0 0", color: "#cbd5e1" }}>
              Başlık boş bırakılırsa ilk satırdan otomatik alınır. Manuel
              başlık yazarsan ona asla dokunulmaz.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: "18px",
            width: "100%",
            background: "linear-gradient(135deg, #2563eb, #7c3aed)",
            border: "none",
            color: "white",
            padding: "9px",
            borderRadius: "8px",
            fontWeight: 700,
            fontSize: "0.85rem",
            cursor: "pointer",
          }}
        >
          Anladım
        </button>
      </div>
    </div>
  );
}
