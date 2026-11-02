/**
 * Resume Template Settings
 *
 * Defines the structure for template selection and formatting controls.
 * These settings affect both the live preview and PDF generation.
 */

export type TemplateType =
  | 'swiss-single'
  | 'swiss-two-column'
  | 'modern'
  | 'modern-two-column'
  | 'latex'
  | 'clean'
  | 'vivid'
  | 'vivid-single'
  | 'modern-deedy'
  | 'deedy'
  | 'photo-sidebar'
  | 'editorial'
  | 'rail-notes'
  | 'label-chips'
  | 'classic-rules'
  | 'numbered'
  | 'night-rail'
  | 'band-rail'
  | 'timeline'
  | 'rule-rail'
  | 'serif-rail'
  | 'blue-rail'
  | 'night-band'
  | 'framed'
  | 'panels'
  | 'photo-panel'
  | 'ats-classic';

const TWO_COLUMN_TEMPLATES: ReadonlySet<TemplateType> = new Set([
  'swiss-two-column',
  'modern-two-column',
  'vivid',
  'deedy',
  'photo-sidebar',
  'editorial',
  'rail-notes',
  'night-rail',
  'band-rail',
  'timeline',
  'rule-rail',
  'serif-rail',
  'blue-rail',
  'framed',
  'panels',
  'photo-panel',
]);

/** Two-column layouts can be read out of order by ATS parsers. */
export function isTwoColumnTemplate(template: TemplateType): boolean {
  return TWO_COLUMN_TEMPLATES.has(template);
}

/** Templates that can show a portrait photo and therefore read the photo controls. */
const PHOTO_TEMPLATES: ReadonlySet<TemplateType> = new Set([
  'photo-sidebar',
  'editorial',
  'rail-notes',
  'night-rail',
  'band-rail',
  'timeline',
  'serif-rail',
  'blue-rail',
  'night-band',
  'panels',
  'photo-panel',
]);

export function isPhotoTemplate(template: TemplateType): boolean {
  return PHOTO_TEMPLATES.has(template);
}

export type PhotoShape = 'circle' | 'square';

/** 1 = small, 2 = medium, 3 = large. */
export type PhotoSizeLevel = 1 | 2 | 3;

export type PageSize = 'A4' | 'LETTER';

/**
 * Accent palettes. The first seven are the original saturated swatches; the rest are
 * low-saturation neutrals for readers who want a quieter document (ash, graphite,
 * navy, denim, sage, sand).
 */
export type AccentColor =
  | 'blue'
  | 'green'
  | 'orange'
  | 'red'
  | 'purple'
  | 'teal'
  | 'gold'
  | 'navy'
  | 'denim'
  | 'sage'
  | 'ash'
  | 'graphite'
  | 'sand';

export type SpacingLevel = 1 | 2 | 3 | 4 | 5;

export type HeaderFontFamily = 'serif' | 'sans-serif' | 'mono';
export type BodyFontFamily = 'serif' | 'sans-serif' | 'mono';

export interface MarginSettings {
  top: number; // 5-25mm
  bottom: number;
  left: number;
  right: number;
}

export interface SpacingSettings {
  section: SpacingLevel; // Gap between major sections
  item: SpacingLevel; // Gap between items within sections
  lineHeight: SpacingLevel; // Text line height
}

export interface FontSizeSettings {
  base: SpacingLevel; // Overall text scale
  headerScale: SpacingLevel; // Header size multiplier
  headerFont: HeaderFontFamily; // Header font family
  bodyFont: BodyFontFamily; // Body text font family
}

export interface TemplateSettings {
  template: TemplateType;
  pageSize: PageSize;
  margins: MarginSettings;
  spacing: SpacingSettings;
  fontSize: FontSizeSettings;
  compactMode: boolean; // Apply tighter spacing across the board
  showContactIcons: boolean; // Show icons next to contact info
  accentColor: AccentColor; // Accent color for Modern template
  // Photo controls (read by the photo templates only).
  showPhoto: boolean;
  photoShape: PhotoShape;
  photoSize: PhotoSizeLevel;
  // On saved settings: which builder session saved them, and its save number.
  session?: string | null;
  revision?: number;
}

/**
 * Default template settings
 */
