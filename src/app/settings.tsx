import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { CandyButton } from '../components/game/candy-button';
import { ComingSoonScreen, ComingSoonSlot } from '../components/game/coming-soon-screen';
import { stopSpeaking } from '../audio/speech';
import { setMusicEnabled, setSfxEnabled } from '../audio/sound';
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
  const [sfx, setSfx] = useState(true);
  const [music, setMusic] = useState(true);

  const refresh = useCallback(async () => {
    setWorldCount(await loadUnlockedWorldCount());
    setDoneLevels((await loadLevelStars('01')).filter((s) => s >= 1).length);
    setVoice(await loadVoiceEnabled());
    setSfx(await loadSfxEnabled());
    setMusic(await loadMusicEnabled());
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
