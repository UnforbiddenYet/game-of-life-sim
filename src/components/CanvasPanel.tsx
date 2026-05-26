import { Box } from '@radix-ui/themes';
import { useRef } from 'react';
import { useElementSize } from '../hooks/useElementSize';
import { Canvas } from './Canvas';
import { CanvasStatus } from './CanvasStatus';
import { PlaybackDock } from './PlaybackDock';

export function CanvasPanel() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { width, height } = useElementSize(ref);
  return (
    <Box asChild className="canvas-panel" p="4">
      <main ref={ref}>
        {width > 0 && height > 0 ? (
          <Canvas width={width} height={height} />
        ) : null}
        <CanvasStatus />
        <PlaybackDock />
      </main>
    </Box>
  );
}
