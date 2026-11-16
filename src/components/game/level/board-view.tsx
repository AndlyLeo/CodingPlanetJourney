import type { ReactNode } from 'react';
import { View } from 'react-native';

import type { LevelDef, ParsedLevel } from '../../../game/engine';

type Props = {
  level: LevelDef;
  parsed: ParsedLevel;
  cell: number;
  collected: number[]; // 已收集的寶石編號
  children?: ReactNode; // 角色
};

const FLOOR_A = '#A6DF72';
const FLOOR_B = '#97D464';

// 棋盤：地面、石頭、寶石、旗子都由程式畫出來，之後可以換成你的素材。
export function BoardView({ level, parsed, cell, collected, children }: Props) {
  const cells: ReactNode[] = [];

  for (let r = 0; r < level.rows; r++) {
    for (let c = 0; c < level.cols; c++) {
      cells.push(
        <View
          key={`${r}-${c}`}
          style={{
            position: 'absolute',
            left: c * cell,
            top: r * cell,
            width: cell,
            height: cell,
            backgroundColor: (r + c) % 2 === 0 ? FLOOR_A : FLOOR_B,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {parsed.rocks[r][c] && <Rock cell={cell} />}
        </View>,
      );
    }
  }

  const radius = Math.min(16, cell * 0.2);
  return (
    <View
      style={{
        width: level.cols * cell,
        height: level.rows * cell,
        borderRadius: radius,
        overflow: 'hidden',
      }}>
      {cells}

      <Marker cell={cell} pos={parsed.start} />
      <Flag cell={cell} row={parsed.goal.row} col={parsed.goal.col} />
      {parsed.gems.map((g, i) =>
        collected.includes(i) ? null : <Gem key={i} cell={cell} row={g.row} col={g.col} />,
      )}

      {children}

      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          borderRadius: radius,
          borderWidth: 4,
          borderColor: 'rgba(255,255,255,0.95)',
        }}
      />
    </View>
  );
}

function Rock({ cell }: { cell: number }) {
  const s = cell * 0.84;
  return (
    <View
      style={{
        width: s,
        height: s,
        borderRadius: s * 0.28,
        backgroundColor: '#8D939E',
        borderBottomWidth: Math.max(3, cell * 0.08),
        borderBottomColor: '#5E636D',
        alignItems: 'center',
      }}>
      <View
        style={{
          marginTop: s * 0.12,
          width: s * 0.5,
          height: s * 0.16,
          borderRadius: s * 0.1,
          backgroundColor: 'rgba(255,255,255,0.35)',
        }}
      />
    </View>
  );
}

function Marker({ cell, pos }: { cell: number; pos: { row: number; col: number } }) {
  const s = cell * 0.78;
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: pos.col * cell + (cell - s) / 2,
        top: pos.row * cell + (cell - s) / 2,
        width: s,
        height: s,
        borderRadius: s / 2,
        borderWidth: Math.max(2, cell * 0.04),
        borderColor: 'rgba(255,255,255,0.8)',
      }}
    />
  );
}

function Gem({ cell, row, col }: { cell: number; row: number; col: number }) {
  const s = cell * 0.34;
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', left: col * cell, top: row * cell, width: cell, height: cell, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: s,
          height: s,
          backgroundColor: '#4DD9F5',
          borderWidth: Math.max(2, cell * 0.05),
          borderColor: '#FFFFFF',
          borderRadius: s * 0.15,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
}

function Flag({ cell, row, col }: { cell: number; row: number; col: number }) {
  const poleW = Math.max(3, cell * 0.07);
  const poleH = cell * 0.58;
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', left: col * cell, top: row * cell, width: cell, height: cell }}>
      <View
        style={{
          position: 'absolute',
          left: cell * 0.3,
          top: cell * 0.76,
          width: cell * 0.4,
          height: cell * 0.12,
          borderRadius: cell * 0.06,
          backgroundColor: 'rgba(0,0,0,0.22)',
        }}
      />
      <View style={{ position: 'absolute', left: cell * 0.38, top: cell * 0.2, width: poleW, height: poleH, backgroundColor: '#7A4318' }} />
      <View
        style={{
          position: 'absolute',
          left: cell * 0.38 + poleW,
          top: cell * 0.2,
          width: 0,
          height: 0,
          borderTopWidth: cell * 0.14,
          borderBottomWidth: cell * 0.14,
          borderLeftWidth: cell * 0.3,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderLeftColor: '#FF4D4D',
        }}
      />
    </View>
  );
}
