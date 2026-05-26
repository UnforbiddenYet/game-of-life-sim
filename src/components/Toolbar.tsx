import { Badge, Box, Button, Flex, Slider, Text } from '@radix-ui/themes';
import {
  Eraser,
  Pause,
  Play,
  Shuffle,
  SkipForward,
  SquarePen,
  Undo2,
} from 'lucide-react';
import type { Mode } from '../types/game';
import { Stats } from './Stats';

export interface ToolbarProps {
  mode: Mode;
  stepsPerSecond: number;
  canUndo: boolean;
  onTogglePlayPause: () => void;
  onStep: () => void;
  onUndo: () => void;
  onClear: () => void;
  onRandomize: () => void;
  onOpenNewGame: () => void;
  onSetSpeed: (stepsPerSecond: number) => void;
}

export function Toolbar({
  mode,
  stepsPerSecond,
  canUndo,
  onTogglePlayPause,
  onStep,
  onUndo,
  onClear,
  onRandomize,
  onOpenNewGame,
  onSetSpeed,
}: ToolbarProps) {
  const isPlaying = mode === 'playing';

  return (
    <Box asChild className="toolbar-surface" px="4" py="3">
      <div>
        <Flex align="center" justify="between" gap="4" wrap="wrap">
          <Flex align="center" gap="4" wrap="wrap">
            <Flex aria-label="Simulation controls" gap="2" wrap="wrap">
              <Button
                type="button"
                aria-label={isPlaying ? 'Pause simulation' : 'Play simulation'}
                onClick={onTogglePlayPause}
                variant="solid"
                className="toolbar-button"
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </Button>

              <Button
                type="button"
                aria-label="Undo last step"
                onClick={onUndo}
                disabled={isPlaying || !canUndo}
                variant="soft"
                color="gray"
                className="toolbar-button"
              >
                <Undo2 size={16} />
                <span>Undo</span>
              </Button>

              <Button
                type="button"
                aria-label="Step simulation"
                onClick={onStep}
                disabled={isPlaying}
                variant="soft"
                color="gray"
                className="toolbar-button"
              >
                <SkipForward size={16} />
                <span>Step</span>
              </Button>

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
                aria-label="Clear grid"
                onClick={onClear}
                variant="soft"
                color="gray"
                className="toolbar-button"
              >
                <Eraser size={16} />
                <span>Clear</span>
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
