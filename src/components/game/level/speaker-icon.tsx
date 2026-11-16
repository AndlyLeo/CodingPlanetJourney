import { View } from 'react-native';

// 喇叭圖示（用 View 畫成）：方塊 + 錐形 + 兩道聲波。
export function SpeakerIcon({ size, color }: { size: number; color: string }) {
  const s = size;
  const clear = 'transparent';
  return (
    <View style={{ width: s, height: s }}>
      <View style={{ position: 'absolute', left: 0.08 * s, top: 0.36 * s, width: 0.22 * s, height: 0.28 * s, backgroundColor: color, borderRadius: 0.03 * s }} />
      <View
        style={{
          position: 'absolute',
          left: 0.28 * s,
          top: 0.24 * s,
          width: 0,
          height: 0,
          borderTopWidth: 0.26 * s,
          borderBottomWidth: 0.26 * s,
          borderRightWidth: 0.26 * s,
          borderTopColor: clear,
          borderBottomColor: clear,
          borderRightColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: 0.38 * s,
          top: 0.3 * s,
          width: 0.4 * s,
          height: 0.4 * s,
          borderRadius: 0.2 * s,
          borderWidth: 0.07 * s,
          borderColor: clear,
          borderRightColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: 0.23 * s,
          top: 0.15 * s,
          width: 0.7 * s,
          height: 0.7 * s,
          borderRadius: 0.35 * s,
          borderWidth: 0.07 * s,
          borderColor: clear,
          borderRightColor: color,
        }}
      />
    </View>
  );
}
