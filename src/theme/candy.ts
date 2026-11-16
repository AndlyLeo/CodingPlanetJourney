// 「糖果日出」色系：明亮、圓潤、兒童卡通風格。
export const candy = {
  ink: '#4B2A7B', // 深紫：文字描邊與次要按鈕文字
  white: '#FFFFFF',
  gold: '#FFC83D', // 金黃：標題字與「目前選中」外框
  goldShadow: '#7A2E00', // 標題字的深褐色陰影（模擬描邊）
  success: '#3CCB6B', // 已選擇的勾勾標記
  star: '#FFE23A', // 已獲得的星星：亮黃色
  starOutline: '#6B3A00', // 星星外框：深褐色
  starEmpty: '#B9BFC9', // 尚未獲得的星星
  starEmptyOutline: '#4A4F58',
  primary: { face: '#FF9F1C', edge: '#D9770A' }, // 橘黃：主要按鈕
  secondary: { face: '#FFD166', edge: '#E0A526' }, // 暖黃：次要按鈕
  screenBg: '#3B2A6B', // 暫時畫面的底色
  locked: {
    card: '#4A4A52', // 上鎖卡片底色
    silhouette: '#26262B', // 剪影顏色
    outline: '#FFFFFF', // 剪影描邊
  },
} as const;
