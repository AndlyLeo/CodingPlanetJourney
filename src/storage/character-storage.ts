import { DEFAULT_CHARACTER_ID, isCharacterUnlocked } from '../data/characters';

// 角色選擇的本機保存。畫面程式不直接讀寫 AsyncStorage，一律透過這個模組。
// 如果目前安裝的 APK 不包含 AsyncStorage 原生模組，會自動改用記憶體暫存，
// APP 不會閃退，只是關閉後選擇不會保留。

const KEY = 'selectedCharacterId';
let memoryValue: string | null = null;

type Store = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
};

function getStore(): Store | null {
  try {
    const mod = require('@react-native-async-storage/async-storage');
    return (mod.default ?? mod) as Store;
  } catch {
    return null;
  }
}

export async function loadSelectedCharacterId(): Promise<string> {
  let saved: string | null = memoryValue;
  try {
    const store = getStore();
    if (store) saved = await store.getItem(KEY);
  } catch {
    // 讀取失敗時使用記憶體值或預設值
  }
  // 保存的角色必須存在且已解鎖，否則回到預設角色
  return saved && isCharacterUnlocked(saved) ? saved : DEFAULT_CHARACTER_ID;
}

export async function saveSelectedCharacterId(id: string): Promise<void> {
  memoryValue = id;
  try {
    const store = getStore();
    if (store) await store.setItem(KEY, id);
  } catch {
    // 寫入失敗時仍保留記憶體值
  }
}
