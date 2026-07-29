#!/bin/bash
# detect_i18n_issues.sh
# Bu script, projedeki i18n'e taşınması gereken Türkçe metinleri tespit eder.
# Kullanım: bash scripts/detect_i18n_issues.sh

echo "============================================"
echo "  i18n DÖNÜŞÜMÜ GEREKTİREN YERLER RAPORU"
echo "============================================"
echo ""

SRC_DIR="src"

# 1. lang === "tr" ? "..." : "..." kalıpları (inline ternary'ler)
echo "------------------------------------------------------"
echo "1. lang === 'tr' TERNARY'LERİ (inline çeviriler)"
echo "   Örnek: lang === 'tr' ? 'Türkçe' : 'English'"
echo "------------------------------------------------------"
echo ""

grep -rn "lang === \"tr\" ?" "$SRC_DIR" --include="*.tsx" --include="*.ts" \
  | grep -v "node_modules" \
  | grep -v "translations" \
  | while IFS= read -r line; do
    file=$(echo "$line" | cut -d: -f1)
    linenum=$(echo "$line" | cut -d: -f2)
    # Extract the Turkish part
    tr_part=$(echo "$line" | grep -oP '(?<=\? ")[^"]+')
    en_part=$(echo "$line" | grep -oP '(?<=: ")[^"]+(?="\))')
    echo "  📄 $file:$linenum"
    echo "     🇹🇷 TR: $tr_part"
    echo "     🇬🇧 EN: $en_part"
    echo ""
done

echo ""
echo "------------------------------------------------------"
echo "2. Hardcoded TÜRKÇE STRING'LER (Türkçe karakter içeren)"
echo "   .tsx/.ts dosyalarındaki Türkçe metin sabitleri"
echo "------------------------------------------------------"
echo ""

grep -rn "ğ\|ü\|ş\|ı\|ö\|ç\|Ğ\|Ü\|Ş\|İ\|Ö\|Ç" "$SRC_DIR" \
  --include="*.tsx" --include="*.ts" \
  | grep -v "node_modules" \
  | grep -v "translations" \
  | grep -v "JSDoc\|@param\|@returns\|@example\|@see" \
  | grep -v "^\s*\*" \
  | while IFS= read -r line; do
    file=$(echo "$line" | cut -d: -f1)
    linenum=$(echo "$line" | cut -d: -f2)
    content=$(echo "$line" | cut -d: -f3-)
    echo "  📄 $file:$linenum"
    echo "     ➡️  $content"
    echo ""
done

echo ""
echo "------------------------------------------------------"
echo "3. DOSYA LİSTESİ (özet)"
echo "------------------------------------------------------"
echo ""

echo "Ternary içeren dosyalar:"
grep -rln "lang === \"tr\" ?" "$SRC_DIR" --include="*.tsx" --include="*.ts" \
  | grep -v "node_modules" | grep -v "translations" \
  | while IFS= read -f; do echo "  - $file"; done

echo ""
echo "Türkçe karakter içeren dosyalar:"
grep -rln "ğ\|ü\|ş\|ı\|ö\|ç" "$SRC_DIR" --include="*.tsx" --include="*.ts" \
  | grep -v "node_modules" | grep -v "translations" \
  | while IFS= read -f; do echo "  - $file"; done

echo ""
echo "============================================"
echo "  RAPOR TAMAMLANDI"
echo "============================================"