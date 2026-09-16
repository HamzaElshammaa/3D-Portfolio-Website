import { expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ComponentType } from 'react';

export interface ThemeStructureExpectations {
  /** Anchor ids the nav (or a CTA) links to — e.g. ['work', 'about', 'services', 'contact']. */
  anchorIds: string[];
  /** Arbitrary text that should be findable somewhere in the rendered theme, one per section
   * that has no anchor id of its own (e.g. a testimonial quote, proving Testimonials rendered). */
  sectionTexts: string[];
}

/**
 * Structural smoke test shared across themes: every anchor id the nav links
 * to must exist in the document, and every section must actually render.
 * `AppleTheme.test.tsx` uses this today; `BrutalistTheme` and
 * `TerminalTheme` should be able to reuse it unchanged once they exist.
 */
export function expectThemeRendersItsSections(
  ThemeComponent: ComponentType,
  expectations: ThemeStructureExpectations
) {
  const { container } = render(<ThemeComponent />);

  for (const id of expectations.anchorIds) {
    expect(
      container.querySelector(`#${id}`),
      `expected an element with id "#${id}" (a nav target) to be in the document`
    ).not.toBeNull();
  }

  for (const text of expectations.sectionTexts) {
    // getAllByText (not getByText) because section headings like "Services" can
    // legitimately also appear as nav link labels elsewhere in the same theme.
    expect(screen.getAllByText(text, { exact: false }).length).toBeGreaterThan(0);
  }
}
