// 音效與背景音樂的呼叫位置。
// 目前還沒有安裝音訊套件，也還沒有音檔，所以這些函式不會有任何動作；
// 畫面程式已經在對的時機呼叫它們，之後安裝套件、放入音檔時，只需要改這個檔案。

export type SfxName =
  | 'tap' // 點按鈕
  | 'drop' // 把方塊放進格子
  | 'step' // 角色前進一格
  | 'turn' // 角色轉彎
  | 'gem' // 收集寶石
  | 'bump' // 撞到石頭或邊界
  | 'win' // 過關
  | 'fail'; // 失敗

export type MusicName = 'welcome' | 'map' | 'level';

export function playSfx(_name: SfxName): void {
  // 之後實作
}

export function playMusic(_name: MusicName | null): void {
  // 之後實作；傳入 null 代表停止音樂
}
