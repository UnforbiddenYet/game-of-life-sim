import { Canvas } from './components/Canvas';
import { GameProvider } from './state/context';

export default function App() {
  return (
    <GameProvider size={50}>
      <Canvas width={600} height={600} />
    </GameProvider>
  );
}
