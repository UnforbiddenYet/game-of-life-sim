import { Box, Callout, Flex, IconButton, Theme } from "@radix-ui/themes";
import { AlertTriangle, HelpCircle, X } from "lucide-react";
import { useRef, useState } from "react";
import { Canvas } from "./components/Canvas";
import { Header } from "./components/Header";
import { ShortcutsDialog } from "./components/ShortcutsDialog";
import { SizeDialog } from "./components/SizeDialog";
import { Toolbar } from "./components/Toolbar";
import { useElementSize } from "./hooks/useElementSize";
import { useGameLoop } from "./hooks/useGameLoop";
import { useImportExport } from "./hooks/useImportExport";
import * as Actions from "./state/actions";
import { GameProvider } from "./state/context";
import { useGameDispatch, useGameUi } from "./state/hooks";

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
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const { mode, size, stepsPerSecond, canUndo } = useGameUi();
  const dispatch = useGameDispatch();
  const { exportGame, importGame, importError, dismissError } =
    useImportExport();

  useGameLoop({
    isPlaying: mode === "playing",
    stepsPerSecond,
    onTick: () => dispatch(Actions.step()),
  });

  return (
    <Theme appearance="light" accentColor="green" radius="large">
      <Flex className="app-shell" direction="column">
        <Header onExport={exportGame} onImport={importGame} />
        <Toolbar
          mode={mode}
          stepsPerSecond={stepsPerSecond}
          canUndo={canUndo}
          onTogglePlayPause={() =>
            dispatch(mode === "playing" ? Actions.pause() : Actions.play())
          }
          onStep={() => dispatch(Actions.step())}
          onUndo={() => dispatch(Actions.undo())}
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

        <IconButton
          className="help-fab"
          aria-label="Show keyboard shortcuts"
          variant="solid"
          color="gray"
          radius="full"
          size="3"
          onClick={() => setIsHelpOpen(true)}
        >
          <HelpCircle size={18} />
        </IconButton>

        <ShortcutsDialog open={isHelpOpen} onOpenChange={setIsHelpOpen} />

        {importError !== null ? (
          <Box className="import-error" role="status" aria-live="polite">
            <Callout.Root color="red" variant="surface">
              <Callout.Icon>
                <AlertTriangle size={16} />
              </Callout.Icon>
              <Callout.Text>{importError}</Callout.Text>
              <IconButton
                aria-label="Dismiss import error"
                variant="ghost"
                color="red"
                size="1"
                onClick={dismissError}
              >
                <X size={14} />
              </IconButton>
            </Callout.Root>
          </Box>
        ) : null}
      </Flex>
    </Theme>
  );
}
