import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Resume, { type ResumeData } from '@/components/dashboard/resume-component';
import { DEFAULT_TEMPLATE_SETTINGS } from '@/lib/types/template-settings';
import {
  PROFILE_PRESETS,
  PROFILE_PRESET_IDS,
  type ProfilePresetId,
} from '@/components/resume/profile-presets';

vi.mock('@/lib/i18n', () => ({ useTranslations: () => ({ t: (key: string) => key }) }));

const PHOTO = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';

const data: ResumeData = {
  personalInfo: {
    name: 'Jordan Ellis',
    title: 'Paralegal',
    email: 'jordan@example.com',
    phone: '(561) 217-6321',
    location: 'New York, NY',
    website: 'jordanellis.com',
    photo: PHOTO,
  },
  summary: 'Paralegal with eight years of litigation support experience.',
  workExperience: [
    {
      id: 1,
      title: 'Senior Paralegal',
      company: 'Harper & Vance LLP',
      location: 'Boca Raton',
      years: 'Aug 2019 - Present',
      description: ['Manage discovery for 40+ matters.'],
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
    technicalSkills: ['Legal Research', 'Document Review'],
    languages: ['English', 'Spanish'],
  },
};

const renderTemplate = (template: ProfilePresetId, resumeData: ResumeData = data) =>
  render(<Resume resumeData={resumeData} settings={{ ...DEFAULT_TEMPLATE_SETTINGS, template }} />);

describe('profile presets', () => {
  it('registers a preset for every id and keeps them unique', () => {
    expect(new Set(PROFILE_PRESET_IDS).size).toBe(PROFILE_PRESET_IDS.length);
    for (const id of PROFILE_PRESET_IDS) {
      expect(PROFILE_PRESETS[id].id).toBe(id);
    }
  });

  it.each(PROFILE_PRESET_IDS)('%s renders the identity and every section', (template) => {
    const { container } = renderTemplate(template);
    const text = container.textContent ?? '';
    expect(text).toContain('Jordan Ellis');
    expect(text).toContain('Senior Paralegal');
    expect(text).toContain('Harper & Vance LLP');
    expect(text).toContain('Rutgers University');
    expect(text).toContain('Legal Research');
  });

  it.each(PROFILE_PRESET_IDS)('%s never prints a proficiency score', (template) => {
    // The reference designs show dot scales and "Expert" badges; the data has names
    // only, so a preset that prints a level would be inventing a fact.
    const { container } = renderTemplate(template);
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/\b\d\s*\/\s*5\b/);
    expect(text).not.toMatch(/\b(Expert|Advanced|Intermediate)\b/);
    expect(container.querySelector('[data-skill-level]')).toBeNull();
  });

  it('puts the rail on the side the preset asks for', (template) => {
    const railLeft = renderTemplate('band-rail');
    expect(railLeft.container.querySelector('aside')).not.toBeNull();
    expect(railLeft.container.querySelector('aside')?.textContent).toContain('Legal Research');

    const single = renderTemplate('numbered');
    expect(single.container.querySelector('aside')).toBeNull();
    expect(single.container.textContent).toContain('Legal Research');
  });

  it('draws the numbered headings with a running index', () => {
    const { container } = renderTemplate('numbered');
    const heads = Array.from(container.querySelectorAll('h3')).map((h) => h.textContent?.trim());
    expect(heads[0]).toMatch(/^01/);
    expect(heads[1]).toMatch(/^02/);
  });

  it('keeps the story column first in the DOM so a parser reads it before the rail', () => {
    const { container } = renderTemplate('rail-notes');
    const text = container.textContent ?? '';
    expect(text.indexOf('Jordan Ellis')).toBeLessThan(text.indexOf('Legal Research'));
  });

  it('hides the portrait when the photo setting is off', () => {
    const { container } = render(
      <Resume
        resumeData={data}
        settings={{ ...DEFAULT_TEMPLATE_SETTINGS, template: 'rail-notes', showPhoto: false }}
      />
    );
    expect(container.querySelector('img[data-photo-shape]')).toBeNull();
  });

  it('renders an almost-empty resume without throwing', () => {
    const { container } = renderTemplate('classic-rules', { personalInfo: { name: 'Ada' } });
    expect(container.textContent).toContain('Ada');
  });
});

describe('profile preset vocabulary', () => {
  it('hangs a node on every entry of the timeline preset', () => {
    const { container } = renderTemplate('timeline');
    const numbered = [
      ...container.querySelectorAll('[data-entry="timeline"] [data-resume-item]'),
    ].filter((el) => !el.hasAttribute('data-earlier-experience'));
    expect(numbered.length).toBeGreaterThan(0);
    // The spine is drawn from the entry stack, so every entry sits inside one.
    for (const item of numbered) {
      expect(item.closest('[data-entry="timeline"]')).not.toBeNull();
    }
  });

  it('puts the contact block above the skills in the timeline rail', () => {
    const { container } = renderTemplate('timeline');
    const rail = container.querySelector('aside');
    const text = rail?.textContent ?? '';
    expect(text.indexOf('jordan@example.com')).toBeGreaterThanOrEqual(0);
    expect(text.indexOf('jordan@example.com')).toBeLessThan(text.indexOf('Legal Research'));
  });

  it('leaves the contact block out of a rail that does not carry one', () => {
    const { container } = renderTemplate('serif-rail');
    const text = container.querySelector('aside')?.textContent ?? '';
    expect(text).toContain('Legal Research');
    expect(text).not.toContain('jordan@example.com');
  });

  it('prints the portrait inside the rail for the photo-panel preset', () => {
    const { container } = renderTemplate('photo-panel');
    const rail = container.querySelector('aside');
    expect(rail?.querySelector('img[data-photo-shape]')).not.toBeNull();
    // Identity stays text-only, so exactly one portrait is printed.
    expect(container.querySelectorAll('img[data-photo-shape]')).toHaveLength(1);
  });

  it('draws the name inside the ruled box for the framed preset', () => {
    const { container } = renderTemplate('framed');
    const name = container.querySelector('h1');
    expect(name?.textContent).toBe('Jordan Ellis');
    // The box is what carries the border; a loose name would lose it on print.
    expect(name?.closest('div[class*="nameBox"]')).not.toBeNull();
  });

  it('keeps every single-column preset free of a rail', () => {
    for (const id of ['ats-classic', 'night-band', 'numbered'] as ProfilePresetId[]) {
      expect(renderTemplate(id).container.querySelector('aside'), id).toBeNull();
    }
  });

  it('prints the contact details in every preset, at most twice', () => {
    // A preset that hides the rail's contact block has to print the contact line
    // instead, or the document loses the email altogether.
    for (const id of PROFILE_PRESET_IDS) {
      const text = renderTemplate(id).container.textContent ?? '';
      const seen = text.split('jordan@example.com').length - 1;
      expect(seen, id).toBeGreaterThanOrEqual(1);
      expect(seen, id).toBeLessThanOrEqual(2);
    }
  });

  it('marks the presets that read the photo controls', () => {
    for (const id of PROFILE_PRESET_IDS) {
      const preset = PROFILE_PRESETS[id];
      const drawsPhoto = preset.photo === true;
      const { container } = renderTemplate(id);
      expect(container.querySelectorAll('img[data-photo-shape]').length, id).toBe(
        drawsPhoto ? 1 : 0
      );
    }
  });
});
