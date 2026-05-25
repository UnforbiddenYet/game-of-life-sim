import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GameProvider } from '../state/context';
import { Canvas } from './Canvas';

describe('Canvas', () => {
  it('renders a canvas element inside the provider', () => {
    const { container } = render(
      <GameProvider size={5}>
        <Canvas width={100} height={100} />
      </GameProvider>,
    );
    expect(container.querySelector('canvas')).not.toBeNull();
  });
});
