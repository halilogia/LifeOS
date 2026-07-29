/**
 * FreeGamesFilterBar.tsx
 * Oyun fırsatları üst filtre barı (Platform & Tür seçimleri, Hızlı Talep bağlantıları ve Kaynak Hariç Tutma kutuları).
 */

import { ExclusionSettings } from "@/types/games.js";

interface FreeGamesFilterBarProps {
  t: Record<string, string>;
  platform: string;
  type: string;
  exclusions: ExclusionSettings;
  onPlatformChange: (val: string) => void;
  onTypeChange: (val: string) => void;
  onExclusionChange: (siteKey: keyof ExclusionSettings) => void;
}

export function FreeGamesFilterBar({
  t,
  platform,
  type,
  exclusions,
  onPlatformChange,
  onTypeChange,
  onExclusionChange,
}: FreeGamesFilterBarProps) {
  return (
    <div>
      <header className="free-games-header">
        <h2>{t.free_games_title}</h2>
        <div className="free-games-filters">
          <div className="filter-group">
            <label>{t.filter_platform}</label>
            <select
              id="free-games-platform-select"
              className="free-games-select"
              value={platform}
              onChange={(e) =>
                onPlatformChange((e.target as HTMLSelectElement).value)
              }
            >
              <option value="all">{t.platform_all}</option>
              <option value="pc">{t.platform_pc}</option>
              <option value="steam">{t.platform_steam}</option>
              <option value="epic-games-store">{t.platform_epic}</option>
              <option value="gog">{t.platform_gog}</option>
            </select>
          </div>
          <div className="filter-group">
            <label>{t.filter_type}</label>
            <select
              id="free-games-type-select"
              className="free-games-select"
              value={type}
              onChange={(e) =>
                onTypeChange((e.target as HTMLSelectElement).value)
              }
            >
              <option value="game">{t.type_game}</option>
              <option value="loot">{t.type_loot}</option>
              <option value="beta">{t.type_beta}</option>
            </select>
          </div>
        </div>
      </header>

      {/* Quick Claim Shortcuts Bar */}
      <div
        className="free-games-shortcuts"
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          flexWrap: "wrap",
          background: "rgba(255, 255, 255, 0.02)",
          border: "1px solid var(--card-border)",
          borderRadius: "12px",
          padding: "12px 16px",
          alignItems: "center",
          width: "100%",
        }}
      >
        <span
          style={{
            fontSize: "0.85rem",
            fontWeight: "600",
            color: "var(--text-secondary)",
            marginRight: "10px",
          }}
        >
          {t.free_games_quick_claim}
        </span>
        <a
          href="https://store.epicgames.com/free-games"
          target="_blank"
          rel="noopener noreferrer"
          className="add-note-action-btn secondary"
          style={{
            padding: "6px 14px",
            fontSize: "0.8rem",
            height: "auto",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            textDecoration: "none",
          }}
        >
          Epic Games
        </a>
        <a
          href="https://gaming.amazon.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="add-note-action-btn secondary"
          style={{
            padding: "6px 14px",
            fontSize: "0.8rem",
            height: "auto",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            textDecoration: "none",
          }}
        >
          Prime Gaming
        </a>
        <a
          href="https://luna.amazon.com/claims/home?g=s"
          target="_blank"
          rel="noopener noreferrer"
          className="add-note-action-btn secondary"
          style={{
            padding: "6px 14px",
            fontSize: "0.8rem",
            height: "auto",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            textDecoration: "none",
            borderColor: "var(--accent-color)",
          }}
        >
          Amazon Luna
        </a>
        <a
          href="https://store.steampowered.com/genre/Free%20to%20Play/"
          target="_blank"
          rel="noopener noreferrer"
          className="add-note-action-btn secondary"
          style={{
            padding: "6px 14px",
            fontSize: "0.8rem",
            height: "auto",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            textDecoration: "none",
          }}
        >
          Steam Free
        </a>
        <a
          href="https://www.gog.com/partner/free_games"
          target="_blank"
          rel="noopener noreferrer"
          className="add-note-action-btn secondary"
          style={{
            padding: "6px 14px",
            fontSize: "0.8rem",
            height: "auto",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            textDecoration: "none",
          }}
        >
          GOG Free
        </a>
      </div>

      {/* Source Exclusion Checkboxes */}
      <div className="free-games-sources">
        <span className="sources-title">{t.filter_sources}</span>
        <div className="sources-grid">
          {(
            [
              "steam",
              "epic",
              "gog",
              "humble",
              "indiegala",
              "itch",
              "other",
            ] as const
          ).map((siteKey) => {
            const label =
              siteKey === "epic"
                ? "Epic Games"
                : siteKey === "humble"
                  ? "Humble Bundle"
                  : siteKey === "other"
                    ? t.cat_other
                    : siteKey.toUpperCase();
            return (
              <label key={siteKey} className="source-label">
                <input
                  type="checkbox"
                  checked={exclusions[siteKey]}
                  onChange={() => onExclusionChange(siteKey)}
                />
                <span>{label}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
