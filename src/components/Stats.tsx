import { Badge, Flex } from "@radix-ui/themes";

interface StatsProps {
  generation: number;
  alive: number;
}

export function Stats({ generation, alive }: StatsProps) {
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
