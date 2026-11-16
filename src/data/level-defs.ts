import type { LevelDef } from '../game/engine';
import { world01Levels } from './world-01-levels';

// 各區的關卡資料。新增第 2 區以後，在這裡加上對應的檔案即可。
const WORLD_LEVELS: Record<string, LevelDef[]> = {
  '01': world01Levels,
};

export function getLevelDef(worldId: string, level: number): LevelDef | undefined {
  return WORLD_LEVELS[worldId]?.find((l) => l.id === level);
}
