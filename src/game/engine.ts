// 關卡的遊戲規則（純邏輯，不含畫面）。
// 小朋友排好指令後，用 simulate() 一步一步算出角色的位置，畫面再依照結果播放動畫。

export type Dir = 0 | 1 | 2 | 3; // 0 = 上、1 = 右、2 = 下、3 = 左（順時針）
export type Command = 'forward' | 'left' | 'right'; // 前進、左轉、右轉

// 程式版面：由「空格」與「重複區塊」組成。重複區塊裡面也有空格。
export type SlotNode = { type: 'slot'; preset?: Command }; // preset：一開始就放好的指令（找錯誤關卡用）
export type RepeatNode = { type: 'repeat'; times: number; body: SlotNode[] };
export type LayoutNode = SlotNode | RepeatNode;

export type LevelDef = {
  id: number; // 1 ~ 12
  rows: number;
  cols: number;
  // 棋盤，每個字元代表一格：. 地面　# 石頭　S 起點　F 旗子（終點）　G 寶石
  grid: string[];
  startDir: Dir;
  allowed: Command[]; // 指令區提供的指令
  layout: LayoutNode[];
  par: number; // 最少需要幾個指令方塊（由解題程式驗證）
};

export type Pos = { row: number; col: number };

export type ParsedLevel = {
  start: Pos;
  goal: Pos;
  gems: Pos[];
  rocks: boolean[][];
};

const DR = [-1, 0, 1, 0];
const DC = [0, 1, 0, -1];

// ---------- 方便寫關卡資料的小工具 ----------
export const slot = (preset?: Command): SlotNode => ({ type: 'slot', preset });
export const slots = (n: number): SlotNode[] => Array.from({ length: n }, () => slot());
export const rep = (times: number, n: number): RepeatNode => ({ type: 'repeat', times, body: slots(n) });

// ---------- 棋盤 ----------
export function parseLevel(level: LevelDef): ParsedLevel {
  let start: Pos = { row: 0, col: 0 };
  let goal: Pos = { row: 0, col: 0 };
  const gems: Pos[] = [];
  const rocks: boolean[][] = [];
  level.grid.forEach((line, row) => {
    rocks.push([]);
    for (let col = 0; col < level.cols; col++) {
      const ch = line[col] ?? '.';
      rocks[row].push(ch === '#');
      if (ch === 'S') start = { row, col };
      if (ch === 'F') goal = { row, col };
      if (ch === 'G') gems.push({ row, col });
    }
  });
  return { start, goal, gems, rocks };
}

// ---------- 程式版面 ----------
export function slotCount(layout: LayoutNode[]): number {
  return layout.reduce((n, node) => n + (node.type === 'slot' ? 1 : node.body.length), 0);
}

export function presetValues(level: LevelDef): (Command | null)[] {
  const values: (Command | null)[] = [];
  for (const node of level.layout) {
    if (node.type === 'slot') values.push(node.preset ?? null);
    else node.body.forEach((s) => values.push(s.preset ?? null));
  }
  return values;
}

export type Step = { slot: number; cmd: Command };

// 把「空格 + 重複區塊」展開成依序執行的指令清單（空的空格會被略過）
export function expandSteps(layout: LayoutNode[], values: (Command | null)[]): Step[] {
  const steps: Step[] = [];
  let index = 0;
  for (const node of layout) {
    if (node.type === 'slot') {
      const cmd = values[index];
      if (cmd) steps.push({ slot: index, cmd });
      index += 1;
    } else {
      const base = index;
      for (let t = 0; t < node.times; t++) {
        node.body.forEach((_, i) => {
          const cmd = values[base + i];
          if (cmd) steps.push({ slot: base + i, cmd });
        });
      }
      index += node.body.length;
    }
  }
  return steps;
}

// ---------- 執行 ----------
export type Frame = {
  slot: number; // 正在執行的空格（畫面上用來標示）
  cmd: Command;
  row: number;
  col: number;
  dir: Dir;
  bumped: boolean; // 前進時撞到石頭或邊界
  collected: number[]; // 到目前為止收集到的寶石編號
};

// win 過關　bump 撞到了　empty 沒有放指令　short 沒走到旗子　gems 到了旗子但還有寶石沒收集
export type Outcome = 'win' | 'bump' | 'empty' | 'short' | 'gems';

export type SimResult = { frames: Frame[]; outcome: Outcome; endPos: Pos };

export function simulate(level: LevelDef, values: (Command | null)[], parsed?: ParsedLevel): SimResult {
  const p = parsed ?? parseLevel(level);
  const steps = expandSteps(level.layout, values);
  let { row, col } = p.start;
  let dir: Dir = level.startDir;
  const collected: number[] = [];
  const frames: Frame[] = [];

  if (steps.length === 0) return { frames, outcome: 'empty', endPos: { row, col } };

  for (const step of steps) {
    let bumped = false;
    if (step.cmd === 'left') dir = ((dir + 3) % 4) as Dir;
    else if (step.cmd === 'right') dir = ((dir + 1) % 4) as Dir;
    else {
      const nr = row + DR[dir];
      const nc = col + DC[dir];
      if (nr < 0 || nr >= level.rows || nc < 0 || nc >= level.cols || p.rocks[nr][nc]) {
        bumped = true;
      } else {
        row = nr;
        col = nc;
        const gemIndex = p.gems.findIndex((g) => g.row === row && g.col === col);
        if (gemIndex >= 0 && !collected.includes(gemIndex)) collected.push(gemIndex);
      }
    }
    frames.push({ slot: step.slot, cmd: step.cmd, row, col, dir, bumped, collected: [...collected] });
    if (bumped) return { frames, outcome: 'bump', endPos: { row, col } };
  }

  const atGoal = row === p.goal.row && col === p.goal.col;
  let outcome: Outcome = 'short';
  if (atGoal) outcome = collected.length === p.gems.length ? 'win' : 'gems';
  return { frames, outcome, endPos: { row, col } };
}

// ---------- 星星 ----------
export function usedBlocks(values: (Command | null)[]): number {
  return values.filter((v) => v !== null).length;
}

// 過關得 1 顆；指令數不超過最少數量 + 2 得 2 顆；剛好是最少數量得 3 顆；使用過提示最多 2 顆。
export function starsFor(level: LevelDef, used: number, hintUsed: boolean): number {
  let stars = 1;
  if (used <= level.par + 2) stars = 2;
  if (used <= level.par) stars = 3;
  return hintUsed ? Math.min(stars, 2) : stars;
}

// ---------- 驗證用：窮舉所有排法，找出過關所需的最少指令數 ----------
export function solveMin(level: LevelDef): number | null {
  const n = slotCount(level.layout);
  const options: (Command | null)[] = [null, ...level.allowed];
  const parsed = parseLevel(level);
  const values: (Command | null)[] = Array(n).fill(null);
  let best: number | null = null;

  const walk = (i: number, used: number) => {
    if (best !== null && used >= best) return;
    if (i === n) {
      if (used > 0 && simulate(level, values, parsed).outcome === 'win') best = used;
      return;
    }
    for (const opt of options) {
      values[i] = opt;
      walk(i + 1, used + (opt ? 1 : 0));
    }
    values[i] = null;
  };
  walk(0, 0);
  return best;
}
