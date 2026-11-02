'use client';

import React from 'react';
import { ACCENT_COLOR_MAP, type AccentColor } from '@/lib/types/template-settings';

interface AccentColorPickerProps {
  value: AccentColor;
  onChange: (color: AccentColor) => void;
  /** Label for the group and for each swatch; the caller passes translated names. */
  labelFor: (color: AccentColor) => string;
  labelledBy: string;
}

const COLORS = Object.keys(ACCENT_COLOR_MAP) as AccentColor[];

/**
 * Square-swatch colour picker.
 *
 * A segmented row stopped working at thirteen swatches (it wrapped past the panel), so
 * this is a two-column grid of named swatches. It keeps the radiogroup contract the
 * shared SegmentedControl provides: one tab stop, arrow keys move the selection, and
 * each swatch announces its name rather than its hex.
 */
export function AccentColorPicker({ value, onChange, labelFor, labelledBy }: AccentColorPickerProps) {
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = Math.max(
    0,
    COLORS.findIndex((color) => color === value)
  );

  const move = (from: number, delta: number) => {
    const next = COLORS[(from + delta + COLORS.length) % COLORS.length];
    onChange(next);
    refs.current[COLORS.indexOf(next)]?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      move(index, 1);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      move(index, -1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      move(0, 0);
    } else if (event.key === 'End') {
      event.preventDefault();
      move(COLORS.length - 1, 0);
    }
  };

  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className="grid grid-cols-2 gap-2">
      {COLORS.map((color, index) => {
        const selected = color === value;
        const name = labelFor(color);
        return (
          <button
            key={color}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={index === selectedIndex ? 0 : -1}
            title={name}
            onClick={() => onChange(color)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={`flex items-center gap-2 border px-2 py-1 text-left font-mono text-xs uppercase ${
              selected
                ? 'border-ink outline outline-2 outline-offset-2 outline-ink'
                : 'border-steel hover:bg-panel-hover'
            }`}
          >
            <span
              aria-hidden="true"
              className="size-4 shrink-0 border border-steel"
              style={{ backgroundColor: ACCENT_COLOR_MAP[color].primary }}
            />
            <span className="truncate">{name}</span>
          </button>
        );
      })}
    </div>
  );
}
