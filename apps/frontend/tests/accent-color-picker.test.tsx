import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AccentColorPicker } from '@/components/builder/accent-color-picker';
import { ACCENT_COLOR_MAP, type AccentColor } from '@/lib/types/template-settings';

const COLORS = Object.keys(ACCENT_COLOR_MAP) as AccentColor[];

const setup = (value: AccentColor = 'blue') => {
  const onChange = vi.fn();
  render(
    <div>
      <h4 id="accent-label">Accent</h4>
      <AccentColorPicker
        value={value}
        onChange={onChange}
        labelFor={(color) => ACCENT_COLOR_MAP[color].name}
        labelledBy="accent-label"
      />
    </div>
  );
  return { onChange };
};

describe('AccentColorPicker', () => {
  it('exposes every swatch as a named radio inside one group', () => {
    setup();
    const group = screen.getByRole('radiogroup', { name: 'Accent' });

    expect(group).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(COLORS.length);
    // Names come from the caller's translator, never from the hex value.
    expect(screen.getByRole('radio', { name: 'Graphite' })).toBeInTheDocument();
  });

  it('marks the current colour checked and keeps a single tab stop', () => {
    setup('navy');
    const checked = screen.getAllByRole('radio').filter((radio) => radio.getAttribute('aria-checked') === 'true');

    expect(checked).toHaveLength(1);
    expect(checked[0]).toHaveAccessibleName('Navy');
    expect(screen.getAllByRole('radio').filter((radio) => radio.getAttribute('tabindex') === '0')).toHaveLength(1);
  });

  it('reports the clicked swatch', () => {
    const { onChange } = setup();
    fireEvent.click(screen.getByRole('radio', { name: 'Sage' }));

    expect(onChange).toHaveBeenCalledWith('sage');
  });

  it('moves the selection with the arrow keys, so the grid is usable without a mouse', () => {
    const { onChange } = setup('blue');
    const blue = screen.getByRole('radio', { name: 'Blue' });

    fireEvent.keyDown(blue, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith(COLORS[1]);

    onChange.mockClear();
    fireEvent.keyDown(blue, { key: 'ArrowLeft' });
    // Wraps to the last swatch rather than dead-ending.
    expect(onChange).toHaveBeenLastCalledWith(COLORS[COLORS.length - 1]);

    onChange.mockClear();
    fireEvent.keyDown(blue, { key: 'End' });
    expect(onChange).toHaveBeenLastCalledWith(COLORS[COLORS.length - 1]);

    onChange.mockClear();
    fireEvent.keyDown(blue, { key: 'Home' });
    expect(onChange).toHaveBeenLastCalledWith(COLORS[0]);
  });
});
