import { useEffect } from "preact/hooks";
import type { Language } from "@/types/types.js";
import { getTranslation } from "@/utils/i18n.js";
import { useNetworkStore, type NetworkTab } from "@/presentation/store/networkStore.js";

import { NetworkOverviewCard } from "./NetworkOverviewCard.js";
import { ProtocolHealthCard } from "./ProtocolHealthCard.js";
import { ServiceRadarGrid } from "./ServiceRadarGrid.js";
import { SpeedometerCard } from "./SpeedometerCard.js";
import { DnsSecurityCard } from "./DnsSecurityCard.js";
import { DiagnosticHistoryCard } from "./DiagnosticHistoryCard.js";

interface NetworkViewProps {
  lang: Language;
}

export function NetworkView({ lang }: NetworkViewProps) {
  const t = getTranslation(lang);

  const activeTab = useNetworkStore((s) => s.activeTab);
  const setActiveTab = useNetworkStore((s) => s.setActiveTab);
  const isTesting = useNetworkStore((s) => s.isTesting);
  const currentPhase = useNetworkStore((s) => s.currentPhase);
  const progressPercent = useNetworkStore((s) => s.progressPercent);
  const speedGaugeMbps = useNetworkStore((s) => s.speedGaugeMbps);
  const latestReport = useNetworkStore((s) => s.latestReport);
  const history = useNetworkStore((s) => s.history);
  const lastCopied = useNetworkStore((s) => s.lastCopied);

  const loadHistory = useNetworkStore((s) => s.loadHistory);
  const runFullDiagnostic = useNetworkStore((s) => s.runFullDiagnostic);
  const runQuickPing = useNetworkStore((s) => s.runQuickPing);
  const runSpeedTestOnly = useNetworkStore((s) => s.runSpeedTestOnly);
  const clearHistory = useNetworkStore((s) => s.clearHistory);
  const copyMarkdownReport = useNetworkStore((s) => s.copyMarkdownReport);

  useEffect(() => {
    void (async () => {
      await loadHistory();
      // If no report exists, run initial quick ping
      const current = useNetworkStore.getState().latestReport;
      if (!current) {
        void runQuickPing();
      }
    })();
  }, []);

  const tabs: { key: NetworkTab; label: string }[] = [
    { key: "overview", label: t.network_tab_overview || "Overview" },
    { key: "services", label: t.network_tab_services || "Service Radar" },
    { key: "speed", label: t.network_tab_speed || "Speed Test" },
    { key: "protocol", label: t.network_tab_protocol || "IPv4 / IPv6 Diagnosis" },
    { key: "history", label: t.network_tab_history || "History" },
  ];

  return (
    <div id="network-view" className="network-dashboard-container">
      {/* Top Header */}
      <header className="network-header">
        <div className="network-header-title-row">
          <div className="network-header-icon-box">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M5 12.55a11 11 0 0 1 14.08 0" />
              <path d="M1.42 9a16 16 0 0 1 21.16 0" />
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
              <line x1="12" y1="20" x2="12.01" y2="20" />
            </svg>
          </div>
          <div>
            <h1 className="network-main-title">{t.network_title}</h1>
            <p className="network-main-subtitle">{t.network_subtitle}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="network-tabs-bar">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`network-tab-btn ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span>{tab.label}</span>
              {tab.key === "protocol" && latestReport?.protocolHealth?.issueDetected && (
                <span className="network-tab-warning-dot" />
              )}
            </button>
          ))}
        </nav>
      </header>

      {/* Main View Area */}
      <main className="network-main-content">
        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="network-tab-pane">
            <NetworkOverviewCard
              lang={lang}
              report={latestReport}
              isTesting={isTesting}
              currentPhase={currentPhase}
              progressPercent={progressPercent}
              onRunFullTest={runFullDiagnostic}
              onRunQuickPing={runQuickPing}
              onRunSpeedTest={runSpeedTestOnly}
            />

            <div className="network-split-layout">
              <ProtocolHealthCard
                lang={lang}
                protocolHealth={latestReport?.protocolHealth ?? null}
              />
              <DnsSecurityCard
                lang={lang}
                dnsChecks={latestReport?.dnsChecks ?? []}
              />
            </div>

            <ServiceRadarGrid
              lang={lang}
              pingResults={latestReport?.pingResults ?? []}
            />
          </div>
        )}

        {/* Tab 2: Services Radar */}
        {activeTab === "services" && (
          <div className="network-tab-pane">
            <ServiceRadarGrid
              lang={lang}
              pingResults={latestReport?.pingResults ?? []}
            />
          </div>
        )}

        {/* Tab 3: Speed Test */}
        {activeTab === "speed" && (
          <div className="network-tab-pane">
            <SpeedometerCard
              lang={lang}
              speedTest={latestReport?.speedTest}
              isTesting={isTesting}
              liveGaugeMbps={speedGaugeMbps}
              progressPercent={progressPercent}
              onRunSpeedTest={runSpeedTestOnly}
            />
          </div>
        )}

        {/* Tab 4: Protocol Health & IPv6 Diagnosis */}
        {activeTab === "protocol" && (
          <div className="network-tab-pane">
            <ProtocolHealthCard
              lang={lang}
              protocolHealth={latestReport?.protocolHealth ?? null}
            />
          </div>
        )}

        {/* Tab 5: History */}
        {activeTab === "history" && (
          <div className="network-tab-pane">
            <DiagnosticHistoryCard
              lang={lang}
              history={history}
              lastCopied={lastCopied}
              onCopyReport={copyMarkdownReport}
              onClearHistory={clearHistory}
            />
          </div>
        )}
      </main>
    </div>
  );
}
