import { View } from 'react-native';

type Props = { size: number; variant?: 'gold' | 'silver' };

const COLORS = {
  gold: { shackle: '#C9CED6', body: '#F5B82E', edge: '#D9921A', hole: '#5B3A00' },
  silver: { shackle: '#B8BDC7', body: '#D3D7DE', edge: '#A4A9B3', hole: '#4A4F5A' },
} as const;

// 用程式畫的鎖頭，不需要圖片。整體高度為 size 的 1.16 倍。
export function LockIcon({ size, variant = 'gold' }: Props) {
  const c = COLORS[variant];
  const shackleW = size * 0.64;
  const shackleH = size * 0.5;
  const stroke = size * 0.12;
  const bodyH = size * 0.66;
  const hole = size * 0.16;

  return (
    <View style={{ width: size, height: shackleH + bodyH, alignItems: 'center' }}>
      <View
        style={{
          width: shackleW,
          height: shackleH,
          borderWidth: stroke,
          borderBottomWidth: 0,
          borderTopLeftRadius: shackleW / 2,
          borderTopRightRadius: shackleW / 2,
          borderColor: c.shackle,
        }}
      />
      <View
        style={{
          width: size,
          height: bodyH,
          borderRadius: size * 0.16,
          backgroundColor: c.body,
          borderBottomWidth: size * 0.06,
          borderBottomColor: c.edge,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <View style={{ width: hole, height: hole, borderRadius: hole / 2, backgroundColor: c.hole }} />
        <View style={{ width: hole * 0.45, height: hole, backgroundColor: c.hole, marginTop: -2 }} />
      </View>
    </View>
  );
}
