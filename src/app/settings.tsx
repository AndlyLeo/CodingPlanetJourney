import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '../components/game/app-text';
import { CandyButton } from '../components/game/candy-button';
import { LockIcon } from '../components/game/lock-icon';
import { ComingSoonScreen, ComingSoonSlot } from '../components/game/coming-soon-screen';
import {
  currentVoiceLabel,
  currentVoiceStyleLabel,
  cycleVoice,
  cycleVoiceStyle,
  stopSpeaking,
} from '../audio/speech';
import { getLevelTrack, setLevelTrack, setMusicEnabled, setSfxEnabled } from '../audio/sound';
import { LEVEL_TRACKS, isTrackUnlocked } from '../data/music-tracks';
import { LEVELS_PER_WORLD, WORLD_COUNT } from '../data/worlds';
import { strings } from '../i18n';
import {
  completeNextLevel,
  loadLevelStars,
  loadUnlockedWorldCount,
  resetWorldProgress,
  unlockNextWorld,
} from '../storage/progress-storage';
import {
  loadMusicEnabled,
  loadSfxEnabled,
  loadVoiceEnabled,
  resetHowToSeen,
  saveVoiceEnabled,
} from '../storage/settings-storage';

// 暫時的設定頁：「選擇外觀」入口，加上測試用的進度按鈕。正式設定頁會取代這個檔案。
export default function SettingsScreen() {
  const router = useRouter();
  const [worldCount, setWorldCount] = useState(1);
  const [doneLevels, setDoneLevels] = useState(0);
  const [voice, setVoice] = useState(true);
  const [voiceLabel, setVoiceLabel] = useState(strings.settings.voiceAuto);
  const [styleLabel, setStyleLabel] = useState(strings.settings.voiceStyleNames[1]);
  const [sfx, setSfx] = useState(true);
  const [music, setMusic] = useState(true);
  const [track, setTrack] = useState(getLevelTrack());
  const [trackNote, setTrackNote] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setWorldCount(await loadUnlockedWorldCount());
    setDoneLevels((await loadLevelStars('01')).filter((s) => s >= 1).length);
    setVoice(await loadVoiceEnabled());
    setVoiceLabel(await currentVoiceLabel());
    setStyleLabel(await currentVoiceStyleLabel());
    setSfx(await loadSfxEnabled());
    setMusic(await loadMusicEnabled());
    setTrack(getLevelTrack());
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  return (
    <ComingSoonScreen
      title={strings.settings.title}
      message={`${strings.settings.unlockStatus(worldCount, WORLD_COUNT)}\n${strings.settings.levelStatus(doneLevels, LEVELS_PER_WORLD)}`}>
      <ComingSoonSlot>
        <CandyButton label={strings.settings.chooseLook} onPress={() => router.push('/character-select')} />
      </ComingSoonSlot>
      <ComingSoonSlot>
        <CandyButton
          label={voice ? strings.settings.voiceOn : strings.settings.voiceOff}
          variant={voice ? 'primary' : 'secondary'}
          onPress={async () => {
            const next = !voice;
            setVoice(next);
            await saveVoiceEnabled(next);
            if (!next) stopSpeaking();
          }}
        />
      </ComingSoonSlot>
      <ComingSoonSlot>
        <CandyButton
          label={strings.settings.voiceChange(voiceLabel)}
          variant="secondary"
          onPress={async () => setVoiceLabel(await cycleVoice())}
        />
      </ComingSoonSlot>
      <ComingSoonSlot>
        <CandyButton
          label={strings.settings.voiceStyle(styleLabel)}
          variant="secondary"
          onPress={async () => setStyleLabel(await cycleVoiceStyle())}
        />
      </ComingSoonSlot>
      <ComingSoonSlot>
        <CandyButton
          label={sfx ? strings.settings.sfxOn : strings.settings.sfxOff}
          variant={sfx ? 'primary' : 'secondary'}
          onPress={async () => {
            const next = !sfx;
            setSfx(next);
            await setSfxEnabled(next);
          }}
        />
      </ComingSoonSlot>
      <ComingSoonSlot>
        <CandyButton
          label={music ? strings.settings.musicOn : strings.settings.musicOff}
          variant={music ? 'primary' : 'secondary'}
          onPress={async () => {
            const next = !music;
            setMusic(next);
            await setMusicEnabled(next);
          }}
        />
      </ComingSoonSlot>
      <View style={{ width: '100%', alignItems: 'center', gap: 8 }}>
        <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '800' }}>{strings.settings.levelMusic}</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {LEVEL_TRACKS.map((t) => {
            const unlocked = isTrackUnlocked(t.id, worldCount);
            const selected = track === t.id;
            return (
              <Pressable
                key={t.id}
                accessibilityRole="button"
                accessibilityLabel={strings.settings.trackLabel(t.id)}
                onPress={async () => {
                  if (!unlocked) {
                    setTrackNote(strings.settings.trackLocked(t.unlockWorld));
                    return;
                  }
                  setTrackNote(null);
                  setTrack(t.id);
                  await setLevelTrack(t.id);
                }}
                style={{
                  minWidth: 96,
                  height: 48,
                  borderRadius: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: !unlocked ? '#7B7F8A' : selected ? '#FF9F1C' : '#FFD166',
                  borderWidth: selected ? 3 : 0,
                  borderColor: '#FFFFFF',
                  paddingHorizontal: 12,
                }}>
                {unlocked ? (
                  <Text style={{ color: selected ? '#FFFFFF' : '#4B2A7B', fontSize: 16, fontWeight: '800' }}>
                    {strings.settings.trackLabel(t.id)}
                  </Text>
                ) : (
                  <LockIcon size={20} variant="silver" />
                )}
              </Pressable>
            );
          })}
        </View>
        {trackNote ? <Text style={{ color: '#FFE23A', fontSize: 14, fontWeight: '800' }}>{trackNote}</Text> : null}
      </View>
      <ComingSoonSlot>
        <CandyButton
          label={strings.settings.completeLevel}
          variant="secondary"
          onPress={() => completeNextLevel('01').then(refresh)}
        />
      </ComingSoonSlot>
      <ComingSoonSlot>
        <CandyButton
          label={strings.settings.unlockNext}
          variant="secondary"
          onPress={() => unlockNextWorld().then(refresh)}
        />
      </ComingSoonSlot>
      <ComingSoonSlot>
        <CandyButton label={strings.settings.resetHowTo} variant="secondary" onPress={() => resetHowToSeen()} />
      </ComingSoonSlot>
      <ComingSoonSlot>
        <CandyButton
          label={strings.settings.resetUnlock}
          variant="secondary"
          onPress={() => resetWorldProgress().then(refresh)}
        />
      </ComingSoonSlot>
    </ComingSoonScreen>
  );
}
