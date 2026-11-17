import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

import { type MusicName, playMusic } from './sound';

// 畫面取得焦點時播放指定的背景音樂（從其他畫面返回時也會重新切回來）。
export function useMusic(name: MusicName): void {
  useFocusEffect(
    useCallback(() => {
      playMusic(name);
    }, [name]),
  );
}
