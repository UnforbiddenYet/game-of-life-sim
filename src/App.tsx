import { Box, Callout, Flex, IconButton, Theme } from "@radix-ui/themes";
import { AlertTriangle, HelpCircle, X } from "lucide-react";
import { useState } from "react";
import { CanvasPanel } from "./components/CanvasPanel";
import { Header } from "./components/Header";
import { ShortcutsDialog } from "./components/ShortcutsDialog";
import { SidePanel } from "./components/SidePanel";
import { useGameLoop } from "./hooks/useGameLoop";
import { useImportExport } from "./hooks/useImportExport";
import { GameProvider } from "./state/context";
import { useEngine, useGameUi } from "./state/hooks";

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
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const { mode, stepsPerSecond } = useGameUi();
  const engine = useEngine();
  const { exportGame, importGame, importError, dismissError } =
    useImportExport();

  useGameLoop({
    isPlaying: mode === "playing",
    stepsPerSecond,
    onTick: () => engine.step(),
  });

  return (
    <Theme appearance="light" accentColor="green" radius="large">
      <Flex className="app-shell" direction="column">
        <Header onExport={exportGame} onImport={importGame} />

        <Flex className="workspace" gap="4" px="5" pb="5">
          <CanvasPanel />
          <SidePanel />
        </Flex>

        <IconButton
          className="help-fab"
          aria-label="Show keyboard shortcuts"
          variant="surface"
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
