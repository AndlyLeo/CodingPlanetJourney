import { useLocalSearchParams } from 'expo-router';

import { ComingSoonScreen } from '../../components/game/coming-soon-screen';
import { ZoneMapScreen } from '../../components/game/zone-map-screen';
import { worldMaps } from '../../data/world-maps';
import { strings } from '../../i18n';

// 區域內部畫面。有提供地圖圖片的區域顯示地圖，其餘區域顯示暫時畫面。
export default function WorldScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const worldId = String(id);

  if (worldMaps[worldId]) return <ZoneMapScreen worldId={worldId} />;

  const name = strings.worlds.regionNames[Math.max(0, Number(worldId) - 1)] ?? strings.worlds.title;
  return <ComingSoonScreen title={name} />;
}
