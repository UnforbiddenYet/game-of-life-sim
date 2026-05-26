import { Badge, Box, Button, Flex, Slider, Text } from '@radix-ui/themes';
import {
  Download,
  Eraser,
  Pause,
  Play,
  Shuffle,
  SkipForward,
  SquarePen,
  Undo2,
  Upload,
} from 'lucide-react';
import { useRef } from 'react';
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
  onExport: () => void;
  onImport: (file: File) => void;
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
  onExport,
  onImport,
}: ToolbarProps) {
  const isPlaying = mode === 'playing';
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <Box asChild className="toolbar-surface" px="4" py="3">
      <header>
        <Flex align="center" justify="between" gap="4" wrap="wrap">
          <Flex align="center" gap="4" wrap="wrap">
            <Box>
              <Text as="div" size="3" weight="bold" className="toolbar-title">
                Game of Life
              </Text>
              <Text as="div" size="1" color="gray">
                adaptiveML take-home
              </Text>
            </Box>

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

              <Button
                type="button"
                aria-label="Export grid as JSON"
                onClick={onExport}
                variant="soft"
                color="gray"
                className="toolbar-button"
              >
                <Download size={16} />
                <span>Export</span>
              </Button>

              <Button
                type="button"
                aria-label="Import grid from JSON"
                onClick={() => fileInputRef.current?.click()}
                variant="soft"
                color="gray"
                className="toolbar-button"
              >
                <Upload size={16} />
                <span>Import</span>
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                aria-label="Import grid from JSON file"
                style={{
                  position: 'absolute',
                  width: 1,
                  height: 1,
                  padding: 0,
                  margin: -1,
                  overflow: 'hidden',
                  clip: 'rect(0 0 0 0)',
                  border: 0,
                }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onImport(file);
                  e.target.value = '';
                }}
              />
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
      </header>
    </Box>
  );
}
