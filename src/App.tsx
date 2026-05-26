import { Box, Flex, Theme } from "@radix-ui/themes";
import { useRef, useState } from "react";
import { aliveCount } from "./core/grid";
import { Canvas } from "./components/Canvas";
import { SizeDialog } from "./components/SizeDialog";
import { Toolbar } from "./components/Toolbar";
import { useElementSize } from "./hooks/useElementSize";
import { useGameLoop } from "./hooks/useGameLoop";
import * as Actions from "./state/actions";
import { GameProvider } from "./state/context";
import { useGameDispatch, useGameState } from "./state/hooks";

import "@radix-ui/themes/styles.css";
import "./styles/styles.css";

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
  const state = useGameState();
  const dispatch = useGameDispatch();
  const alive = aliveCount(state.grid);

  useGameLoop({
    isPlaying: state.mode === "playing",
    stepsPerSecond: state.stepsPerSecond,
    onTick: () => dispatch(Actions.step()),
  });

  return (
    <Theme appearance="light" accentColor="gray" radius="large">
      <Flex className="app-shell" direction="column">
        <Toolbar
          mode={state.mode}
          generation={state.generation}
          alive={alive}
          size={state.size}
          stepsPerSecond={state.stepsPerSecond}
          onTogglePlayPause={() =>
            dispatch(
              state.mode === "playing" ? Actions.pause() : Actions.play(),
            )
          }
          onStep={() => dispatch(Actions.step())}
          onClear={() => dispatch(Actions.clear())}
          onRandomize={() => dispatch(Actions.randomize(0.3))}
          onOpenNewGame={() => setIsSizeDialogOpen(true)}
          onSetSpeed={(stepsPerSecond) =>
            dispatch(Actions.setSpeed(stepsPerSecond))
          }
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
          currentSize={state.size}
          onOpenChange={setIsSizeDialogOpen}
          onSubmit={(size) => {
            dispatch(Actions.newGame(size));
            setIsSizeDialogOpen(false);
          }}
        />
      </Flex>
    </Theme>
  );
}
