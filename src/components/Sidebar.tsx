import { Language } from '../types/types.js';
import { translations } from '../utils/i18n.js';

interface SidebarProps {
  lang: Language;
  activeView: string;
  activeTab: 'focus' | 'routines';
  sidebarOpen: boolean;
  onViewChange: (view: any) => void;
  onTabChange: (tab: 'focus' | 'routines') => void;
  onSidebarToggle: () => void;
  onSettingsOpen: () => void;
}

export function Sidebar({
  lang,
  activeView,
  activeTab,
  sidebarOpen,
  onViewChange,
  onTabChange,
  onSidebarToggle,
  onSettingsOpen,
}: SidebarProps) {
  const t = translations[lang];

  return (
    <>
      <button
        id="sidebar-toggle"
        className="sidebar-toggle"
        onClick={onSidebarToggle}
      >
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
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      <aside id="sidebar" className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="logo">Life OS</h2>
        </div>
        <nav className="sidebar-nav">
          <button
            id="view-free-games-btn"
            className={`sidebar-btn ${activeView === 'free-games' ? 'active' : ''}`}
            onClick={() => onViewChange('free-games')}
          >
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
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <path d="M6 12h4M8 10v4M15 11v.01M18 13v.01" />
            </svg>
            <span>{t.view_free_games}</span>
          </button>

          <button
            id="view-pomodoro-btn"
            className={`sidebar-btn ${activeView === 'pomodoro' ? 'active' : ''}`}
            onClick={() => onViewChange('pomodoro')}
          >
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
              <path d="M10 2h4"></path>
              <path d="M12 14v-4"></path>
              <path d="M4 13a8 8 0 0 1 8-7 8 8 0 1 1-8 7z"></path>
            </svg>
            <span>{t.view_pomodoro}</span>
          </button>

          <button
            id="nav-focus-btn"
            className={`sidebar-btn ${activeView === 'list' && activeTab === 'focus' ? 'active' : ''}`}
            onClick={() => {
              onViewChange('list');
              onTabChange('focus');
            }}
          >
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
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>{t.section_tasks}</span>
          </button>

          <button
            id="nav-routines-btn"
            className={`sidebar-btn ${activeView === 'list' && activeTab === 'routines' ? 'active' : ''}`}
            onClick={() => {
              onViewChange('list');
              onTabChange('routines');
            }}
          >
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
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
            </svg>
            <span>{t.section_recurring}</span>
          </button>

          <div className="sidebar-divider"></div>

          <button
            id="view-list-btn"
            className={`sidebar-btn ${activeView === 'list' && activeTab === 'focus' ? 'active' : ''}`}
            onClick={() => {
              onViewChange('list');
              onTabChange('focus');
            }}
          >
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
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            <span>{t.view_list}</span>
          </button>

          <button
            id="view-kanban-btn"
            className={`sidebar-btn ${activeView === 'kanban' ? 'active' : ''}`}
            onClick={() => onViewChange('kanban')}
          >
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
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="3" x2="9" y2="21"></line>
              <line x1="15" y1="3" x2="15" y2="21"></line>
            </svg>
            <span>{t.view_kanban}</span>
          </button>

          <button
            id="view-hifiz-btn"
            className={`sidebar-btn ${activeView === 'hifiz' ? 'active' : ''}`}
            onClick={() => onViewChange('hifiz')}
          >
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
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            <span>{lang === 'tr' ? 'Ezberlerim' : 'Memorizations'}</span>
          </button>

          <button
            id="view-notes-btn"
            className={`sidebar-btn ${activeView === 'notes' ? 'active' : ''}`}
            onClick={() => onViewChange('notes')}
          >
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
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span>{t.view_notes}</span>
          </button>

          <button
            id="view-srs-btn"
            className={`sidebar-btn ${activeView === 'srs' ? 'active' : ''}`}
            onClick={() => onViewChange('srs')}
          >
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
              <path d="M21.5 2v6h-6M2.13 15.57a9 9 0 1 0 3.84-10.4L2 8"></path>
            </svg>
            <span>{t.view_srs}</span>
          </button>

          <button
            id="view-calendar-btn"
            className={`sidebar-btn ${activeView === 'calendar' ? 'active' : ''}`}
            onClick={() => onViewChange('calendar')}
          >
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
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>{t.view_calendar}</span>
          </button>

          <button
            id="view-prayer-btn"
            className={`sidebar-btn ${activeView === 'prayer' ? 'active' : ''}`}
            onClick={() => onViewChange('prayer')}
          >
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
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path>
              <circle cx="12" cy="12" r="4"></circle>
            </svg>
            <span>{t.view_prayer}</span>
          </button>

          <button
            id="view-kpss-btn"
            className={`sidebar-btn ${activeView === 'kpss' ? 'active' : ''}`}
            onClick={() => onViewChange('kpss')}
          >
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
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              <path d="M12 6v4"></path>
              <path d="M12 14v.01"></path>
            </svg>
            <span>KPSS</span>
          </button>

          <button
            id="view-willpower-btn"
            className={`sidebar-btn ${activeView === 'willpower' ? 'active' : ''}`}
            onClick={() => onViewChange('willpower')}
          >
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
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>{t.view_willpower}</span>
          </button>

          <div className="sidebar-divider"></div>

          <button id="settings-btn" className="sidebar-btn" onClick={onSettingsOpen}>
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
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <span>{t.settings_title}</span>
          </button>
        </nav>
      </aside>
    </>
  );
}
