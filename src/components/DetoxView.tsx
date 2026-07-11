import { useState, useEffect } from 'preact/hooks';
import { Language } from '../types/types.js';
import { translations } from '../utils/i18n.js';

interface DetoxViewProps {
  lang: Language;
}

const SUPPORTED_SITES = [
  { id: 'x.com', label: 'Twitter / X', domains: ['x.com', 'twitter.com'] },
  { id: 'instagram.com', label: 'Instagram', domains: ['instagram.com'] },
  { id: 'youtube.com', label: 'YouTube', domains: ['youtube.com'] },
  { id: 'tiktok.com', label: 'TikTok', domains: ['tiktok.com'] },
  { id: 'facebook.com', label: 'Facebook', domains: ['facebook.com'] },
];

const DURATIONS = [
  { value: 15 * 60 * 1000, labelKey: 'detox_duration_15m' },
  { value: 30 * 60 * 1000, labelKey: 'detox_duration_30m' },
  { value: 60 * 60 * 1000, labelKey: 'detox_duration_1h' },
  { value: 120 * 60 * 1000, labelKey: 'detox_duration_2h' },
  { value: 240 * 60 * 1000, labelKey: 'detox_duration_4h' },
  { value: -1, labelKey: 'detox_duration_permanent' },
];

export function DetoxView({ lang }: DetoxViewProps) {
  const t = translations[lang];

  const [enabled, setEnabled] = useState(false);
  const [blockedSites, setBlockedSites] = useState<string[]>([]);
  const [endTime, setEndTime] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(30 * 60 * 1000); // 30m default
  const [timeLeft, setTimeLeft] = useState(0);

  // Load configuration from storage
  useEffect(() => {
    chrome.storage.sync.get(['detox_enabled', 'detox_blocked_sites', 'detox_end_time'], (res) => {
      const isEnabled = res.detox_enabled || false;
      const sites = res.detox_blocked_sites || [];
      const end = res.detox_end_time || 0;

      // Check if time expired
      if (isEnabled && end !== -1 && end <= Date.now()) {
        // Expired, auto disable
        handleDisableDetox();
      } else {
        setEnabled(isEnabled);
        setBlockedSites(sites);
        setEndTime(end);
      }
    });
  }, []);

  // Tick local countdown timer if active
  useEffect(() => {
    let interval: number | null = null;

    if (enabled && endTime !== -1) {
      const calcTimeLeft = () => {
        const remaining = Math.max(0, Math.round((endTime - Date.now()) / 1000));
        setTimeLeft(remaining);
        if (remaining === 0) {
          handleDisableDetox();
        }
      };

      calcTimeLeft();
      interval = window.setInterval(calcTimeLeft, 1000);
    } else {
      setTimeLeft(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [enabled, endTime]);

  const handleToggleSite = (siteDomains: string[]) => {
    setBlockedSites((prev) => {
      // Check if first domain is already in list
      const exists = prev.includes(siteDomains[0]);
      if (exists) {
        return prev.filter((d) => !siteDomains.includes(d));
      } else {
        return [...prev, ...siteDomains];
      }
    });
  };

  const handleEnableDetox = async () => {
    if (blockedSites.length === 0) {
      alert(t.detox_no_sites_alert || 'Lütfen en az bir site seçin.');
      return;
    }

    const calculatedEndTime = selectedDuration === -1 ? -1 : Date.now() + selectedDuration;
    const settings = {
      detox_enabled: true,
      detox_blocked_sites: blockedSites,
      detox_end_time: calculatedEndTime,
    };

    chrome.storage.sync.set(settings, () => {
      setEnabled(true);
      setEndTime(calculatedEndTime);
    });
  };

  const handleDisableDetox = async () => {
    const settings = {
      detox_enabled: false,
      detox_end_time: 0,
    };

    chrome.storage.sync.set(settings, () => {
      setEnabled(false);
      setEndTime(0);
      setTimeLeft(0);
    });
  };

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    
    let str = '';
    if (h > 0) {
      str += `${h.toString().padStart(2, '0')}:`;
    }
    str += `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return str;
  };

  return (
    <div id="detox-view" className="view-content active">
      <div className="detox-container">
        
        {/* Main Status Block Card */}
        <div className="detox-card">
          <div className="detox-status-header">
            <div className="detox-title-group">
              <h2>{t.detox_title || 'Sosyal Medya Detoksu'}</h2>
              <p>{t.detox_desc || 'Sosyal medyaya erişimi engelleyerek odaklanmanızı artırın.'}</p>
            </div>
            
            <div className={`detox-status-badge ${enabled ? 'active' : ''}`}>
              <div className="badge-dot"></div>
              <span>{enabled ? (t.detox_status_active || 'Aktif') : (t.detox_status_inactive || 'Pasif')}</span>
            </div>
          </div>

          {enabled ? (
            // Active Countdown Screen Layout
            <div className="detox-active-screen">
              <div className="countdown-ring">
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle className="ring-bg" cx="60" cy="60" r="50" />
                  <circle className="ring-progress animate-pulse" cx="60" cy="60" r="50" />
                </svg>
                <div className="ring-text">
                  <span className="ring-time-val">
                    {endTime === -1 ? '∞' : formatTime(timeLeft)}
                  </span>
                  <span className="ring-time-lbl">
                    {endTime === -1 ? (t.detox_duration_permanent || 'Süresiz') : (t.time_remaining || 'Kalan Süre')}
                  </span>
                </div>
              </div>

              <div className="detox-active-info">
                <h3>{t.detox_active_title || 'Derin Odaklanma Modu'}</h3>
                <p>{t.detox_active_desc || 'Odaklanma oturumunuz boyunca seçilen sosyal medya kanalları tamamen engellenmiştir.'}</p>
                
                <button className="detox-btn danger" onClick={handleDisableDetox}>
                  {t.detox_btn_disable || 'Detoksu Sonlandır'}
                </button>
              </div>
            </div>
          ) : (
            // Configure Detox Settings Form
            <div className="detox-setup-form">
              <div className="setup-section">
                <h3>{t.detox_select_sites || 'Engellenecek Platformları Seçin'}</h3>
                <div className="platforms-grid">
                  {SUPPORTED_SITES.map((site) => {
                    const isChecked = blockedSites.includes(site.domains[0]);
                    return (
                      <div
                        key={site.id}
                        className={`platform-checkbox-card ${isChecked ? 'checked' : ''}`}
                        onClick={() => handleToggleSite(site.domains)}
                      >
                        <div className="card-checkbox-circle">
                          {isChecked && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          )}
                        </div>
                        <span className="platform-label">{site.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="setup-section duration-section">
                <div className="duration-picker-group">
                  <div className="picker-label-group">
                    <h3>{t.detox_select_duration || 'Süre Belirleyin'}</h3>
                    <p>{t.detox_duration_desc || 'Bloklamanın ne kadar süreceğini seçin.'}</p>
                  </div>
                  
                  <select
                    className="free-games-select detox-select"
                    value={selectedDuration}
                    onChange={(e) => setSelectedDuration(Number((e.target as HTMLSelectElement).value))}
                  >
                    {DURATIONS.map((dur) => (
                      <option key={dur.value} value={dur.value}>
                        {t[dur.labelKey as keyof typeof t] || dur.labelKey}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button className="detox-btn primary" onClick={handleEnableDetox}>
                {t.detox_btn_enable || 'Detoksu Başlat'}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
