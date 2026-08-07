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
      // 1. KRİTİK & GÜVENLİK (error) — MV3 Uyumlu & Runtime Koruması
      // ============================================================
      // Strict equality: == yerine === (type coercion hatası önler)
      'eqeqeq': ['error', 'always'],
      // Blok süslü parantez zorunlu (dangling else önler)
      'curly': ['error', 'all'],
      // var yasak (hoisting karışıklığı önler)
      'no-var': 'error',
      // Değişmez değerler const olmalı
      'prefer-const': 'error',
      // Switch'te fallthrough yasak (case atlama hatası)
      'no-fallthrough': 'error',
      // Blok içinde fonksiyon/değişken bildirimi yasak
      'no-inner-declarations': 'error',
      // Object.prototype metotlarını doğrudan çağırma yasak (XSS / prototype pollution)
      'no-prototype-builtins': 'error',
      // Sınırsız döngü koşulu yasak
      'no-constant-condition': 'error',
      // Ulaşılamaz ölü kod yasak
      'no-unreachable': 'error',
      // Gereksiz boolean dönüşüm yasak
      'no-extra-boolean-cast': 'error',
      // switch-case çift tanım yasak
      'no-dupe-else-if': 'error',
      // Manifest V3 Güvenlik: eval() ve implied eval yasak
      'no-eval': 'error',
      'no-implied-eval': 'error',
      // Async promise executor fonksiyonu yasak (hata yutma engeller)
      'no-async-promise-executor': 'error',

      // ============================================================
      // 2. TİP GÜVENLİĞİ & TYPESCRIPT (error)
      // ============================================================
      // Sıfır 'any' kuralı (AGENTS.md Rule 2.10)
      '@typescript-eslint/no-explicit-any': 'error',
      // Kullanılmayan değişken/import uyarısı (_ ile başlayanlar hariç)
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { 'argsIgnorePattern': '^_', 'varsIgnorePattern': '^_' },
      ],

      // ============================================================
      // 3. KOD KALİTESİ & BAKIMLIK (warn)
      // ============================================================
      // Türkçe literal: i18n sistemi zorunlu (UI kalitesi)
      'local/no-turkish-literals': 'warn',
      // Dosya boyutu uyarısı (>600 satır God File uyarısı — AGENTS.md Rule 6.1)
      'max-lines': ['warn', { 'max': 600, 'skipBlankLines': true, 'skipComments': true }],
      // Parametre sayısı uyarısı (>5 parametre)
      'max-params': ['warn', { 'max': 5 }],
      // await kullanılmayan async fonksiyon uyarısı
      'require-await': 'warn',
      // Gereksiz return await uyarısı
      'no-return-await': 'warn',
      // Console log serbest (logger utility kullanılıyor)
      'no-console': 'off',

      // ============================================================
      // 4. STİL & FORMATLAMA (off — Prettier yönetsin)
      // ============================================================
      'quotes': 'off',
      'semi': 'off',
      'indent': 'off',
    },
  },
  {
    ignores: ['node_modules/', 'dist/', 'build/', 'out/', '*.js', '*.config.js'],
  }
);