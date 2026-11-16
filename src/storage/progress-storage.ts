import { LEVELS_PER_WORLD, WORLD_COUNT } from '../data/worlds';
import { readItem, writeItem } from './local-store';

// 區域與關卡進度的本機保存。畫面程式一律透過這個模組讀寫。

// ---------- 區域解鎖 ----------
const WORLD_KEY = 'unlockedWorldCount';

function clampCount(n: number): number {
  if (!Number.isFinite(n)) return 1;
  return Math.min(WORLD_COUNT, Math.max(1, Math.floor(n)));
}

export async function loadUnlockedWorldCount(): Promise<number> {
  const saved = await readItem(WORLD_KEY);
  return saved === null ? 1 : clampCount(Number(saved));
}

export async function saveUnlockedWorldCount(count: number): Promise<number> {
  const value = clampCount(count);
  await writeItem(WORLD_KEY, String(value));
  return value;
}

// 測試用：直接解鎖下一區
export async function unlockNextWorld(): Promise<number> {
  return saveUnlockedWorldCount((await loadUnlockedWorldCount()) + 1);
}

// ---------- 關卡星星 ----------
// 格式：{ "01": [3, 2, 0, ...] }，每個區域 12 個數字（0 = 尚未完成，1 ~ 3 = 最佳星數）。
const LEVEL_KEY = 'levelStars';
type LevelMap = Record<string, number[]>;

function normalize(list: unknown): number[] {
  const out: number[] = Array(LEVELS_PER_WORLD).fill(0);
  if (Array.isArray(list)) {
    list.slice(0, LEVELS_PER_WORLD).forEach((v, i) => {
      if (Number.isFinite(v)) out[i] = Math.min(3, Math.max(0, Math.floor(v)));
    });
  }
  return out;
}

async function readLevelMap(): Promise<LevelMap> {
  try {
    const parsed = JSON.parse((await readItem(LEVEL_KEY)) ?? '{}');
    return parsed && typeof parsed === 'object' ? (parsed as LevelMap) : {};
  } catch {
    return {};
  }
}

export async function loadLevelStars(worldId: string): Promise<number[]> {
  return normalize((await readLevelMap())[worldId]);
}

// 各區已收集的星星總數（陣列長度 = 區域數量）
export async function loadWorldStars(): Promise<number[]> {
  const map = await readLevelMap();
  return Array.from({ length: WORLD_COUNT }, (_, i) => {
    const id = String(i + 1).padStart(2, '0');
    return normalize(map[id]).reduce((a, b) => a + b, 0);
  });
}

// 關卡完成後呼叫（第二階段的關卡畫面會用到）。只保留最佳星數；
// 整個區域 12 關都完成後，自動解鎖下一區。
export async function recordLevelResult(worldId: string, level: number, stars: number): Promise<number[]> {
  const map = await readLevelMap();
  const list = normalize(map[worldId]);
  const i = level - 1;
  if (i >= 0 && i < LEVELS_PER_WORLD) list[i] = Math.max(list[i], Math.min(3, Math.max(1, Math.floor(stars))));
  map[worldId] = list;
  await writeItem(LEVEL_KEY, JSON.stringify(map));

  if (list.every((s) => s >= 1)) {
    const next = Number(worldId) + 1; // 需要的解鎖數量 = 下一區的編號
    if ((await loadUnlockedWorldCount()) < next) await saveUnlockedWorldCount(next);
  }
  return list;
}

// 測試用：把這個區域第一個還沒完成的關卡記為 3 顆星
export async function completeNextLevel(worldId: string): Promise<number[]> {
  const list = await loadLevelStars(worldId);
  const i = list.findIndex((s) => s < 1);
  return i === -1 ? list : recordLevelResult(worldId, i + 1, 3);
}

// 測試用：清除所有關卡進度並回到只解鎖第 1 區
export async function resetWorldProgress(): Promise<number> {
  await writeItem(LEVEL_KEY, '{}');
  return saveUnlockedWorldCount(1);
}
