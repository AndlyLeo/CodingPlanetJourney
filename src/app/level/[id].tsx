import { useLocalSearchParams } from 'expo-router';

import { ComingSoonScreen } from '../../components/game/coming-soon-screen';
import { LevelScreen } from '../../components/game/level/level-screen';
import { getLevelDef } from '../../data/level-defs';
import { strings } from '../../i18n';

// 關卡畫面。網址的 id 格式為「區域編號-關卡編號」，例如 01-3 代表第 1 區第 3 關。
export default function LevelRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [worldId, levelStr] = String(id).split('-');
  const level = Number(levelStr);
  const def = getLevelDef(worldId, level);

  if (!def) return <ComingSoonScreen title={strings.game.levelLabel(level)} />;
  return <LevelScreen key={String(id)} worldId={worldId} level={level} def={def} />;
}
