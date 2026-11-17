import { readItem, writeItem } from './local-store';

// 使用者設定與「只顯示一次」的提示旗標。畫面程式一律透過這個模組讀寫。

// ---------- 語音說明（預設開啟） ----------
const VOICE_KEY = 'voiceEnabled';
let voiceCache: boolean | null = null;

export async function loadVoiceEnabled(): Promise<boolean> {
  if (voiceCache === null) {
    const saved = await readItem(VOICE_KEY);
    voiceCache = saved === null ? true : saved === '1';
  }
  return voiceCache;
}

export async function saveVoiceEnabled(on: boolean): Promise<void> {
  voiceCache = on;
  await writeItem(VOICE_KEY, on ? '1' : '0');
}

// ---------- 第一次進入第 1 關時，自動顯示玩法說明 ----------
const HOWTO_KEY = 'howToSeen';

export async function hasSeenHowTo(): Promise<boolean> {
  return (await readItem(HOWTO_KEY)) === '1';
}

export async function markHowToSeen(): Promise<void> {
  await writeItem(HOWTO_KEY, '1');
}

// 測試用：讓玩法說明在下次進入第 1 關時再顯示一次
export async function resetHowToSeen(): Promise<void> {
  await writeItem(HOWTO_KEY, '0');
}

// ---------- 音效與背景音樂（預設開啟） ----------
const SFX_KEY = 'sfxEnabled';
const MUSIC_KEY = 'musicEnabled';
let sfxCache: boolean | null = null;
let musicCache: boolean | null = null;

export async function loadSfxEnabled(): Promise<boolean> {
  if (sfxCache === null) {
    const saved = await readItem(SFX_KEY);
    sfxCache = saved === null ? true : saved === '1';
  }
  return sfxCache;
}

export async function saveSfxEnabled(on: boolean): Promise<void> {
  sfxCache = on;
  await writeItem(SFX_KEY, on ? '1' : '0');
}

export async function loadMusicEnabled(): Promise<boolean> {
  if (musicCache === null) {
    const saved = await readItem(MUSIC_KEY);
    musicCache = saved === null ? true : saved === '1';
  }
  return musicCache;
}

export async function saveMusicEnabled(on: boolean): Promise<void> {
  musicCache = on;
  await writeItem(MUSIC_KEY, on ? '1' : '0');
}
