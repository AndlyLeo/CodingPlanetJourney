import {
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { Text } from './app-text';
import type { WorldDef } from '../../data/worlds';
import { candy } from '../../theme/candy';
import { LockIcon } from './lock-icon';

// 區域圖片 zone-N.png 的寬高比（1122 × 1402）
export const ZONE_RATIO = 1122 / 1402;

type Props = {
  world: WorldDef;
  name: string; // 供無障礙朗讀，以及沒有圖片時顯示
  width: number;
  unlocked: boolean;
  current: boolean; // 目前最新解鎖的區域：金色外框
  stars: number; // 已收集星星數
  total: number; // 本區星星總數
  label: string;
  onPress: () => void;
};

// 區域卡片：圖片填滿卡片，星星數量由程式疊在下方；未解鎖的區域蓋一層灰霧並顯示鎖頭。
export function ZoneCard({ world, name, width, unlocked, current, stars, total, label, onPress }: Props) {
  const height = width / ZONE_RATIO;
  const border = Math.max(3, Math.round(width * 0.018));
  const radius = width * 0.09;
  const ring = 5;
  const pillW = width * 0.62;
  const pillH = width * 0.17;
  const lockSize = width * 0.36;

  const borderColor = current ? candy.gold : unlocked ? candy.white : '#8FB7F5';

  // 圖片：由程式算出「填滿卡片」的寬高再指定給圖片，超出的部分被卡片裁掉。
  const innerW = width - border * 2;
  const innerH = height - border * 2;
  const src = world.image ? Image.resolveAssetSource(world.image) : undefined;
  let imgW = innerW;
  let imgH = innerH;
  if (src && src.width && src.height) {
    const scale = Math.max(innerW / src.width, innerH / src.height);
    imgW = src.width * scale;
    imgH = src.height * scale;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label} ${world.index + 1} ${name}`}
      accessibilityState={{ disabled: !unlocked }}
      style={{ width, height }}>
      {current && (
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
            borderColor: 'rgba(255,200,61,0.55)',
          }}
        />
      )}

      <View
        style={{
          flex: 1,
          borderRadius: radius,
          borderWidth: border,
          borderColor,
          backgroundColor: world.cardColor,
          overflow: 'hidden',
        }}>
        {world.image ? (
          <View style={[StyleSheet.absoluteFill, styles.center]}>
            <Image source={world.image} style={{ width: imgW, height: imgH, resizeMode: 'stretch' }} />
          </View>
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.center]}>
            <Text
              allowFontScaling={false}
              style={{
                fontSize: width * 0.42,
                fontWeight: '900',
                color: 'rgba(255,255,255,0.92)',
                textShadowColor: candy.ink,
                textShadowOffset: { width: 0, height: 3 },
                textShadowRadius: 0,
                includeFontPadding: false,
              }}>
              {world.index + 1}
            </Text>
            <Text
              allowFontScaling={false}
              numberOfLines={1}
              style={{ fontSize: width * 0.11, fontWeight: '800', color: candy.white, marginTop: width * 0.04 }}>
              {name}
            </Text>
          </View>
        )}
        {!unlocked && (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(200,208,220,0.58)' }]} />
        )}
      </View>

      {!unlocked && (
        <View
          pointerEvents="none"
          style={{ position: 'absolute', left: (width - lockSize) / 2, top: height * 0.45 - lockSize * 0.58 }}>
          <LockIcon size={lockSize} variant="silver" />
        </View>
      )}

      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: (width - pillW) / 2,
          bottom: -pillH * 0.2,
          width: pillW,
          height: pillH,
          borderRadius: pillH * 0.38,
          borderWidth: Math.max(2, pillH * 0.07),
          borderColor: unlocked ? '#7A4318' : '#5C606A',
          backgroundColor: unlocked ? '#B36B2C' : '#8B8F99',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: pillH * 0.12,
        }}>
        <Text
          allowFontScaling={false}
          style={{ color: unlocked ? candy.gold : '#D5D8DE', fontSize: pillH * 0.66, includeFontPadding: false }}>
          ★
        </Text>
        <Text
          allowFontScaling={false}
          style={{ color: candy.white, fontSize: pillH * 0.5, fontWeight: '900', includeFontPadding: false }}>
          {stars} / {total}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
});
