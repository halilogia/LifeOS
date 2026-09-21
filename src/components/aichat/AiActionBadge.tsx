/**
 * AiActionBadge.tsx
 * Visual confirmation badge rendered in AI chat when a background action
 * (Media Vault add, batch items, task creation, note save, memory update) executes.
 * Clean Architecture - Presentational Component.
 */

interface AiActionBadgeProps {
  action?: string;
  actionParams?: Record<string, unknown>;
  t: Record<string, string>;
}

export function AiActionBadge({
  action,
  actionParams,
  t,
}: AiActionBadgeProps) {
  if (!action || action === "none" || action === "clarification") {
    return null;
  }

  let iconSvg = (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );

  let label = "";

  if (action === "add_media") {
    const title = String(actionParams?.title ?? "");
    const type = String(actionParams?.type ?? "book");
    const typeLabel =
      type === "book"
        ? "Kitap"
        : type === "movie"
          ? "Film"
          : type === "tv"
            ? "Dizi"
            : "Oyun";
    label = `${t.action_media_added || "Media Vault'a Eklendi"} (${typeLabel}): "${title}"`;
    iconSvg = (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    );
  } else if (action === "batch_add_media") {
    const items = Array.isArray(actionParams?.items) ? actionParams.items : [];
    label = `${items.length} ${t.action_batch_media_added || "Eser Media Vault'a Eklendi"}`;
    iconSvg = (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="m16 6 4 14" />
        <path d="M12 6v14" />
        <path d="M8 8v12" />
        <path d="M4 4v16" />
      </svg>
    );
  } else if (action === "add_media_quote") {
    const bookTitle = String(actionParams?.book_title ?? "");
    label = `${t.action_quote_added || "Alıntı Eklendi"}: "${bookTitle}"`;
    iconSvg = (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
        <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
      </svg>
    );
  } else if (action === "update_media_progress") {
    const title = String(actionParams?.title ?? "");
    label = `İlerleme Güncellendi: "${title}"`;
  } else if (action === "create_task") {
    const text = String(actionParams?.text ?? "");
    label = `${t.action_task_added || "Görev Eklendi"}: "${text}"`;
  } else if (action === "batch_create_tasks") {
    const tasks = Array.isArray(actionParams?.tasks) ? actionParams.tasks : [];
    label = `${tasks.length} ${t.action_batch_tasks_added || "Adet Görev Eklendi"}`;
  } else if (action === "add_note") {
    const title = String(actionParams?.note_title ?? "Not");
    label = `${t.action_note_added || "Not Kaydedildi"}: "${title}"`;
    iconSvg = (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    );
  } else if (action === "update_memory") {
    label = t.action_memory_updated || "Kişisel Hafıza Güncellendi";
    iconSvg = (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M12 2a5 5 0 0 1 5 5v1a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5z" />
        <path d="M19 14v1a7 7 0 0 1-14 0v-1" />
      </svg>
    );
  } else if (action === "navigate_view") {
    const targetView = String(actionParams?.view ?? "");
    label = `${t.action_navigated || "Sayfaya Geçildi"}: "${targetView}"`;
    iconSvg = (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polygon points="3 11 22 2 13 21 11 13 3 11" />
      </svg>
    );
  } else if (action === "control_pomodoro") {
    const cmd = String(actionParams?.command ?? "start");
    label = `${t.action_pomodoro_controlled || "Pomodoro Zamanlayıcı"} (${cmd})`;
    iconSvg = (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    );
  } else if (action === "toggle_routine") {
    const rText = String(actionParams?.routine_text ?? "");
    label = `${t.action_routine_toggled || "Rutin Güncellendi"}: "${rText}"`;
    iconSvg = (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
      </svg>
    );
  } else if (action === "add_stock_watchlist") {
    const symbol = String(actionParams?.symbol ?? "");
    label = `${t.action_stock_added || "Borsa Takip Listesine Eklendi"}: ${symbol}`;
    iconSvg = (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    );
  } else if (action === "log_kpss_study") {
    const subject = String(actionParams?.subject ?? "Genel");
    const q = Number(actionParams?.questions) || 0;
    label = `${t.action_kpss_logged || "KPSS Çalışması Kaydedildi"} (${subject} - ${q} Soru)`;
    iconSvg = (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    );
  } else if (action === "set_prayer_city") {
    const city = String(actionParams?.city ?? "");
    label = `${t.action_prayer_city_updated || "Namaz Vakti Şehri Güncellendi"}: ${city}`;
    iconSvg = (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      </svg>
    );
  } else {
    label = `İşlem Gerçekleştirildi: ${action}`;
  }

  return (
    <div className="aichat-action-badge">
      <span className="aichat-action-icon">{iconSvg}</span>
      <span className="aichat-action-label">{label}</span>
    </div>
  );
}