export const DEFAULT_TEMPLATE_SETTINGS: TemplateSettings = {
  template: 'swiss-single',
  pageSize: 'A4',
  margins: { top: 10, bottom: 10, left: 10, right: 10 },
  spacing: { section: 3, item: 2, lineHeight: 3 },
  fontSize: { base: 3, headerScale: 3, headerFont: 'serif', bodyFont: 'sans-serif' },
  compactMode: false,
  showContactIcons: false,
  accentColor: 'blue',
  showPhoto: true,
  photoShape: 'circle',
  photoSize: 2,
};

/**
 * Page size dimensions for display
 */
export const PAGE_SIZE_INFO: Record<PageSize, { name: string; dimensions: string }> = {
  A4: { name: 'A4', dimensions: '210 × 297 mm' },
  LETTER: { name: 'US Letter', dimensions: '8.5 × 11 in' },
};

/**
 * CSS Variable mappings for spacing levels
 */
export const SECTION_SPACING_MAP: Record<SpacingLevel, string> = {
  1: '0.375rem', // 6px
  2: '0.625rem', // 10px
  3: '1rem', // 16px - default
  4: '1.25rem', // 20px
  5: '1.5rem', // 24px
};

export const ITEM_SPACING_MAP: Record<SpacingLevel, string> = {
  1: '0.125rem', // 2px
  2: '0.25rem', // 4px - default
  3: '0.5rem', // 8px
  4: '0.75rem', // 12px
  5: '1rem', // 16px
};

export const LINE_HEIGHT_MAP: Record<SpacingLevel, number> = {
  1: 1.15, // tight
  2: 1.25,
  3: 1.35, // default
  4: 1.45,
  5: 1.55, // loose
};

export const FONT_SIZE_MAP: Record<SpacingLevel, string> = {
  1: '11px',
  2: '12px',
  3: '14px', // default
  4: '15px',
  5: '16px',
};

/** Portrait sizes for the photo templates (see --resume-photo-size). */
export const PHOTO_SIZE_MAP: Record<PhotoSizeLevel, string> = {
  1: '56px',
  2: '76px', // default
  3: '96px',
};

export const HEADER_SCALE_MAP: Record<SpacingLevel, number> = {
  1: 1.5,
  2: 1.75,
  3: 2, // default
  4: 2.25,
  5: 2.5,
};

// Section header scale (SUMMARY, EXPERIENCE, etc.) - slightly smaller than name
export const SECTION_HEADER_SCALE_MAP: Record<SpacingLevel, number> = {
  1: 1.0,
  2: 1.1,
  3: 1.2, // default
  4: 1.3,
  5: 1.4,
};

/**
 * CJK fallback ordering, per content locale.
 *
 * Noto Sans SC, KR and JP all cover Han ideographs, and SC additionally covers
 * ~93% of kana — so whichever face is listed first wins for any shared
 * codepoint. A single static order cannot be right for every locale:
 *
 *   - SC first  → correct Chinese, but Japanese kana renders in SC forms
 *   - JP first  → correct Japanese, but Chinese Han renders in JP forms
 *   - Hangul    → only KR covers it meaningfully (SC covers 0.7%, i.e. tofu)
 *
 * so the stack is ordered by the locale the document is actually rendered in.
 */
const CJK_FONT_STACKS: Record<string, string[]> = {
  zh: ['--font-noto-sans-sc', '--font-noto-sans-jp', '--font-noto-sans-kr'],
  ja: ['--font-noto-sans-jp', '--font-noto-sans-kr', '--font-noto-sans-sc'],
  ko: ['--font-noto-sans-kr', '--font-noto-sans-jp', '--font-noto-sans-sc'],
};

const DEFAULT_CJK_STACK = CJK_FONT_STACKS.zh;

const cjkVars = (locale?: string): string => {
  const key = (locale ?? '').toLowerCase().split('-')[0];
  const stack = CJK_FONT_STACKS[key] ?? DEFAULT_CJK_STACK;
  return stack.map((v) => `var(${v})`).join(', ');
};

// Header font family mapping. Exported as functions of the locale; the eager
// maps below preserve the previous default-ordering API for existing callers.
// Each stack starts with a face the app ships (loaded by components/dashboard/
// resume-component.tsx), so the preview and the PDF renderer use the same font file
// whatever fonts their machines have.
export const buildHeaderFontMap = (locale?: string): Record<HeaderFontFamily, string> => ({
  serif: `"Noto Serif", ui-serif, Georgia, Cambria, "Times New Roman", ${cjkVars(locale)}, Times, serif`,
  'sans-serif': `"Noto Sans", ui-sans-serif, system-ui, ${cjkVars(locale)}, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"`,
  mono: `"Noto Sans Mono", ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, ${cjkVars(locale)}, monospace`,
});

