// 關卡音樂的曲目（最多 4 首）。檔案放在 assets/audio/，檔名 bgm-level-1.mp3 ~ bgm-level-4.mp3。
// 第 1 首預設開放；其餘曲目在解鎖到指定區域後才能選擇。要更換解鎖條件，只需要改 unlockWorld。
export type LevelTrack = {
  id: 1 | 2 | 3 | 4;
  unlockWorld: number; // 需要解鎖到第幾區（含）才能使用這首音樂
};

export const LEVEL_TRACKS: LevelTrack[] = [
  { id: 1, unlockWorld: 1 },
  { id: 2, unlockWorld: 2 },
  { id: 3, unlockWorld: 3 },
  { id: 4, unlockWorld: 4 },
];

export function isTrackUnlocked(id: number, unlockedWorldCount: number): boolean {
  const track = LEVEL_TRACKS.find((t) => t.id === id);
  return !!track && unlockedWorldCount >= track.unlockWorld;
}
