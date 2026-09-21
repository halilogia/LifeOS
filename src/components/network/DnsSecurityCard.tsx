import type { Language } from "@/types/types.js";
import { getTranslation } from "@/utils/i18n.js";
import type { DnsCheckResult } from "@/types/network.js";

interface DnsSecurityCardProps {
  lang: Language;
  dnsChecks: DnsCheckResult[];
}

export function DnsSecurityCard({ lang, dnsChecks }: DnsSecurityCardProps) {
  const t = getTranslation(lang);

  const getDnsStatusBadge = (status: DnsCheckResult["status"]) => {
    switch (status) {
      case "fast":
        return { text: t.network_status_fast || "Fast", color: "var(--success, #10b981)" };
      case "moderate":
        return { text: t.network_status_moderate || "Moderate", color: "var(--warning, #f59e0b)" };
      case "slow":
        return { text: t.network_status_slow || "Slow", color: "var(--danger, #ef4444)" };
      case "failed":
      default:
        return { text: t.network_status_offline || "Failed", color: "var(--text-muted, #64748b)" };
    }
  };

  return (
    <div className="network-card dns-card">
      <div className="dns-card-header">
        <div className="dns-title-group">
          <div className="dns-icon-badge">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div>
            <h4 className="dns-card-title">{t.network_dns_title}</h4>
            <p className="dns-card-subtitle">{t.network_dns_desc}</p>
          </div>
        </div>
      </div>

      <div className="dns-resolvers-grid">
        {dnsChecks.length > 0 ? (
          dnsChecks.map((d) => {
            const badge = getDnsStatusBadge(d.status);
            return (
              <div key={d.provider} className="dns-resolver-item">
                <div className="dns-resolver-info">
                  <span
                    className="dns-dot"
                    style={{ backgroundColor: badge.color }}
                  />
                  <span className="dns-name">{d.provider}</span>
                </div>
                <div className="dns-resolver-meta">
                  <span className="dns-latency">
                    {d.status === "failed" ? "--" : `${d.latencyMs} ms`}
                  </span>
                  <span
                    className="dns-status-tag"
                    style={{ borderColor: badge.color, color: badge.color }}
                  >
                    {badge.text}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="dns-empty-notice">
            <span>{t.network_dns_empty || "Run full diagnostics to benchmark DNS DoH speeds."}</span>
          </div>
        )}
      </div>
    </div>
  );
}
