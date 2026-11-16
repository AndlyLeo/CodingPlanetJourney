import { useRef } from 'react';
import { PanResponder, type PanResponderInstance, View } from 'react-native';

import type { Command } from '../../../game/engine';
import { CommandBlock } from './command-block';

type Props = {
  cmd: Command;
  size: number;
  label: string;
  disabled: boolean;
  onDragStart: (cmd: Command, pageX: number, pageY: number) => void;
  onDragMove: (pageX: number, pageY: number) => void;
  onDragEnd: (cmd: Command, pageX: number, pageY: number, moved: boolean) => void;
  onDragCancel: () => void;
};

// 指令區的方塊：可以拖曳到程式格子裡；輕點一下則自動放到第一個空格。
export function PaletteBlock({ cmd, size, label, disabled, onDragStart, onDragMove, onDragEnd, onDragCancel }: Props) {
  // 手勢處理器只建立一次，所以用 ref 隨時取得最新的函式與狀態
  const latest = useRef({ disabled, onDragStart, onDragMove, onDragEnd, onDragCancel });
  latest.current = { disabled, onDragStart, onDragMove, onDragEnd, onDragCancel };
  const moved = useRef(false);
  const pan = useRef<PanResponderInstance | null>(null);

  if (pan.current === null) {
    pan.current = PanResponder.create({
      onStartShouldSetPanResponder: () => !latest.current.disabled,
      onMoveShouldSetPanResponder: () => !latest.current.disabled,
      onPanResponderGrant: (e) => {
        moved.current = false;
        latest.current.onDragStart(cmd, e.nativeEvent.pageX, e.nativeEvent.pageY);
      },
      onPanResponderMove: (e, g) => {
        if (Math.abs(g.dx) + Math.abs(g.dy) > 8) moved.current = true;
        latest.current.onDragMove(e.nativeEvent.pageX, e.nativeEvent.pageY);
      },
      onPanResponderRelease: (e) => {
        latest.current.onDragEnd(cmd, e.nativeEvent.pageX, e.nativeEvent.pageY, moved.current);
      },
      onPanResponderTerminate: () => latest.current.onDragCancel(),
    });
  }

  return (
    <View
      {...pan.current.panHandlers}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{ opacity: disabled ? 0.5 : 1 }}>
      <CommandBlock cmd={cmd} size={size} label={label} />
    </View>
  );
}
