// 本機小型儲存。優先使用 AsyncStorage；如果目前安裝的 APK 不包含這個原生模組，
// 會自動改用記憶體暫存，APP 不會閃退，只是關閉後資料不會保留。

type Store = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
};

const memory = new Map<string, string>();

function getStore(): Store | null {
  try {
    const mod = require('@react-native-async-storage/async-storage');
    return (mod.default ?? mod) as Store;
  } catch {
    return null;
  }
}

export async function readItem(key: string): Promise<string | null> {
  try {
    const store = getStore();
    if (store) return await store.getItem(key);
  } catch {
    // 讀取失敗時使用記憶體值
  }
  return memory.get(key) ?? null;
}

export async function writeItem(key: string, value: string): Promise<void> {
  memory.set(key, value);
  try {
    const store = getStore();
    if (store) await store.setItem(key, value);
  } catch {
    // 寫入失敗時仍保留記憶體值
  }
}
