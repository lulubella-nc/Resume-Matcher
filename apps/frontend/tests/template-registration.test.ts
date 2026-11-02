import { describe, expect, it } from 'vitest';
import {
  TEMPLATE_OPTIONS,
  applyTemplatePreset,
  settingsToCssVars,
  isTwoColumnTemplate,
  isPhotoTemplate,
  DEFAULT_TEMPLATE_SETTINGS,
  type TemplateType,
  type TemplateSettings,
} from '@/lib/types/template-settings';

/**
 * The hand-written templates. The preset-driven ones are counted from
 * `PROFILE_PRESET_IDS` instead of being listed here, so adding a preset does not
 * need a second edit in a test.
 */
const BASE_TEMPLATES: TemplateType[] = [
  'swiss-single',
  'swiss-two-column',
  'modern',
  'modern-two-column',
  'latex',
  'clean',
  'vivid',
  'vivid-single',
  'modern-deedy',
  'deedy',
  'photo-sidebar',
  'editorial',
];

describe('template registration', () => {
  it('includes every template with non-empty metadata', async () => {
    const { PROFILE_PRESET_IDS } = await import('@/components/resume/profile-presets');
    const ids = TEMPLATE_OPTIONS.map((t) => t.id);
    expect(ids).toEqual(
      expect.arrayContaining<TemplateType>([
        ...BASE_TEMPLATES,
        ...(PROFILE_PRESET_IDS as TemplateType[]),
      ])
    );
    expect(ids).toHaveLength(BASE_TEMPLATES.length + PROFILE_PRESET_IDS.length);

    for (const opt of TEMPLATE_OPTIONS) {
      expect(opt.name.length).toBeGreaterThan(0);
      expect(opt.description.length).toBeGreaterThan(0);
    }
  });

  it('registers every profile preset as a template', async () => {
    // A preset the engine can draw but nobody registered is invisible in the picker.
    const { PROFILE_PRESET_IDS } = await import('@/components/resume/profile-presets');
    const ids = new Set(TEMPLATE_OPTIONS.map((option) => option.id as string));
    for (const preset of PROFILE_PRESET_IDS) {
      expect(ids.has(preset), preset).toBe(true);
    }
  });

  it('has unique template ids', () => {
    const ids = TEMPLATE_OPTIONS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('applyTemplatePreset', () => {
  it('seeds signature fonts for single-typeface templates', () => {
    const clean = applyTemplatePreset(DEFAULT_TEMPLATE_SETTINGS, 'clean');
    expect(clean.template).toBe('clean');
    expect(clean.fontSize.headerFont).toBe('sans-serif');
    expect(clean.fontSize.bodyFont).toBe('sans-serif');

    const latex = applyTemplatePreset(DEFAULT_TEMPLATE_SETTINGS, 'latex');
    expect(latex.template).toBe('latex');
    expect(latex.fontSize.headerFont).toBe('serif');
    expect(latex.fontSize.bodyFont).toBe('serif');

    const deedy = applyTemplatePreset(DEFAULT_TEMPLATE_SETTINGS, 'modern-deedy');
    expect(deedy.template).toBe('modern-deedy');
    expect(deedy.fontSize.headerFont).toBe('sans-serif');
    expect(deedy.fontSize.bodyFont).toBe('sans-serif');
  });

  it('leaves fonts untouched for templates without a preset', () => {
    const custom: TemplateSettings = {
      ...DEFAULT_TEMPLATE_SETTINGS,
      fontSize: { ...DEFAULT_TEMPLATE_SETTINGS.fontSize, headerFont: 'mono', bodyFont: 'mono' },
    };
    const modern = applyTemplatePreset(custom, 'modern');
    expect(modern.template).toBe('modern');
    expect(modern.fontSize.headerFont).toBe('mono');
    expect(modern.fontSize.bodyFont).toBe('mono');
  });

  it('preserves unrelated settings when applying a preset', () => {
    const custom: TemplateSettings = {
      ...DEFAULT_TEMPLATE_SETTINGS,
      pageSize: 'LETTER',
      compactMode: true,
    };
    const clean = applyTemplatePreset(custom, 'clean');
    expect(clean.pageSize).toBe('LETTER');
    expect(clean.compactMode).toBe(true);
    expect(clean.margins).toEqual(custom.margins);
  });
});

describe('editorial template', () => {
  it('is a two-column photo template', () => {
    expect(isTwoColumnTemplate('editorial')).toBe(true);
    expect(isPhotoTemplate('editorial')).toBe(true);
  });

  it('seeds its signature look: gold accent, large portrait, serif headings', () => {
    const preset = applyTemplatePreset(DEFAULT_TEMPLATE_SETTINGS, 'editorial');
    expect(preset.accentColor).toBe('gold');
    expect(preset.photoSize).toBe(3);
    expect(preset.fontSize.headerFont).toBe('serif');
    expect(preset.fontSize.bodyFont).toBe('sans-serif');
  });

  it('keeps serif and sans choices independent', () => {
    const vars = settingsToCssVars(
      {
        ...DEFAULT_TEMPLATE_SETTINGS,
        template: 'editorial',
        accentColor: 'gold',
        fontSize: { ...DEFAULT_TEMPLATE_SETTINGS.fontSize, headerFont: 'serif', bodyFont: 'sans-serif' },
      },
      'en'
    ) as Record<string, string>;
    expect(vars['--header-font']).toContain('"Noto Serif"');
    expect(vars['--body-font']).toContain('"Noto Sans"');
    expect(vars['--resume-accent-primary']).toBe('#A98C60');
  });
});

describe('modern-deedy template', () => {
  const settings = (template: TemplateType, font: 'serif' | 'sans-serif' | 'mono') => ({
    ...DEFAULT_TEMPLATE_SETTINGS,
    template,
    fontSize: { ...DEFAULT_TEMPLATE_SETTINGS.fontSize, headerFont: font, bodyFont: font },
  });
  const fonts = (template: TemplateType, font: 'serif' | 'sans-serif' | 'mono') =>
    settingsToCssVars(settings(template, font), 'en') as Record<string, string>;

  it('is a single-column layout', () => {
    expect(isTwoColumnTemplate('modern-deedy')).toBe(false);
  });

  it('resolves its sans-serif choice to self-hosted Lato, ahead of the sans fallbacks', () => {
    const vars = fonts('modern-deedy', 'sans-serif');
    expect(vars['--body-font']).toMatch(/^var\(--font-lato\), "Noto Sans", ui-sans-serif/);
    expect(vars['--header-font']).toMatch(/^var\(--font-lato\), "Noto Sans", ui-sans-serif/);
  });

  it('keeps the Serif and Mono choices live and leaves other templates on the system sans', () => {
    expect(fonts('modern-deedy', 'serif')['--body-font']).not.toContain('--font-lato');
    expect(fonts('modern-deedy', 'mono')['--header-font']).not.toContain('--font-lato');
    expect(fonts('clean', 'sans-serif')['--body-font']).not.toContain('--font-lato');
  });
});
