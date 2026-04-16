import { Language } from "../types/types.js";

export const translations = {
  tr: {
    view_list: "Liste",
    view_kanban: "Kanban",
    greeting: "Bugünkü odağın nedir?",
    todo_placeholder: "Yeni görev ekle...",
    repeat_none: "Tekrar Yok",
    repeat_daily: "Günlük",
    repeat_weekly: "Haftalık",
    repeat_monthly: "Aylık",
    section_tasks: "Odağım",
    section_recurring: "Rutinler",
    empty_state: "Her şey tamam! Biraz dinlenme zamanı.",
    backup: "Yedek Al",
    restore: "Yedekten Yükle",
    kanban_todo: "Yapılacak",
    kanban_in_progress: "Yapılıyor",
    kanban_done: "Bitti",
    settings_title: "Ayarlar",
    change_lang: "Dil Değiştir",
    settings_data_title: "Veri Yönetimi",
    clear_all: "Tüm Verileri Temizle",
    alert_restore_success: "Yedek başarıyla yüklendi!",
    alert_restore_invalid: "Geçersiz yedek dosyası formatı.",
    alert_restore_error: "Yedek dosyası okunurken bir hata oluştu.",
    alert_clear_confirm:
      "Tüm verileri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.",
    quote_1: '"Başlamanın yolu konuşmayı bırakıp yapmaya başlamaktır."',
    quote_2: '"Başlamak, başarmanın yarısıdır."',
    quote_3: '"Yapılmış olması, mükemmel olmasından iyidir."',
    quote_4: '"Meşgul olmaya değil, üretken olmaya odaklan."',
    quote_5: '"Geleceği tahmin etmenin en iyi yolu onu yaratmaktır."',
    quote_6: '"İstediğin her şey korkunun diğer tarafındadır."',
    quote_7: '"Günleri sayma, günlere anlam kat."',
    cat_other: "Diğer",
    view_hifiz: "Ezberlerim",
    view_notes: "Notlarım",
    view_srs: "Aralıklı Tekrar",
    view_pomodoro: "Pomodoro",
    hifiz_title: "Kuran Ezberlerim",
    notes_title: "Notlarım",
    notes_placeholder: "Başlık...",
    notes_content_placeholder: "Bir şeyler yazın...",
    hifiz_stat_memorized: "Ezberlendi",
    hifiz_stat_in_progress: "Çalışılıyor",
    hifiz_stat_total: "Hedef",
    hifiz_cat_ayat: "Özel Ayetler",
    hifiz_cat_surahs: "Sureler",
    hifiz_cat_duas: "Dualar",
    hifiz_cat_juz30: "30. Cüz (Amme)",
    hifiz_status_not_started: "Başlanmadı",
    hifiz_status_in_progress: "Devam Ediyor",
    hifiz_status_memorized: "Ezberlendi",
    hifiz_search_placeholder: "Sure veya dua ara...",
  },
  en: {
    view_list: "List",
    view_kanban: "Kanban",
    greeting: "What's your focus for today?",
    todo_placeholder: "Add a new task...",
    repeat_none: "No Repeat",
    repeat_daily: "Daily",
    repeat_weekly: "Weekly",
    repeat_monthly: "Monthly",
    section_tasks: "My Focus",
    section_recurring: "Routines",
    empty_state: "All done! Time for some rest.",
    backup: "Backup",
    restore: "Restore",
    kanban_todo: "To Do",
    kanban_in_progress: "Doing",
    kanban_done: "Done",
    settings_title: "Settings",
    change_lang: "Change Language",
    settings_data_title: "Data Management",
    clear_all: "Clear All Data",
    alert_restore_success: "Backup restored successfully!",
    alert_restore_invalid: "Invalid backup file format.",
    alert_restore_error: "An error occurred while reading the backup file.",
    alert_clear_confirm:
      "Are you sure you want to clear all data? This action cannot be undone.",
    quote_1: '"The secret of getting ahead is getting started."',
    quote_2: '"Well begun is half done."',
    quote_3: '"Done is better than perfect."',
    quote_4: '"Focus on being productive instead of busy."',
    quote_5: '"The best way to predict the future is to create it."',
    quote_6: '"Everything you want is on the other side of fear."',
    quote_7: '"Don’t count the days, make the days count."',
    cat_other: "Other",
    view_hifiz: "Memorizations",
    view_notes: "Notes",
    view_srs: "Spaced Repetition",
    view_pomodoro: "Pomodoro",
    hifiz_title: "Quran Memorization",
    notes_title: "My Notes",
    notes_placeholder: "Title...",
    notes_content_placeholder: "Write something...",
    hifiz_stat_memorized: "Memorized",
    hifiz_stat_in_progress: "In Progress",
    hifiz_stat_total: "Goal",
    hifiz_cat_ayat: "Special Ayats",
    hifiz_cat_surahs: "Surahs",
    hifiz_cat_duas: "Duas",
    hifiz_cat_juz30: "Juz 30 (Amme)",
    hifiz_status_not_started: "Not Started",
    hifiz_status_in_progress: "In Progress",
    hifiz_status_memorized: "Memorized",
    hifiz_search_placeholder: "Search surah or dua...",
  },
};

export function applyI18n(
  lang: Language,
  todoInput: HTMLInputElement,
  _langToggleBtn: HTMLButtonElement,
): void {
  const elementsWithText = document.querySelectorAll("[data-i18n]");
  elementsWithText.forEach((el) => {
    const key = el.getAttribute(
      "data-i18n",
    ) as keyof (typeof translations)["tr"];
    if (translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });

  const elementsWithPlaceholder = document.querySelectorAll(
    "[data-i18n-placeholder]",
  );
  elementsWithPlaceholder.forEach((el) => {
    const key = el.getAttribute(
      "data-i18n-placeholder",
    ) as keyof (typeof translations)["tr"];
    if (translations[lang][key]) {
      (el as HTMLInputElement).placeholder = translations[lang][key];
    }
  });

  todoInput.placeholder = translations[lang].todo_placeholder;
}
