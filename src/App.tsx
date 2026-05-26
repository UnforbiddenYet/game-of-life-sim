import { useRef } from 'react';
import { Canvas } from './components/Canvas';
import { useElementSize } from './hooks/useElementSize';
import { GameProvider } from './state/context';

export default function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { width, height } = useElementSize(containerRef);

  return (
    <GameProvider size={50}>
      <main
        ref={containerRef}
        style={{
          height: '100vh',
          width: '100vw',
          margin: 0,
          background: '#0b0d10',
        }}
      >
        {width > 0 && height > 0 && (
          <Canvas width={width} height={height} />
        )}
      </main>
    </GameProvider>
  );
}
