import { requireOptionalNativeModule } from 'expo-modules-core';

import {
  loadLevelTrack,
  loadMusicEnabled,
  loadSfxEnabled,
  saveLevelTrack,
  saveMusicEnabled,
  saveSfxEnabled,
} from '../storage/settings-storage';

export type SfxName = 'tap' | 'drop' | 'gem' | 'bump' | 'win' | 'fail';
export type MusicName = 'welcome' | 'level';

const SFX_VOLUME = 0.8;
const MUSIC_VOLUME = 0.3;
const MUSIC_DUCK_VOLUME = 0.1;

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

// ---------- 音檔路徑修正（指向同層的 src/audio/ 檔案） ----------
function sfxSource(name: SfxName): unknown {
  switch (name) {
    case 'tap':
      return require('./sfx-tap.mp3');
    case 'drop':
      return require('./sfx-drop.mp3');
    case 'gem':
      return require('./sfx-gem.mp3');
    case 'bump':
      return require('./sfx-bump.mp3');
    case 'win':
      return require('./sfx-win.mp3');
    case 'fail':
      return require('./sfx-fail.mp3');
  }
}

function levelSource(track: number): unknown {
  switch (track) {
    case 1:
      return require('./bgm-level-1.mp3');
    case 2:
      return require('./bgm-level-2.mp3');
    case 3:
      return require('./bgm-level-3.mp3');
    case 4:
      return require('./bgm-level-4.mp3');
  }
  return null;
}

function musicSource(name: MusicName, track: number): unknown {
  if (name === 'level') return levelSource(track) ?? levelSource(1);
  return require('./bgm-welcome.mp3');
}

// ---------- 狀態 ----------
let sfxOn = true;
let musicOn = true;
let ducked = false;
let wantedMusic: MusicName | null = null;
let currentKey: string | null = null;
let levelTrack = 1;
let musicPlayer: Player | null = null;
const sfxPlayers = new Map<SfxName, Player | null>();

export async function initAudio(): Promise<void> {
  try {
    const [sfx, music, track] = await Promise.all([loadSfxEnabled(), loadMusicEnabled(), loadLevelTrack()]);
    sfxOn = sfx;
    musicOn = music;
    levelTrack = track;
    await getLib()?.setAudioModeAsync?.({ playsInSilentMode: true });
  } catch (e) {
    console.warn('initAudio error:', e);
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
    player.seekTo(0);
    player.play();
  } catch (e) {
    console.warn(`playSfx error (${name}):`, e);
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
  } catch (e) {
    console.warn(`playMusic error (${name}):`, e);
  }
}

export function duckMusic(on: boolean): void {
  ducked = on;
  try {
    if (musicPlayer) musicPlayer.volume = on ? MUSIC_DUCK_VOLUME : MUSIC_VOLUME;
  } catch {
    // 略過
  }
}

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

export function getLevelTrack(): number {
  return levelTrack;
}

export async function setLevelTrack(track: number): Promise<void> {
  levelTrack = track;
  await saveLevelTrack(track);
  playMusic('level');
}