/**
 * KpssQuizInfoModal.tsx
 * KPSS soru sistemi değişim milatları (2013, 2014, 2018+) bilgilendirme pop-up penceresi.
 */

interface KpssQuizInfoModalProps {
  t: Record<string, string>;
  onClose: () => void;
}

export function KpssQuizInfoModal({ t, onClose }: KpssQuizInfoModalProps) {
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
          <h3>{t.kpss_past_exams_history_q}</h3>
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
              {t.kpss_past_exams_history_q}
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
                {t.kpss_past_exams_step1}
              </strong>
              <span style={{ opacity: 0.7, fontSize: "0.85rem" }}>
                {t.kpss_past_exams_mixed}
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
                {t.kpss_past_exams_step2}
              </strong>
              <span style={{ opacity: 0.7, fontSize: "0.85rem" }}>
                {t.kpss_past_exams_all}
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
                {t.kpss_past_exams_history_q}
              </strong>
              <span style={{ opacity: 0.7, fontSize: "0.85rem" }}>
                {t.kpss_past_exams_geography}
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
            {t.kpss_quiz_got_it}
          </button>
        </div>
      </div>
    </div>
  );
}
