/**
 * KpssQuizInfoModal.tsx
 * KPSS soru sistemi değişim milatları (2013, 2014, 2018+) bilgilendirme pop-up penceresi.
 */

interface KpssQuizInfoModalProps {
  lang: string;
  onClose: () => void;
}

export function KpssQuizInfoModal({ lang, onClose }: KpssQuizInfoModalProps) {
  return (
    <div
      className="settings-panel active"
      style={{ zIndex: 1100 }}
      onClick={onClose}
    >
      <div
        className="settings-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "500px",
          width: "90%",
          background: "rgba(20, 20, 25, 0.95)",
          border: "1px solid var(--card-border, rgba(139, 92, 246, 0.2))",
        }}
      >
        <div className="settings-header">
          <h3>
            {lang === "tr"
              ? "KPSS Soru Sistemi Değişim Milatları"
              : "KPSS Question System Evolution"}
          </h3>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div
          className="settings-body"
          style={{
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            lineHeight: "1.5",
            fontSize: "0.9rem",
          }}
        >
          <div
            style={{
              borderBottom:
                "1px solid var(--card-border, rgba(255,255,255,0.08))",
              paddingBottom: "12px",
            }}
          >
            <p
              style={{
                opacity: 0.8,
                fontSize: "0.85rem",
                marginBottom: "8px",
              }}
            >
              {lang === "tr"
                ? "ÖSYM çıkmış sorularını çözerken hazırlık stratejinizi aşağıdaki reform yıllarına göre belirleyebilirsiniz:"
                : "When practicing past exam questions, customize your strategy based on these key reform milestones:"}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                fontWeight: "700",
                color: "var(--accent-color)",
                minWidth: "45px",
              }}
            >
              2013
            </div>
            <div>
              <strong
                style={{ display: "block", color: "var(--text-primary)" }}
              >
                {lang === "tr"
                  ? "Geçiş / Deneme Dönemi"
                  : "Transition / Pilot Era"}
              </strong>
              <span style={{ opacity: 0.7, fontSize: "0.85rem" }}>
                {lang === "tr"
                  ? "İlk kez Lisans sınavında yorumsal, öncüllü sorular ve Çağdaş Türk ve Dünya Tarihi müfredata girdi."
                  : "Interpretation-based questions and Contemporary Turkish/World History introduced first time for Undergraduate."}
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                fontWeight: "700",
                color: "var(--accent-color)",
                minWidth: "45px",
              }}
            >
              2014
            </div>
            <div>
              <strong
                style={{ display: "block", color: "var(--text-primary)" }}
              >
                {lang === "tr"
                  ? "Resmi Başlangıç / Standartlaşma"
                  : "Official Launch / Standardization"}
              </strong>
              <span style={{ opacity: 0.7, fontSize: "0.85rem" }}>
                {lang === "tr"
                  ? "Tüm düzeylerde (Lisans, Önlisans, Ortaöğretim) Sözel/Sayısal Mantık resmileşti ve bugünkü 120 soruluk şablon kalıcı hale geldi."
                  : "Verbal/Numerical Logic standardized across all levels; the modern 120-question template became permanent."}
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                fontWeight: "700",
                color: "var(--accent-color)",
                minWidth: "45px",
              }}
            >
              2018+
            </div>
            <div>
              <strong
                style={{ display: "block", color: "var(--text-primary)" }}
              >
                {lang === "tr"
                  ? "Nihai Dönem / Yeni Nesil Çağı"
                  : "Final Era / New Generation"}
              </strong>
              <span style={{ opacity: 0.7, fontSize: "0.85rem" }}>
                {lang === "tr"
                  ? "ÖSYM soru havuzu tamamen YKS/ALES paralelinde uzun paragraflara, günlük hayat senaryolarına ve yoğun muhakemeye evrildi."
                  : "Question database evolved fully parallel to YKS/ALES, shifting toward long reading passages and intense reasoning."}
              </span>
            </div>
          </div>
        </div>
        <div className="settings-footer">
          <button
            className="settings-add-btn"
            style={{ width: "auto", padding: "0 24px" }}
            onClick={onClose}
          >
            {lang === "tr" ? "Anladım" : "Got it"}
          </button>
        </div>
      </div>
    </div>
  );
}
