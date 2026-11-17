import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  type ImageSourcePropType,
  Pressable,
  StatusBar,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useMusic } from '../../../audio/use-music';
import { Text } from '../app-text';
import { speak, stopSpeaking } from '../../../audio/speech';
import { playSfx } from '../../../audio/sound';
import { characters } from '../../../data/characters';
import {
  type Command,
  type LevelDef,
  type Outcome,
  parseLevel,
  presetValues,
  simulate,
  starsFor,
  usedBlocks,
} from '../../../game/engine';
import { strings } from '../../../i18n';
import { loadSelectedCharacterId } from '../../../storage/character-storage';
import { recordLevelResult } from '../../../storage/progress-storage';
import { hasSeenHowTo, loadVoiceEnabled, markHowToSeen } from '../../../storage/settings-storage';
import { candy } from '../../../theme/candy';
import { BackIconButton } from '../back-icon-button';
import { CandyButton } from '../candy-button';
import { OutlinedStar } from '../outlined-star';
import { BoardView } from './board-view';
import { CommandBlock } from './command-block';
import { HeroView } from './hero-view';
import { PaletteBlock } from './palette-block';
import { SpeakerIcon } from './speaker-icon';
import { ProgramView } from './program-view';

const background = require('../../../../assets/images/worlds/world-select-bg.png');
const bgSize = Image.resolveAssetSource(background);

const MARGIN = 12;
const STEP_MS = 420; // 角色走一格的時間
const TURN_MS = 320; // 轉彎的停留時間
const FAIL_MS = 1500; // 失敗提示顯示的時間
const MAX_LEVEL = 12;

