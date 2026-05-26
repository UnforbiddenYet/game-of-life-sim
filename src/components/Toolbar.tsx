import { Badge, Box, Button, Flex, Slider, Text } from '@radix-ui/themes';
import { Shuffle, SquarePen } from 'lucide-react';
import { Stats } from './Stats';

export interface ToolbarProps {
  stepsPerSecond: number;
  onRandomize: () => void;
  onOpenNewGame: () => void;
  onSetSpeed: (stepsPerSecond: number) => void;
}

export function Toolbar({
  stepsPerSecond,
  onRandomize,
  onOpenNewGame,
  onSetSpeed,
}: ToolbarProps) {
  return (
    <Box asChild className="toolbar-surface" px="4" py="3">
      <div>
        <Flex align="center" justify="between" gap="4" wrap="wrap">
          <Flex align="center" gap="4" wrap="wrap">
            <Flex aria-label="Simulation controls" gap="2" wrap="wrap">
              <Button
                type="button"
                aria-label="Randomize grid"
                onClick={onRandomize}
                variant="soft"
                color="gray"
                className="toolbar-button"
              >
                <Shuffle size={16} />
                <span>Randomize</span>
              </Button>

              <Button
                type="button"
                aria-label="New game"
                onClick={onOpenNewGame}
                variant="soft"
                color="gray"
                className="toolbar-button"
              >
                <SquarePen size={16} />
                <span>Change size</span>
              </Button>
            </Flex>
          </Flex>

          <Flex className="toolbar-meta" align="center" gap="4" wrap="wrap">
            <Flex asChild align="center" gap="3" wrap="wrap">
              <label>
                <Text as="span" size="2" weight="medium">
                  Simulation speed
                </Text>
                <Box width="160px">
                  <Slider
                    aria-label="Simulation speed"
                    min={1}
                    max={60}
                    step={1}
                    value={[stepsPerSecond]}
                    onValueChange={(value) => {
                      const [next] = value;
                      if (next !== undefined) {
                        onSetSpeed(next);
                      }
                    }}
                  />
                </Box>
                <Badge
                  className="toolbar-stat"
                  color="gray"
                  variant="soft"
                  radius="full"
                >
                  <span>Speed</span>
                  <span className="toolbar-stat-value toolbar-stat-value-speed">
                    {stepsPerSecond}
                  </span>
                  <span>sps</span>
                </Badge>
              </label>
            </Flex>

            <Stats />
          </Flex>
        </Flex>
      </div>
    </Box>
  );
}
