// 全 APP 使用的字體：jf open 粉圓（Huninn），SIL Open Font License 1.1。
// 字體檔放在 assets/fonts/Huninn.ttf。
//
// 字體在 APP 啟動時載入（見 app/_layout.tsx）。如果載入失敗，會自動改用系統字型，APP 不會當機。

export const FONT_NAME = 'Huninn';

let loaded = false;

// 目前可以使用的字體名稱；還沒載入或載入失敗時為 undefined（使用系統字型）
export function appFontFamily(): string | undefined {
  return loaded ? FONT_NAME : undefined;
}

export async function loadAppFonts(): Promise<void> {
  try {
    const Font = require('expo-font') as {
      loadAsync: (map: Record<string, unknown>) => Promise<void>;
    };
    await Font.loadAsync({ [FONT_NAME]: require('../../assets/fonts/Huninn.ttf') });
    loaded = true;
  } catch (error) {
    loaded = false;
    // 開發時在畫面下方顯示黃色警告，方便找出原因（檔案不存在、檔名不對、模組載入失敗等）
    if (__DEV__) console.warn('粉圓字體載入失敗，改用系統字型：', error instanceof Error ? error.message : error);
  }
}
