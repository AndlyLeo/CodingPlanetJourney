import { Pressable, View } from 'react-native';

type Props = { size: number; onPress: () => void; accessibilityLabel: string };

const FACE = '#3B8BFF';
const EDGE = '#1F57C4';

// 設定按鈕：藍色圓形，齒輪圖示用程式畫成（不需要圖片或字體）。
export function GearButton({ size, onPress, accessibilityLabel }: Props) {
  const edge = Math.max(3, size * 0.07);
  const face = size - edge;
  const g = face * 0.64; // 齒輪大小
  const bar = g * 0.26;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={({ pressed }) => ({
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: EDGE,
        paddingBottom: pressed ? edge * 0.35 : edge,
        paddingTop: pressed ? edge * 0.65 : 0,
      })}>
      <View style={{ flex: 1, borderRadius: face / 2, backgroundColor: FACE, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: g, height: g }}>
          {[0, 45, 90, 135].map((angle) => (
            <View
              key={angle}
              style={{
                position: 'absolute',
                left: (g - bar) / 2,
                top: 0,
                width: bar,
                height: g,
                borderRadius: bar * 0.25,
                backgroundColor: '#FFFFFF',
                transform: [{ rotate: `${angle}deg` }],
              }}
            />
          ))}
          <View
            style={{
              position: 'absolute',
              left: g * 0.14,
              top: g * 0.14,
              width: g * 0.72,
              height: g * 0.72,
              borderRadius: g * 0.36,
              backgroundColor: '#FFFFFF',
            }}
          />
          <View
            style={{
              position: 'absolute',
              left: g * 0.35,
              top: g * 0.35,
              width: g * 0.3,
              height: g * 0.3,
              borderRadius: g * 0.15,
              backgroundColor: FACE,
            }}
          />
        </View>
      </View>
    </Pressable>
  );
}
