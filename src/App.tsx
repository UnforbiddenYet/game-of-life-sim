import { Box, Flex, Theme } from '@radix-ui/themes';
import { useRef, useState } from 'react';
import { Canvas } from './components/Canvas';
import { SizeDialog } from './components/SizeDialog';
import { Toolbar } from './components/Toolbar';
import { useElementSize } from './hooks/useElementSize';
import { useGameLoop } from './hooks/useGameLoop';
import * as Actions from './state/actions';
import { GameProvider } from './state/context';
import { useGameDispatch, useGameUi } from './state/hooks';

import '@radix-ui/themes/styles.css';
import './styles/styles.css';

export default function App() {
  return (
    <GameProvider size={50}>
      <AppShell />
    </GameProvider>
  );
}

function AppShell() {
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const { width, height } = useElementSize(canvasContainerRef);
  const [isSizeDialogOpen, setIsSizeDialogOpen] = useState(false);
  const { mode, size, stepsPerSecond } = useGameUi();
  const dispatch = useGameDispatch();

  useGameLoop({
    isPlaying: mode === 'playing',
    stepsPerSecond,
    onTick: () => dispatch(Actions.step()),
  });

  return (
    <Theme appearance="dark" accentColor="gray" radius="large">
      <Flex className="app-shell" direction="column">
        <Toolbar
          mode={mode}
          stepsPerSecond={stepsPerSecond}
          onTogglePlayPause={() =>
            dispatch(
              mode === 'playing' ? Actions.pause() : Actions.play(),
            )
          }
          onStep={() => dispatch(Actions.step())}
          onClear={() => dispatch(Actions.clear())}
          onRandomize={() => dispatch(Actions.randomize(0.3))}
          onOpenNewGame={() => setIsSizeDialogOpen(true)}
          onSetSpeed={(sps) => dispatch(Actions.setSpeed(sps))}
        />

        <Box asChild className="canvas-shell" p="4">
          <main ref={canvasContainerRef}>
            {width > 0 && height > 0 ? (
              <Canvas width={width} height={height} />
            ) : null}
          </main>
        </Box>

        <SizeDialog
          open={isSizeDialogOpen}
          currentSize={size}
          onOpenChange={setIsSizeDialogOpen}
          onSubmit={(nextSize) => {
            dispatch(Actions.newGame(nextSize));
            setIsSizeDialogOpen(false);
          }}
        />
      </Flex>
    </Theme>
  );
}
