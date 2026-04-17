import { prayerService, PrayerTimes } from "../services/prayerService.js";
import { state } from "../core/state.js";

const PRAYER_NAMES: Record<string, Record<string, string>> = {
  tr: {
    Fajr: "İmsak",
    Sunrise: "Güneş",
    Dhuhr: "Öğle",
    Asr: "İkindi",
    Maghrib: "Akşam",
    Isha: "Yatsı",
    title: "Namaz Vakitleri",
  },
  en: {
    Fajr: "Fajr",
    Sunrise: "Sunrise",
    Dhuhr: "Dhuhr",
    Asr: "Asr",
    Maghrib: "Maghrib",
    Isha: "Isha",
    title: "Prayer Times",
  },
};

export async function initPrayers() {
  const content = document.getElementById("prayer-content");

  if (!content) {
    return;
  }

  content.innerHTML = `<div style="text-align:center; padding: 4rem; color: var(--text-secondary); animation: pulse 1.5s infinite;">Vakitler alınıyor...</div>`;

  try {
    const times = await prayerService.getPrayerTimes();
    const currentLang = state.currentLang || "tr";
    const labels =
      PRAYER_NAMES[currentLang as keyof typeof PRAYER_NAMES] || PRAYER_NAMES.tr;

    content.innerHTML = `
      <div class="prayer-standalone-card" style="max-width: 600px; margin: 0 auto;">
        <div class="prayer-widget-header" style="margin-bottom: 2rem; padding-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--card-border);">
          <h2 style="font-size: 1.8rem; font-weight: 700; color: var(--text-primary);">${labels.title}</h2>
          <span class="prayer-city-tag" style="font-size: 0.9rem; background: rgba(139, 92, 246, 0.1); color: var(--accent-color); padding: 6px 16px; border-radius: 20px; font-weight: 600;">İstanbul</span>
        </div>
        <div class="prayer-list" style="display: grid; gap: 1rem;">
          ${renderPrayerItem(labels.Fajr, times.Fajr)}
          ${renderPrayerItem(labels.Sunrise, times.Sunrise)}
          ${renderPrayerItem(labels.Dhuhr, times.Dhuhr)}
          ${renderPrayerItem(labels.Asr, times.Asr)}
          ${renderPrayerItem(labels.Maghrib, times.Maghrib)}
          ${renderPrayerItem(labels.Isha, times.Isha)}
        </div>
      </div>
    `;

    highlightCurrentPrayer(times);
  } catch (error) {
    content.innerHTML = `<div style="text-align:center; padding: 2rem; color: var(--danger);">Vakitler yüklenirken bir hata oluştu.</div>`;
    console.error("Failed to load prayers", error);
  }
}

function renderPrayerItem(name: string, time: string) {
  return `
    <div class="prayer-item" data-time="${time}">
      <span class="prayer-name">${name}</span>
      <span class="prayer-time">${time}</span>
    </div>
  `;
}

function highlightCurrentPrayer(times: PrayerTimes) {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const timeToMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const schedule = [
    { name: "Fajr", min: timeToMinutes(times.Fajr) },
    { name: "Sunrise", min: timeToMinutes(times.Sunrise) },
    { name: "Dhuhr", min: timeToMinutes(times.Dhuhr) },
    { name: "Asr", min: timeToMinutes(times.Asr) },
    { name: "Maghrib", min: timeToMinutes(times.Maghrib) },
    { name: "Isha", min: timeToMinutes(times.Isha) },
  ];

  let currentIndex = -1;
  for (let i = 0; i < schedule.length; i++) {
    if (currentTime >= schedule[i].min) {
      currentIndex = i;
    }
  }

  if (currentIndex !== -1) {
    const items = document.querySelectorAll(".prayer-item");
    items.forEach((item, idx) => {
      // Because we render items in order: Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha
      // Which matches the schedule array exactly.
      // But we need to handle the whole page (two panels potentially)
      if (idx % 6 === currentIndex) {
        item.classList.add("active");
      }
    });
  }
}
