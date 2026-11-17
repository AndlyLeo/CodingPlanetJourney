import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
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

// 按鈕外框：讓按鈕有固定的最小寬度，方便排成多欄
export function ComingSoonSlot({ children }: { children: ReactNode }) {
  return <View style={styles.slot}>{children}</View>;
}

// 尚未製作的畫面暫用，讓導覽流程可以先走通。內容太多時可以上下捲動。
export function ComingSoonScreen({ title, message, children }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 12,
          paddingLeft: insets.left + 12,
          paddingRight: insets.right + 12,
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: candy.screenBg },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  title: { fontSize: 32, fontWeight: '800', color: candy.white },
  message: { fontSize: 18, color: candy.white, textAlign: 'center' },
  buttons: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    maxWidth: 640,
  },
  slot: { minWidth: 150 },
});
