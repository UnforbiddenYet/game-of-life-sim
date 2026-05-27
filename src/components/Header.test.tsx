import { Theme } from '@radix-ui/themes';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TickContext } from '../state/hooks';
import { Header } from './Header';

afterEach(() => {
  cleanup();
});

function renderHeader(
  overrides: Partial<React.ComponentProps<typeof Header>> = {},
  tick: { generation: number; alive: number } = { generation: 10, alive: 0 },
) {
  const props: React.ComponentProps<typeof Header> = {
    onExport: vi.fn(),
    onImport: vi.fn(),
    ...overrides,
  };

  render(
    <TickContext.Provider value={tick}>
      <Theme>
        <Header {...props} />
      </Theme>
    </TickContext.Provider>,
  );
  return props;
}

describe('Header', () => {
  it('shows the title and current generation', () => {
    renderHeader({}, { generation: 42, alive: 0 });
    expect(screen.getByText(/conway's game of life/i)).toBeInTheDocument();
    expect(screen.getByText(/generation/i)).toHaveTextContent('Generation 42');
  });

  it('shows the current alive cell count next to the title', () => {
    renderHeader({}, { generation: 0, alive: 87 });
    expect(screen.getByText(/alive/i)).toHaveTextContent('Alive 87');
  });

  it('triggers onExport when Export is clicked', () => {
    const props = renderHeader();
    fireEvent.click(screen.getByRole('button', { name: /export grid/i }));
    expect(props.onExport).toHaveBeenCalledTimes(1);
  });

  it('forwards the chosen file to onImport', async () => {
    const props = renderHeader();
    const user = userEvent.setup();
    const file = new File(['{"version":1}'], 'game.json', {
      type: 'application/json',
    });
    const input = screen.getByLabelText(
      /import grid from json file/i,
    ) as HTMLInputElement;
    await user.upload(input, file);
    expect(props.onImport).toHaveBeenCalledTimes(1);
    expect(props.onImport).toHaveBeenCalledWith(file);
  });
});
