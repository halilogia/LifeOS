/**
 * preload.js
 * Electron contextBridge — Chrome Extension API mock'u.
 * Sadece KPSS Not Stüdyosu'nun ihtiyaç duyduğu API'ler mock'lanır:
 *   - chrome.storage.sync / local  → localStorage tabanlı kalıcı depo
 *   - chrome.runtime.*             → minimal no-op / getURL
 *   - chrome.i18n                  → no-op
 * Not: Veriler localStorage'da JSON olarak tutulur — uygulama kapanınca kaybolmaz.
 */

const { contextBridge, ipcRenderer } = require("electron");

// ---------- Storage namespace ----------
function makeStorageArea(areaName) {
  const PREFIX = `mindvault_${areaName}_`;
  return {
    get(keys, cb) {
      try {
        const result = {};
        if (typeof keys === "string") {
          keys = [keys];
        }
        if (Array.isArray(keys)) {
          keys.forEach((k) => {
            const raw = localStorage.getItem(PREFIX + k);
            if (raw !== null) {
              try {
                result[k] = JSON.parse(raw);
              } catch {
                result[k] = raw;
              }
            }
          });
        } else if (keys && typeof keys === "object") {
          Object.keys(keys).forEach((k) => {
            const raw = localStorage.getItem(PREFIX + k);
            if (raw !== null) {
              try {
                result[k] = JSON.parse(raw);
              } catch {
                result[k] = raw;
              }
            } else {
              result[k] = keys[k];
            }
          });
        } else {
          // keys undefined/null → tümü
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(PREFIX)) {
              const bare = key.slice(PREFIX.length);
              const raw = localStorage.getItem(key);
              try {
                result[bare] = JSON.parse(raw);
              } catch {
                result[bare] = raw;
              }
            }
          }
        }
        cb(result);
      } catch (err) {
        cb({});
      }
    },
    set(items, cb) {
      try {
        Object.keys(items).forEach((k) => {
          localStorage.setItem(PREFIX + k, JSON.stringify(items[k]));
        });
        if (cb) cb();
      } catch (err) {
        if (cb) cb();
      }
    },
    remove(keys, cb) {
      try {
        (Array.isArray(keys) ? keys : [keys]).forEach((k) =>
          localStorage.removeItem(PREFIX + k),
        );
        if (cb) cb();
      } catch (err) {
        if (cb) cb();
      }
    },
    clear(cb) {
      try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && key.startsWith(PREFIX)) {
            localStorage.removeItem(key);
          }
        }
        if (cb) cb();
      } catch (err) {
        if (cb) cb();
      }
    },
  };
}

// ---------- Runtime namespace ----------
const runtime = {
  getURL(path) {
    return path;
  },
  getManifest() {
    return { name: "MindVault", version: "1.0.0" };
  },
  sendMessage(_msg, cb) {
    if (cb) cb({ ok: true });
  },
  onMessage: {
    addListener() {},
    removeListener() {},
  },
  onStartup: {
    addListener() {},
  },
  lastError: null,
};

// ---------- Diğer no-op namespace'ler ----------
const noopNamespace = () =>
  new Proxy(
    {},
    {
      get() {
        return noopNamespace;
      },
      apply() {
        return undefined;
      },
    },
  );

const chromeMock = {
  storage: {
    sync: makeStorageArea("sync"),
    local: makeStorageArea("local"),
    onChanged: { addListener() {}, removeListener() {} },
  },
  runtime,
  i18n: {
    getMessage: (key) => key,
    getUILanguage: () => "tr",
  },
  tabs: noopNamespace(),
  windows: noopNamespace(),
  alarms: noopNamespace(),
  notifications: noopNamespace(),
  downloads: noopNamespace(),
  scripting: noopNamespace(),
  sidePanel: noopNamespace(),
  contextMenus: noopNamespace(),
  commands: noopNamespace(),
  identity: noopNamespace(),
  idle: noopNamespace(),
  offscreen: noopNamespace(),
  tabGroups: noopNamespace(),
  fileSystem: noopNamespace(),
};

contextBridge.exposeInMainWorld("chrome", chromeMock);
