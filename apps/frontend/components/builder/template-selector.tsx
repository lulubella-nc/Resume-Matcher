'use client';

import React from 'react';
import { type TemplateType, TEMPLATE_OPTIONS } from '@/lib/types/template-settings';
import { useTranslations } from '@/lib/i18n';
import { templateLabels as templateLabelsFor } from '@/lib/i18n/template-labels';
import { getProfilePreset, isProfilePreset } from '@/components/resume/profile-presets';

interface TemplateSelectorProps {
  value: TemplateType;
  onChange: (template: TemplateType) => void;
}

/**
 * Template Selector Component
 *
 * Visual thumbnail buttons for selecting resume templates.
 * Swiss design: Square corners, high contrast, monospace labels.
 */
export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ value, onChange }) => {
  const { t } = useTranslations();
  const templateLabels = templateLabelsFor(t);

  return (
    <div className="flex flex-wrap gap-3">
      {TEMPLATE_OPTIONS.map((template) => (
        <button
          key={template.id}
          type="button"
          onClick={() => onChange(template.id)}
          aria-pressed={value === template.id}
          className={`group flex flex-col items-center p-3 border border-ink bg-white transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-canvas ${
            value === template.id
              ? 'outline-2 outline-offset-2 outline-ink'
              : 'hover:bg-canvas focus-visible:outline-none'
          }`}
          title={templateLabels[template.id].description}
        >
          {/* Template Thumbnail */}
          <div className="mb-2">
            <TemplateThumbnail type={template.id} isActive={value === template.id} />
          </div>

          {/* Template Name */}
          <span
            className={`font-mono text-xs uppercase tracking-wider font-bold ${
              value === template.id ? 'text-ink' : 'text-ink-soft'
            }`}
          >
            {templateLabels[template.id].name}
          </span>
        </button>
      ))}
    </div>
  );
};

/**
 * Template Thumbnail
 *
 * Visual representation of each template layout
 * Exported for use in FormattingControls
 */
interface TemplateThumbnailProps {
  type: TemplateType;
  isActive: boolean;
}

