import { Animated, Image, type ImageSourcePropType, View } from 'react-native';

import type { Dir } from '../../../game/engine';

type Props = {
  cell: number;
  image?: ImageSourcePropType;
  pos: Animated.ValueXY; // 角色所在格子左上角的位置（dp）
  shake: Animated.Value; // 撞到東西時的左右晃動
  dir: Dir;
  facing: 1 | -1; // 1 = 原圖方向，-1 = 左右鏡射（往左走時）
};

// 棋盤上的角色：用目前選擇的角色圖，前方有一個小三角形指出面向的方向。
export function HeroView({ cell, image, pos, shake, dir, facing }: Props) {
  const src = image ? Image.resolveAssetSource(image) : undefined;
  const h = cell * 0.9;
  const w = src && src.height ? h * (src.width / src.height) : h * 0.5;
  const tri = cell * 0.13;

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: cell,
        height: cell,
        transform: [{ translateX: pos.x }, { translateY: pos.y }],
      }}>
      <Animated.View
        style={{
          position: 'absolute',
          left: (cell - w) / 2,
          bottom: cell * 0.04,
          width: w,
          height: h,
          transform: [{ translateX: shake }, { scaleX: facing }],
        }}>
        {image ? <Image source={image} style={{ width: w, height: h }} /> : null}
      </Animated.View>

      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: cell,
          height: cell,
          transform: [{ rotate: `${dir * 90}deg` }],
        }}>
        <View
          style={{
            position: 'absolute',
            left: cell / 2 - tri,
            top: cell * 0.01,
            width: 0,
            height: 0,
            borderLeftWidth: tri,
            borderRightWidth: tri,
            borderBottomWidth: tri * 1.4,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: '#FF5A3C',
          }}
        />
      </View>
    </Animated.View>
  );
}
