# Sidebar Otomatik Sıralama — Implementation Plan

## 1. Amaç

Sidebar item'ları **kullanım sıklığına göre otomatik sıralansın**. Varsayılan:
- 1. sıra: **free-games**
- 2. sıra: **ai-chat**
- Ayarlarda **"Otomatik Sıralama"** toggle'ı (varsayılan **açık**)
- Toggle **kapanırsa**: kullanıcının drag-drop ile belirlediği manuel sıralama korunur

## 2. Veri Modeli

```typescript
// chrome.storage.local — "sidebarUsage": { [viewKey]: visitCount }
interface SidebarUsageStats {
  [viewKey: string]: number;
}
```

Sıralama mantığı: `score = visitCount + recencyBonus`, son kullanılanlara küçük bonus.

## 3. Davranış Detayı

| Olay | Aksiyon |
|---|---|
| Kullanıcı view'a geçince (`handleViewChange`) | counter +1 (debounce 300ms, aynı view'a hızlı geçişlerde spam yok) |
| Auto-sort açıkken sıralama değişince | smooth reorder animasyonu + persistSidebarOrder |
| Kullanıcı drag-drop yaptığında | Auto-sort otomatik **kapatılır** + uyarı gösterilir |
| Auto-sort açıldığında | Mevcut istatistiklerle sıralama yeniden hesaplanır |
| Yeni kullanıcı / istatistik yok | Default sıraya (free-games, ai-chat ilk 2) döner |

## 4. Dosya Değişiklikleri

### [NEW] `src/presentation/store/sidebarUsageStore.ts`
Zustand singleton: usage stats + auto-sort toggle + reorder action.

### [MODIFY] `src/presentation/store/uiStore.ts`
- `handleViewChange`: usageStore.increment(viewKey) çağırır
- Eğer auto-sort açıksa: usageStore'dan smart order al → persistSidebarOrder uygula
- `loadSidebarOrder`: yeni default order'ı kullan (`free-games` ilk, `ai-chat` 2.)

### [MODIFY] `src/domain/constants/sidebarConstants.ts`
```typescript
export const DEFAULT_SIDEBAR_ORDER: string[] = [
  "free-games",   // 1.
  "ai-chat",      // 2.
  "list",
  "eisenhower",
  // ... mevcut sıra
];
```

### [MODIFY] `src/components/sidebar/Sidebar.tsx`
- Drag-drop sonrası: auto-sort toggle'ı otomatik kapat, "Otomatik sıralama kapatıldı — manuel sıralama aktif" snackbar göster
- Sıralama değiştiğinde smooth transition

### [MODIFY] `src/components/settings/AppSettingsGroup.tsx` veya yeni `SidebarSettingsTab.tsx`
Yeni toggle satırı: "Otomatik Sıralama (Kullanım Sıklığı)" + tooltip + sıfırla butonu.

### [MODIFY] `src/utils/translations/{tr,en}/settings.ts` (veya sidebar.ts)
`settings_sidebar_auto_sort`, `settings_sidebar_auto_sort_desc`, `settings_sidebar_reset_usage`

### [MODIFY] `src/ARCHITECTURE.md`
Sidebar satırına auto-sort bilgisi ekle.

## 5. Doğrulama
- tsc / eslint / build / findDeadFiles
- Manual: birkaç view'a tıkla → sidebar'da sıra değişiyor mu kontrol et

## 6. Açık Sorular

1. **Snackbar bildirim**: drag-drop'tan sonra auto-sort kapatıldığında toast mesajı gösterilsin mi ("Otomatik sıralama kapatıldı, manuel sıra aktif")?
2. **Sıfırlama butonu**: kullanım istatistiklerini sıfırla butonu ayarlara eklenmeli mi?
3. **Recency bonus**: son 24 saat içinde kullanılanlara ekstra +1 mi, yoksa sadece toplam sayım mı?
