import { Flex, Text } from '@radix-ui/themes';
import { Activity } from 'lucide-react';
import { useGameUi } from '../state/hooks';

export function CanvasStatus() {
  const { mode, stepsPerSecond } = useGameUi();
  const playing = mode === 'playing';

  return (
    <Flex
      className="canvas-status"
      align="center"
      gap="2"
      px="3"
      py="2"
      role="status"
      aria-live="polite"
    >
      <Activity size={14} aria-hidden="true" />
      {playing ? (
        <Text as="span" size="2">
          Simulation running at <strong>{stepsPerSecond}</strong> steps/sec
        </Text>
      ) : (
        <Text as="span" size="2">
          Simulation paused
        </Text>
      )}
    </Flex>
  );
}
