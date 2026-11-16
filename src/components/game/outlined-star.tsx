import { Text, View } from 'react-native';

type Props = {
  size: number; // 星星字級
  face: string; // 星星顏色
  outline: string; // 外框顏色
  outlineWidth?: number; // 外框在星星尖角處的粗細（dp）
};

// 有外框的星星：後面墊一顆放大的深色星星當外框，上面再疊星星本體。
// （之前用 8 個方向偏移的做法，在尖角處會產生鋸齒狀的重影，所以改成放大剪影。）
export function OutlinedStar({ size, face, outline, outlineWidth }: Props) {
  const ow = outlineWidth ?? size * 0.07;
  const scale = 1 + (ow * 2) / (size * 0.45); // 外框粗細乘上 2 星星的外接半徑約為字級的 0.45 倍
  const w = size * 1.6;
  const h = size * 1.3;
  const base = {
    position: 'absolute' as const,
    left: 0,
    top: 0,
    width: w,
    textAlign: 'center' as const,
    fontSize: size,
    lineHeight: h,
    includeFontPadding: false,
  };

  return (
    <View style={{ width: w, height: h }} pointerEvents="none">
      <Text allowFontScaling={false} style={[base, { color: outline, transform: [{ scale }] }]}>
        ★
      </Text>
      <Text allowFontScaling={false} style={[base, { color: face }]}>
        ★
      </Text>
    </View>
  );
}
