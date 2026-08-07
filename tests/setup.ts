/**
 * Test setup — chrome.storage.local mock.
 * Extension API'lerini taklit eder; testlerde gerçek chrome olmadığı için.
 */

type StorageArea = {
  get: (keys: string | string[] | null, cb: (res: Record<string, unknown>) => void) => void;
  set: (items: Record<string, unknown>, cb?: () => void) => void;
  remove: (keys: string | string[], cb?: () => void) => void;
  clear: (cb?: () => void) => void;
};

function createStorageArea(): StorageArea {
  const store = new Map<string, unknown>();
  return {
    get(keys, cb) {
      const res: Record<string, unknown> = {};
      if (keys === null) {
        for (const [k, v] of store) res[k] = v;
      } else if (Array.isArray(keys)) {
        for (const k of keys) if (store.has(k)) res[k] = store.get(k);
      } else if (store.has(keys)) {
        res[keys] = store.get(keys);
      }
      cb(res);
    },
    set(items, cb) {
      for (const [k, v] of Object.entries(items)) store.set(k, v);
      cb?.();
    },
    remove(keys, cb) {
      const list = Array.isArray(keys) ? keys : [keys];
      for (const k of list) store.delete(k);
      cb?.();
    },
    clear(cb) {
      store.clear();
      cb?.();
    },
  };
}

(globalThis as Record<string, unknown>).chrome = {
  storage: {
    local: createStorageArea(),
  },
  identity: {
    getAuthToken: (_opts: { interactive: boolean }, cb: (token?: string) => void) =>
      cb("fake-token"),
  },
  runtime: {
    lastError: undefined,
  },
};
