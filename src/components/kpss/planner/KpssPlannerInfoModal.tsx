interface KpssPlannerInfoModalProps {
  t: Record<string, string>;
  onClose: () => void;
}

export function KpssPlannerInfoModal({
  t,
  onClose,
}: KpssPlannerInfoModalProps) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "rgba(30, 30, 46, 0.95)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "16px",
          padding: "24px",
          maxWidth: "500px",
          width: "90%",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
          color: "#f1f5f9",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            paddingBottom: "12px",
          }}
        >
          <span
            style={{
              fontSize: "1.05rem",
              fontWeight: "700",
              color: "var(--accent-color)",
            }}
          >
            {t.kpss_planner_info_title}
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-secondary)",
              fontSize: "1.3rem",
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            &times;
          </button>
        </div>

        {/* Info content stays language-aware via the `t` object */}
        <div
          style={{
            fontSize: "0.85rem",
            lineHeight: 1.6,
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
          dangerouslySetInnerHTML={{
            __html:
              t.kpss_planner_how_step1 +
              t.kpss_planner_how_step2 +
              t.kpss_planner_how_step3 +
              t.kpss_planner_how_step4,
          }}
        />
      </div>
    </div>
  );
}