export const buildBodyFontMap = (locale?: string): Record<BodyFontFamily, string> =>
  buildHeaderFontMap(locale);

export const HEADER_FONT_MAP: Record<HeaderFontFamily, string> = buildHeaderFontMap();
export const BODY_FONT_MAP: Record<BodyFontFamily, string> = buildBodyFontMap();

/**
 * Accent color mapping for Modern template
 */
export const ACCENT_COLOR_MAP: Record<
  AccentColor,
  { primary: string; light: string; name: string }
> = {
  blue: { primary: '#1D4ED8', light: '#DBEAFE', name: 'Blue' },
  green: { primary: '#15803D', light: '#DCFCE7', name: 'Green' },
  orange: { primary: '#EA580C', light: '#FED7AA', name: 'Orange' },
  red: { primary: '#DC2626', light: '#FEE2E2', name: 'Red' },
  purple: { primary: '#6D28D9', light: '#EDE9FE', name: 'Purple' },
  teal: { primary: '#0F766E', light: '#CCFBF1', name: 'Teal' },
  // The Editorial template's signature: a muted type-gold sampled from its reference.
  gold: { primary: '#A98C60', light: '#F4EEE1', name: 'Gold' },
  // Low-saturation set. Ordered cool → warm so the picker reads as a ramp, and every
  // primary stays legible as heading text on white (all ≥ 3:1, most ≥ 4.5:1).
  navy: { primary: '#22395B', light: '#E2E8F1', name: 'Navy' },
  denim: { primary: '#5A7794', light: '#E6EEF5', name: 'Denim' },
  sage: { primary: '#6B8A73', light: '#EAF1EC', name: 'Sage' },
  ash: { primary: '#7E858E', light: '#F0F1F3', name: 'Ash' },
  graphite: { primary: '#3E444B', light: '#E6E8EA', name: 'Graphite' },
  sand: { primary: '#9B8A76', light: '#F4EFE9', name: 'Sand' },
};

// Compact mode multiplier (applied to spacing values only, NOT line-height)
export const COMPACT_MULTIPLIER = 0.6;

// Line height gets a gentler reduction in compact mode
export const COMPACT_LINE_HEIGHT_MULTIPLIER = 0.92;

/**
 * Convert TemplateSettings to CSS custom properties
 */
export function settingsToCssVars(
  settings?: TemplateSettings,
  locale?: string
): React.CSSProperties {
  const s = settings || DEFAULT_TEMPLATE_SETTINGS;
  const compact = s.compactMode ? COMPACT_MULTIPLIER : 1;

  // Margins remain literal; compact mode only affects spacing/line-height.
  const marginTop = s.margins.top;
  const marginBottom = s.margins.bottom;
  const marginLeft = s.margins.left;
  const marginRight = s.margins.right;

  // Get accent colors for Modern template
  const accentColors = ACCENT_COLOR_MAP[s.accentColor];

  // Modern Deedy's signature face is Lato: its "sans-serif" choice resolves to the
  // self-hosted --font-lato (app/layout.tsx), with the regular sans stack as fallback.
  const withTemplateFace = (map: Record<HeaderFontFamily, string>) =>
    s.template === 'modern-deedy'
      ? { ...map, 'sans-serif': `var(--font-lato), ${map['sans-serif']}` }
      : map;

  return {
    '--section-gap': s.compactMode
      ? `calc(${SECTION_SPACING_MAP[s.spacing.section]} * ${compact})`
      : SECTION_SPACING_MAP[s.spacing.section],
    '--item-gap': s.compactMode
      ? `calc(${ITEM_SPACING_MAP[s.spacing.item]} * ${compact})`
      : ITEM_SPACING_MAP[s.spacing.item],
    // Line-height uses a gentler multiplier to avoid text overlap
    '--line-height': s.compactMode
      ? LINE_HEIGHT_MAP[s.spacing.lineHeight] * COMPACT_LINE_HEIGHT_MULTIPLIER
      : LINE_HEIGHT_MAP[s.spacing.lineHeight],
    '--font-size-base': FONT_SIZE_MAP[s.fontSize.base],
    '--header-scale': HEADER_SCALE_MAP[s.fontSize.headerScale],
    '--section-header-scale': SECTION_HEADER_SCALE_MAP[s.fontSize.headerScale],
    '--header-font': withTemplateFace(buildHeaderFontMap(locale))[s.fontSize.headerFont],
    '--body-font': withTemplateFace(buildBodyFontMap(locale))[s.fontSize.bodyFont],
    '--margin-top': `${marginTop}mm`,
    '--margin-bottom': `${marginBottom}mm`,
    '--margin-left': `${marginLeft}mm`,
    '--margin-right': `${marginRight}mm`,
    // Accent colors for Modern template
    '--resume-accent-primary': accentColors.primary,
    '--resume-accent-light': accentColors.light,
    // Portrait size for the photo templates
    '--resume-photo-size': PHOTO_SIZE_MAP[s.photoSize ?? DEFAULT_TEMPLATE_SETTINGS.photoSize],
  } as React.CSSProperties;
}

