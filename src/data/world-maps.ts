import type { ImageSourcePropType } from 'react-native';

// 區域內部地圖。圖片檔名規則：assets/images/worlds/map-1.png、map-2.png ……
// 地圖圖片只放場景；關卡圓盤、關卡編號、星星、設定與返回按鈕都由程式繪製。
// 關卡點的位置單位是「地圖圖片的像素」（以 1672 × 941 量出），
// 程式會依螢幕大小自動換算。每個區域的關卡位置不同，各自設定在這裡。

export type WorldMapDef = {
  image: ImageSourcePropType;
  nodes: { level: number; x: number; y: number }[]; // 關卡圓盤中心
};

export const worldMaps: Record<string, WorldMapDef> = {
  '01': {
    image: require('../../assets/images/worlds/map-1.png'),
    nodes: [
      { level: 1, x: 190, y: 492 },
      { level: 2, x: 453, y: 428 },
      { level: 3, x: 643, y: 312 },
      { level: 4, x: 862, y: 337 },
      { level: 5, x: 1093, y: 357 },
      { level: 6, x: 1345, y: 342 },
      { level: 7, x: 1460, y: 476 },
      { level: 8, x: 1437, y: 659 },
      { level: 9, x: 1140, y: 676 },
      { level: 10, x: 858, y: 720 },
      { level: 11, x: 608, y: 766 },
      { level: 12, x: 311, y: 748 },
    ],
  },
};
