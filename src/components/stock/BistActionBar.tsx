/**
 * BistActionBar.tsx
 * BIST Dashboard sekmeleri ve aksiyon butonları (BIST Portföy, Halka Arz Takvimi, KAP Haberleri, Hisse Ara / Keşfet, + Hisse Ekle, Alarmlar, Yenile).
 */

export type BistTabId = "portfolio" | "watchlist" | "halka-arz" | "kesfet";

interface BistActionBarProps {
  activeTab: BistTabId;
  alertLogsCount: number;
  onTabChange: (tab: BistTabId) => void;
  onOpenKapNewsModal: () => void;
  onOpenAddModal: () => void;
  onOpenLogsModal: () => void;
  onRefreshData: () => void;
}

function IconBriefcase() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function IconEye() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function IconRefresh() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

function IconNewspaper() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 1-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
      <path d="M18 14h-8" />
      <path d="M18 18h-8" />
      <path d="M10 6h8v4h-8V6Z" />
    </svg>
  );
}

function IconRocket() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.71.79-1.81.2-2.55L4.5 16.5z" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-3.05 11a22.35 22.35 0 0 1-3.95 2L12 15z" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function BistActionBar({
  activeTab,
  alertLogsCount,
  onTabChange,
  onOpenKapNewsModal,
  onOpenAddModal,
  onOpenLogsModal,
  onRefreshData,
}: BistActionBarProps) {
  return (
    <div className="stock-action-bar">
      <div
        style={{
          display: "flex",
          gap: "8px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <button
          className={`stock-btn ${
            activeTab === "portfolio"
              ? "stock-btn-primary"
              : "stock-btn-secondary"
          }`}
          onClick={() => onTabChange("portfolio")}
        >
          <IconBriefcase />
          <span>BİST Portföyüm</span>
        </button>
        <button
          className={`stock-btn ${
            activeTab === "watchlist"
              ? "stock-btn-primary"
              : "stock-btn-secondary"
          }`}
          onClick={() => onTabChange("watchlist")}
        >
          <IconEye />
          <span>Takip Listelerim</span>
        </button>
        <button
          className={`stock-btn ${
            activeTab === "kesfet" ? "stock-btn-primary" : "stock-btn-secondary"
          }`}
          onClick={() => onTabChange("kesfet")}
        >
          <IconSearch />
          <span>Keşfet & Hisse Ara</span>
        </button>
        <button
          className={`stock-btn ${
            activeTab === "halka-arz"
              ? "stock-btn-primary"
              : "stock-btn-secondary"
          }`}
          onClick={() => onTabChange("halka-arz")}
        >
          <IconRocket />
          <span>Halka Arz Takvimi</span>
        </button>
      </div>

      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <button
          className="stock-btn stock-btn-secondary"
          onClick={onOpenKapNewsModal}
        >
          <IconNewspaper />
          <span>KAP Haberleri</span>
        </button>
        <button
          className="stock-btn stock-btn-secondary"
          onClick={onOpenLogsModal}
        >
          <IconBell />
          <span>Alarmlar ({alertLogsCount})</span>
        </button>
        <button
          className="stock-btn stock-btn-secondary"
          onClick={onRefreshData}
          title="Canlı Verileri Yenile"
        >
          <IconRefresh />
        </button>
      </div>
    </div>
  );
}
