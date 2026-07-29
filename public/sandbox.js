var gameLoaded = false;

// ---------------------------------------------------------------------------
// Storage polyfills — Chrome sandbox.pages pages have null origin, so
// localStorage / sessionStorage throw SecurityError. We patch them with a
// lightweight in-memory implementation that satisfies the Web Storage API.
// Game saves won't persist between sessions, but the game will run correctly.
// ---------------------------------------------------------------------------
(function () {
  function makeStorage() {
    var data = Object.create(null);
    return {
      getItem:    function (k)    { return Object.prototype.hasOwnProperty.call(data, k) ? data[k] : null; },
      setItem:    function (k, v) { data[String(k)] = String(v); },
      removeItem: function (k)    { delete data[String(k)]; },
      clear:      function ()     { data = Object.create(null); },
      key:        function (i)    { return Object.keys(data)[i] || null; },
      get length()                { return Object.keys(data).length; }
    };
  }
  ['localStorage', 'sessionStorage'].forEach(function (name) {
    try {
      window[name].getItem('__probe__'); // triggers SecurityError in sandbox
    } catch (e) {
      console.warn('[sandbox] ' + name + ' unavailable (sandbox null-origin), using in-memory polyfill');
      Object.defineProperty(window, name, {
        get: (function () { var s = makeStorage(); return function () { return s; }; })(),
        configurable: true
      });
    }
  });
})();

var mimeMap = {
  js: 'text/javascript',
  mjs: 'text/javascript',
  css: 'text/css',
  html: 'text/html',
  htm: 'text/html',
  json: 'application/json',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  woff: 'font/woff',
  woff2: 'font/woff2',
  ttf: 'font/ttf',
  otf: 'font/otf',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  mp4: 'video/mp4'
};

function getMime(filename) {
  var ext = (filename.split('.').pop() || '').toLowerCase();
  return mimeMap[ext] || 'application/octet-stream';
}

function normalizePath(val) {
  var clean = val.split('?')[0].split('#')[0];
  if (clean.startsWith('./')) clean = clean.slice(2);
  if (clean.startsWith('/')) clean = clean.slice(1);
  return clean;
}

function isScriptFile(path) {
  var ext = (path.split('.').pop() || '').toLowerCase();
  return ext === 'js' || ext === 'mjs';
}

function handlePackage(pkg) {
  console.log('[sandbox] handlePackage called. files:', Object.keys(pkg.files || {}));

  var urlMap = {};
  var scriptTexts = {};

  if (pkg.files) {
    Object.keys(pkg.files).forEach(function (path) {
      var norm = normalizePath(path);
      if (isScriptFile(path)) {
        try {
          var text = new TextDecoder('utf-8').decode(new Uint8Array(pkg.files[path]));
          scriptTexts[norm] = text;
          console.log('[sandbox] Inlining script:', norm, '(' + text.length + ' chars)');
        } catch (e) {
          console.warn('[sandbox] Failed to decode script:', path, e);
        }
      } else {
        try {
          var mime = getMime(path);
          var blob = new Blob([pkg.files[path]], { type: mime });
          urlMap[norm] = URL.createObjectURL(blob);
          console.log('[sandbox] Blob URL for asset:', norm);
        } catch (e) {
          console.warn('[sandbox] Failed to create blob for:', path, e);
        }
      }
    });
  }

  var html = pkg.html;
  console.log('[sandbox] Original HTML length:', html.length);

  // 1. Strip external CDN <script src="https://..."> tags
  html = html.replace(/<script\b[^>]*\bsrc\s*=\s*["']https?:\/\/[^"']+["'][^>]*><\/script>/gi, '');
  html = html.replace(/<script\b[^>]*\bsrc\s*=\s*["']https?:\/\/[^"']+["'][^>]*\/?>/gi, '');

  // 2. Inline local JS files (blob: scripts are blocked by script-src CSP, inline is allowed via unsafe-inline)
  function inlineScript(m, pre, src, post) {
    if (/^(https?:|data:|blob:|javascript:|\/\/)/.test(src)) return m;
    var clean = normalizePath(src);
    var content = scriptTexts[clean];
    if (content === undefined) {
      console.warn('[sandbox] Script not found in package:', clean);
      return m;
    }
    var attrs = (pre + ' ' + post)
      .replace(/\s*\bsrc\s*=\s*["'][^"']*["']/gi, '')
      .replace(/\s*\bcrossorigin\b(?:\s*=\s*["'][^"']*["'])?/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    console.log('[sandbox] Inlined script tag:', clean);
    return '<script' + (attrs ? ' ' + attrs : '') + '>\n' + content + '\n</script>';
  }
  html = html.replace(/<script\b([^>]*)\bsrc\s*=\s*"([^"]+)"([^>]*)><\/script>/gi, inlineScript);
  html = html.replace(/<script\b([^>]*)\bsrc\s*=\s*'([^']+)'([^>]*)><\/script>/gi, inlineScript);

  // 3. Rewrite local non-script asset paths to blob: URLs
  function rewriteUrl(m, attr, val) {
    if (/^(https?:|data:|blob:|javascript:|#|\/\/)/.test(val)) return m;
    var clean = normalizePath(val);
    var resolved = urlMap[clean];
    if (resolved) console.log('[sandbox] Rewrote', attr, val, '->', resolved.substring(0, 40));
    return resolved ? attr + '="' + resolved + '"' : m;
  }
  html = html.replace(/\b(src|href|poster)\s*=\s*"([^"#][^"]*)"/g, rewriteUrl);
  html = html.replace(/\b(src|href|poster)\s*=\s*'([^'#][^']*)'/g, function (m, attr, val) {
    if (/^(https?:|data:|blob:|javascript:|#|\/\/)/.test(val)) return m;
    var clean = normalizePath(val);
    var resolved = urlMap[clean];
    return resolved ? attr + '="' + resolved + '"' : m;
  });

  // 4. Strip remaining crossorigin attrs
  html = html.replace(/(<(?:script|link)[^>]*)\s+crossorigin(?:\s*=\s*["'][^"']*["'])?/gi, '$1');

  // 5. Remove existing CSP / X-Frame-Options meta tags
  html = html.replace(/<meta[^>]*http-equiv\s*=\s*["']?(content-security-policy|x-frame-options)["']?[^>]*>/gi, '');

  console.log('[sandbox] Writing HTML (' + html.length + ' chars) to document...');

  // 6. Write game directly into this sandbox document
  document.open();
  document.write(html);
  document.close();

  console.log('[sandbox] document.write complete');
}

window.addEventListener('message', function (event) {
  if (gameLoaded) {
    console.log('[sandbox] Message received but game already loaded, ignoring.');
    return;
  }
  if (event.data && event.data.type === 'LOAD_GAME_PACKAGE' && event.data.pkg) {
    gameLoaded = true;
    console.log('[sandbox] LOAD_GAME_PACKAGE received');
    handlePackage(event.data.pkg);
  }
});

console.log('[sandbox] sandbox.js loaded, waiting for LOAD_GAME_PACKAGE message...');
