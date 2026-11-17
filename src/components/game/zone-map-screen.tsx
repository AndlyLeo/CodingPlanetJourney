import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  type ImageSourcePropType,
  StatusBar,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useMusic } from '../../audio/use-music';
import { Text } from './app-text';
import { characters } from '../../data/characters';
import { getLevelStates } from '../../data/levels';
import { type WorldMapDef, worldMaps } from '../../data/world-maps';
import { LEVELS_PER_WORLD, STARS_PER_WORLD } from '../../data/worlds';
import { strings } from '../../i18n';
import { loadSelectedCharacterId } from '../../storage/character-storage';
import { loadLevelStars } from '../../storage/progress-storage';
import { candy } from '../../theme/candy';
import { BackIconButton } from './back-icon-button';
import { GearButton } from './gear-button';
import { LevelNode } from './level-node';
import { StarProgress } from './star-progress';

const EDGE_MARGIN = 20; // 設定、返回按鈕距離螢幕邊緣至少 20dp
const STRETCH_LIMIT = 1.15; // 螢幕與地圖比例相差不超過 15% 時，拉伸填滿；超過則完整縮放並以模糊背景補滿
const NOTICE_MS = 1500;

// 角色（以地圖圖片像素為單位，實際大小乘上縮放比例）
const CHAR_HEIGHT = 120; // 角色高度
const CHAR_FOOT = 14; // 腳底在關卡圓心下方多少，讓角色站在關卡上
const SPEED = 240; // 移動速度（dp / 秒）
const ENTER_DELAY_MS = 2000; // 角色抵達被點選的關卡後，等待多久才進入關卡

export function ZoneMapScreen({ worldId }: { worldId: string }) {
  const map = worldMaps[worldId];
  return map ? <ZoneMap worldId={worldId} map={map} /> : null;
}

