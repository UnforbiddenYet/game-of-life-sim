import { Box, Button, Flex, Slider, Text, TextField } from '@radix-ui/themes';
import { Shuffle } from 'lucide-react';
import { useEffect, useState } from 'react';
import * as Actions from '../state/actions';
import { useGameDispatch, useGameUi } from '../state/hooks';

export function SidePanel() {
  const { size, stepsPerSecond } = useGameUi();
  const dispatch = useGameDispatch();
  const [sizeDraft, setSizeDraft] = useState(String(size));
  useEffect(() => {
    setSizeDraft(String(size));
  }, [size]);

  const applyResize = () => {
    const next = Number(sizeDraft);
    if (Number.isInteger(next) && next >= 3 && next <= 1000) {
      dispatch(Actions.newGame(next));
    }
  };
  return (
    <Box asChild className="side-panel" p="5">
      <aside aria-label="Game settings">
        <Flex direction="column" gap="5">
          <Flex direction="column" gap="2">
            <Text size="1" weight="bold" className="side-section-label">
              SIMULATION SPEED
            </Text>
            <Slider
              aria-label="Simulation speed"
              min={1}
              max={60}
              step={1}
              value={[stepsPerSecond]}
              onValueChange={(value) => {
                const [next] = value;
                if (next !== undefined) dispatch(Actions.setSpeed(next));
              }}
            />
          </Flex>

          <Flex direction="column" gap="2">
            <Text size="1" weight="bold" className="side-section-label">
              GRID CONFIGURATION
            </Text>
            <Flex direction="column" gap="1" asChild>
              <label>
                <Text size="2">Grid size</Text>
                <TextField.Root
                  type="number"
                  aria-label="Grid size"
                  value={sizeDraft}
                  onChange={(e) => setSizeDraft(e.target.value)}
                />
              </label>
            </Flex>
            <Button
              type="button"
              variant="surface"
              color="gray"
              onClick={applyResize}
            >
              Apply Resize
            </Button>
          </Flex>

          <Flex direction="column" gap="2">
            <Text size="1" weight="bold" className="side-section-label">
              GENERATION
            </Text>
            <Button
              type="button"
              variant="surface"
              color="gray"
              onClick={() => dispatch(Actions.randomize(0.3))}
            >
              <Shuffle size={16} />
              <span>Randomize Cells</span>
            </Button>
          </Flex>

          <Flex direction="column" gap="2">
            <Text size="1" weight="bold" className="side-section-label">
              CELL RULES
            </Text>
            <Text as="p" size="2" color="gray">
              Survival: 2 or 3 neighbors.
            </Text>
            <Text as="p" size="2" color="gray">
              Birth: Exactly 3 neighbors.
            </Text>
          </Flex>
        </Flex>
      </aside>
    </Box>
  );
}