export const TemplateThumbnail: React.FC<TemplateThumbnailProps> = ({ type, isActive }) => {
  const lineColor = isActive ? 'bg-primary' : 'bg-steel';
  const borderColor = isActive ? 'border-primary' : 'border-steel';
  const accentColor = isActive ? 'bg-primary/70' : 'bg-primary/50';

  // The profile presets share one engine, so their thumbnail is derived from the
  // preset (band on top, rail left/right/none) instead of a hand-drawn branch each.
  if (isProfilePreset(type)) {
    const preset = getProfilePreset(type);
    const railRight =
      preset.layout === 'rail-right' ||
      preset.layout === 'night-rail' ||
      preset.layout === 'panel-right' ||
      preset.layout === 'photo-panel';
    const railLeft = preset.layout === 'rail-left' || preset.layout === 'rail-divider';
    const railDark = preset.layout === 'night-rail';
    const railPanel = preset.layout === 'panel-right';
    const railPhoto = preset.layout === 'photo-panel';

    const lines = (count: number, width = 'w-full') => (
      <>
        {Array.from({ length: count }, (_, index) => (
          <div key={index} className={`h-0.5 ${lineColor} ${width} opacity-50`} />
        ))}
      </>
    );

    const header = () => {
      if (preset.header === 'band' || preset.header === 'night') {
        return (
          <div
            className={`flex items-end gap-1 p-1 ${
              preset.header === 'night' ? 'h-5 bg-primary/60' : 'h-4 bg-primary/30'
            }`}
          >
            <div className={`h-1 ${lineColor} w-2/3`} />
          </div>
        );
      }
      if (preset.header === 'centered' || preset.header === 'centered-photo') {
        return (
          <div className="flex flex-col items-center gap-1 p-1">
            {preset.header === 'centered-photo' && (
              <div className={`h-2.5 w-2.5 ${accentColor}`} />
            )}
            <div className={`h-1 ${lineColor} w-3/4`} />
            <div className={`h-0.5 ${lineColor} w-1/2 opacity-50`} />
          </div>
        );
      }
      if (preset.header === 'boxed') {
        return (
          <div className="p-1">
            <div className={`flex flex-col items-center gap-1 border ${borderColor} py-1`}>
              <div className={`h-1 ${lineColor} w-2/3`} />
              <div className={`h-0.5 ${lineColor} w-1/3 opacity-50`} />
            </div>
          </div>
        );
      }
      return (
        <div className="flex flex-col gap-1 p-1">
          <div className={`${preset.header === 'display' ? 'h-1.5' : 'h-1'} ${lineColor} w-2/3`} />
          <div className={`h-0.5 ${lineColor} w-1/3 opacity-50`} />
        </div>
      );
    };

    return (
      <div className={`w-16 h-20 border ${borderColor} bg-white flex flex-col overflow-hidden`}>
        {header()}
        <div className="flex flex-1 gap-1 p-1">
          {railLeft && (
            <div
              className={`w-1/4 space-y-1 border-r ${borderColor} pr-1 ${
                railDark ? 'bg-primary/20' : ''
              }`}
            >
              {lines(3)}
            </div>
          )}
          <div className="flex-1 space-y-1">
            {lines(2, 'w-5/6')}
            <div className="h-0.5" />
            {lines(3, 'w-full')}
          </div>
          {railRight && (
            <div
              className={`w-1/4 space-y-1 border-l ${borderColor} pl-1 ${
                railDark ? 'bg-primary/60' : railPanel ? 'bg-primary/15' : ''
              }`}
            >
              {railPhoto && <div className={`h-3 w-full ${accentColor}`} />}
              {lines(railPhoto ? 2 : 3)}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (type === 'swiss-single') {
    // Single column thumbnail
    return (
      <div className={`w-16 h-20 border ${borderColor} bg-white p-2 flex flex-col gap-1`}>
        {/* Header */}
        <div className={`h-2 ${lineColor} w-full`}></div>
        <div className={`h-0.5 ${lineColor} w-3/4`}></div>
        {/* Sections */}
        <div className="flex-1 space-y-1 mt-1">
          <div className={`h-0.5 ${lineColor} w-full`}></div>
          <div className={`h-0.5 ${lineColor} w-5/6 opacity-50`}></div>
          <div className={`h-0.5 ${lineColor} w-4/6 opacity-50`}></div>
          <div className="h-1"></div>
          <div className={`h-0.5 ${lineColor} w-full`}></div>
          <div className={`h-0.5 ${lineColor} w-5/6 opacity-50`}></div>
          <div className={`h-0.5 ${lineColor} w-3/6 opacity-50`}></div>
        </div>
      </div>
    );
  }

  if (type === 'latex') {
    // LaTeX thumbnail - centered name + Title-Case ruled section headers (serif feel)
    return (
      <div className={`w-16 h-20 border ${borderColor} bg-white p-2 flex flex-col gap-1`}>
        {/* Centered name + contact */}
        <div className="flex flex-col items-center gap-1">
          <div className={`h-1.5 ${lineColor} w-2/3`}></div>
          <div className={`h-0.5 ${lineColor} w-1/2 opacity-60`}></div>
        </div>
        {/* Sections: each header is a full-width line with a bottom rule */}
        <div className="flex-1 space-y-1 mt-1">
          <div className={`h-0.5 ${lineColor} w-2/5 border-b ${borderColor} pb-1`}></div>
          <div className={`h-0.5 ${lineColor} w-5/6 opacity-50`}></div>
          <div className={`h-0.5 ${lineColor} w-4/6 opacity-50`}></div>
          <div className="h-0.5"></div>
          <div className={`h-0.5 ${lineColor} w-1/3 border-b ${borderColor} pb-1`}></div>
          <div className={`h-0.5 ${lineColor} w-5/6 opacity-50`}></div>
        </div>
      </div>
    );
  }

  if (type === 'clean') {
    // Clean thumbnail - centered light name + large understated gray uppercase headers
    return (
      <div className={`w-16 h-20 border ${borderColor} bg-white p-2 flex flex-col gap-1`}>
        {/* Centered light name + contact line */}
        <div className="flex flex-col items-center gap-1">
          <div className={`h-1.5 ${lineColor} w-1/2 opacity-70`}></div>
          <div className={`h-0.5 ${lineColor} w-2/3 opacity-40`}></div>
        </div>
        {/* Large gray section headers (taller, lower opacity) + thin rule */}
        <div className="flex-1 space-y-1 mt-1">
          <div className={`h-1 ${lineColor} w-1/2 opacity-30 border-b ${borderColor}`}></div>
          <div className={`h-0.5 ${lineColor} w-5/6 opacity-50`}></div>
          <div className={`h-0.5 ${lineColor} w-4/6 opacity-50`}></div>
          <div className="h-0.5"></div>
          <div className={`h-1 ${lineColor} w-2/5 opacity-30 border-b ${borderColor}`}></div>
          <div className={`h-0.5 ${lineColor} w-5/6 opacity-50`}></div>
        </div>
      </div>
    );
  }

  if (type === 'modern') {
    // Modern template thumbnail - with accent color highlights
    return (
      <div className={`w-16 h-20 border ${borderColor} bg-white p-2 flex flex-col gap-1`}>
        {/* Header with accent underline */}
        <div className="flex flex-col items-center gap-1">
          <div className={`h-2 ${lineColor} w-3/4`}></div>
          <div className={`h-0.5 ${accentColor} w-1/3`}></div>
        </div>
        {/* Sections with accent headers */}
        <div className="flex-1 space-y-1 mt-1">
          <div className={`h-0.5 ${accentColor} w-full`}></div>
          <div className={`h-0.5 ${lineColor} w-5/6 opacity-50`}></div>
          <div className={`h-0.5 ${lineColor} w-4/6 opacity-50`}></div>
          <div className="h-0.5"></div>
          <div className={`h-0.5 ${accentColor} w-full`}></div>
          <div className={`h-0.5 ${lineColor} w-5/6 opacity-50`}></div>
          <div className={`h-0.5 ${lineColor} w-3/6 opacity-50`}></div>
        </div>
      </div>
    );
  }

  if (type === 'modern-two-column') {
    // Modern two-column template thumbnail - accent colors + two columns
    return (
      <div className={`w-16 h-20 border ${borderColor} bg-white p-2 flex flex-col gap-1`}>
        {/* Header with accent underline */}
        <div className="flex flex-col items-center gap-1">
          <div className={`h-1.5 ${lineColor} w-3/4`}></div>
          <div className={`h-0.5 ${accentColor} w-1/3`}></div>
        </div>
        {/* Two columns */}
        <div className="flex-1 flex gap-1 mt-1">
          {/* Left column (wider) - with accent headers */}
          <div className="w-2/3 space-y-1">
            <div className={`h-0.5 ${accentColor} w-full`}></div>
            <div className={`h-0.5 ${lineColor} w-5/6 opacity-50`}></div>
            <div className={`h-0.5 ${lineColor} w-4/6 opacity-50`}></div>
            <div className="h-0.5"></div>
            <div className={`h-0.5 ${accentColor} w-full`}></div>
            <div className={`h-0.5 ${lineColor} w-5/6 opacity-50`}></div>
          </div>
          {/* Right column (narrower). Active state uses a heavier full
              border instead of a left stripe (impeccable BAN 1). */}
          <div
            className={`w-1/3 border ${isActive ? 'border-primary/70' : 'border-primary/30'} pl-1 space-y-1`}
          >
            <div className={`h-0.5 ${accentColor} w-full`}></div>
            <div className={`h-0.5 ${lineColor} w-4/5 opacity-50`}></div>
            <div className="h-0.5"></div>
            <div className={`h-0.5 ${accentColor} w-full`}></div>
            <div className={`h-0.5 ${lineColor} w-3/5 opacity-50`}></div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'vivid') {
    // Vivid thumbnail - two-tone accent name + accent headers + accent arrow bullets
    return (
      <div className={`w-16 h-20 border ${borderColor} bg-white p-2 flex flex-col gap-1`}>
        {/* Two-tone name (left-aligned) */}
        <div className="flex items-center gap-1">
          <div className={`h-1.5 ${accentColor} w-1/3`}></div>
          <div className={`h-1.5 ${accentColor} w-1/4 opacity-50`}></div>
        </div>
        <div className={`h-0.5 ${lineColor} w-2/3 opacity-40`}></div>
        {/* Two columns (no divider) */}
        <div className="flex-1 flex gap-1 mt-1">
          {/* Left column with arrow ticks */}
          <div className="w-2/3 space-y-1">
            <div className={`h-0.5 ${accentColor} w-1/2`}></div>
            <div className="flex items-center gap-1">
              <div className={`h-0.5 w-0.5 ${accentColor}`}></div>
              <div className={`h-0.5 ${lineColor} w-5/6 opacity-50`}></div>
            </div>
            <div className="flex items-center gap-1">
              <div className={`h-0.5 w-0.5 ${accentColor}`}></div>
              <div className={`h-0.5 ${lineColor} w-4/6 opacity-50`}></div>
            </div>
            <div className="h-0.5"></div>
            <div className={`h-0.5 ${accentColor} w-2/5`}></div>
          </div>
          {/* Right column (sidebar) */}
          <div className="w-1/3 space-y-1">
            <div className={`h-0.5 ${accentColor} w-full`}></div>
            <div className={`h-0.5 ${lineColor} w-4/5 opacity-50`}></div>
            <div className="h-0.5"></div>
            <div className={`h-0.5 ${accentColor} w-full`}></div>
            <div className={`h-0.5 ${lineColor} w-3/5 opacity-50`}></div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'vivid-single') {
    // Vivid single-column thumbnail - two-tone accent name + accent headers + arrow ticks, one column
    return (
      <div className={`w-16 h-20 border ${borderColor} bg-white p-2 flex flex-col gap-1`}>
        {/* Two-tone name (left-aligned) */}
        <div className="flex items-center gap-1">
          <div className={`h-1.5 ${accentColor} w-1/3`}></div>
          <div className={`h-1.5 ${accentColor} w-1/4 opacity-50`}></div>
        </div>
        <div className={`h-0.5 ${lineColor} w-2/3 opacity-40`}></div>
        {/* Single column: accent header, arrow-tick rows, next header */}
        <div className="flex-1 space-y-1 mt-1">
          <div className={`h-0.5 ${accentColor} w-2/5`}></div>
          <div className="flex items-center gap-1">
            <div className={`h-0.5 w-0.5 ${accentColor}`}></div>
            <div className={`h-0.5 ${lineColor} w-5/6 opacity-50`}></div>
          </div>
          <div className="flex items-center gap-1">
            <div className={`h-0.5 w-0.5 ${accentColor}`}></div>
            <div className={`h-0.5 ${lineColor} w-4/6 opacity-50`}></div>
          </div>
          <div className="h-0.5"></div>
          <div className={`h-0.5 ${accentColor} w-1/3`}></div>
          <div className={`h-0.5 ${lineColor} w-5/6 opacity-50`}></div>
          <div className={`h-0.5 ${lineColor} w-3/6 opacity-50`}></div>
        </div>
      </div>
    );
  }

  if (type === 'modern-deedy') {
    // Modern Deedy thumbnail - centred name + contact line, light grey headings with no
    // rule, one-line entries with right-aligned dates, and indented bullets
    return (
      <div className={`w-16 h-20 border ${borderColor} bg-white p-2 flex flex-col gap-1`}>
        {/* Centred name + contact line */}
        <div className="flex flex-col items-center gap-1">
          <div className={`h-1.5 ${lineColor} w-1/2 opacity-70`}></div>
          <div className={`h-0.5 ${lineColor} w-3/4 opacity-40`}></div>
        </div>
        {/* Light grey headings (no rule), entry rows with a right-aligned date */}
        <div className="flex-1 space-y-1 mt-1">
          <div className={`h-1 ${lineColor} w-2/5 opacity-30`}></div>
          <div className="flex items-center justify-between gap-1">
            <div className={`h-0.5 ${lineColor} w-1/2`}></div>
            <div className={`h-0.5 ${lineColor} w-1/4 opacity-40`}></div>
          </div>
          <div className="flex items-center gap-1 pl-1">
            <div className={`h-0.5 w-0.5 ${lineColor}`}></div>
            <div className={`h-0.5 ${lineColor} w-5/6 opacity-50`}></div>
          </div>
          <div className="flex items-center gap-1 pl-1">
            <div className={`h-0.5 w-0.5 ${lineColor}`}></div>
            <div className={`h-0.5 ${lineColor} w-4/6 opacity-50`}></div>
          </div>
          <div className="h-0.5"></div>
          <div className={`h-1 ${lineColor} w-1/3 opacity-30`}></div>
          <div className="flex items-center justify-between gap-1">
            <div className={`h-0.5 ${lineColor} w-2/5`}></div>
            <div className={`h-0.5 ${lineColor} w-1/4 opacity-40`}></div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'deedy') {
    // Deedy thumbnail - centered two-weight name over a full-width rule, then a narrow
    // left column and a wide right column under light gray headers
    return (
      <div className={`w-16 h-20 border ${borderColor} bg-white p-2 flex flex-col gap-1`}>
        {/* Thin first name + heavier last name, contact line */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1 w-3/4">
            <div className={`h-1.5 ${lineColor} w-3/5 opacity-30`}></div>
            <div className={`h-1.5 ${lineColor} w-2/5`}></div>
          </div>
          <div className={`h-0.5 ${lineColor} w-1/2 opacity-50`}></div>
        </div>
        <div className={`border-b ${borderColor}`}></div>
        {/* Narrow left, wide right */}
        <div className="flex-1 flex gap-1">
          <div className="w-1/3 space-y-1">
            <div className={`h-0.5 ${lineColor} w-full opacity-30`}></div>
            <div className={`h-0.5 ${lineColor} w-4/5 opacity-60`}></div>
            <div className={`h-0.5 ${lineColor} w-3/5 opacity-60`}></div>
            <div className="h-0.5"></div>
            <div className={`h-0.5 ${lineColor} w-full opacity-30`}></div>
            <div className={`h-0.5 ${lineColor} w-4/5 opacity-60`}></div>
          </div>
          <div className="w-2/3 space-y-1">
            <div className={`h-0.5 ${lineColor} w-1/2 opacity-30`}></div>
            <div className={`h-0.5 ${lineColor} w-2/3`}></div>
            <div className={`h-0.5 ${lineColor} w-5/6 opacity-50`}></div>
            <div className={`h-0.5 ${lineColor} w-4/6 opacity-50`}></div>
            <div className="h-0.5"></div>
            <div className={`h-0.5 ${lineColor} w-2/3`}></div>
            <div className={`h-0.5 ${lineColor} w-5/6 opacity-50`}></div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'photo-sidebar') {
    // Photo Sidebar thumbnail - a colored rail holding a portrait block, contact
    // ticks and skills, next to a white main column
    return (
      <div className={`w-16 h-20 border ${borderColor} bg-white flex`}>
        {/* Colored rail */}
        <div
          className={`w-1/3 h-full ${isActive ? 'bg-primary' : 'bg-primary/70'} p-1 flex flex-col items-center gap-1`}
        >
          <div className="size-3.5 bg-white/90" />
          <div className="h-0.5 w-4/5 bg-white/80" />
          <div className="h-0.5 w-3/5 bg-white/60" />
          <div className="h-0.5 w-4/5 bg-white/50 mt-1" />
          <div className="h-0.5 w-3/5 bg-white/50" />
          <div className="h-0.5 w-4/5 bg-white/50" />
        </div>
        {/* Main column */}
        <div className="w-2/3 p-1 space-y-1">
          <div className={`h-0.5 ${accentColor} w-1/2`} />
          <div className={`h-0.5 ${lineColor} w-full opacity-50`} />
          <div className={`h-0.5 ${lineColor} w-5/6 opacity-50`} />
          <div className="h-0.5"></div>
          <div className={`h-0.5 ${accentColor} w-2/5`} />
          <div className={`h-0.5 ${lineColor} w-full opacity-50`} />
          <div className={`h-0.5 ${lineColor} w-4/6 opacity-50`} />
        </div>
      </div>
    );
  }

  if (type === 'editorial') {
    // Editorial thumbnail - round portrait over a narrow rail with dot-rated skills,
    // gold serif headings beside a wide story column with stacked entry pairs
    return (
      <div className={`w-16 h-20 border ${borderColor} bg-white flex`}>
        {/* Narrow rail: portrait, three contact ticks, dot rows */}
        <div className="w-1/3 p-1 flex flex-col gap-1">
          <div
            className={`size-4 ${isActive ? 'bg-primary/30' : 'bg-primary/20'}`}
            style={{ borderRadius: '999px' }}
          />
          <div className={`h-0.5 ${lineColor} w-3/4`} />
          <div className={`h-0.5 ${lineColor} w-2/3 opacity-40`} />
          <div className={`h-0.5 ${lineColor} w-3/5 opacity-40`} />
          <div className="h-0.5"></div>
          <div className={`h-0.5 ${accentColor} w-3/5`} />
          <div className="flex items-center gap-[1px]">
            {[0, 1, 2, 3, 4].map((dot) => (
              <span
                key={dot}
                className={`size-[2px] ${dot < 4 ? lineColor : 'bg-steel/40'}`}
                style={{ borderRadius: '999px' }}
              />
            ))}
          </div>
          <div className="flex items-center gap-[1px]">
            {[0, 1, 2, 3, 4].map((dot) => (
              <span
                key={dot}
                className={`size-[2px] ${dot < 3 ? lineColor : 'bg-steel/40'}`}
                style={{ borderRadius: '999px' }}
              />
            ))}
          </div>
        </div>
        {/* Story column: large name, gold headings, title + date pairs */}
        <div className="w-2/3 p-1 space-y-1">
          <div className={`h-1.5 ${lineColor} w-3/4`} />
          <div className={`h-0.5 ${lineColor} w-2/5 opacity-40`} />
          <div className={`h-0.5 ${accentColor} w-2/5 mt-1`} />
          <div className={`h-0.5 ${lineColor} w-full opacity-40`} />
          <div className={`h-0.5 ${lineColor} w-5/6 opacity-40`} />
          <div className={`h-0.5 ${accentColor} w-1/3 mt-1`} />
          <div className={`h-0.5 ${lineColor} w-2/3`} />
          <div className={`h-0.5 ${lineColor} w-1/2 opacity-30`} />
          <div className={`h-0.5 ${lineColor} w-5/6 opacity-40`} />
        </div>
      </div>
    );
  }

  // Two column thumbnail (swiss-two-column)
  return (
    <div className={`w-16 h-20 border ${borderColor} bg-white p-2 flex flex-col gap-1`}>
      {/* Header - centered */}
      <div className="flex flex-col items-center gap-1">
        <div className={`h-1.5 ${lineColor} w-3/4`}></div>
        <div className={`h-0.5 ${lineColor} w-1/2 opacity-70`}></div>
      </div>
      {/* Two columns */}
      <div className="flex-1 flex gap-1 mt-1">
        {/* Left column (wider) */}
        <div className="w-2/3 space-y-1">
          <div className={`h-0.5 ${lineColor} w-full`}></div>
          <div className={`h-0.5 ${lineColor} w-5/6 opacity-50`}></div>
          <div className={`h-0.5 ${lineColor} w-4/6 opacity-50`}></div>
          <div className="h-0.5"></div>
          <div className={`h-0.5 ${lineColor} w-full`}></div>
          <div className={`h-0.5 ${lineColor} w-5/6 opacity-50`}></div>
        </div>
        {/* Right column (narrower) */}
        <div className="w-1/3 border-l border-paper pl-1 space-y-1">
          <div className={`h-0.5 ${lineColor} w-full`}></div>
          <div className={`h-0.5 ${lineColor} w-4/5 opacity-50`}></div>
          <div className="h-0.5"></div>
          <div className={`h-0.5 ${lineColor} w-full`}></div>
          <div className={`h-0.5 ${lineColor} w-3/5 opacity-50`}></div>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;
