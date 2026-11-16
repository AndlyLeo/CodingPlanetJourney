// 關卡狀態規則：
// - 第 1 關預設開放；完成前一關（至少 1 顆星）後，下一關開放。
// - 開放但還沒完成的第一個關卡是「進行中」；已完成的是「通過」。
// - 進行中與通過的關卡顯示藍底白字，尚未開放的顯示灰色。
export type LevelState = 'locked' | 'current' | 'completed';

export function getLevelStates(stars: number[]): LevelState[] {
  const states: LevelState[] = [];
  let currentFound = false;
  for (let i = 0; i < stars.length; i++) {
    if (stars[i] >= 1) {
      states.push('completed');
    } else if (!currentFound) {
      states.push('current');
      currentFound = true;
    } else {
      states.push('locked');
    }
  }
  return states;
}
