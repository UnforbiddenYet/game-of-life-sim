import { Badge, Flex } from '@radix-ui/themes';
import { useGameTick } from '../state/hooks';

export function Stats() {
  const { generation, alive } = useGameTick();
  return (
    <Flex aria-label="Simulation statistics" gap="2" wrap="wrap">
      <Badge className="toolbar-stat" color="gray" variant="soft" radius="full">
        <span>Generation</span>
        <span className="toolbar-stat-value toolbar-stat-value-generation">
          {generation}
        </span>
      </Badge>
      <Badge className="toolbar-stat" color="gray" variant="soft" radius="full">
        <span>Alive</span>
        <span className="toolbar-stat-value toolbar-stat-value-alive">
          {alive}
        </span>
      </Badge>
    </Flex>
  );
}
