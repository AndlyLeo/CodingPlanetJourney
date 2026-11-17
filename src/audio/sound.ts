import { requireOptionalNativeModule } from 'expo-modules-core';

import {
  loadLevelTrack,
  loadMusicEnabled,
  loadSfxEnabled,
  saveLevelTrack,
  saveMusicEnabled,
  saveSfxEnabled,
} from '../storage/settings-storage';

// 音效與背景音樂。使用 expo-audio。
//
// 音檔放在 assets/audio/（檔名見下方 sfxSource、musicSource）。
// - 還沒有放某個音檔：那個聲音會安靜地略過，不會出錯。
// - 目前安裝的 APK 還沒有 expo-audio 原生模組：整個音訊功能略過（重新建置後就會有）。

export type SfxName =
  | 'tap' // 點按鈕
  | 'drop' // 把方塊放進格子
  | 'gem' // 收集寶石
  | 'bump' // 撞到石頭或邊界
  | 'win' // 過關
  | 'fail'; // 失敗

// 背景音樂：welcome = 歡迎畫面（固定）；level = 關卡（曲目可在設定中選擇）。
// 其他畫面（選擇外觀、區域選擇、區域地圖、設定）不指定音樂，會繼續播放前一個畫面的音樂。
export type MusicName = 'welcome' | 'level';

const SFX_VOLUME = 0.8;
const MUSIC_VOLUME = 0.3; // 背景音樂音量（比音效小，不蓋過語音）
const MUSIC_DUCK_VOLUME = 0.1; // 語音說話時，背景音樂降到這個音量

type Player = {
  play: () => void;
  pause: () => void;
  seekTo: (seconds: number) => unknown;
  volume: number;
  loop: boolean;
  remove?: () => void;
};
type AudioLib = {
  createAudioPlayer: (source: unknown) => Player;
  setAudioModeAsync?: (mode: Record<string, unknown>) => Promise<void>;
};

let lib: AudioLib | null | undefined;
let warned = false;

function getLib(): AudioLib | null {
  if (lib !== undefined) return lib;
  try {
    // 先確認原生模組存在，不存在時直接略過，不去載入 expo-audio
    lib = requireOptionalNativeModule('ExpoAudio') ? (require('expo-audio') as AudioLib) : null;
  } catch {
    lib = null;
  }
  if (!lib && __DEV__ && !warned) {
    warned = true;
    console.warn('找不到音訊原生模組（expo-audio）：音效與音樂暫時沒有聲音，重新建置並安裝新版 APK 後就會有。');
  }
  return lib;
}

// ---------- 音檔（檔案不存在時回傳 null） ----------
function sfxSource(name: SfxName): unknown {
  try {
    switch (name) {
      case 'tap':
        return require('../../assets/audio/sfx-tap.mp3');
      case 'drop':
        return require('../../assets/audio/sfx-drop.mp3');
      case 'gem':
        return require('../../assets/audio/sfx-gem.mp3');
      case 'bump':
        return require('../../assets/audio/sfx-bump.mp3');
      case 'win':
        return require('../../assets/audio/sfx-win.mp3');
      case 'fail':
        return require('../../assets/audio/sfx-fail.mp3');
    }
  } catch {
    return null;
  }
  return null;
}

function levelSource(track: number): unknown {
  try {
    switch (track) {
      case 1:
        return require('../../assets/audio/bgm-level-1.mp3');
      case 2:
        return require('../../assets/audio/bgm-level-2.mp3');
      case 3:
        return require('../../assets/audio/bgm-level-3.mp3');
      case 4:
        return require('../../assets/audio/bgm-level-4.mp3');
    }
  } catch {
    return null;
  }
  return null;
}

function musicSource(name: MusicName, track: number): unknown {
  if (name === 'level') return levelSource(track) ?? levelSource(1); // 選的曲目檔案不存在時，改用第 1 首
  try {
    return require('../../assets/audio/bgm-welcome.mp3');
  } catch {
    return null;
  }
}

