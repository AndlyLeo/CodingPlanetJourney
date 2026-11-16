import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '../components/game/app-text';
import { BackIconButton } from '../components/game/back-icon-button';
import { CARD_RATIO, CharacterCard } from '../components/game/character-card';
import { DEFAULT_CHARACTER_ID, characters, isCharacterUnlocked } from '../data/characters';
import { strings } from '../i18n';
import { loadSelectedCharacterId, saveSelectedCharacterId } from '../storage/character-storage';
import { candy } from '../theme/candy';

const background = require('../../assets/images/characters/character-select-bg.png');
const bgSize = Image.resolveAssetSource(background);

// 以下數值依背景圖（1671 × 941）量出，單位是背景圖的像素。若日後更換背景圖，只需調整這裡。
const PANEL_CENTER_X = 207; // 左側面板中心 x
const PANEL_RIGHT = 380; // 左側面板右緣 x
const PANEL_INNER_W = 230; // 面板內可放文字的寬度
const TITLE_TOP = 215; // 標題文字區上緣 y（上方星星之下）
const TITLE_H = 470; // 標題文字區高度，上下置中於兩顆星星之間
const STAR_TOP = 105; // 上方星星上緣 y，返回按鈕放在它的上方空間
const STAR_SIZE = 85; // 上方星星大小，返回按鈕大小與它相近
const PANEL_BOTTOM = 772; // 面板（含下方星星）下緣 y，需要完整顯示

const COLUMNS = 3; // 3 欄 × 5 列，上下滑動瀏覽
const GAP_X = 0.22; // 欄距，相對於卡片寬度
const GAP_Y = 0.09; // 列距，相對於卡片高度
const ROWS_VISIBLE = 2.3; // 一個畫面約顯示 2 列多一點，露出第 3 列提示可以滑動
const RETURN_DELAY_MS = 2500; // 選擇角色後自動返回的時間
const LOCK_NOTICE_MS = 1500; // 「尚未解鎖」提示的顯示時間

