import { View } from 'react-native';

import { Text } from '../app-text';
import type { Command } from '../../../game/engine';
import { candy } from '../../../theme/candy';

export const COMMAND_COLORS: Record<Command, { face: string; edge: string }> = {
  forward: { face: '#4CC35A', edge: '#2E8F3B' }, // 前進：綠
  left: { face: '#2F8BFF', edge: '#1B5FD1' }, // 左轉：藍
  right: { face: '#FF9F1C', edge: '#D9770A' }, // 右轉：橘
};

// 指令圖示：用 View 畫的箭頭（前進＝向上、左轉＝向左彎、右轉＝向右彎）
export function CommandIcon({ cmd, size, color = '#FFFFFF' }: { cmd: Command; size: number; color?: string }) {
  const s = size;
  const clear = 'transparent';

  if (cmd === 'forward') {
    return (
      <View style={{ width: s, height: s }}>
        <View style={{ position: 'absolute', left: 0.43 * s, top: 0.36 * s, width: 0.14 * s, height: 0.52 * s, backgroundColor: color }} />
        <View
          style={{
            position: 'absolute',
            left: 0.3 * s,
            top: 0.08 * s,
            width: 0,
            height: 0,
            borderLeftWidth: 0.2 * s,
            borderRightWidth: 0.2 * s,
            borderBottomWidth: 0.26 * s,
            borderLeftColor: clear,
            borderRightColor: clear,
            borderBottomColor: color,
          }}
        />
      </View>
    );
  }

  const left = cmd === 'left';
  return (
    <View style={{ width: s, height: s }}>
      <View style={{ position: 'absolute', left: (left ? 0.55 : 0.31) * s, top: 0.38 * s, width: 0.14 * s, height: 0.52 * s, backgroundColor: color }} />
      <View style={{ position: 'absolute', left: (left ? 0.3 : 0.31) * s, top: 0.38 * s, width: 0.39 * s, height: 0.14 * s, backgroundColor: color }} />
      <View
        style={{
          position: 'absolute',
          left: (left ? 0.06 : 0.68) * s,
          top: 0.25 * s,
          width: 0,
          height: 0,
          borderTopWidth: 0.2 * s,
          borderBottomWidth: 0.2 * s,
          borderTopColor: clear,
          borderBottomColor: clear,
          borderLeftWidth: left ? 0 : 0.26 * s,
          borderRightWidth: left ? 0.26 * s : 0,
          borderLeftColor: left ? clear : color,
          borderRightColor: left ? color : clear,
        }}
      />
    </View>
  );
}

type Props = {
  cmd: Command;
  size: number;
  label?: string; // 有提供時，顯示在圖示下方
  glow?: boolean; // 執行中的方塊：金色外框
};

// 指令方塊：圓角色塊 + 箭頭圖示，立體感與其他按鈕一致。
export function CommandBlock({ cmd, size, label, glow }: Props) {
  const c = COMMAND_COLORS[cmd];
  const edge = Math.max(3, size * 0.07);
  const iconSize = label ? size * 0.58 : size * 0.72;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.22,
        backgroundColor: c.edge,
        paddingBottom: edge,
      }}>
      <View
        style={{
          flex: 1,
          borderRadius: size * 0.2,
          backgroundColor: c.face,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: glow ? 3 : 0,
          borderColor: candy.gold,
        }}>
        <CommandIcon cmd={cmd} size={iconSize} />
        {label ? (
          <Text
            allowFontScaling={false}
            style={{ color: '#FFFFFF', fontSize: size * 0.17, fontWeight: '900', includeFontPadding: false, marginTop: -size * 0.04 }}>
            {label}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
