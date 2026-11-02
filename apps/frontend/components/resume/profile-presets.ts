/**
 * Presets for the shared profile-layout engine (`resume-profile.tsx`).
 *
 * The reference library of resume designs (the `*-resume-examples.jpg` pages) turned
 * out to hold far fewer *designs* than images: the same layout is reused across job
 * titles with a different accent colour. So each design is one preset here, and the
 * engine reads the preset instead of branching on a template id.
 *
 * Two rules the presets obey:
 * - A preset never invents data. Skill "levels", dot scales and "Expert" badges are
 *   deliberately absent: the resume data has names, not proficiency, and printing a
 *   score the user never entered is a lie an ATS or a recruiter cannot verify.
 * - Everything colour-related lives here, not in the component, so a design can be
 *   retinted without touching markup.
 */

export type ProfilePresetId =
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

/** Where the rail sits, if any. */
export type ProfileLayout =
  | 'single'
  | 'rail-right'
  | 'rail-left'
  /** Left rail closed by a vertical hairline instead of a filled column. */
  | 'rail-divider'
  /** Right rail whose blocks sit in filled panels. */
  | 'panel-right'
  /** Right column that opens with a full-bleed portrait. */
  | 'photo-panel'
  | 'night-rail';

/** How the identity block is drawn. */
export type ProfileHeader =
  | 'plain'
  /** Centred name and role, contact on one dot-separated line. */
  | 'centered'
  /** Colour band behind the name, contact on a strip underneath. */
  | 'band'
  /** Plain name over a centred portrait, contact on one line below. */
  | 'centered-photo'
  /** Portrait at the left, name and contact to its right. */
  | 'inline'
  /** Oversized name set over the role, closed by a hairline. */
  | 'display'
  /** Name and role inside a ruled box. */
  | 'boxed'
  /** Dark band with a centred portrait and a darker contact strip. */
  | 'night';

/** How a section label is drawn. */
export type ProfileHeading =
  | 'icon-rule'
  | 'chip'
  | 'rule-label'
  | 'numbered'
  | 'plain'
  /** Icon beside a bold sentence-case label. */
  | 'icon-plain'
  /** Icon beside a letterspaced uppercase label. */
  | 'icon-caps'
  /** Uppercase letterspaced label sitting on a full-width hairline. */
  | 'underline'
  /** Oversized accent label, no rule at all. */
  | 'display'
  /** Letterspaced serif caps, no rule. */
  | 'tracked-serif';

/**
 * Skills presentation. No variant encodes a proficiency — `bars` and `ruled` draw a
 * hairline under each name as a rule, not as a filled track.
 */
export type ProfileSkills = 'plain' | 'bars' | 'ruled' | 'rule-sep' | 'two-col';

/** How an experience/education entry is laid out. */
export type ProfileEntry =
  | 'stacked'
  | 'date-column'
  /** Title left, location right on the same line, dates beneath. */
  | 'title-right'
  /** Entries hang off a vertical spine with a node per entry. */
  | 'timeline';

/** How the contact block is drawn. */
export type ProfileContact = 'inline' | 'stacked' | 'grid';

export interface ProfilePreset {
  id: ProfilePresetId;
  layout: ProfileLayout;
  header: ProfileHeader;
  heading: ProfileHeading;
  skills: ProfileSkills;
  entry: ProfileEntry;
  contact: ProfileContact;
  /** Headline colour, also used for rules and chips. */
  accent: string;
  /** Tint for the rail background (rail layouts), the band or the panels. */
  surface: string;
  /** Text colour on `surface`. */
  onSurface: string;
  /** Section labels set in a serif face. */
  serifHeadings?: boolean;
  /** Identity area can show a portrait. */
  photo?: boolean;
  /** Rail headings ("Details" / "Skills") are drawn in this style. */
  railLabelled?: boolean;
  /** The rail carries the contact block. Defaults to true. */
  railContact?: boolean;
  /** In a left rail the contact block comes before the skills. */
  railContactFirst?: boolean;
  /** The display name takes the accent colour. */
  accentName?: boolean;
  /** Name set at display scale. */
  largeName?: boolean;
  /** Entry titles sit on a filled bar of `accent`. */
  titleBar?: boolean;
  /** Italic display name (one reference sets the name in italic). */
  italicName?: boolean;
}

