import { prayerService, PrayerTimes } from "@/services/prayerService.js";
import { state } from "@/core/state.js";
import { storage } from "@/core/storage.js";

const TURKEY_CITIES = [
  "Adana", "Adiyaman", "Afyonkarahisar", "Agri", "Aksaray", "Amasya", "Ankara", "Antalya", "Ardahan", "Artvin",
  "Aydin", "Balikesir", "Bartin", "Batman", "Bayburt", "Bilecik", "Bingol", "Bitlis", "Bolu", "Burdur",
  "Bursa", "Canakkale", "Cankiri", "Corum", "Denizli", "Diyarbakir", "Duzce", "Edirne", "Elazig", "Erzincan",
  "Erzurum", "Eskisehir", "Gaziantep", "Giresun", "Gumushane", "Hakkari", "Hatay", "Igdir", "Isparta", "Istanbul",
  "Izmir", "Kahramanmaras", "Karabuk", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kilis", "Kirikkale", "Kirklareli",
  "Kirsehir", "Kocaeli", "Konya", "Kutahya", "Malatya", "Manisa", "Mardin", "Mersin", "Mugla", "Mus",
  "Nevsehir", "Nigde", "Ordu", "Osmaniye", "Rize", "Sakarya", "Samsun", "Sanliurfa", "Siirt", "Sinop",
  "Sivas", "Sirnak", "Tekirdag", "Tokat", "Trabzon", "Tunceli", "Usak", "Van", "Yalova", "Yozgat", "Zonguldak"
];

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
    const settings = await storage.getSettings();
    const city = settings.prayerCity || "Istanbul";
    const country = settings.prayerCountry || "Turkey";

    const times = await prayerService.getPrayerTimes(city, country);
    const currentLang = state.currentLang || "tr";
    const labels =
      PRAYER_NAMES[currentLang as keyof typeof PRAYER_NAMES] || PRAYER_NAMES.tr;

    content.innerHTML = `
      <div class="prayer-standalone-card" style="max-width: 600px; margin: 0 auto;">
        <div class="prayer-widget-header" style="margin-bottom: 2rem; padding-bottom: 1.5rem; display: flex; flex-direction: column; gap: 1rem; border-bottom: 1px solid var(--card-border);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h2 style="font-size: 1.8rem; font-weight: 700; color: var(--text-primary);">${labels.title}</h2>
            <div id="city-display-container" style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <span class="prayer-city-tag" style="font-size: 0.9rem; background: rgba(139, 92, 246, 0.1); color: var(--accent-color); padding: 6px 16px; border-radius: 20px; font-weight: 600;">${city}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.5;"><path d="m18 15-6-6-6 6"/></svg>
            </div>
          </div>
          
          <div id="city-edit-form" style="display: none; background: rgba(255,255,255,0.03); padding: 15px; border-radius: 12px; border: 1px solid var(--card-border);">
            <div style="display: flex; gap: 8px;">
               <select id="prayer-city-select" style="flex: 1; background: var(--bg-color); border: 1px solid var(--card-border); color: var(--text-primary); padding: 8px 12px; border-radius: 8px; font-size: 0.9rem;">
                 ${TURKEY_CITIES.map(c => `<option value="${c}" ${c === city ? 'selected' : ''}>${c}</option>`).join('')}
               </select>
               <button id="save-prayer-city-btn" style="background: var(--accent-color); color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600;">Kaydet</button>
            </div>
          </div>
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

    const cityDisplay = document.getElementById("city-display-container");
    const cityForm = document.getElementById("city-edit-form");
    const saveBtn = document.getElementById("save-prayer-city-btn");

    if (cityDisplay && cityForm) {
      cityDisplay.onclick = () => {
        const isHidden = cityForm.style.display === "none";
        cityForm.style.display = isHidden ? "block" : "none";
        cityDisplay.querySelector("svg")!.style.transform = isHidden ? "rotate(180deg)" : "rotate(0deg)";
      };
    }

    if (saveBtn) {
      saveBtn.onclick = async () => {
        const newCity = (document.getElementById("prayer-city-select") as HTMLSelectElement).value;
        if (newCity) {
          await storage.setPrayerLocation(newCity, "Turkey");
          initPrayers(); // Refresh
        }
      };
    }

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
