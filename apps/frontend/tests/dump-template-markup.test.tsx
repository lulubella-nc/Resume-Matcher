/**
 * Dumps the markup of the preset templates so `scripts/make-template-assets.py`
 * can render the README samples from the real components.
 *
 *   cd apps/frontend
 *   DUMP_TEMPLATES=timeline,panels npx vitest run --pool=threads --maxWorkers=1 \
 *     tests/dump-template-markup.test.tsx
 *
 * Then, from the repo root:
 *
 *   python scripts/make-template-assets.py --template timeline --css profile \
 *     --html .workbuddy/tmp/timeline.html
 *
 * Two rules keep the samples publishable:
 *
 * 1. The data below is invented. Never swap in a real resume: the samples are
 *    committed as webp/PDF and a real one would publish a name, a phone number,
 *    an email address and a face.
 * 2. The portrait is a drawn silhouette, not a photograph, for the same reason.
 *
 * The spec is skipped unless `DUMP_TEMPLATES` is set, so a normal `npm test`
 * run neither writes files nor depends on this fixture.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';
import Resume, { type ResumeData } from '@/components/dashboard/resume-component';
import {
  DEFAULT_TEMPLATE_SETTINGS,
  applyTemplatePreset,
  type TemplateType,
} from '@/lib/types/template-settings';
import { PROFILE_PRESET_IDS } from '@/components/resume/profile-presets';

vi.mock('@/lib/i18n', () => ({ useTranslations: () => ({ t: (key: string) => key }) }));

/** A drawn head-and-shoulders placeholder: no real person appears in the samples. */
const PORTRAIT =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgNTAwIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUwMCI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNTAwIiBmaWxsPSIjZThlNmUxIi8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE5MCIgcj0iNzgiIGZpbGw9IiNjNmMyYmEiLz4KPHBhdGggZD0iTTIwMCAyODVjLTc4IDAtMTQxIDUyLTE0MSAxMTZ2OTloMjgydi05OWMwLTY0LTYzLTExNi0xNDEtMTE2eiIgZmlsbD0iI2M2YzJiYSIvPgo8L3N2Zz4=';

export const DEMO_RESUME: ResumeData = {
  personalInfo: {
    name: 'Jordan Ellis',
    title: 'Paralegal',
    email: 'jordan.ellis@example.com',
    // 555-01xx is the North American range reserved for fiction, so the number
    // cannot ring a real subscriber once the sample is published.
    phone: '(202) 555-0143',
    location: 'New York, NY',
    website: 'jordanellis.example.com',
    photo: PORTRAIT,
  },
  summary:
    'Paralegal with eight years of litigation support experience across commercial and employment matters. Builds discovery timelines that hold up in court and keeps forty-case dockets moving.',
  workExperience: [
    {
      id: 1,
      title: 'Senior Paralegal',
      company: 'Harper & Vance LLP',
      location: 'New York, NY',
      years: 'Aug 2019 - Present',
      description: [
        'Manage discovery for 40+ commercial matters, from hold notices to production logs.',
        'Prepare deposition binders and trial exhibits for a team of six attorneys.',
        'Cut document review turnaround from three weeks to nine days.',
      ],
    },
    {
      id: 2,
      title: 'Paralegal',
      company: 'Calder Rowe LLC',
      location: 'Boca Raton, FL',
      years: 'Jun 2016 - Jul 2019',
      description: [
        'Drafted motions, subpoenas and settlement summaries for employment disputes.',
        'Maintained the firm calendar and filed with state and federal courts.',
      ],
    },
  ],
  education: [
    {
      id: 1,
      institution: 'Rutgers University',
      degree: 'Bachelor of Communications',
      years: 'Aug 2012 - May 2016',
    },
  ],
  additional: {
    technicalSkills: ['Legal Research', 'Document Review', 'eDiscovery', 'Bluebook Citations'],
    languages: ['English', 'Spanish'],
  },
};

const requested = process.env.DUMP_TEMPLATES?.split(',')
  .map((value) => value.trim())
  .filter(Boolean);
const templates = (requested?.length ? requested : PROFILE_PRESET_IDS) as TemplateType[];
const outDir = resolve(process.cwd(), process.env.DUMP_TEMPLATES_OUT ?? '../../.workbuddy/tmp');

describe.skipIf(!process.env.DUMP_TEMPLATES)('template markup dump', () => {
  it('writes one html file per requested template', () => {
    mkdirSync(outDir, { recursive: true });
    for (const template of templates) {
      const settings = applyTemplatePreset(
        { ...DEFAULT_TEMPLATE_SETTINGS, showPhoto: true, photoShape: 'square' },
        template
      );
      const { container, unmount } = render(
        <Resume resumeData={DEMO_RESUME} settings={settings} />
      );
      writeFileSync(resolve(outDir, `${template}.html`), container.innerHTML, 'utf8');
      unmount();
    }
  });
});
