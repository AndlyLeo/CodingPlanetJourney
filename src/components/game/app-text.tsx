import { Text as RNText, type TextProps } from 'react-native';

import { appFontFamily } from '../../theme/fonts';

// 全 APP 的文字元件：和 React Native 的 Text 用法完全相同，但會自動套用 APP 字體（粉圓）。
// 注意：★、✓ 這類符號仍使用原本的 Text，由系統字型顯示。
export function Text({ style, ...rest }: TextProps) {
  const family = appFontFamily();
  return <RNText {...rest} style={family ? [{ fontFamily: family }, style] : style} />;
}
