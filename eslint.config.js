import js from '@eslint/js';
import ts from 'typescript-eslint';
import globals from 'globals';

// Custom rule: Türkçe karakter içeren string literal'leri uyar
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

    // Sadece .ts ve .tsx dosyalarını kontrol et
    if (allowedExtensions.some(ext => filename.endsWith(ext))) {
      return {};
    }
    // translations klasörünü atla (tr.ts, en.ts)
    if (filename.includes('translations')) {
      return {};
    }

    return {
      Literal(node) {
        if (typeof node.value === 'string' && turkishChars.test(node.value)) {
          // JSDoc yorumlarını atla
          const parent = node.parent;
          if (parent && parent.type === 'ExpressionStatement' && parent.expression === node) {
            return;
          }
          context.report({
            node,
            messageId: 'noTurkishLiteral',
          });
        }
      },
      TemplateLiteral(node) {
        if (node.quasis) {
          for (const quasi of node.quasis) {
            if (turkishChars.test(quasi.value.raw)) {
              context.report({
                node: quasi,
                messageId: 'noTurkishLiteral',
              });
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
        ...globals.webextensions,
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
      'local/no-turkish-literals': 'warn',
      'max-lines': ['error', { 'max': 1200, 'skipBlankLines': true, 'skipComments': true }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
      'no-console': 'off',
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'semi': ['error', 'always'],
      'quotes': 'off',
    },
  },
  {
    ignores: ['node_modules/', 'dist/', '*.js'],
  }
);