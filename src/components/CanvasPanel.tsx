import { Box } from "@radix-ui/themes";
import { useRef } from "react";
import { useCamera } from "../hooks/useCamera";
import { useElementSize } from "../hooks/useElementSize";
import { useGameUi } from "../state/hooks";
import { Canvas } from "./Canvas";
import { CanvasStatus } from "./CanvasStatus";
import { PlaybackDock } from "./PlaybackDock";
import { ZoomDock } from "./ZoomDock";

export function CanvasPanel() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { width, height } = useElementSize(ref);
  const { size } = useGameUi();
  const viewport = { width, height };
  const [camera, setCamera] = useCamera(size, viewport);
  const ready = width > 0 && height > 0;
  return (
    <Box asChild className="canvas-panel" p="4">
      <main ref={ref}>
        {ready ? (
          <Canvas
            width={width}
            height={height}
            camera={camera}
            setCamera={setCamera}
          />
        ) : null}
        <CanvasStatus />
        {ready ? <ZoomDock viewport={viewport} setCamera={setCamera} /> : null}
        <PlaybackDock />
      </main>
    </Box>
  );
}
