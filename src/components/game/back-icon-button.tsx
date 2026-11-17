import { Pressable, View } from 'react-native';

import { playSfx } from '../../audio/sound';
import { candy } from '../../theme/candy';

type Props = {
  size: number;
  onPress: () => void;
  accessibilityLabel: string;
};

// 圓形返回按鈕，圖示為逆時針箭頭（用 View 畫成，不需要圖片或字體）。
// 按下時按鈕面下沉，整體高度不變。
export function BackIconButton({ size, onPress, accessibilityLabel }: Props) {
  const edge = Math.max(3, size * 0.07);
  const face = size - edge;

  return (
    <Pressable
      onPress={() => {
        playSfx('tap');
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={12}
      style={({ pressed }) => ({
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: candy.secondary.edge,
        paddingBottom: pressed ? edge * 0.35 : edge,
        paddingTop: pressed ? edge * 0.65 : 0,
      })}>
      <View
        style={{
          flex: 1,
          borderRadius: face / 2,
          backgroundColor: candy.secondary.face,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <CounterClockwiseArrow size={face * 0.58} color={candy.ink} />
      </View>
    </Pressable>
  );
}

// 逆時針箭頭：開口朝左上的圓弧，箭頭在頂端向左。
function CounterClockwiseArrow({ size, color }: { size: number; color: string }) {
  const t = size * 0.18; // 線條粗細
  const head = size * 0.3; // 箭頭大小
  const r = size / 2;

  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: size,
          height: size,
          borderRadius: r,
          borderWidth: t,
          borderColor: 'transparent',
          borderTopColor: color,
          borderRightColor: color,
          borderBottomColor: color,
          transform: [{ rotate: '45deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: r - head * 0.2,
          top: t / 2 - head * 0.6,
          width: 0,
          height: 0,
          borderTopWidth: head * 0.6,
          borderBottomWidth: head * 0.6,
          borderRightWidth: head,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderRightColor: color,
          transform: [{ translateX: -head * 0.55 }],
        }}
      />
    </View>
  );
}
