import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';

import { loadAppFonts } from '../theme/fonts';

// 堆疊式導覽：不顯示標題列與底部分頁，適合遊戲式全螢幕畫面。
// 啟動時先載入字體（通常不到一秒），載入完成才顯示畫面，避免文字先出現系統字型再跳成粉圓。
export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadAppFonts().finally(() => setReady(true));
  }, []);

  if (!ready) return null;
  return <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />;
}
