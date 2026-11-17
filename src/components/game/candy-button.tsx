import { Pressable, StyleSheet, View } from 'react-native';

import { playSfx } from '../../audio/sound';
import { Text } from './app-text';
import { candy } from '../../theme/candy';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  accessibilityLabel?: string;
};

// 卡通立體按鈕：按下時按鈕面下沉，底部厚度縮小，整體高度不變，不會讓版面跳動。
export function CandyButton({ label, onPress, variant = 'primary', accessibilityLabel }: Props) {
  const colors = variant === 'primary' ? candy.primary : candy.secondary;
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      onPress={() => {
        playSfx('tap');
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: colors.edge,
          paddingBottom: pressed ? 2 : 6,
          marginTop: pressed ? 4 : 0,
        },
      ]}>
      <View style={[styles.face, { backgroundColor: colors.face }]}>
        <Text
          numberOfLines={1}
          style={[styles.label, isPrimary ? styles.labelPrimary : styles.labelSecondary]}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 32,
  },
  face: {
    minHeight: 56, // 兒童手指好點擊的最小高度
    borderRadius: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 22,
    fontWeight: '800',
  },
  labelPrimary: {
    color: candy.white,
    textShadowColor: candy.ink,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 0,
  },
  labelSecondary: {
    color: candy.ink,
  },
});
