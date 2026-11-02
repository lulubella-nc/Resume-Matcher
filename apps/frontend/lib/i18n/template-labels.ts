import type { TemplateType } from '@/lib/types/template-settings';

/**
 * i18n key for each template's copy.
 *
 * Templates are keyed in kebab-case (`'rail-notes'`) but the message files use the
 * camelCase form (`railNotes`), so the mapping has to live somewhere. Keeping it in
 * one table — instead of a per-template object literal in every selector — means a
 * new template is registered once and shows up in the picker, the tooltip and any
 * future list.
 */
const LABEL_KEYS: Record<TemplateType, string> = {
  'swiss-single': 'swissSingle',
  'swiss-two-column': 'swissTwoColumn',
  modern: 'modern',
  'modern-two-column': 'modernTwoColumn',
  latex: 'latex',
  clean: 'clean',
  vivid: 'vivid',
  'vivid-single': 'vividSingle',
  'modern-deedy': 'modernDeedy',
  deedy: 'deedy',
  'photo-sidebar': 'photoSidebar',
  editorial: 'editorial',
  'rail-notes': 'railNotes',
  'label-chips': 'labelChips',
  'classic-rules': 'classicRules',
  numbered: 'numbered',
  'night-rail': 'nightRail',
  'band-rail': 'bandRail',
  timeline: 'timeline',
  'rule-rail': 'ruleRail',
  'serif-rail': 'serifRail',
  'blue-rail': 'blueRail',
  'night-band': 'nightBand',
  framed: 'framed',
  panels: 'panels',
  'photo-panel': 'photoPanel',
  'ats-classic': 'atsClassic',
};

export interface TemplateLabel {
  name: string;
  description: string;
}

export type TemplateLabelMap = Record<TemplateType, TemplateLabel>;

export function templateLabels(t: (key: string) => string): TemplateLabelMap {
  const labels = {} as TemplateLabelMap;
  for (const [id, key] of Object.entries(LABEL_KEYS) as [TemplateType, string][]) {
    labels[id] = {
      name: t(`builder.formatting.templates.${key}.name`),
      description: t(`builder.formatting.templates.${key}.description`),
    };
  }
  return labels;
}