export default function CharacterSelectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: W, height: H } = useWindowDimensions();

  const [selectedId, setSelectedId] = useState(DEFAULT_CHARACTER_ID);
  const [notice, setNotice] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const returning = useRef(false);

  useEffect(() => {
    let alive = true;
    loadSelectedCharacterId().then((id) => {
      if (alive) setSelectedId(id);
    });
    return () => {
      alive = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/settings');
  };

  const showNotice = (text: string, ms: number, after?: () => void) => {
    if (timer.current) clearTimeout(timer.current);
    setNotice(text);
    timer.current = setTimeout(() => {
      setNotice(null);
      after?.();
    }, ms);
  };

  const onPressCard = (id: string) => {
    if (returning.current) return;
    if (!isCharacterUnlocked(id)) {
      showNotice(strings.characters.locked, LOCK_NOTICE_MS);
      return;
    }
    returning.current = true;
    setSelectedId(id);
    saveSelectedCharacterId(id);
    showNotice(strings.characters.selected, RETURN_DELAY_MS, goBack);
  };

  // 背景：左側對齊、等比例填滿畫面（寬螢幕裁切上下，窄螢幕裁切右側），讓左側面板永遠完整可見。
  const sc = Math.max(W / bgSize.width, H / bgSize.height);
  const bgW = bgSize.width * sc;
  const bgH = bgSize.height * sc;
  // 上方空間（放返回按鈕）優先保留；只在需要時才往上移，讓面板下緣完整顯示。
  const bgTop = Math.min(0, Math.max(H - bgH, H - (PANEL_BOTTOM + 4) * sc));

  // 面板內：標題文字區（橫向書寫、自動換行並縮放）與返回按鈕
  const panelTextW = PANEL_INNER_W * sc;
  const panelLeft = PANEL_CENTER_X * sc - panelTextW / 2;
  // 返回按鈕：放在上方星星之上的空間，不壓住星星
  const starTopOnScreen = bgTop + STAR_TOP * sc;
  const backSize = Math.min(Math.max(STAR_SIZE * sc, 36), Math.max(32, starTopOnScreen - 6), 72);
  const backTop = Math.max(insets.top + 3, (starTopOnScreen - backSize) / 2);

  // 卡片格：放在面板右側，3 欄 × 5 列，超出畫面的部分上下滑動。
  const pad = 12;
  const gridLeftBound = Math.max(PANEL_RIGHT * sc + pad, insets.left + pad);
  const viewW = W - insets.right - gridLeftBound;
  const availW = viewW - pad * 2;
  const availH = H - insets.top - insets.bottom - pad * 2;
  const wByWidth = availW / (COLUMNS + (COLUMNS - 1) * GAP_X);
  const wByHeight = ((availH / ROWS_VISIBLE) * CARD_RATIO);
  const cardW = Math.min(wByWidth, wByHeight);
  const cardH = cardW / CARD_RATIO;
  // 明確分成一列一列，避免浮點誤差造成最後一欄被擠到下一列
  const cardRows: (typeof characters)[] = [];
  for (let i = 0; i < characters.length; i += COLUMNS) cardRows.push(characters.slice(i, i + COLUMNS));

  return (
    <View style={styles.root}>
      <StatusBar hidden />
      <Image
        source={background}
        style={{ position: 'absolute', left: 0, top: bgTop, width: bgW, height: bgH }}
      />

      <View
        style={{
          position: 'absolute',
          left: panelLeft,
          top: bgTop + TITLE_TOP * sc,
          width: panelTextW,
          height: TITLE_H * sc,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {strings.characters.titleVertical ? (
          // 直排：一字一行，字級依文字區高度與字數自動計算
          <View accessible accessibilityRole="header" accessibilityLabel={strings.characters.title}>
            {Array.from(strings.characters.title).map((ch, i, all) => {
              const line = (TITLE_H * sc) / all.length;
              return (
                <Text
                  key={i}
                  allowFontScaling={false}
                  style={{
                    textAlign: 'center',
                    fontSize: Math.min(line * 0.8, panelTextW * 0.7),
                    lineHeight: line,
                    fontWeight: '900',
                    color: candy.gold,
                    textShadowColor: candy.goldShadow,
                    textShadowOffset: { width: 0, height: 3 },
                    textShadowRadius: 0,
                    includeFontPadding: false,
                  }}>
                  {ch}
                </Text>
              );
            })}
          </View>
        ) : (
          // 橫向：自動換行（最多 3 行），太長時自動縮小字級
          <Text
            accessibilityRole="header"
            allowFontScaling={false}
            numberOfLines={3}
            adjustsFontSizeToFit
            minimumFontScale={0.4}
            style={{
              width: '100%',
              textAlign: 'center',
              fontSize: 104 * sc,
              fontWeight: '900',
              color: candy.gold,
              textShadowColor: candy.goldShadow,
              textShadowOffset: { width: 0, height: 3 },
              textShadowRadius: 0,
              includeFontPadding: false,
            }}>
            {strings.characters.title}
          </Text>
        )}
      </View>

      <View style={{ position: 'absolute', left: PANEL_CENTER_X * sc - backSize / 2, top: backTop }}>
        <BackIconButton
          size={backSize}
          accessibilityLabel={strings.common.back}
          onPress={goBack}
        />
      </View>

      <ScrollView
        style={{
          position: 'absolute',
          left: gridLeftBound,
          right: insets.right,
          top: insets.top,
          bottom: insets.bottom,
        }}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: pad,
          paddingHorizontal: pad,
        }}
        showsVerticalScrollIndicator={false}>
        <View style={{ rowGap: cardH * GAP_Y }}>
          {cardRows.map((row, r) => (
            <View key={r} style={{ flexDirection: 'row', columnGap: cardW * GAP_X }}>
              {row.map((c) => (
                <CharacterCard
                  key={c.id}
                  character={c}
                  width={cardW}
                  unlocked={isCharacterUnlocked(c.id)}
                  selected={c.id === selectedId}
                  label={`${strings.characters.itemPrefix} ${characters.indexOf(c) + 1}`}
                  onPress={() => onPressCard(c.id)}
                />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      {notice && (
        <View pointerEvents="none" style={styles.noticeWrap}>
          <View style={styles.notice}>
            <Text style={styles.noticeText}>{notice}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#2B6FD6', overflow: 'hidden' },
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
