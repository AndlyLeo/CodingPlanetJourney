import { Pressable, View } from 'react-native';

import { Text } from './app-text';
import type { LevelState } from '../../data/levels';
import { candy } from '../../theme/candy';
import { OutlinedStar } from './outlined-star';

// 以「地圖圖片像素」為單位的設計尺寸，實際大小乘上縮放比例 u。
export const NODE_BOX = { left: 75, right: 75, top: 150, bottom: 50 }; // 點擊範圍（以圓心為基準）
const DISC = 84; // 圓形底座直徑
const LIP = 8; // 底座下方的厚度（立體感）
const STAR = 40; // 星星大小
const STAR_OFFSETS: [number, number][] = [
  [-40, -102],
  [0, -112],
  [40, -102],
];

const COLORS = {
  active: { face: '#2F8BFF', edge: '#1B5FD1', text: candy.white, shadow: '#123F94' }, // 進行中、通過：藍底白字
  locked: { face: '#9A9EA8', edge: '#6B6F78', text: 'rgba(255,255,255,0.85)', shadow: '#555962' },
} as const;

type Props = {
  level: number;
  state: LevelState;
  stars: number; // 這一關已獲得的星星（0 ~ 3）
  cx: number; // 圓心的螢幕座標
  cy: number;
  u: number; // 縮放比例（地圖像素 → dp）
  label: string;
  onPress: () => void;
};

// 關卡點：圓形底座、關卡編號、三顆星星都由程式繪製，位置由地圖資料決定。
export function LevelNode({ level, state, stars, cx, cy, u, label, onPress }: Props) {
  const colors = state === 'locked' ? COLORS.locked : COLORS.active;
  const boxW = (NODE_BOX.left + NODE_BOX.right) * u;
  const boxH = (NODE_BOX.top + NODE_BOX.bottom) * u;
  const ox = NODE_BOX.left * u; // 圓心在點擊範圍內的位置
  const oy = NODE_BOX.top * u;

  const d = DISC * u;
  const lip = LIP * u;
  const star = STAR * u;
  const ring = Math.max(2, 4 * u);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{ position: 'absolute', left: cx - ox, top: cy - oy, width: boxW, height: boxH }}>
      {STAR_OFFSETS.map(([dx, dy], i) => {
        const earned = i < stars;
        return (
          <View
            key={i}
            pointerEvents="none"
            style={{ position: 'absolute', left: ox + dx * u - star * 0.8, top: oy + dy * u - star * 0.65 }}>
            <OutlinedStar
              size={star}
              face={earned ? candy.star : candy.starEmpty}
              outline={earned ? candy.starOutline : candy.starEmptyOutline}
              outlineWidth={Math.max(1.2, star * 0.085)}
            />
          </View>
        );
      })}

      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: ox - d / 2,
          top: oy - d / 2 + lip,
          width: d,
          height: d,
          borderRadius: d / 2,
          backgroundColor: colors.edge,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: ox - d / 2,
          top: oy - d / 2,
          width: d,
          height: d,
          borderRadius: d / 2,
          backgroundColor: colors.face,
          borderWidth: ring,
          borderColor: 'rgba(255,255,255,0.95)',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text
          allowFontScaling={false}
          style={{
            color: colors.text,
            fontSize: d * 0.55,
            fontWeight: '900',
            includeFontPadding: false,
            textShadowColor: colors.shadow,
            textShadowOffset: { width: 0, height: Math.max(1, 2 * u) },
            textShadowRadius: 0,
          }}>
          {level}
        </Text>
      </View>
    </Pressable>
  );
}
