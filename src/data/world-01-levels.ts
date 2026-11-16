import { type LevelDef, rep, slot, slots } from '../game/engine';

// 第 1 區「新手村」的 12 個關卡。
// 棋盤字元：. 地面　# 石頭　S 起點　F 旗子　G 寶石
// startDir：0 上、1 右、2 下、3 左。par 是過關所需的最少指令數（已用程式驗證過）。
export const world01Levels: LevelDef[] = [
  // 1 認識「前進」
  {
    id: 1, rows: 3, cols: 4,
    grid: ['.#..', 'S..F', '..#.'],
    startDir: 1, allowed: ['forward'], layout: slots(3), par: 3,
  },
  // 2 走長路
  {
    id: 2, rows: 3, cols: 6,
    grid: ['......', 'S....F', '..#...'],
    startDir: 1, allowed: ['forward'], layout: slots(6), par: 5,
  },
  // 3 右轉彎
  {
    id: 3, rows: 3, cols: 4,
    grid: ['S..#', '#..#', '#.F#'],
    startDir: 1, allowed: ['forward', 'right'], layout: slots(6), par: 5,
  },
  // 4 左轉右轉
  {
    id: 4, rows: 4, cols: 5,
    grid: ['###..', '###.F', '###..', 'S....'],
    startDir: 1, allowed: ['forward', 'left', 'right'], layout: slots(9), par: 7,
  },
  // 5 收集寶石
  {
    id: 5, rows: 4, cols: 5,
    grid: ['###F.', '###G.', '###..', 'S.G..'],
    startDir: 1, allowed: ['forward', 'left'], layout: slots(8), par: 7,
  },
  // 6 認識「重複」
  {
    id: 6, rows: 3, cols: 7,
    grid: ['..#....', 'S.....F', '....#..'],
    startDir: 1, allowed: ['forward'], layout: [rep(6, 1)], par: 1,
  },
  // 7 重複爬樓梯
  {
    id: 7, rows: 4, cols: 4,
    grid: ['S.##', '#..#', '##..', '###F'],
    startDir: 1, allowed: ['forward', 'left', 'right'], layout: [rep(3, 4)], par: 4,
  },
  // 8 找錯誤（第 7 個方塊應該是左轉）
  {
    id: 8, rows: 3, cols: 5,
    grid: ['S...#', '###.#', '....F'],
    startDir: 1, allowed: ['forward', 'left', 'right'],
    layout: [
      slot('forward'), slot('forward'), slot('forward'), slot('right'),
      slot('forward'), slot('forward'), slot('right'), slot('forward'),
    ],
    par: 8,
  },
  // 9 重複與寶石
  {
    id: 9, rows: 3, cols: 7,
    grid: ['..#....', 'S.G.G.F', '....#..'],
    startDir: 1, allowed: ['forward'], layout: [rep(3, 2)], par: 2,
  },
  // 10 繞池塘
  {
    id: 10, rows: 4, cols: 4,
    grid: ['....', 'G.G.', 'F#..', 'S.G.'],
    startDir: 1, allowed: ['forward', 'left', 'right'], layout: [rep(3, 3), slot()], par: 4,
  },
  // 11 自由組合
  {
    id: 11, rows: 4, cols: 6,
    grid: ['###.F.', '###.G.', '###...', 'S.G...'],
    startDir: 1, allowed: ['forward', 'left', 'right'],
    layout: [slot(), rep(2, 2), slot(), rep(3, 1), slot()], par: 4,
  },
  // 12 城堡大門
  {
    id: 12, rows: 5, cols: 7,
    grid: ['..#.#..', '.#...#.', '####.GF', '##.G.##', 'S.G####'],
    startDir: 1, allowed: ['forward', 'left', 'right'],
    layout: [rep(2, 5), slot(), slot()], par: 7,
  },
];
