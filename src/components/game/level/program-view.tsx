import type { MutableRefObject } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '../app-text';
import type { Command, LayoutNode } from '../../../game/engine';
import { strings } from '../../../i18n';
import { candy } from '../../../theme/candy';
import { CommandBlock } from './command-block';

type Props = {
  layout: LayoutNode[];
  values: (Command | null)[];
  size: number; // 每個格子的大小
  activeSlot: number | null; // 執行中的格子（金色外框）
  editable: boolean;
  slotRefs: MutableRefObject<(View | null)[]>; // 供拖曳放開時，量出每個格子的位置
  onClear: (index: number) => void;
};

// 程式區：由空格與「重複」區塊組成。輕點已放好的方塊可以拿掉。
export function ProgramView({ layout, values, size, activeSlot, editable, slotRefs, onClear }: Props) {
  const gap = Math.max(6, size * 0.16);

  const renderSlot = (index: number) => {
    const value = values[index];
    const active = activeSlot === index;
    return (
      <Pressable
        key={`s${index}`}
        ref={(r) => {
          slotRefs.current[index] = r;
        }}
        collapsable={false}
        onPress={() => {
          if (editable && value) onClear(index);
        }}
        accessibilityRole="button"
        accessibilityLabel={value ? strings.game.commands[value] : undefined}
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.22,
          borderWidth: active ? 4 : 2,
          borderStyle: value ? 'solid' : 'dashed',
          borderColor: active ? candy.gold : value ? 'transparent' : 'rgba(75,42,123,0.5)',
          backgroundColor: value ? 'transparent' : 'rgba(255,255,255,0.55)',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {value ? <CommandBlock cmd={value} size={size - (active ? 8 : 4)} /> : null}
      </Pressable>
    );
  };

  let index = 0;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', gap }}>
      {layout.map((node, i) => {
        if (node.type === 'slot') return renderSlot(index++);
        const base = index;
        index += node.body.length;
        return (
          <View
            key={`r${i}`}
            style={{
              borderWidth: 3,
              borderColor: '#FF9F1C',
              borderRadius: 14,
              backgroundColor: 'rgba(255,159,28,0.18)',
              padding: 6,
              gap: 4,
            }}>
            <Text
              allowFontScaling={false}
              style={{ fontSize: Math.max(11, size * 0.26), fontWeight: '900', color: '#B35A00', includeFontPadding: false }}>
              {strings.game.repeatLabel(node.times)}
            </Text>
            <View style={{ flexDirection: 'row', gap: gap * 0.6 }}>{node.body.map((_, j) => renderSlot(base + j))}</View>
          </View>
        );
      })}
    </View>
  );
}
