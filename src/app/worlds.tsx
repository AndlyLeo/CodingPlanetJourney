import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useMusic } from '../audio/use-music';
import { Text } from '../components/game/app-text';
import { BackIconButton } from '../components/game/back-icon-button';
import { ChevronButton } from '../components/game/chevron-button';
import { ZONE_RATIO, ZoneCard } from '../components/game/zone-card';
import { STARS_PER_WORLD, isWorldUnlocked, worlds } from '../data/worlds';
import { strings } from '../i18n';
import { loadUnlockedWorldCount, loadWorldStars } from '../storage/progress-storage';
import { candy } from '../theme/candy';

const background = require('../../assets/images/worlds/world-select-bg.png');
const bgSize = Image.resolveAssetSource(background);

const LOCK_NOTICE_MS = 1500; // 「尚未解鎖」提示的顯示時間
const EDGE = 4; // 判斷是否已到最左／最右的容許值（dp）

export default function WorldsScreen() {
  const router = useRouter();
  useMusic('map');
  const insets = useSafeAreaInsets();
  const { width: W, height: H } = useWindowDimensions();

  const [unlockedCount, setUnlockedCount] = useState(1);
  const [stars, setStars] = useState<number[]>(() => Array(worlds.length).fill(0));
  const [loaded, setLoaded] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  const scrollRef = useRef<ScrollView>(null);
  const xRef = useRef(0);
  const contentWRef = useRef(0);
  const initDone = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 每次回到這個畫面都重新讀取解鎖進度與星星數
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      Promise.all([loadUnlockedWorldCount(), loadWorldStars()]).then(([count, s]) => {
        if (!alive) return;
        setUnlockedCount(count);
        setStars(s);
        setLoaded(true);
      });
      return () => {
        alive = false;
      };
    }, []),
  );

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  // 卡片大小：一個畫面約顯示 3 張多一點（露出下一張提示可以滑動），高度不超過畫面的 72%
  const cardW = Math.min(W / 3.5, H * 0.72 * ZONE_RATIO);
  const cardH = cardW / ZONE_RATIO;
  const gap = cardW * 0.14;
  const interval = cardW + gap;
  const sidePad = Math.max(insets.left, insets.right) + Math.max(56, W * 0.07); // 兩側留給箭頭
  const arrowSize = Math.min(64, Math.max(44, cardW * 0.3));

  // 第一次進入：自動停在最新解鎖的區域
  useEffect(() => {
    if (!loaded || !contentReady || initDone.current) return;
    initDone.current = true;
    const maxX = Math.max(0, contentWRef.current - W);
    const x = Math.min((unlockedCount - 1) * interval, maxX);
    scrollRef.current?.scrollTo({ x, animated: false });
    xRef.current = x;
    setCanLeft(x > EDGE);
    setCanRight(x < maxX - EDGE);
  }, [loaded, contentReady, unlockedCount, interval, W]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    xRef.current = contentOffset.x;
    setCanLeft(contentOffset.x > EDGE);
    setCanRight(contentOffset.x < contentSize.width - layoutMeasurement.width - EDGE);
  };

  // 箭頭：一次移動兩張卡片，並對齊到卡片位置
  const scrollBy = (dir: 1 | -1) => {
    const maxX = Math.max(0, contentWRef.current - W);
    const target = Math.round(xRef.current / interval) * interval + dir * interval * 2;
    scrollRef.current?.scrollTo({ x: Math.min(maxX, Math.max(0, target)), animated: true });
  };

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const onPressWorld = (index: number) => {
    if (!isWorldUnlocked(index, unlockedCount)) {
      if (timer.current) clearTimeout(timer.current);
      setNotice(strings.worlds.locked);
      timer.current = setTimeout(() => setNotice(null), LOCK_NOTICE_MS);
      return;
    }
    router.push(`/world/${worlds[index].id}`);
  };

  const arrowTop = H * 0.47 - arrowSize / 2;
  const bgScale = Math.max(W / bgSize.width, H / bgSize.height); // 填滿畫面，多出的邊緣置中裁切

  return (
    <View style={styles.root}>
      <StatusBar hidden />
      <Image
        source={background}
        style={{
          position: 'absolute',
          left: (W - bgSize.width * bgScale) / 2,
          top: (H - bgSize.height * bgScale) / 2,
          width: bgSize.width * bgScale,
          height: bgSize.height * bgScale,
        }}
      />

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={interval}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        scrollEventThrottle={16}
        onScroll={onScroll}
        onContentSizeChange={(w) => {
          contentWRef.current = w;
          setContentReady(true);
        }}
        style={StyleSheet.absoluteFill}
        contentContainerStyle={{
          height: H,
          alignItems: 'center',
          paddingHorizontal: sidePad,
          paddingBottom: H * 0.06,
          columnGap: gap,
        }}>
        {worlds.map((w) => (
          <ZoneCard
            key={w.id}
            world={w}
            name={strings.worlds.regionNames[w.index]}
            width={cardW}
            unlocked={isWorldUnlocked(w.index, unlockedCount)}
            current={w.index === unlockedCount - 1}
            stars={stars[w.index] ?? 0}
            total={STARS_PER_WORLD}
            label={strings.worlds.itemPrefix}
            onPress={() => onPressWorld(w.index)}
          />
        ))}
      </ScrollView>

      {canLeft && (
        <View style={{ position: 'absolute', left: insets.left + 6, top: arrowTop }}>
          <ChevronButton direction="left" size={arrowSize} accessibilityLabel="‹" onPress={() => scrollBy(-1)} />
        </View>
      )}
      {canRight && (
        <View style={{ position: 'absolute', right: insets.right + 6, top: arrowTop }}>
          <ChevronButton direction="right" size={arrowSize} accessibilityLabel="›" onPress={() => scrollBy(1)} />
        </View>
      )}

      <View style={{ position: 'absolute', left: insets.left + 12, top: insets.top + 10 }}>
        <BackIconButton size={48} accessibilityLabel={strings.common.back} onPress={goBack} />
      </View>

      {notice && (
        <View pointerEvents="none" style={styles.noticeWrap}>
          <View style={styles.notice}>
            <Text allowFontScaling={false} style={styles.noticeText}>
              {notice}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#8FD4F8', overflow: 'hidden' },
  noticeWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notice: {
    backgroundColor: 'rgba(75,42,123,0.94)',
    borderColor: candy.white,
    borderWidth: 3,
    borderRadius: 28,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  noticeText: { color: candy.white, fontSize: 26, fontWeight: '800' },
});