/**
 * Template metadata for UI display
 */
export interface TemplateInfo {
  id: TemplateType;
  name: string;
  description: string;
}

export const TEMPLATE_OPTIONS: TemplateInfo[] = [
  {
    id: 'swiss-single',
    name: 'Single Column',
    description: 'Traditional full-width layout with maximum content density',
  },
  {
    id: 'swiss-two-column',
    name: 'Two Column',
    description: 'Experience-focused main column with sidebar for skills',
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Colorful accents with customizable theme colors',
  },
  {
    id: 'modern-two-column',
    name: 'Modern Two Column',
    description: 'Two-column layout with modern colorful accents and themes',
  },
  {
    id: 'latex',
    name: 'LaTeX',
    description: 'Classic serif academic layout with ruled section headers',
  },
  {
    id: 'clean',
    name: 'Clean',
    description: 'Minimal sans layout with large understated section headers',
  },
  {
    id: 'vivid',
    name: 'Vivid',
    description: 'Colorful two-column layout with accent headers and arrow bullets',
  },
  {
    id: 'vivid-single',
    name: 'Vivid Single Column',
    description: 'Colorful single-column layout with accent headers and arrow bullets',
  },
  {
    id: 'modern-deedy',
    name: 'Modern Deedy',
    description: 'Dense one-page layout in Lato with light grey uppercase section headings',
  },
  {
    id: 'deedy',
    name: 'Deedy',
    description:
      'Two-column layout with a hairline name, a narrow left column and light gray headings',
  },
  {
    id: 'photo-sidebar',
    name: 'Photo Sidebar',
    description: 'Colored rail with a portrait photo, contact details and skills beside your story',
  },
  {
    id: 'editorial',
    name: 'Editorial',
    description:
      'Airy two-column layout with gold serif headings, a round portrait and a plain skills list',
  },
  {
    id: 'rail-notes',
    name: 'Rail Notes',
    description:
      'Right rail with a labelled contact block, icon section headings and ruled skills',
  },
  {
    id: 'label-chips',
    name: 'Label Chips',
    description:
      'Colour band behind the name with black chip section labels and ruled skill columns',
  },
  {
    id: 'classic-rules',
    name: 'Classic Rules',
    description:
      'Centred heading, letterspaced section labels over rules and dates in their own column',
  },
  {
    id: 'numbered',
    name: 'Numbered',
    description:
      'Numbered sections with heavy rules and a label/value contact grid',
  },
  {
    id: 'night-rail',
    name: 'Night Rail',
    description:
      'Full-height navy rail with white ruled skills beside the story column',
  },
  {
    id: 'band-rail',
    name: 'Band Rail',
    description:
      'Colour band header over a narrow rail of skills and languages',
  },
  {
    id: 'timeline',
    name: 'Timeline',
    description:
      'Centred portrait over the name, icon labels in caps and a spine hanging a node on every role',
  },
  {
    id: 'rule-rail',
    name: 'Rule Rail',
    description:
      'Oversized name over the role, a left rail closed by a vertical rule and ruled skills',
  },
  {
    id: 'serif-rail',
    name: 'Serif Rail',
    description:
      'Serif name in accent beside a square portrait, letterspaced caps and a right rail of ruled skills',
  },
  {
    id: 'blue-rail',
    name: 'Blue Rail',
    description:
      'Portrait beside the name, icon labels in sentence case and a light rule under every skill',
  },
  {
    id: 'night-band',
    name: 'Night Band',
    description:
      'Dark band with a centred portrait, a serif name and a contact strip, then one reading column',
  },
  {
    id: 'framed',
    name: 'Framed',
    description:
      'Name and role inside a ruled box, uppercase headings on a full rule and a left rail',
  },
  {
    id: 'panels',
    name: 'Panels',
    description:
      'Display name beside the portrait, oversized section labels and grey panels down the right column',
  },
  {
    id: 'photo-panel',
    name: 'Photo Panel',
    description:
      'Tall portrait filling the head of a grey right column, italic display name beside it',
  },
  {
    id: 'ats-classic',
    name: 'ATS Classic',
    description:
      'Dense single column: centred name, uppercase headings on a rule, role and dates on the entry line',
  },
];

