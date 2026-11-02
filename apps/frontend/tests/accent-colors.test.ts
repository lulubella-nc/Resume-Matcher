import { describe, expect, it } from 'vitest';

import en from '@/messages/en.json';
import es from '@/messages/es.json';
import zh from '@/messages/zh.json';
import ja from '@/messages/ja.json';
import pt from '@/messages/pt-BR.json';
import fr from '@/messages/fr.json';
import ko from '@/messages/ko.json';

import { ACCENT_COLOR_MAP, type AccentColor } from '@/lib/types/template-settings';

const MESSAGES = { en, es, zh, ja, pt, fr, ko };

/** Swatches added for readers who want a low-saturation document. */
const MUTED: AccentColor[] = ['navy', 'denim', 'sage', 'ash', 'graphite', 'sand'];

describe('accent palette', () => {
  const colors = Object.keys(ACCENT_COLOR_MAP) as AccentColor[];

  it('ships the saturated seven plus the muted six', () => {
    expect(colors).toHaveLength(13);
    for (const color of MUTED) expect(colors).toContain(color);
  });

  it('gives every swatch a distinct primary and a lighter tint', () => {
    const primaries = colors.map((color) => ACCENT_COLOR_MAP[color].primary.toLowerCase());
    expect(new Set(primaries).size).toBe(colors.length);

    for (const color of colors) {
      const { primary, light } = ACCENT_COLOR_MAP[color];
      expect(primary).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(light).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(primary.toLowerCase()).not.toBe(light.toLowerCase());
    }
  });

  it('keeps the muted primaries dark enough to read as heading text', () => {
    // Rough relative luminance: a muted swatch must still print darker than mid-grey,
    // otherwise the section headings it paints wash out on white paper.
    const luminance = (hex: string) => {
      const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
      const channel = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
      return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    };

    for (const color of MUTED) {
      const contrast = 1.05 / (luminance(ACCENT_COLOR_MAP[color].primary) + 0.05);
      expect(contrast, `${color} contrast on white`).toBeGreaterThanOrEqual(3);
    }
  });

  it('names every swatch in every locale', () => {
    for (const [locale, messages] of Object.entries(MESSAGES)) {
      const names = messages.builder.formatting.accentColors as Record<string, string>;
      for (const color of colors) {
        expect(names[color], `${locale}.${color}`).toBeTruthy();
      }
    }
  });
});
