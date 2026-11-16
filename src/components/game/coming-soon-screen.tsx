import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from './app-text';
import { strings } from '../../i18n';
import { candy } from '../../theme/candy';
import { CandyButton } from './candy-button';

type Props = {
  title: string;
  message?: string; // 預設為「這個畫面還在準備中」
  children?: ReactNode; // 暫時的測試按鈕，每個請用 ComingSoonSlot 包起來
};

// 按鈕外框：讓按鈕有固定的最小寬度，方便排成兩欄
export function ComingSoonSlot({ children }: { children: ReactNode }) {
  return <View style={styles.slot}>{children}</View>;
}

// 尚未製作的畫面暫用，讓導覽流程可以先走通。
export function ComingSoonScreen({ title, message, children }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message ?? strings.common.comingSoon}</Text>
      <View style={styles.buttons}>
        {children}
        <ComingSoonSlot>
          <CandyButton label={strings.common.back} variant="secondary" onPress={() => router.back()} />
        </ComingSoonSlot>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: candy.screenBg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  title: { fontSize: 32, fontWeight: '800', color: candy.white },
  message: { fontSize: 18, color: candy.white },
  buttons: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    maxWidth: 560,
  },
  slot: { minWidth: 170 },
});