type Phase = 'edit' | 'running' | 'won';
type Rect = { x: number; y: number; w: number; h: number };

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export function LevelScreen({ worldId, level, def }: { worldId: string; level: number; def: LevelDef }) {
  const router = useRouter();
  useMusic('level');
  const insets = useSafeAreaInsets();
  const { width: W, height: H } = useWindowDimensions();

  const parsed = useMemo(() => parseLevel(def), [def]);
  const text = strings.worldLevels[worldId as '01']?.[level - 1];
  const storyLine = text ? `${strings.game.levelLabel(level)}，${text.title}。${text.story}` : '';

  const [values, setValues] = useState<(Command | null)[]>(() => presetValues(def));
  const [phase, setPhase] = useState<Phase>('edit');
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [collected, setCollected] = useState<number[]>([]);
  const [heroDir, setHeroDir] = useState<0 | 1 | 2 | 3>(def.startDir);
  const [facing, setFacing] = useState<1 | -1>(1);
  const [charImage, setCharImage] = useState<ImageSourcePropType | undefined>();
  const [notice, setNotice] = useState<string | null>(null);
  const [hintOpen, setHintOpen] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true); // 設定中是否開啟語音說明（預設開啟）
  const [hintRevealed, setHintRevealed] = useState(false); // 是否已看了「這一關的提示」
  const [hintUsed, setHintUsed] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);
  const [dragging, setDragging] = useState<Command | null>(null);

  const mountedRef = useRef(true);
  const phaseRef = useRef<Phase>('edit');
  const valuesRef = useRef(values);
  const slotRefs = useRef<(View | null)[]>([]);
  const rootRef = useRef<View>(null);
  const origin = useRef({ x: 0, y: 0 });
  const ghost = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const pos = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const shake = useRef(new Animated.Value(0)).current;

  phaseRef.current = phase;
  valuesRef.current = values;

  useEffect(() => {
    mountedRef.current = true;
    loadSelectedCharacterId().then((id) => {
      if (mountedRef.current) setCharImage(characters.find((c) => c.id === id)?.image);
    });
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // 進入關卡時唸出關卡說明；第一次進入第 1 關時，自動打開玩法說明並一起唸出來
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [seen, voice] = await Promise.all([
        level === 1 ? hasSeenHowTo() : Promise.resolve(true),
        loadVoiceEnabled(),
      ]);
      if (cancelled) return;
      setVoiceOn(voice);
      if (!seen) {
        setHintOpen(true);
        markHowToSeen();
        speak(`${storyLine} ${strings.game.howTo.join(' ')}`);
      } else {
        speak(storyLine);
      }
    })();
    return () => {
      cancelled = true;
      stopSpeaking();
    };
  }, []);

  // ---------- 版面尺寸 ----------
  // 左右、上下各自取兩側安全區較大的一邊，讓內容在畫面上左右對稱、上下對稱（置中）。
  // （手機常見：一側有鏡頭挖孔、下方有手勢列，只算單邊會讓畫面偏向一邊）
  const edgeX = Math.max(insets.left, insets.right) + MARGIN;
  const edgeV = Math.max(insets.top, insets.bottom) + 8;
  const topBarH = Math.round(Math.min(104, Math.max(64, H * 0.19)));
  const contentW = W - edgeX * 2;
  const contentH = H - edgeV * 2 - topBarH;
  const boardCol = contentW * 0.47;
  const cell = Math.floor(Math.min(boardCol / def.cols, contentH / def.rows, H * 0.2));
  const rightW = contentW - boardCol - MARGIN;
  const slotSize = Math.round(Math.min(58, Math.max(38, (rightW - 24) / 7.6)));
  const palSize = Math.round(Math.min(86, Math.max(58, slotSize * 1.35)));
  const backSize = Math.round(Math.min(56, Math.max(44, topBarH * 0.7)));
  const titleFont = Math.round(topBarH * 0.3);
  const storyFont = Math.round(topBarH * 0.21);

  // 角色回到起點
  const resetHero = () => {
    pos.setValue({ x: parsed.start.col * cell, y: parsed.start.row * cell });
    setHeroDir(def.startDir);
    setFacing(1);
    setCollected([]);
    setActiveSlot(null);
  };

  useEffect(() => {
    resetHero();
  }, [cell]);

  // ---------- 拖曳 ----------
  const measureSlot = (view: View | null) =>
    new Promise<Rect | null>((resolve) => {
      if (!view) return resolve(null);
      view.measure((_x, _y, w, h, pageX, pageY) => resolve({ x: pageX, y: pageY, w, h }));
    });

  const placeBlock = (index: number, cmd: Command) => {
    setValues((prev) => {
      const next = [...prev];
      next[index] = cmd;
      return next;
    });
    playSfx('drop');
  };

  const onDragStart = (cmd: Command, pageX: number, pageY: number) => {
    if (phaseRef.current !== 'edit') return;
    ghost.setValue({ x: pageX - origin.current.x - palSize / 2, y: pageY - origin.current.y - palSize / 2 });
    setDragging(cmd);
  };

  const onDragMove = (pageX: number, pageY: number) => {
    ghost.setValue({ x: pageX - origin.current.x - palSize / 2, y: pageY - origin.current.y - palSize / 2 });
  };

  const onDragEnd = async (cmd: Command, pageX: number, pageY: number, moved: boolean) => {
    setDragging(null);
    if (phaseRef.current !== 'edit') return;

    // 輕點：放到第一個空格
    if (!moved) {
      const empty = valuesRef.current.findIndex((v) => v === null);
      if (empty >= 0) placeBlock(empty, cmd);
      return;
    }

    // 拖曳：放到手指放開位置最近的格子
    const rects = await Promise.all(slotRefs.current.slice(0, values.length).map(measureSlot));
    const tolerance = 12;
    let best = -1;
    let bestDist = Infinity;
    rects.forEach((r, i) => {
      if (!r) return;
      const inside =
        pageX >= r.x - tolerance && pageX <= r.x + r.w + tolerance && pageY >= r.y - tolerance && pageY <= r.y + r.h + tolerance;
      if (!inside) return;
      const dist = Math.hypot(pageX - (r.x + r.w / 2), pageY - (r.y + r.h / 2));
      if (dist < bestDist) {
        best = i;
        bestDist = dist;
      }
    });
    if (best >= 0 && phaseRef.current === 'edit') placeBlock(best, cmd);
  };

  const clearSlot = (index: number) => {
    if (phaseRef.current !== 'edit') return;
    setValues((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    playSfx('tap');
  };

  // ---------- 執行 ----------
  const animateTo = (row: number, col: number) =>
    new Promise<void>((resolve) => {
      Animated.timing(pos, {
        toValue: { x: col * cell, y: row * cell },
        duration: STEP_MS,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }).start(() => resolve());
    });

  const shakeHero = () =>
    new Promise<void>((resolve) => {
      const t = (v: number) => Animated.timing(shake, { toValue: v, duration: 60, useNativeDriver: true });
      Animated.sequence([t(cell * 0.12), t(-cell * 0.12), t(cell * 0.08), t(0)]).start(() => resolve());
    });

  const showNotice = async (outcome: Exclude<Outcome, 'win'>) => {
    setNotice(strings.game.fail[outcome]);
    speak(strings.game.fail[outcome]);
    await sleep(FAIL_MS);
    if (mountedRef.current) setNotice(null);
  };

  const run = async () => {
    if (phaseRef.current !== 'edit') return;
    const sim = simulate(def, values, parsed);
    if (sim.outcome === 'empty') {
      showNotice('empty');
      return;
    }

    setPhase('running');
    phaseRef.current = 'running';
    setHintOpen(false);
    stopSpeaking();
    resetHero();
    await sleep(250);

    let gemCount = 0;
    for (const f of sim.frames) {
      if (!mountedRef.current) return;
      setActiveSlot(f.slot);
      setHeroDir(f.dir);
      if (f.dir === 1) setFacing(1);
      else if (f.dir === 3) setFacing(-1);

      if (f.cmd === 'forward') {
        if (f.bumped) {
          playSfx('bump');
          await shakeHero();
          break;
        }
        await animateTo(f.row, f.col);
        setCollected(f.collected);
        if (f.collected.length > gemCount) {
          gemCount = f.collected.length;
          playSfx('gem');
        }
      } else {
        await sleep(TURN_MS);
      }
      await sleep(60);
    }
    if (!mountedRef.current) return;
    setActiveSlot(null);

    if (sim.outcome === 'win') {
      const stars = starsFor(def, usedBlocks(values), hintUsed);
      setEarnedStars(stars);
      try {
        await recordLevelResult(worldId, level, stars);
      } catch {
        // 儲存失敗時仍讓小朋友看到過關畫面
      }
      if (!mountedRef.current) return;
      playSfx('win');
      speak(strings.game.winSpoken(stars));
      setPhase('won');
      return;
    }

    playSfx('fail');
    await showNotice(sim.outcome);
    if (!mountedRef.current) return;
    resetHero();
    setPhase('edit');
  };

  const resetAll = () => {
    if (phaseRef.current === 'running') return;
    setValues(presetValues(def));
    resetHero();
    setPhase('edit');
  };

  // 打開提示視窗：先顯示「玩法說明」（不影響星星）；
  // 要再按「看這一關的提示」才會看到關卡提示，這時最多只能得 2 顆星。
  const closeHint = () => {
    setHintOpen(false);
    stopSpeaking();
  };

  const toggleHint = () => {
    playSfx('tap');
    if (hintOpen) {
      closeHint();
    } else {
      setHintOpen(true);
      speak(`${strings.game.howTo.join(' ')} ${strings.game.hintWarning}`);
    }
  };

  const revealHint = () => {
    playSfx('tap');
    setHintRevealed(true);
    setHintUsed(true);
    speak(text?.hint ?? '');
  };

  const listenAgain = () => {
    playSfx('tap');
    speak(storyLine);
  };

  // ---------- 過關後 ----------
  const goMap = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/worlds');
  };
  const goNext = () => {
    if (level >= MAX_LEVEL) goMap();
    else router.replace(`/level/${worldId}-${level + 1}`);
  };
  const playAgain = () => {
    setValues(presetValues(def));
    resetHero();
    setHintUsed(false);
    setHintRevealed(false);
    setPhase('edit');
  };

  // ---------- 畫面 ----------
  const bgScale = Math.max(W / bgSize.width, H / bgSize.height);
  const running = phase === 'running';

  return (
    <View
      ref={rootRef}
      collapsable={false}
      onLayout={() => {
        rootRef.current?.measure((_x, _y, _w, _h, pageX, pageY) => {
          origin.current = { x: pageX, y: pageY };
        });
      }}
      style={styles.root}>
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

      {/* 上方：返回、關卡名稱與說明、提示 */}
      <View
        style={{
          position: 'absolute',
          left: edgeX,
          right: edgeX,
          top: edgeV,
          height: topBarH,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}>
        <BackIconButton size={backSize} accessibilityLabel={strings.common.back} onPress={goMap} />
        <View style={styles.titleBox}>
          <Text allowFontScaling={false} numberOfLines={1} style={[styles.title, { fontSize: titleFont }]}>
            {strings.game.levelLabel(level)}　{text?.title}
          </Text>
          <Text allowFontScaling={false} numberOfLines={2} style={[styles.story, { fontSize: storyFont }]}>
            {text?.story}
          </Text>
        </View>
        {voiceOn && (
          <Pressable
            onPress={listenAgain}
            accessibilityRole="button"
            accessibilityLabel={strings.game.listen}
            style={[
              styles.hintBtn,
              {
                width: Math.round(topBarH * 0.62),
                height: Math.round(topBarH * 0.62),
                borderRadius: topBarH * 0.31,
                minWidth: 0,
                paddingHorizontal: 0,
              },
            ]}>
            <SpeakerIcon size={Math.round(topBarH * 0.4)} color={candy.ink} />
          </Pressable>
        )}
        <Pressable
          onPress={toggleHint}
          accessibilityRole="button"
          accessibilityLabel={strings.game.hint}
          style={[styles.hintBtn, { height: Math.round(topBarH * 0.62), borderRadius: topBarH * 0.31 }]}>
          <Text allowFontScaling={false} style={[styles.hintText, { fontSize: Math.round(topBarH * 0.28) }]}>
            {strings.game.hint}
          </Text>
          <View
            pointerEvents="none"
            style={[
              styles.hintBadge,
              { width: topBarH * 0.3, height: topBarH * 0.3, borderRadius: topBarH * 0.15, top: -topBarH * 0.1, right: -topBarH * 0.1 },
            ]}>
            <Text allowFontScaling={false} style={[styles.warnBang, { fontSize: topBarH * 0.22 }]}>
              !
            </Text>
          </View>
        </Pressable>
      </View>

      <View
        style={{
          position: 'absolute',
          left: edgeX,
          right: edgeX,
          top: edgeV + topBarH,
          bottom: edgeV,
          flexDirection: 'row',
          gap: MARGIN,
        }}>
        {/* 左：棋盤 */}
        <View style={{ width: boardCol, alignItems: 'center', justifyContent: 'center' }}>
          <BoardView level={def} parsed={parsed} cell={cell} collected={collected}>
            <HeroView cell={cell} image={charImage} pos={pos} shake={shake} dir={heroDir} facing={facing} />
          </BoardView>
        </View>

        {/* 右：程式區、指令區、按鈕 */}
        <View style={{ flex: 1, gap: 8 }}>
          <View style={[styles.card, { flex: 1 }]}>
            <ProgramView
              layout={def.layout}
              values={values}
              size={slotSize}
              activeSlot={activeSlot}
              editable={!running}
              slotRefs={slotRefs}
              onClear={clearSlot}
            />
          </View>

          <View style={[styles.card, { flexDirection: 'row', justifyContent: 'center', gap: 14 }]}>
            {def.allowed.map((cmd) => (
              <PaletteBlock
                key={cmd}
                cmd={cmd}
                size={palSize}
                label={strings.game.commands[cmd]}
                disabled={phase !== 'edit'}
                onDragStart={onDragStart}
                onDragMove={onDragMove}
                onDragEnd={onDragEnd}
                onDragCancel={() => setDragging(null)}
              />
            ))}
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 3 }}>
              <CandyButton label={strings.game.run} onPress={run} />
            </View>
            <View style={{ flex: 2 }}>
              <CandyButton label={strings.game.reset} variant="secondary" onPress={resetAll} />
            </View>
          </View>
        </View>
      </View>

      {hintOpen && (
        <View style={[styles.hint, { top: edgeV + topBarH + 4, right: edgeX }]}>
          <Text allowFontScaling={false} style={[styles.hintHeading, { fontSize: storyFont + 1 }]}>
            {strings.game.howToTitle}
          </Text>
          {strings.game.howTo.map((line, i) => (
            <Text key={i} allowFontScaling={false} style={[styles.hintBubbleText, { fontSize: storyFont + 1 }]}>
              {line}
            </Text>
          ))}
          {hintRevealed ? (
            <Text allowFontScaling={false} style={[styles.hintLevelText, { fontSize: storyFont + 1 }]}>
              {text?.hint}
            </Text>
          ) : (
            <>
              <Pressable onPress={revealHint} accessibilityRole="button" style={styles.showHintBtn}>
                <Text allowFontScaling={false} style={[styles.showHintText, { fontSize: storyFont }]}>
                  {strings.game.showHint}
                </Text>
              </Pressable>
              <View style={styles.warnRow}>
                <View
                  style={[
                    styles.warnBadge,
                    { width: storyFont * 1.5, height: storyFont * 1.5, borderRadius: storyFont * 0.75 },
                  ]}>
                  <Text allowFontScaling={false} style={[styles.warnBang, { fontSize: storyFont * 1.1 }]}>
                    !
                  </Text>
                </View>
                <Text allowFontScaling={false} style={[styles.hintWarning, { fontSize: storyFont, flex: 1 }]}>
                  {strings.game.hintWarning}
                </Text>
              </View>
            </>
          )}
          <Pressable onPress={closeHint} accessibilityRole="button" style={styles.gotItBtn}>
            <Text allowFontScaling={false} style={[styles.showHintText, { fontSize: storyFont }]}>
              {strings.game.gotIt}
            </Text>
          </Pressable>
        </View>
      )}

      {/* 拖曳中的方塊 */}
      {dragging && (
        <Animated.View
          pointerEvents="none"
          style={{ position: 'absolute', left: 0, top: 0, opacity: 0.92, transform: ghost.getTranslateTransform() }}>
          <CommandBlock cmd={dragging} size={palSize} />
        </Animated.View>
      )}

      {notice && (
        <View pointerEvents="none" style={styles.noticeWrap}>
          <View style={styles.notice}>
            <Text allowFontScaling={false} style={styles.noticeText}>
              {notice}
            </Text>
          </View>
        </View>
      )}

      {phase === 'won' && (
        <View style={styles.winWrap}>
          <View style={styles.winCard}>
            <Text allowFontScaling={false} style={styles.winTitle}>
              {strings.game.win}
            </Text>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              {[0, 1, 2].map((i) => (
                <OutlinedStar
                  key={i}
                  size={Math.min(56, H * 0.12)}
                  face={i < earnedStars ? candy.star : candy.starEmpty}
                  outline={i < earnedStars ? candy.starOutline : candy.starEmptyOutline}
                />
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 10, alignSelf: 'stretch' }}>
              <View style={{ flex: 1 }}>
                <CandyButton label={level >= MAX_LEVEL ? strings.game.toMap : strings.game.next} onPress={goNext} />
              </View>
              <View style={{ flex: 1 }}>
                <CandyButton label={strings.game.again} variant="secondary" onPress={playAgain} />
              </View>
            </View>
            {level < MAX_LEVEL && (
              <Pressable onPress={goMap} accessibilityRole="button" style={{ paddingVertical: 4 }}>
                <Text allowFontScaling={false} style={styles.mapLink}>
                  {strings.game.toMap}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#8FD4F8', overflow: 'hidden' },
  titleBox: {
    flex: 1,
    backgroundColor: 'rgba(75,42,123,0.72)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
    justifyContent: 'center',
  },
  title: { color: candy.gold, fontWeight: '900', includeFontPadding: false },
  story: { color: candy.white, fontWeight: '700', includeFontPadding: false },
  hintBtn: {
    minWidth: 64,
    paddingHorizontal: 14,
    backgroundColor: candy.secondary.face,
    borderBottomWidth: 4,
    borderBottomColor: candy.secondary.edge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintText: { color: candy.ink, fontWeight: '900', includeFontPadding: false },
  card: {
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.95)',
    padding: 8,
    overflow: 'hidden',
    alignItems: 'flex-start',
  },
  hint: {
    position: 'absolute',
    maxWidth: 380,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderColor: candy.ink,
    borderWidth: 3,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  hintHeading: { color: '#B35A00', fontWeight: '900', marginBottom: 2 },
  hintBubbleText: { color: candy.ink, fontWeight: '800', marginBottom: 2 },
  hintLevelText: {
    color: candy.ink,
    fontWeight: '800',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 2,
    borderTopColor: 'rgba(75,42,123,0.25)',
  },
  showHintBtn: {
    marginTop: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: candy.secondary.face,
    borderBottomWidth: 3,
    borderBottomColor: candy.secondary.edge,
  },
  showHintText: { color: candy.ink, fontWeight: '900' },
  hintWarning: { color: '#C2410C', fontWeight: '800' },
  warnRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  warnBadge: { backgroundColor: '#E11D1D', alignItems: 'center', justifyContent: 'center' },
  hintBadge: {
    position: 'absolute',
    backgroundColor: '#E11D1D',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  warnBang: { color: '#FFFFFF', fontWeight: '900', includeFontPadding: false },
  gotItBtn: {
    marginTop: 8,
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#DDEBFF',
    borderBottomWidth: 3,
    borderBottomColor: '#9BBCEB',
  },
  noticeWrap: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  notice: {
    backgroundColor: 'rgba(75,42,123,0.94)',
    borderColor: candy.white,
    borderWidth: 3,
    borderRadius: 28,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  noticeText: { color: candy.white, fontSize: 24, fontWeight: '800' },
  winWrap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  winCard: {
    width: 340,
    maxWidth: '86%',
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 28,
    borderWidth: 4,
    borderColor: candy.gold,
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 10,
  },
  winTitle: { color: candy.ink, fontSize: 30, fontWeight: '900', includeFontPadding: false },
  mapLink: { color: candy.ink, fontSize: 15, fontWeight: '800', textDecorationLine: 'underline' },
});
