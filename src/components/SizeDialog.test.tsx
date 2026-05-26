import { Theme } from '@radix-ui/themes';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SizeDialog } from './SizeDialog';

afterEach(() => {
  cleanup();
});

describe('SizeDialog', () => {
  it('rejects non-integer and out-of-range sizes inline', () => {
    const onSubmit = vi.fn();
    render(
      <Theme>
        <SizeDialog
          open
          currentSize={50}
          onOpenChange={vi.fn()}
          onSubmit={onSubmit}
        />
      </Theme>,
    );

    const input = screen.getByLabelText(/grid size/i);
    const submit = screen.getByRole('button', { name: /start new game/i });

    fireEvent.change(input, { target: { value: '2' } });
    fireEvent.click(submit);
    expect(screen.getByRole('alert')).toHaveTextContent(/between 3 and 1000/i);

    fireEvent.change(input, { target: { value: '12.5' } });
    fireEvent.click(submit);
    expect(screen.getByRole('alert')).toHaveTextContent(/whole number/i);

    fireEvent.change(input, { target: { value: '1001' } });
    fireEvent.click(submit);
    expect(screen.getByRole('alert')).toHaveTextContent(/between 3 and 1000/i);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits a valid size', () => {
    const onSubmit = vi.fn();
    render(
      <Theme>
        <SizeDialog
          open
          currentSize={50}
          onOpenChange={vi.fn()}
          onSubmit={onSubmit}
        />
      </Theme>,
    );

    fireEvent.change(screen.getByLabelText(/grid size/i), {
      target: { value: '75' },
    });
    fireEvent.click(screen.getByRole('button', { name: /start new game/i }));

    expect(onSubmit).toHaveBeenCalledWith(75);
  });
});
