import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import type { CharacterDef } from '../../data/characters';
import { candy } from '../../theme/candy';
import { LockIcon } from './lock-icon';

// 卡片寬高比（依設計示意圖：約 218 × 268）
export const CARD_RATIO = 218 / 268;

type Props = {
  character: CharacterDef;
  width: number;
  unlocked: boolean;
  selected: boolean;
  label: string;
  onPress: () => void;
};

// 角色卡片：卡片底色、外框、上鎖剪影、鎖頭、選中標記全部由程式繪製。
export function CharacterCard({ character, width, unlocked, selected, label, onPress }: Props) {
  const height = width / CARD_RATIO;
  const border = Math.max(2, Math.round(width * 0.025));
  const radius = width * 0.13;
  const pad = width * 0.05;
  const outline = Math.max(1.5, width * 0.012);
  const ring = 4;
  const lockSize = width * 0.34;
  const badge = width * 0.26;

  // 角色圖：由程式先算好「完整放進卡片」的寬高，再直接指定給圖片，
  // 不依賴 resizeMode，確保角色整個縮小到卡片內。
  const innerW = width - border * 2 - pad * 2;
  const innerH = height - border * 2 - pad * 2;
  const src = character.image ? Image.resolveAssetSource(character.image) : undefined;
  const ratio = src && src.width && src.height ? src.width / src.height : 0.47;
  let fitW = innerW;
  let fitH = fitW / ratio;
  if (fitH > innerH) {
    fitH = innerH;
    fitW = fitH * ratio;
  }

  const offsets: [number, number][] = [
    [outline, 0], [-outline, 0], [0, outline], [0, -outline],
    [outline, outline], [-outline, -outline], [outline, -outline], [-outline, outline],
  ];

  const layer = (key: string | number, extra: object) => (
    <View key={key} style={[StyleSheet.absoluteFill, styles.center]}>
      <Image
        source={character.image}
        style={[{ width: fitW, height: fitH, resizeMode: 'stretch' }, extra]}
      />
    </View>
  );

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      style={{ width, height }}>
      {selected && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: -ring,
            top: -ring,
            right: -ring,
            bottom: -ring,
            borderRadius: radius + ring,
            borderWidth: ring,
            borderColor: candy.gold,
          }}
        />
      )}

      <View
        style={{
          flex: 1,
          borderRadius: radius,
          borderWidth: border,
          borderColor: 'rgba(255,255,255,0.95)',
          backgroundColor: unlocked ? character.cardColor : candy.locked.card,
          overflow: 'hidden',
        }}>
        {character.image && (
          <View style={{ position: 'absolute', left: pad, right: pad, top: pad, bottom: pad }}>
            {unlocked ? (
              layer('main', {})
            ) : (
              <>
                {offsets.map(([dx, dy], i) =>
                  layer(i, {
                    tintColor: candy.locked.outline,
                    transform: [{ translateX: dx }, { translateY: dy }],
                  }),
                )}
                {layer('dark', { tintColor: candy.locked.silhouette })}
              </>
            )}
          </View>
        )}
      </View>

      {!unlocked && (
        <View
          pointerEvents="none"
          style={{ position: 'absolute', left: (width - lockSize) / 2, top: height * 0.58 - lockSize * 0.58 }}>
          <LockIcon size={lockSize} />
        </View>
      )}

      {selected && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: -width * 0.04,
            right: -width * 0.04,
            width: badge,
            height: badge,
            borderRadius: badge / 2,
            backgroundColor: candy.success,
            borderWidth: 2,
            borderColor: candy.white,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text
            allowFontScaling={false}
            style={{ color: candy.white, fontSize: badge * 0.6, fontWeight: '900', includeFontPadding: false }}>
            ✓
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
});
