import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';

import { initAudio } from '../audio/sound';
import { loadAppFonts } from '../theme/fonts';

// 堆疊式導覽：不顯示標題列與底部分頁，適合遊戲式全螢幕畫面。
// 啟動時先載入字體與音訊設定（通常不到一秒），載入完成才顯示畫面，避免文字先出現系統字型再跳成粉圓。
export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([loadAppFonts(), initAudio()]).finally(() => setReady(true));
  }, []);

  if (!ready) return null;
  return <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />;
}
