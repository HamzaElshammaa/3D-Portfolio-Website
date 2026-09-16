import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from './theme-context';

function Probe() {
  const { activeTheme, selectTheme, reopenPicker } = useTheme();
  return (
    <div>
      <span data-testid="active">{activeTheme ?? 'none'}</span>
      <button onClick={() => selectTheme('apple')}>pick apple</button>
      <button onClick={reopenPicker}>reopen</button>
    </div>
  );
}

describe('ThemeProvider / useTheme', () => {
  it('starts with no active theme', () => {
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>
    );
    expect(screen.getByTestId('active')).toHaveTextContent('none');
  });

  it('selectTheme sets the active theme', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>
    );
    await user.click(screen.getByText('pick apple'));
    expect(screen.getByTestId('active')).toHaveTextContent('apple');
  });

  it('reopenPicker clears the active theme', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>
    );
    await user.click(screen.getByText('pick apple'));
    await user.click(screen.getByText('reopen'));
    expect(screen.getByTestId('active')).toHaveTextContent('none');
  });
});
