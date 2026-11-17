import { useRouter } from 'expo-router';
import {
  Image,
  StatusBar,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useMusic } from '../audio/use-music';
import { CandyButton } from '../components/game/candy-button';
import { strings } from '../i18n';

// 三層結構：背景層（純背景）→ 標題 logo 層（透明 PNG）→ 按鈕層（程式繪製，文字來自語系檔）
const background = require('../../assets/images/home/welcome-bg-clean.png');
const titleLogo = require('../../assets/images/home/title-logo.png');

const bgSize = Image.resolveAssetSource(background);
const logoSize = Image.resolveAssetSource(titleLogo);
const logoRatio = logoSize.width / logoSize.height;

export default function WelcomeScreen() {
  const router = useRouter();
  useMusic('welcome');
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  // 背景主體在左右兩側，標題與按鈕放在中央欄，避開主體。
  const columnWidth = Math.min(width * 0.44, 520);
  const bgScale = Math.max(width / bgSize.width, height / bgSize.height);

  return (
    <View style={styles.root}>
      {/* 背景：等比例放大到填滿畫面，多出的邊緣置中裁切 */}
      <Image
        source={background}
        style={{
          position: 'absolute',
          left: (width - bgSize.width * bgScale) / 2,
          top: (height - bgSize.height * bgScale) / 2,
          width: bgSize.width * bgScale,
          height: bgSize.height * bgScale,
        }}
      />
      <StatusBar hidden />
      <View
        style={[
          styles.center,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
          },
        ]}>
        <View style={{ width: columnWidth, alignItems: 'center', gap: 20 }}>
          <Image
            source={titleLogo}
            resizeMode="contain"
            accessibilityRole="image"
            accessibilityLabel={strings.welcome.logoLabel}
            style={{ width: '100%', aspectRatio: logoRatio, maxHeight: height * 0.42 }}
          />
          <View style={styles.buttonRow}>
            <View style={styles.primarySlot}>
              <CandyButton label={strings.welcome.start} onPress={() => router.push('/worlds')} />
            </View>
            <View style={styles.secondarySlot}>
              <CandyButton
                variant="secondary"
                label={strings.welcome.settings}
                onPress={() => router.push('/settings')}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  buttonRow: { flexDirection: 'row', width: '100%', gap: 12, alignItems: 'flex-start' },
  primarySlot: { flex: 3 },
  secondarySlot: { flex: 2 },
});