const INK = '#1c1b19';
const PAPER = '#ffffff';

export const PROFILE_PRESETS: Record<ProfilePresetId, ProfilePreset> = {
  /**
   * Right rail with a labelled contact block, icon section headings sitting on a
   * hairline, and skills ruled underneath. The library's most reused design
   * (agricultural / city manager / health & safety / HR director).
   */
  'rail-notes': {
    id: 'rail-notes',
    layout: 'rail-right',
    header: 'plain',
    heading: 'icon-rule',
    skills: 'bars',
    entry: 'stacked',
    contact: 'stacked',
    accent: '#8e2f32',
    surface: PAPER,
    onSurface: INK,
    photo: true,
    railLabelled: true,
  },

  /**
   * Full-bleed colour band behind the name, section labels as black chips, skills
   * in two ruled columns (art director / electrical engineer).
   */
  'label-chips': {
    id: 'label-chips',
    layout: 'single',
    header: 'band',
    heading: 'chip',
    skills: 'two-col',
    entry: 'stacked',
    contact: 'stacked',
    accent: '#141414',
    surface: '#f2e14c',
    onSurface: '#141414',
  },

  /**
   * The classic centred heading, letterspaced labels over rules, dates in their own
   * column (call centre / construction worker / electrician / mechanical engineer).
   */
  'classic-rules': {
    id: 'classic-rules',
    layout: 'single',
    header: 'centered',
    heading: 'rule-label',
    skills: 'two-col',
    entry: 'date-column',
    contact: 'inline',
    accent: '#1c1b19',
    surface: PAPER,
    onSurface: INK,
    serifHeadings: true,
  },

  /**
   * Numbered sections with a heavy underline, contact as a label/value grid
   * (CNC machinist / digital marketing manager).
   */
  numbered: {
    id: 'numbered',
    layout: 'single',
    header: 'plain',
    heading: 'numbered',
    skills: 'two-col',
    entry: 'date-column',
    contact: 'grid',
    accent: '#111111',
    surface: PAPER,
    onSurface: INK,
  },

  /**
   * Story column beside a full-height navy rail with white rules under every skill
   * (civil engineer / technician).
   */
  'night-rail': {
    id: 'night-rail',
    layout: 'night-rail',
    header: 'plain',
    heading: 'plain',
    skills: 'bars',
    entry: 'stacked',
    contact: 'stacked',
    accent: '#12294a',
    surface: '#0f2440',
    onSurface: '#f4f4f2',
    photo: true,
    railLabelled: true,
  },

  /**
   * Colour band across the top, then a narrow left rail holding skills and
   * languages (engineer / research engineer / structural engineer).
   */
  'band-rail': {
    id: 'band-rail',
    layout: 'rail-left',
    header: 'band',
    heading: 'plain',
    skills: 'bars',
    entry: 'stacked',
    contact: 'stacked',
    accent: '#111111',
    surface: '#3ee08f',
    onSurface: '#101010',
    photo: true,
    railLabelled: true,
  },

  /**
   * Portrait centred over the name, icon labels in letterspaced caps, and a spine
   * hanging the entries off a node per role (construction manager / federal /
   * immigration lawyer).
   */
  timeline: {
    id: 'timeline',
    layout: 'rail-left',
    header: 'centered-photo',
    heading: 'icon-caps',
    skills: 'bars',
    entry: 'timeline',
    contact: 'inline',
    accent: '#1c1b19',
    surface: PAPER,
    onSurface: INK,
    photo: true,
    railLabelled: true,
    railContactFirst: true,
  },

  /**
   * Oversized name over the role, a left rail closed by a vertical rule, contact
   * stacked under small caps labels, skills ruled edge to edge
   * (correctional officer / process engineer).
   */
  'rule-rail': {
    id: 'rule-rail',
    layout: 'rail-divider',
    header: 'display',
    heading: 'underline',
    skills: 'bars',
    entry: 'title-right',
    contact: 'stacked',
    accent: '#1c1b19',
    surface: PAPER,
    onSurface: INK,
    railLabelled: true,
    railContactFirst: true,
  },

  /**
   * Serif throughout: name in red beside a square portrait, letterspaced section
   * caps, a right rail of ruled skills and languages (housekeeping).
   */
  'serif-rail': {
    id: 'serif-rail',
    layout: 'rail-right',
    header: 'inline',
    heading: 'tracked-serif',
    skills: 'rule-sep',
    entry: 'stacked',
    contact: 'inline',
    accent: '#a3281f',
    surface: PAPER,
    onSurface: INK,
    serifHeadings: true,
    photo: true,
    railLabelled: true,
    railContact: false,
    accentName: true,
  },

  /**
   * Sans with a blue accent: portrait beside the name, icon labels in sentence case,
   * a light rule under every skill in the right rail (HR generalist).
   */
  'blue-rail': {
    id: 'blue-rail',
    layout: 'rail-right',
    header: 'inline',
    heading: 'icon-plain',
    skills: 'ruled',
    entry: 'stacked',
    contact: 'stacked',
    accent: '#3f93c8',
    surface: PAPER,
    onSurface: INK,
    photo: true,
    railLabelled: true,
  },

  /**
   * Dark band: circular portrait over a serif name, contact on a darker strip, then
   * a single reading column (postal service worker).
   */
  'night-band': {
    id: 'night-band',
    layout: 'single',
    header: 'night',
    heading: 'plain',
    skills: 'plain',
    entry: 'stacked',
    contact: 'inline',
    accent: '#111111',
    surface: '#2b2b2b',
    onSurface: '#f3f1ec',
    serifHeadings: true,
    photo: true,
  },

  /**
   * Name inside a ruled box, uppercase headings on a full hairline, and a left rail
   * of details, skills and languages (project engineer).
   */
  framed: {
    id: 'framed',
    layout: 'rail-left',
    header: 'boxed',
    heading: 'underline',
    skills: 'rule-sep',
    entry: 'title-right',
    contact: 'stacked',
    accent: '#1c1b19',
    surface: PAPER,
    onSurface: INK,
    railLabelled: true,
    railContactFirst: true,
  },

  /**
   * Navy display name beside the portrait, oversized section labels, and grey
   * panels stacked down the right column (systems engineer).
   */
  panels: {
    id: 'panels',
    layout: 'panel-right',
    header: 'inline',
    heading: 'display',
    skills: 'plain',
    entry: 'stacked',
    contact: 'inline',
    accent: '#1b3a63',
    surface: '#e7e9ed',
    onSurface: '#1b3a63',
    photo: true,
    railLabelled: true,
    railContact: false,
    largeName: true,
    titleBar: true,
    accentName: true,
  },

  /**
   * A tall portrait filling the head of a grey right column, italic display name on
   * the left, plain bold section labels (the bilingual student reference).
   */
  'photo-panel': {
    id: 'photo-panel',
    layout: 'photo-panel',
    header: 'display',
    heading: 'plain',
    skills: 'plain',
    entry: 'stacked',
    contact: 'inline',
    accent: '#141414',
    surface: '#eeeeec',
    onSurface: INK,
    photo: true,
    railLabelled: true,
    railContact: false,
    largeName: true,
    italicName: true,
  },

  /**
   * The dense single column: centred name, bold contact lines, uppercase headings on
   * a rule, role and dates on the entry line. Built to be parsed (the graduate
   * school reference).
   */
  'ats-classic': {
    id: 'ats-classic',
    layout: 'single',
    header: 'centered',
    heading: 'underline',
    skills: 'plain',
    entry: 'title-right',
    contact: 'inline',
    accent: '#111111',
    surface: PAPER,
    onSurface: INK,
    serifHeadings: true,
  },
};

export const PROFILE_PRESET_IDS = Object.keys(PROFILE_PRESETS) as ProfilePresetId[];

export function isProfilePreset(id: string): id is ProfilePresetId {
  return Object.hasOwn(PROFILE_PRESETS, id);
}

export function getProfilePreset(id: ProfilePresetId): ProfilePreset {
  return PROFILE_PRESETS[id];
}
