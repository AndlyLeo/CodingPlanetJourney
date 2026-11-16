import { Pressable, View } from 'react-native';

import { candy } from '../../theme/candy';

type Props = {
  direction: 'left' | 'right';
  size: number;
  onPress: () => void;
  accessibilityLabel: string;
};

// 左右切換箭頭：圓形黃色按鈕，箭頭用程式畫成，按下時按鈕面下沉。
export function ChevronButton({ direction, size, onPress, accessibilityLabel }: Props) {
  const edge = Math.max(3, size * 0.07);
  const face = size - edge;
  const s = face * 0.34; // 箭頭邊長
  const t = Math.max(3, face * 0.1); // 線條粗細
  const left = direction === 'left';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={10}
      style={({ pressed }) => ({
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: candy.primary.edge,
        paddingBottom: pressed ? edge * 0.35 : edge,
        paddingTop: pressed ? edge * 0.65 : 0,
      })}>
      <View
        style={{
          flex: 1,
          borderRadius: face / 2,
          backgroundColor: candy.primary.face,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <View
          style={{
            width: s,
            height: s,
            marginLeft: left ? s * 0.25 : -s * 0.25,
            borderColor: candy.white,
            borderLeftWidth: left ? t : 0,
            borderBottomWidth: left ? t : 0,
            borderRightWidth: left ? 0 : t,
            borderTopWidth: left ? 0 : t,
            transform: [{ rotate: '45deg' }],
          }}
        />
      </View>
    </Pressable>
  );
}
