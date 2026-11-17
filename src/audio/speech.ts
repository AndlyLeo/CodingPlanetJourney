import { requireOptionalNativeModule } from 'expo-modules-core';

import { strings } from '../i18n';
import { duckMusic } from './sound';
import { loadVoiceEnabled } from '../storage/settings-storage';

// 語音說明（文字轉語音，TTS）。
// 使用 expo-speech。如果目前安裝的 APK 還不包含這個原生模組（需要重新建置才會有），
// 這裡會先檢查，沒有就直接略過，不去載入 expo-speech，APP 不會出錯，只是沒有聲音。

type SpeechModule = {
  speak: (
    text: string,
    options?: {
      language?: string;
      rate?: number;
      pitch?: number;
      onStart?: () => void;
      onDone?: () => void;
      onStopped?: () => void;
      onError?: (error: unknown) => void;
    },
  ) => void;
  stop: () => unknown;
};

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

// 唸出文字。會先停掉正在唸的內容；使用者在設定中關閉語音說明時不會唸。
export async function speak(text: string): Promise<void> {
  if (!text) return;
  if (!(await loadVoiceEnabled())) return;
  const speech = getSpeech();
  if (!speech) return;
  try {
    speech.stop();
    // 說話時壓低背景音樂，說完（或被中斷）再恢復
    speech.speak(text, {
      language: strings.speechLanguage,
      rate: 0.9,
      pitch: 1.05,
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
