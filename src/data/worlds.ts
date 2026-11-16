import type { ImageSourcePropType } from 'react-native';

export const WORLD_COUNT = 25;
export const LEVELS_PER_WORLD = 12;
export const STARS_PER_WORLD = LEVELS_PER_WORLD * 3; // 每區可收集 36 顆星

export type WorldDef = {
  id: string; // 兩位數字 '01' ~ '25'
  index: number; // 0 ~ 24，也是解鎖順序
  image?: ImageSourcePropType; // 區域圖片（直式，zone-N.png）；尚未提供的區域先留空
  cardColor: string; // 沒有圖片時使用的底色
};

const PALETTE = ['#7CCBF4', '#FF9DC8', '#FFC24A', '#B58CF0', '#8EE08A', '#5FD8E8', '#FF9F8A', '#B9E56A'];

// 區域圖片檔名規則：assets/images/worlds/zone-1.png、zone-2.png ……（流水號不補零）。
// 新增第 6 區以後，把檔案放進資料夾，再加上對應那一行即可。
const ZONE_IMAGES: Record<string, ImageSourcePropType | undefined> = {
  '01': require('../../assets/images/worlds/zone-1.png'),
  '02': require('../../assets/images/worlds/zone-2.png'),
  '03': require('../../assets/images/worlds/zone-3.png'),
  '04': require('../../assets/images/worlds/zone-4.png'),
  '05': require('../../assets/images/worlds/zone-5.png'),
};

export const worlds: WorldDef[] = Array.from({ length: WORLD_COUNT }, (_, index) => {
  const id = String(index + 1).padStart(2, '0');
  return { id, index, image: ZONE_IMAGES[id], cardColor: PALETTE[index % PALETTE.length] };
});

// 規則：第一區預設解鎖，完成前一區任務後解鎖下一區。
// unlockedCount 是目前已解鎖的區域數量（至少 1）。
export function isWorldUnlocked(index: number, unlockedCount: number): boolean {
  return index < unlockedCount;
}
