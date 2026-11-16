import { View } from 'react-native';

import { Text } from './app-text';
import { candy } from '../../theme/candy';
import { OutlinedStar } from './outlined-star';

type Props = {
  stars: number;
  total: number;
  height: number; // 整條的高度
  barWidth: number; // 進度條寬度
};

// 星星進度：★ + 橫向進度條 + 「已收集 / 總數」
export function StarProgress({ stars, total, height, barWidth }: Props) {
  const ratio = total > 0 ? Math.min(1, stars / total) : 0;
  const barH = Math.max(10, height * 0.3);
  const font = height * 0.46;

  return (
    <View
      accessible
      accessibilityLabel={`${stars} / ${total}`}
      style={{
        height,
        paddingHorizontal: height * 0.3,
        borderRadius: height / 2,
        backgroundColor: 'rgba(75,42,123,0.62)',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.85)',
        flexDirection: 'row',
        alignItems: 'center',
        gap: height * 0.02,
      }}>
      <OutlinedStar size={height * 0.62} face={candy.star} outline={candy.starOutline} />
      <View
        style={{
          width: barWidth,
          height: barH,
          borderRadius: barH / 2,
          backgroundColor: 'rgba(0,0,0,0.4)',
          overflow: 'hidden',
        }}>
        <View style={{ width: barWidth * ratio, height: '100%', borderRadius: barH / 2, backgroundColor: candy.star }} />
      </View>
      <Text allowFontScaling={false} style={{ fontSize: font, fontWeight: '900', color: candy.white, includeFontPadding: false }}>
        {stars} / {total}
      </Text>
    </View>
  );
}