// 區域內部地圖：整張地圖完整顯示，不裁切。關卡、星星、進度、設定與返回按鈕、角色全部由程式繪製。
function ZoneMap({ worldId, map }: { worldId: string; map: WorldMapDef }) {
  const router = useRouter();
  useMusic('map');
  const insets = useSafeAreaInsets();
  const { width: W, height: H } = useWindowDimensions();

  const [levelStars, setLevelStars] = useState<number[]>(() => Array(LEVELS_PER_WORLD).fill(0));
  const [charImage, setCharImage] = useState<ImageSourcePropType | undefined>();
  const [loaded, setLoaded] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [facing, setFacing] = useState<1 | -1>(1); // 1 = 面向右（原圖方向），-1 = 左右鏡射
  const [placed, setPlaced] = useState(false);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pos = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const placedIdx = useRef<number | null>(null);
  const facingRef = useRef<1 | -1>(1);
  const busyRef = useRef(false); // 角色移動或等待進入關卡時，暫時不接受新的點選
  const mountedRef = useRef(true);
  const enterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointsRef = useRef<{ x: number; y: number }[]>([]);

  // 每次回到這個畫面都重新讀取關卡進度與目前選擇的角色
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      Promise.all([loadLevelStars(worldId), loadSelectedCharacterId()]).then(([stars, charId]) => {
        if (!alive) return;
        setLevelStars(stars);
        setCharImage(characters.find((c) => c.id === charId)?.image);
        setLoaded(true);
      });
      return () => {
        // 離開這個畫面（例如按了設定）時，取消尚未進行的「進入關卡」
        alive = false;
        if (enterTimer.current) clearTimeout(enterTimer.current);
        busyRef.current = false;
      };
    }, [worldId]),
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timer.current) clearTimeout(timer.current);
      if (enterTimer.current) clearTimeout(enterTimer.current);
    };
  }, []);

  // ---------- 版面 ----------
  const img = Image.resolveAssetSource(map.image);
  const fitX = W / img.width;
  const fitY = H / img.height;

  // 地圖的基本尺寸：等比例完整放進螢幕並置中。比例相近時再拉伸到填滿，不裁切任何內容。
  // 拉伸用 transform 完成，不依賴圖片的縮放模式設定。
  const base = Math.min(fitX, fitY);
  const stretch = Math.max(fitX, fitY) / base <= STRETCH_LIMIT;
  const kx = stretch ? fitX / base : 1;
  const ky = stretch ? fitY / base : 1;
  const sx = base * kx; // 地圖像素 → 螢幕 dp（水平）
  const sy = base * ky; // （垂直）
  const u = (sx + sy) / 2;
  const toX = (x: number) => W / 2 + (x - img.width / 2) * sx;
  const toY = (y: number) => H / 2 + (y - img.height / 2) * sy;
  const cover = Math.max(fitX, fitY);

  const states = getLevelStates(levelStars);
  const total = levelStars.reduce((a, b) => a + b, 0);

  // ---------- 角色移動 ----------
  // 角色預設站在「進行中」的關卡；12 關全部完成時停在最後一關。
  const currentIdx = states.indexOf('current');
  const targetIdx = Math.min(currentIdx >= 0 ? currentIdx : map.nodes.length - 1, map.nodes.length - 1);

  const points = map.nodes.map((n) => ({ x: toX(n.x), y: toY(n.y) }));
  pointsRef.current = points;
  const p0 = points[0];
  const charSrc = charImage ? Image.resolveAssetSource(charImage) : undefined;
  const charH = CHAR_HEIGHT * u;
  const charW = charSrc && charSrc.height ? charH * (charSrc.width / charSrc.height) : charH * 0.5;
  const foot = CHAR_FOOT * u;

  // 沿著相鄰關卡中心點的連線，一關一關移動到目標關卡（前進或退回都可以）。
  // 往 X- 方向（左）移動時，角色圖片左右鏡射。
  const moveTo = useCallback(
    async (target: number) => {
      const pts = pointsRef.current;
      const origin = pts[0];
      let from = placedIdx.current ?? target;
      const step = target > from ? 1 : -1;
      while (from !== target) {
        if (!mountedRef.current) return;
        const a = pts[from];
        const b = pts[from + step];
        if (b.x !== a.x) {
          const dir = b.x < a.x ? -1 : 1;
          facingRef.current = dir;
          setFacing(dir);
        }
        const dist = Math.hypot(b.x - a.x, b.y - a.y);
        await new Promise<void>((resolve) => {
          Animated.timing(pos, {
            toValue: { x: b.x - origin.x, y: b.y - origin.y },
            duration: Math.min(1400, Math.max(450, (dist / SPEED) * 1000)),
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }).start(() => resolve());
        });
        from += step;
        placedIdx.current = from;
      }
    },
    [pos],
  );

  // 進度改變（有關卡通過）時，角色移到新的進行中關卡。第一次顯示則直接站定，不做移動。
  useEffect(() => {
    if (!loaded || !charImage) return;
    const pts = pointsRef.current;
    const origin = pts[0];
    if (placedIdx.current === null) {
      pos.setValue({ x: pts[targetIdx].x - origin.x, y: pts[targetIdx].y - origin.y });
      placedIdx.current = targetIdx;
      setPlaced(true);
      return;
    }
    if (placedIdx.current === targetIdx || busyRef.current) return;
    busyRef.current = true;
    moveTo(targetIdx).finally(() => {
      busyRef.current = false;
    });
  }, [loaded, charImage, targetIdx]);

  // ---------- 操作 ----------
  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/worlds');
  };

  // 點選關卡：
  // - 尚未解鎖：顯示提示，角色不動。
  // - 已解鎖（包含已通關、可退回重玩）：角色先移動到該關卡，抵達後等待 2 秒再進入。
  const onPressLevel = (level: number) => {
    if (busyRef.current) return;
    const idx = level - 1;
    if (states[idx] === 'locked') {
      if (timer.current) clearTimeout(timer.current);
      setNotice(strings.worlds.locked);
      timer.current = setTimeout(() => setNotice(null), NOTICE_MS);
      return;
    }
    busyRef.current = true;
    (async () => {
      if (placedIdx.current !== null && placedIdx.current !== idx) await moveTo(idx);
      if (!mountedRef.current) return;
      enterTimer.current = setTimeout(() => {
        busyRef.current = false;
        router.push(`/level/${worldId}-${level}`);
      }, ENTER_DELAY_MS);
    })();
  };

  const marginTop = Math.max(EDGE_MARGIN, insets.top + 8);
  const marginRight = Math.max(EDGE_MARGIN, insets.right + 8);
  const marginBottom = Math.max(EDGE_MARGIN, insets.bottom + 8);
  const gearSize = Math.min(56, Math.max(46, H * 0.1));
  const backSize = Math.min(64, Math.max(52, H * 0.11));
  const barWidth = Math.min(200, Math.max(90, W * 0.14));

  return (
    <View style={styles.root}>
      <StatusBar hidden />

      {!stretch && (
        <Image
          source={map.image}
          blurRadius={14}
          style={{
            position: 'absolute',
            left: (W - img.width * cover) / 2,
            top: (H - img.height * cover) / 2,
            width: img.width * cover,
            height: img.height * cover,
          }}
        />
      )}

      <Image
        source={map.image}
        style={{
          position: 'absolute',
          left: (W - img.width * base) / 2,
          top: (H - img.height * base) / 2,
          width: img.width * base,
          height: img.height * base,
          transform: [{ scaleX: kx }, { scaleY: ky }],
        }}
      />

      {map.nodes.map((n) => (
        <LevelNode
          key={n.level}
          level={n.level}
          state={states[n.level - 1]}
          stars={levelStars[n.level - 1]}
          cx={toX(n.x)}
          cy={toY(n.y)}
          u={u}
          label={strings.worlds.levelTitle(n.level)}
          onPress={() => onPressLevel(n.level)}
        />
      ))}

      {charImage && (
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: p0.x - charW / 2,
            top: p0.y + foot - charH,
            width: charW,
            height: charH,
            opacity: placed ? 1 : 0,
            transform: [{ translateX: pos.x }, { translateY: pos.y }],
          }}>
          <Image
            source={charImage}
            style={{ width: charW, height: charH, transform: [{ scaleX: facing }] }}
          />
        </Animated.View>
      )}

      <View style={{ position: 'absolute', top: marginTop, right: marginRight, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <StarProgress stars={total} total={STARS_PER_WORLD} height={gearSize} barWidth={barWidth} />
        <GearButton size={gearSize} accessibilityLabel={strings.settings.title} onPress={() => router.push('/settings')} />
      </View>

      <View style={{ position: 'absolute', right: marginRight, bottom: marginBottom }}>
        <BackIconButton size={backSize} accessibilityLabel={strings.common.back} onPress={goBack} />
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
  root: { flex: 1, backgroundColor: '#5BA8E8', overflow: 'hidden' },
  noticeWrap: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
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