/**
 * Signature font presets for single-typeface templates.
 *
 * LaTeX and Clean bind their headers to `--header-font` and body to `--body-font`, so
 * both font controls are live. Selecting one of these templates applies its signature
 * fonts (so it matches its reference look by default); the user can then override either
 * control. Templates not listed here keep the current font settings on selection.
 */
export const TEMPLATE_FONT_PRESETS: Partial<
  Record<TemplateType, { headerFont: HeaderFontFamily; bodyFont: BodyFontFamily }>
> = {
  latex: { headerFont: 'serif', bodyFont: 'serif' },
  clean: { headerFont: 'sans-serif', bodyFont: 'sans-serif' },
  'modern-deedy': { headerFont: 'sans-serif', bodyFont: 'sans-serif' },
  'photo-sidebar': { headerFont: 'sans-serif', bodyFont: 'sans-serif' },
  editorial: { headerFont: 'serif', bodyFont: 'sans-serif' },
  'rail-notes': { headerFont: 'serif', bodyFont: 'sans-serif' },
  'label-chips': { headerFont: 'sans-serif', bodyFont: 'sans-serif' },
  'classic-rules': { headerFont: 'serif', bodyFont: 'sans-serif' },
  numbered: { headerFont: 'sans-serif', bodyFont: 'sans-serif' },
  'night-rail': { headerFont: 'sans-serif', bodyFont: 'sans-serif' },
  'band-rail': { headerFont: 'sans-serif', bodyFont: 'sans-serif' },
  timeline: { headerFont: 'serif', bodyFont: 'sans-serif' },
  'rule-rail': { headerFont: 'sans-serif', bodyFont: 'sans-serif' },
  'serif-rail': { headerFont: 'serif', bodyFont: 'serif' },
  'blue-rail': { headerFont: 'sans-serif', bodyFont: 'sans-serif' },
  'night-band': { headerFont: 'serif', bodyFont: 'sans-serif' },
  framed: { headerFont: 'sans-serif', bodyFont: 'sans-serif' },
  panels: { headerFont: 'sans-serif', bodyFont: 'sans-serif' },
  'photo-panel': { headerFont: 'sans-serif', bodyFont: 'sans-serif' },
  'ats-classic': { headerFont: 'serif', bodyFont: 'serif' },
};

/**
 * Signature look applied when a template is selected: the accent and portrait
 * scale that make the template match its reference design. Same contract as
 * TEMPLATE_FONT_PRESETS — applied once on selection, then fully user-overridable.
 */
export const TEMPLATE_LOOK_PRESETS: Partial<
  Record<TemplateType, { accentColor?: AccentColor; photoSize?: PhotoSizeLevel }>
> = {
  editorial: { accentColor: 'gold', photoSize: 3 },
  'photo-panel': { photoSize: 3 },
  panels: { photoSize: 2 },
};

/**
 * Return settings with the given template applied, seeding the template's signature
 * fonts when it has a preset. Use this at every template-change entry point so the
 * single-typeface templates render their reference look by default.
 */
export function applyTemplatePreset(
  settings: TemplateSettings,
  template: TemplateType
): TemplateSettings {
  const fonts = TEMPLATE_FONT_PRESETS[template];
  const look = TEMPLATE_LOOK_PRESETS[template];
  if (!fonts && !look) return { ...settings, template };

  return {
    ...settings,
    template,
    ...(look?.accentColor ? { accentColor: look.accentColor } : {}),
    ...(look?.photoSize ? { photoSize: look.photoSize } : {}),
    ...(fonts
      ? {
          fontSize: {
            ...settings.fontSize,
            headerFont: fonts.headerFont,
            bodyFont: fonts.bodyFont,
          },
        }
      : {}),
  };
}
