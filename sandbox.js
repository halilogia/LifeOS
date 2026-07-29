const mimeMap = {
  js: 'text/javascript;charset=utf-8',
  mjs: 'text/javascript;charset=utf-8',
  css: 'text/css;charset=utf-8',
  html: 'text/html;charset=utf-8',
  htm: 'text/html;charset=utf-8',
  json: 'application/json;charset=utf-8',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml;charset=utf-8',
  woff: 'font/woff',
  woff2: 'font/woff2',
  ttf: 'font/ttf',
  otf: 'font/otf',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  mp4: 'video/mp4',
};

function getMime(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  return mimeMap[ext] || 'application/octet-stream';
}

const activeBlobUrls = [];

function revokeOldBlobs() {
  while (activeBlobUrls.length > 0) {
    const url = activeBlobUrls.pop();
    try { URL.revokeObjectURL(url); } catch (e) {}
  }
}

function joinPath(base, rel) {
  let cleanRel = rel.split('?')[0].split('#')[0];
  if (cleanRel.startsWith('/')) { cleanRel = cleanRel.slice(1); }
  const stack = base ? base.split('/').filter(Boolean) : [];
  for (const part of cleanRel.split('/')) {
    if (!part || part === '.') { continue; }
    if (part === '..') { stack.pop(); }
    else { stack.push(part); }
  }
  return stack.join('/');
}

function rewriteHTML(html, urlMap) {
  const tagRegex = /<(link|script|img|source|video|audio)\b([^>]*)>/gi;
  return html.replace(tagRegex, function (match, tag, attrs) {
    const attrRegex = /\b([a-zA-Z\-:]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
    let newAttrs = attrs.replace(attrRegex, function (m, name, v1, v2) {
      const val = v1 !== undefined ? v1 : v2;
      const lower = name.toLowerCase();
      if ((lower === 'src' || lower === 'href' || lower === 'poster') && val && !/^(https?:|data:|blob:|javascript:|#)/i.test(val)) {
        const clean = joinPath('', val);
        const resolved = urlMap.get(clean) || urlMap.get(val);
        if (resolved) {
          return `${name}="${resolved}"`;
        }
      }
      return m;
    });
    return `<${tag}${newAttrs}>`;
  });
}

window.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'LOAD_GAME_PACKAGE' && event.data.pkg) {
    revokeOldBlobs();
    const pkg = event.data.pkg;
    const urlMap = new Map();

    if (pkg.files) {
      Object.keys(pkg.files).forEach(function (relPath) {
        const buffer = pkg.files[relPath];
        const mime = getMime(relPath);
        const blob = new Blob([buffer], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        activeBlobUrls.push(blobUrl);
        urlMap.set(relPath, blobUrl);
        if (relPath.startsWith('./')) {
          urlMap.set(relPath.slice(2), blobUrl);
        }
      });
    }

    let rewritten = rewriteHTML(pkg.html, urlMap);
    rewritten = rewritten.replace(/<meta\s+[^>]*http-equiv\s*=\s*["']?refresh["']?[^>]*>/gi, '');
    rewritten = rewritten.replace(/<meta\s+[^>]*http-equiv\s*=\s*["']?(x-frame-options|content-security-policy)["']?[^>]*>/gi, '');

    const mainBlob = new Blob([rewritten], { type: 'text/html;charset=utf-8' });
    const mainUrl = URL.createObjectURL(mainBlob);
    activeBlobUrls.push(mainUrl);

    let frame = document.getElementById('game-runner-frame');
    if (!frame) {
      frame = document.createElement('iframe');
      frame.id = 'game-runner-frame';
      frame.style.width = '100%';
      frame.style.height = '100%';
      frame.style.border = 'none';
      frame.style.display = 'block';
      frame.setAttribute('sandbox', 'allow-scripts allow-forms allow-popups allow-modals allow-same-origin');
      document.body.appendChild(frame);
    }
    frame.src = mainUrl;
  }
});
