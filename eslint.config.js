// ============================================================
// EVRENSEL ESLINT CONFIG — tüm projelerde kullanılabilir
// Kopyala: eslint.config.js (ESM) — package.json'a ekle:
//   "type": "module" VEYA dosyayı eslint.config.mjs yap
// Bağımlılıklar:
//   npm i -D eslint @eslint/js typescript-eslint globals
// ============================================================
import js from '@eslint/js';
import ts from 'typescript-eslint';
import globals from 'globals';

// ------------------------------------------------------------------
// Özel kural: Türkçe karakter içeren string literal'leri uyar.
// UI metinleri i18n sisteminden (t.anahtar) alınmalıdır.
// Kullanmak istemezsen bu bloğu ve 'local/no-turkish-literals'
// satırını sil.
// ------------------------------------------------------------------
const noTurkishLiteralsRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Türkçe karakter (ğüşıöç) içeren string literal kullanımını engeller. Tüm UI metinleri i18n sisteminden (t.anahtar) alınmalıdır.',
    },
    messages: {
      noTurkishLiteral: 'UI metinlerinde doğrudan Türkçe karakter kullanma. i18n sistemini kullan (t.anahtar_adi).',
    },
  },
  create(context) {
    const turkishChars = /[ğüşıöçĞÜŞİÖÇ]/;
    const allowedExtensions = ['.css', '.json', '.md', '.html'];
    const filename = context.filename || context.getFilename();

    if (allowedExtensions.some(ext => filename.endsWith(ext))) {
      return {};
    }
    if (filename.includes('translations')) {
      return {};
    }

    return {
      Literal(node) {
        if (typeof node.value === 'string' && turkishChars.test(node.value)) {
          const parent = node.parent;
          if (parent && parent.type === 'ExpressionStatement' && parent.expression === node) {
            return;
          }
          context.report({ node, messageId: 'noTurkishLiteral' });
        }
      },
      TemplateLiteral(node) {
        if (node.quasis) {
          for (const quasi of node.quasis) {
            if (turkishChars.test(quasi.value.raw)) {
              context.report({ node: quasi, messageId: 'noTurkishLiteral' });
            }
          }
        }
      },
    };
  },
};

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        // Chrome Extension kullanmıyorsan bu satırı sil
        ...globals.webextensions,
        // Node.js projesi ise ekle:
        // ...globals.node,
      },
    },
    plugins: {
      'local': {
        rules: {
          'no-turkish-literals': noTurkishLiteralsRule,
        },
      },
    },
    rules: {
      // ============================================================
      // KRİTİK (error) — runtime hatası, güvenlik, davranış bozukluğu
      // Bunları kapatma; kod kırar veya güvenlik açığı bırakır.
      // ============================================================
      // Strict equality: == yerine === (type coercion hatası önler)
      'eqeqeq': ['error', 'always'],
      // Blok süslü parantez zorunlu (dangling else, yanlış kapsam)
      'curly': ['error', 'all'],
      // var yasak (hoisting karışıklığı)
      'no-var': 'error',
      // Değişmez değerler const olmalı (yanlışlıkla reassign önler)
      'prefer-const': 'error',
      // Switch'te fallthrough yasak (case atlama hatası)
      'no-fallthrough': 'error',
      // Blok içinde fonksiyon/değişken bildirimi yasak (hoisting)
      'no-inner-declarations': 'error',
      // Object.prototype metotlarını doğrudan çağırma yasak (prototype pollution XSS)
      'no-prototype-builtins': 'error',
      // Sınırsız döngü koşulu yasak (sonsuz döngü riski)
      'no-constant-condition': 'error',
      // Kullanılamaz erişim: continue/break/return sonrası kod
      'no-unreachable': 'error',
      // === Yeni kurallar (ihtiyaca göre ekle) ===
      // Gereksiz boolean dönüşüm yasak
      'no-extra-boolean-cast': 'error',
      // switch-case çift tanım yasak
      'no-dupe-else-if': 'error',
      // Fonksiyon parametre sayısı limiti (bakım kokusu — kritik değil)
      'max-params': ['warn', { 'max': 6 }],

      // ============================================================
      // ORTA (warn) — kod kokusu, temizlik. Davranışı kırmaz.
      // ============================================================
      // Türkçe literal: i18n zorunlu (UI kalitesi) — istemezsen sil
      'local/no-turkish-literals': 'warn',
      // Dosya boyutu: 1200 satır üstü uyar (bakım zorluğu)
      'max-lines': ['warn', { 'max': 1200, 'skipBlankLines': true, 'skipComments': true }],
      // any kullanımı: tip güvenliği zayıf
      '@typescript-eslint/no-explicit-any': 'error',
      // Kullanılmayan değişken/import: temizlik
      '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
      // console: content script'lerde gerekli — projene göre ayarla
      'no-console': 'off',
      // Noktalı virgül: stil tutarlılığı (prettier ile çakışmaz)
      'semi': ['warn', 'always'],
      // await kullanılmayan async: callback API kullanan projelerde
      // yanlış pozitif üretir — warning seviyesi güvenli
      'require-await': 'warn',
      // Gereksiz return-await: zararsız ama gereksiz
      'no-return-await': 'warn',
      // Tırnak stili serbest (prettier yönetsin)
      'quotes': 'off',
    },
  },
  {
    ignores: ['node_modules/', 'dist/', 'build/', 'out/', '*.js', '*.config.js'],
  }
);