import type { ImageSourcePropType } from 'react-native';

export type CharacterDef = {
  id: string; // 兩位數字，與圖片檔名 character-XX.png 對應
  image?: ImageSourcePropType; // 圖片尚未提供的角色先留空，卡片會顯示統一的上鎖樣式
  cardColor: string; // 解鎖後的卡片底色
  unlockedByDefault: boolean; // 第一階段：前 3 個角色開放，其餘需關卡解鎖
};

// 第一次使用、從未選過角色時的預設角色（機器人）
export const DEFAULT_CHARACTER_ID = '03';

// 由左到右、由上到下共 15 個。
// 新增角色圖片時，只要取消對應那一行的 image 註解即可，其他程式不用改。
export const characters: CharacterDef[] = [
  { id: '01', image: require('../../assets/images/characters/character-01.png'), cardColor: '#7CCBF4', unlockedByDefault: true },
  { id: '02', image: require('../../assets/images/characters/character-02.png'), cardColor: '#FF9DC8', unlockedByDefault: true },
  { id: '03', image: require('../../assets/images/characters/character-03.png'), cardColor: '#7CCBF4', unlockedByDefault: true },
  { id: '04', /* image: require('../../assets/images/characters/character-04.png'), */ cardColor: '#FFC24A', unlockedByDefault: false },
  { id: '05', /* image: require('../../assets/images/characters/character-05.png'), */ cardColor: '#B58CF0', unlockedByDefault: false },
  { id: '06', /* image: require('../../assets/images/characters/character-06.png'), */ cardColor: '#6FA8FF', unlockedByDefault: false },
  { id: '07', /* image: require('../../assets/images/characters/character-07.png'), */ cardColor: '#A98BEF', unlockedByDefault: false },
  { id: '08', /* image: require('../../assets/images/characters/character-08.png'), */ cardColor: '#F58BD0', unlockedByDefault: false },
  { id: '09', /* image: require('../../assets/images/characters/character-09.png'), */ cardColor: '#8EE08A', unlockedByDefault: false },
  { id: '10', /* image: require('../../assets/images/characters/character-10.png'), */ cardColor: '#B9E56A', unlockedByDefault: false },
  { id: '11', /* image: require('../../assets/images/characters/character-11.png'), */ cardColor: '#5FD8E8', unlockedByDefault: false },
  { id: '12', /* image: require('../../assets/images/characters/character-12.png'), */ cardColor: '#C8E85C', unlockedByDefault: false },
  { id: '13', /* image: require('../../assets/images/characters/character-13.png'), */ cardColor: '#FFC85A', unlockedByDefault: false },
  { id: '14', /* image: require('../../assets/images/characters/character-14.png'), */ cardColor: '#FF9F8A', unlockedByDefault: false },
  { id: '15', /* image: require('../../assets/images/characters/character-15.png'), */ cardColor: '#FF9AC7', unlockedByDefault: false },
];

// 第二階段做完關卡後，這裡改成讀取使用者的進度；現在先用預設值。
export function isCharacterUnlocked(id: string): boolean {
  return characters.find((c) => c.id === id)?.unlockedByDefault ?? false;
}
