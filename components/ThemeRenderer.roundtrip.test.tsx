import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ThemeProvider } from '@/lib/theme-context';
import { ThemeRenderer } from './ThemeRenderer';

// The real PickerGate calls usePrefersReducedMotion, which reads
// window.matchMedia. jsdom doesn't implement it, so stub it for this
// real-wiring test (no scene URL is configured, so PickerGate always
// resolves to the 2D fallback regardless of this value).
beforeAll(() => {
  window.matchMedia =
    window.matchMedia ||
    ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList);
});

describe('ThemeRenderer round trip (real ThemeProvider, real registry, real PickerGate)', () => {
  it('lets the visitor reopen the picker and pick again, repeatedly (no wedge after the first switch)', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeRenderer />
      </ThemeProvider>
    );

    // Do the pick -> switch round trip three times in a row. A regression
    // where AnimatePresence's exit-complete callback never fires (e.g.
    // mode="wait" blocking on an animation-completion signal the browser
    // can defer) would wedge after the very first switch: this loop would
    // time out on the second iteration if that regression came back.
    for (let i = 0; i < 3; i++) {
      await user.click(await screen.findByTestId('card-apple'));
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /switch design/i })).toBeInTheDocument()
      );
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /switch design/i }));
      await waitFor(() => expect(screen.getByTestId('card-apple')).toBeInTheDocument());
    }
  });
});