// ---------- 狀態 ----------
let sfxOn = true;
let musicOn = true;
let ducked = false;
let wantedMusic: MusicName | null = null; // 目前畫面希望播放的音樂
let currentKey: string | null = null; // 實際正在播放的音樂（含曲目編號）
let levelTrack = 1; // 目前選擇的關卡音樂曲目
let musicPlayer: Player | null = null;
const sfxPlayers = new Map<SfxName, Player | null>();

// APP 啟動時呼叫一次：讀取設定、設定音訊模式
export async function initAudio(): Promise<void> {
  try {
    const [sfx, music, track] = await Promise.all([loadSfxEnabled(), loadMusicEnabled(), loadLevelTrack()]);
    sfxOn = sfx;
    musicOn = music;
    levelTrack = track;
    await getLib()?.setAudioModeAsync?.({ playsInSilentMode: true });
  } catch {
    // 略過
  }
}

// ---------- 音效 ----------
export function playSfx(name: SfxName): void {
  if (!sfxOn) return;
  const audio = getLib();
  if (!audio) return;
  try {
    let player = sfxPlayers.get(name);
    if (player === undefined) {
      const source = sfxSource(name);
      player = source ? audio.createAudioPlayer(source) : null;
      if (player) player.volume = SFX_VOLUME;
      sfxPlayers.set(name, player);
    }
    if (!player) return;
    player.seekTo(0); // expo-audio 播完不會自動回到開頭
    player.play();
  } catch {
    // 播放失敗時略過
  }
}

// ---------- 背景音樂 ----------
function stopMusicPlayer(): void {
  try {
    musicPlayer?.pause();
    musicPlayer?.remove?.();
  } catch {
    // 略過
  }
  musicPlayer = null;
  currentKey = null;
}

// 切換背景音樂；傳入 null 代表停止。同一首音樂已在播放時不會重頭開始。
export function playMusic(name: MusicName | null): void {
  wantedMusic = name;
  if (!musicOn) return;
  if (name === null) {
    stopMusicPlayer();
    return;
  }
  const key = name === 'level' ? `level-${levelTrack}` : name;
  if (key === currentKey && musicPlayer) return;
  const audio = getLib();
  if (!audio) return;
  stopMusicPlayer();
  try {
    const source = musicSource(name, levelTrack);
    if (!source) return;
    const player = audio.createAudioPlayer(source);
    player.loop = true;
    player.volume = ducked ? MUSIC_DUCK_VOLUME : MUSIC_VOLUME;
    player.play();
    musicPlayer = player;
    currentKey = key;
  } catch {
    // 略過
  }
}

// 語音說話時把背景音樂壓低，說完再恢復
export function duckMusic(on: boolean): void {
  ducked = on;
  try {
    if (musicPlayer) musicPlayer.volume = on ? MUSIC_DUCK_VOLUME : MUSIC_VOLUME;
  } catch {
    // 略過
  }
}

// ---------- 設定 ----------
export async function setSfxEnabled(on: boolean): Promise<void> {
  sfxOn = on;
  await saveSfxEnabled(on);
}

export async function setMusicEnabled(on: boolean): Promise<void> {
  musicOn = on;
  await saveMusicEnabled(on);
  if (on) {
    currentKey = null;
    playMusic(wantedMusic);
  } else {
    stopMusicPlayer();
  }
}

// ---------- 關卡音樂曲目 ----------
export function getLevelTrack(): number {
  return levelTrack;
}

// 選擇關卡音樂曲目，並立刻播放該曲目試聽。
// 試聽的音樂會一直播放到下一個有指定音樂的畫面（歡迎畫面或關卡）為止。
export async function setLevelTrack(track: number): Promise<void> {
  levelTrack = track;
  await saveLevelTrack(track);
  playMusic('level');
}
