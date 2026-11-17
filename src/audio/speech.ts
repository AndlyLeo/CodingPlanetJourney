import { requireOptionalNativeModule } from 'expo-modules-core';

import { strings } from '../i18n';
import {
  loadVoiceEnabled,
  loadVoiceId,
  loadVoiceStyle,
  saveVoiceId,
  saveVoiceStyle,
} from '../storage/settings-storage';
import { duckMusic } from './sound';

// 語音說明（文字轉語音，TTS）。
// 使用 expo-speech。如果目前安裝的 APK 還不包含這個原生模組（需要重新建置才會有），
// 這裡會先檢查，沒有就直接略過，不去載入 expo-speech，APP 不會出錯，只是沒有聲音。

type Voice = { identifier: string; name: string; language: string; quality?: string };

type SpeechModule = {
  speak: (
    text: string,
    options?: {
      language?: string;
      voice?: string;
      rate?: number;
      pitch?: number;
      onStart?: () => void;
      onDone?: () => void;
      onStopped?: () => void;
      onError?: (error: unknown) => void;
    },
  ) => void;
  stop: () => unknown;
  getAvailableVoicesAsync: () => Promise<Voice[]>;
};

// 語音風格：用音調與語速調出比較童趣的聲音（expo-speech 的音調範圍是 0.5 ~ 2.0）。
// 這是把系統語音的音調拉高，不是真正的卡通角色配音。
const VOICE_STYLES = [
  { pitch: 1.0, rate: 0.85 }, // 標準
  { pitch: 1.3, rate: 0.9 }, // 可愛
  { pitch: 1.6, rate: 0.95 }, // 卡通
  { pitch: 1.9, rate: 1.0 }, // 小精靈
];

let cached: SpeechModule | null | undefined;

function getSpeech(): SpeechModule | null {
  if (cached !== undefined) return cached;
  try {
    // 先確認原生模組存在；不存在時 requireOptionalNativeModule 會回傳 null，不會丟出錯誤
    cached = requireOptionalNativeModule('ExpoSpeech') ? (require('expo-speech') as SpeechModule) : null;
  } catch {
    cached = null;
  }
  return cached;
}

// ---------- 聲音清單 ----------
let voicesCache: Voice[] | null = null;

// 取得手機上符合目前語言（繁體中文）的語音，品質較好的排在前面
export async function listVoices(): Promise<Voice[]> {
  if (voicesCache) return voicesCache;
  const speech = getSpeech();
  if (!speech) return [];
  try {
    const all = await speech.getAvailableVoicesAsync();
    const [base, region] = strings.speechLanguage.toLowerCase().split('-');
    const bases = base === 'zh' ? ['zh', 'cmn'] : [base];
    voicesCache = all
      .filter((v) => {
        const lang = v.language.toLowerCase().replace('_', '-');
        return bases.some((b) => lang.startsWith(b)) && (!region || lang.endsWith(region));
      })
      .sort((a, b) => Number(b.quality === 'Enhanced') - Number(a.quality === 'Enhanced') || a.name.localeCompare(b.name));
  } catch {
    voicesCache = [];
  }
  return voicesCache;
}

// 實際使用的聲音：使用者選的；沒選（自動）時，如果有品質較好的就用它，否則交給系統預設
async function pickVoiceId(): Promise<string | undefined> {
  const voices = await listVoices();
  const chosen = await loadVoiceId();
  if (chosen && voices.some((v) => v.identifier === chosen)) return chosen;
  return voices.find((v) => v.quality === 'Enhanced')?.identifier;
}

// ---------- 唸出文字 ----------
// 會先停掉正在唸的內容；使用者在設定中關閉語音說明時不會唸。
export async function speak(text: string): Promise<void> {
  if (!text) return;
  if (!(await loadVoiceEnabled())) return;
  const speech = getSpeech();
  if (!speech) return;
  try {
    const voice = await pickVoiceId();
    const style = VOICE_STYLES[await loadVoiceStyle()] ?? VOICE_STYLES[1];
    speech.stop();
    // 說話時壓低背景音樂，說完（或被中斷）再恢復
    speech.speak(text, {
      language: strings.speechLanguage,
      ...(voice ? { voice } : {}),
      rate: style.rate,
      pitch: style.pitch,
      onStart: () => duckMusic(true),
      onDone: () => duckMusic(false),
      onStopped: () => duckMusic(false),
      onError: () => duckMusic(false),
    });
  } catch {
    // 語音引擎無法使用時略過
  }
}

export function stopSpeaking(): void {
  try {
    getSpeech()?.stop();
  } catch {
    // 略過
  }
}

// ---------- 設定頁：換聲音 ----------
async function labelFor(id: string): Promise<string> {
  if (!id) return strings.settings.voiceAuto;
  const voices = await listVoices();
  const index = voices.findIndex((v) => v.identifier === id);
  return index < 0 ? strings.settings.voiceAuto : `${index + 1}/${voices.length}`;
}

export async function currentVoiceLabel(): Promise<string> {
  return labelFor(await loadVoiceId());
}

// 依序切換：自動 → 第 1 個 → 第 2 個 …… → 回到自動，並用新的聲音唸一句話試聽
export async function cycleVoice(): Promise<string> {
  const voices = await listVoices();
  const current = await loadVoiceId();
  const ids = ['', ...voices.map((v) => v.identifier)];
  const next = ids[(Math.max(0, ids.indexOf(current)) + 1) % ids.length];
  await saveVoiceId(next);
  await speak(strings.settings.voiceSample);
  return labelFor(next);
}

// ---------- 設定頁：換音調風格 ----------
export async function currentVoiceStyleLabel(): Promise<string> {
  return strings.settings.voiceStyleNames[await loadVoiceStyle()] ?? strings.settings.voiceStyleNames[1];
}

// 依序切換：標準 → 可愛 → 卡通 → 小精靈 → 標準，並用新的風格唸一句話試聽
export async function cycleVoiceStyle(): Promise<string> {
  const next = ((await loadVoiceStyle()) + 1) % VOICE_STYLES.length;
  await saveVoiceStyle(next);
  await speak(strings.settings.voiceSample);
  return strings.settings.voiceStyleNames[next];
}
